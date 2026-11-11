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
  type Lang,
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

Write each reason as one or two plain sentences addressed to the reviewer. Say what you saw and what would settle it. Return exactly one entry per transaction id you were given. In a reason, refer to another transaction by its date and amount, never by its id.`;

// The CLI rejects a schema that carries a "$schema" URI, so strip it.
const { $schema: _ignored, ...SCHEMA } = z.toJSONSchema(Classification);
void _ignored;

class ClaudeUnavailable extends Error {}

// Runs the local Claude Code CLI in print mode with no tools, no MCP servers and no user
// settings, so it behaves as a plain model call that returns schema-checked JSON.
function runClaude(prompt: string, lang: Lang): Promise<unknown> {
  const system =
    lang === "zh"
      ? `${SYSTEM}\n\nWrite every reason in Traditional Chinese as used in Taiwan (繁體中文、台灣用語). Keep form names, company names and bank descriptions in their original English.`
      : SYSTEM;
  const args = [
    "-p",
    "--model", MODEL,
    "--effort", "low",
    "--output-format", "json",
    "--json-schema", JSON.stringify(SCHEMA),
    "--system-prompt", system,
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

async function classifyWithClaude(txns: Txn[], relatedCompanies: string[], lang: Lang): Promise<Classified[]> {
  const zh = lang === "zh";
  const raw = await runClaude(`Company: Kuroshio Studio LLC (Wyoming, formed 2026-08-04).
Sole owner: ${OWNER.name}, tax resident of ${OWNER.country}.
Other companies the owner holds a stake in: ${relatedCompanies.join(", ")}.

Bank transactions for the tax year (positive = money in):
${JSON.stringify(txns, null, 2)}`, lang);

  const parsed = Classification.safeParse(raw);
  if (!parsed.success) throw new ClaudeUnavailable("Claude's answer did not match the expected shape");

  const byId = new Map(parsed.data.transactions.map((c) => [c.id, c]));
  return txns.map((t) => {
    const c = byId.get(t.id);
    // A transaction the model skipped is surfaced for review rather than silently dropped.
    if (!c) {
      return { ...t, category: "unknown", reportable: false, confidence: "low", reason: zh ? "模型沒有回傳這一列的分類。" : "The model returned no classification for this row." };
    }
    return { ...t, category: c.category, reportable: isReportable(c.category), confidence: c.confidence, reason: c.reason };
  });
}

export async function POST(request: Request) {
  let txns: Txn[];
  let lang: Lang = "en";
  try {
    const body = (await request.json()) as { csv?: string; lang?: string };
    lang = body.lang === "zh" ? "zh" : "en";
    txns = parseCsv(body.csv ?? "", lang);
  } catch (error) {
    const fallback = lang === "zh" ? "讀不懂這次上傳的內容。" : "We couldn't read that upload.";
    const message = error instanceof CsvError ? error.message : fallback;
    return Response.json({ error: message }, { status: 400 });
  }

  const company = companies.find((c) => c.id === "kuroshio")!;
  const related = companies.filter((c) => c.id !== company.id).map((c) => c.name);

  let classified: Classified[];
  let source: Draft["source"] = "claude";
  const zh = lang === "zh";
  let sourceNote = zh ? "交易由 Claude 分類，金額加總由程式計算。" : "Transactions classified by Claude. Totals computed in code.";

  try {
    classified = await classifyWithClaude(txns, related, lang);
  } catch (error) {
    if (!(error instanceof ClaudeUnavailable)) throw error;
    classified = classifyWithRules(txns, OWNER.name, related, lang);
    source = "rules";
    sourceNote = zh ? "這台電腦目前無法使用 Claude，改用關鍵字規則分類。" : `${error.message}, so keyword rules were used.`;
  }

  const draft: Draft = {
    source,
    sourceNote,
    transactions: classified,
    ...buildDraft(classified, { name: company.name, state: company.state }, OWNER, lang),
  };
  return Response.json(draft);
}
