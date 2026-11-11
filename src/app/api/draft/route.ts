import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { z } from "zod";
import { companies } from "@/lib/obligations";
import {
  CATEGORIES,
  CsvError,
  buildDraft,
  classifyWithRules,
  isReportable,
  parseCsv,
  type Classified,
  type Draft,
  type Txn,
} from "@/lib/draft";

export const maxDuration = 120;

const OWNER = { name: "Ray Lin", country: "Taiwan" };
const MODEL = "claude-opus-5-5";

const Classification = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      category: z.enum(CATEGORIES),
      confidence: z.enum(["high", "low"]),
      reason: z.string(),
    }),
  ),
});

const SYSTEM = `You help a non-credentialed reviewer prepare IRS Form 5472 for a US LLC that is wholly owned by one foreign person and treated as a disregarded entity.

Form 5472 reports transactions between the company and its foreign owner or other related parties. Your only job is to classify each bank transaction into one category and explain why. You never add up amounts and you never state deadlines, penalties or tax owed: code does the arithmetic and a rule table holds the rules.

Categories:
- owner_contribution: money the owner put into the company
- owner_distribution: money the company paid out to the owner with no obligation to return it
- owner_loan: money moving between owner and company that is meant to be repaid
- owner_reimbursement: the company repaying the owner for a business cost the owner paid personally
- related_company_payment: money moving between this company and another company the same person owns
- revenue: customer income, including payment-processor payouts
- expense: payment to an unrelated vendor
- unknown: you cannot tell

Mark confidence "low" whenever a careful preparer would want a document or an answer from the founder before signing: an unclear sender, a memo that suggests a loan with no agreement, a reimbursement with no receipt, a related-company payment with no invoice. Being wrong here costs the founder $25,000, so prefer "low" over a confident guess.

Write each reason as one or two plain sentences addressed to the reviewer. Say what you saw and what would settle it. Return exactly one entry per transaction id you were given.`;

// The CLI rejects a schema that carries a "$schema" URI, so strip it.
const { $schema: _ignored, ...SCHEMA } = z.toJSONSchema(Classification);
void _ignored;

class ClaudeUnavailable extends Error {}

// Runs the local Claude Code CLI in print mode with no tools, no MCP servers and no user
// settings, so it behaves as a plain model call that returns schema-checked JSON.
function runClaude(prompt: string): Promise<unknown> {
  const args = [
    "-p",
    "--model", MODEL,
    "--effort", "low",
    "--output-format", "json",
    "--json-schema", JSON.stringify(SCHEMA),
    "--system-prompt", SYSTEM,
    "--tools", "",
    "--strict-mcp-config",
    "--setting-sources", "",
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.CLAUDE_BIN ?? "claude", args, { cwd: tmpdir() });
    let out = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new ClaudeUnavailable("Claude took longer than 90 seconds"));
    }, 90_000);
    child.stdout.on("data", (chunk) => (out += chunk));
    child.on("error", () => {
      clearTimeout(timer);
      reject(new ClaudeUnavailable("The Claude CLI is not installed on this machine"));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const result = JSON.parse(out);
        if (code !== 0 || result.is_error || !result.structured_output) {
          return reject(new ClaudeUnavailable("Claude did not return a usable answer"));
        }
        resolve(result.structured_output);
      } catch {
        reject(new ClaudeUnavailable("Claude returned output we couldn't read"));
      }
    });
    child.stdin.end(prompt);
  });
}

async function classifyWithClaude(txns: Txn[], relatedCompanies: string[]): Promise<Classified[]> {
  const raw = await runClaude(`Company: Kuroshio Studio LLC (Wyoming, formed 2026-08-04).
Sole owner: ${OWNER.name}, tax resident of ${OWNER.country}.
Other companies the owner holds a stake in: ${relatedCompanies.join(", ")}.

Bank transactions for the tax year (positive = money in):
${JSON.stringify(txns, null, 2)}`);

  const parsed = Classification.safeParse(raw);
  if (!parsed.success) throw new ClaudeUnavailable("Claude's answer did not match the expected shape");

  const byId = new Map(parsed.data.transactions.map((c) => [c.id, c]));
  return txns.map((t) => {
    const c = byId.get(t.id);
    // A transaction the model skipped is surfaced for review rather than silently dropped.
    if (!c) {
      return { ...t, category: "unknown", reportable: false, confidence: "low", reason: "The model returned no classification for this row." };
    }
    return { ...t, category: c.category, reportable: isReportable(c.category), confidence: c.confidence, reason: c.reason };
  });
}

export async function POST(request: Request) {
  let txns: Txn[];
  try {
    const body = (await request.json()) as { csv?: string };
    txns = parseCsv(body.csv ?? "");
  } catch (error) {
    const message = error instanceof CsvError ? error.message : "We couldn't read that upload.";
    return Response.json({ error: message }, { status: 400 });
  }

  const company = companies.find((c) => c.id === "kuroshio")!;
  const related = companies.filter((c) => c.id !== company.id).map((c) => c.name);

  let classified: Classified[];
  let source: Draft["source"] = "claude";
  let sourceNote = "Transactions classified by Claude. Totals computed in code.";

  try {
    classified = await classifyWithClaude(txns, related);
  } catch (error) {
    if (!(error instanceof ClaudeUnavailable)) throw error;
    classified = classifyWithRules(txns, OWNER.name, related);
    source = "rules";
    sourceNote = `${error.message}, so keyword rules were used.`;
  }

  const draft: Draft = {
    source,
    sourceNote,
    transactions: classified,
    ...buildDraft(classified, { name: company.name, state: company.state }, OWNER),
  };
  return Response.json(draft);
}
