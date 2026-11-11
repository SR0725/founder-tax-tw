import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
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

async function classifyWithClaude(txns: Txn[], relatedCompanies: string[]): Promise<Classified[] | null> {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Company: Kuroshio Studio LLC (Wyoming, formed 2026-08-04).
Sole owner: ${OWNER.name}, tax resident of ${OWNER.country}.
Other companies the owner holds a stake in: ${relatedCompanies.join(", ")}.

Bank transactions for the tax year (positive = money in):
${JSON.stringify(txns, null, 2)}`,
      },
    ],
    output_config: { effort: "low", format: zodOutputFormat(Classification) },
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return null;

  const byId = new Map(response.parsed_output.transactions.map((c) => [c.id, c]));
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

  let classified: Classified[] | null = null;
  let source: Draft["source"] = "rules";
  let sourceNote = "No API key is configured, so transactions were classified by keyword rules.";

  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
    try {
      classified = await classifyWithClaude(txns, related);
      if (classified) {
        source = "claude";
        sourceNote = "Transactions classified by Claude. Totals computed in code.";
      } else {
        sourceNote = "Claude declined or returned an unreadable answer, so keyword rules were used.";
      }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        sourceNote = "The API key was rejected, so keyword rules were used.";
      } else if (error instanceof Anthropic.RateLimitError) {
        sourceNote = "Claude is rate limited right now, so keyword rules were used.";
      } else if (error instanceof Anthropic.APIError) {
        sourceNote = `Claude returned an error (${error.status ?? "network"}), so keyword rules were used.`;
      } else {
        throw error;
      }
    }
  }

  classified ??= classifyWithRules(txns, OWNER.name, related);

  const draft: Draft = {
    source,
    sourceNote,
    transactions: classified,
    ...buildDraft(classified, { name: company.name, state: company.state }, OWNER),
  };
  return Response.json(draft);
}
