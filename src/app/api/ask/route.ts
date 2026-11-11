import { z } from "zod";
import { ClaudeUnavailable, askClaude } from "@/lib/claude";
import { JURISDICTION_LABEL, companies, obligationsFor } from "@/lib/obligations";

export const maxDuration = 90;

const ACTIONS = ["none", "open_draft", "open_filings", "open_documents", "open_review", "open_companies", "open_taiwan"] as const;

const Answer = z.object({
  reply: z.string(),
  action: z.enum(ACTIONS),
});

const SYSTEM = `You are the voice assistant inside GoTax, a service that handles US tax compliance for Taiwanese founders who own US companies. The founder is talking to you out loud and your reply will be read aloud.

Rules:
- Reply in at most three short spoken sentences. No lists, no markdown, no symbols that sound odd when read aloud. Say dollar amounts in words a person would say.
- Use only the facts in the context below for deadlines, penalties, fees and which filings apply. If the context does not cover it, say you will flag it for the CPA rather than guessing.
- You prepare filings; a reviewer checks them and a licensed CPA signs. Never say you file anything yourself, and never call this tax advice.
- When the founder asks you to prepare, draft, start or "do" the Form 5472 or their taxes for Kuroshio Studio, set action to open_draft and say you are pulling the bank statement and drafting it now.
- Set action to open_filings, open_documents, open_review, open_companies or open_taiwan only when the founder asks to see that screen or asks a question that screen answers in full. Otherwise use none.`;

function context() {
  const today = new Date().toISOString().slice(0, 10);
  const name = (id: string) => (id === "personal" ? "the founder personally" : companies.find((c) => c.id === id)?.name ?? id);
  return `Today: ${today}.
Founder: Ray Lin, tax resident of Taiwan.
Companies:
${companies.map((c) => `- ${c.name}: ${c.state} LLC, formed ${c.formed}, members ${c.members.map((m) => `${m.name} ${m.share}%`).join(", ")}. ${c.explain.en}`).join("\n")}
Filings for 2027 (draft rules, not yet verified):
${obligationsFor(2027)
  .map(
    (o) =>
      `- ${o.form} (${o.title.en}) for ${name(o.companyId)}, ${JURISDICTION_LABEL[o.jurisdiction].en}, due ${o.due}. If missed: ${o.penalty.en}.${o.fee ? ` Fee ${o.fee}.` : ""}${o.question ? ` Only applies if: ${o.question.en}` : ""} Why: ${o.why.en}`,
  )
  .join("\n")}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { question?: string; lang?: string };
  const question = (body.question ?? "").trim().slice(0, 600);
  const zh = body.lang === "zh";
  if (!question) {
    return Response.json({ error: zh ? "沒有聽到問題。" : "I didn't catch a question." }, { status: 400 });
  }

  try {
    const raw = await askClaude({
      system: `${SYSTEM}\n\n${zh ? "Reply in Traditional Chinese as spoken in Taiwan. Keep form names in English." : "Reply in English."}\n\nContext:\n${context()}`,
      prompt: question,
      schema: z.toJSONSchema(Answer),
    });
    const parsed = Answer.safeParse(raw);
    if (!parsed.success) throw new ClaudeUnavailable("bad shape");
    return Response.json({ ...parsed.data, source: "claude" });
  } catch (error) {
    if (!(error instanceof ClaudeUnavailable)) throw error;
    return Response.json({
      reply: zh
        ? "語音助理需要 Claude，這台機器目前連不上。請在示範用的筆電上使用。"
        : "The voice assistant needs Claude, which this machine can't reach right now. Use it on the demo laptop.",
      action: "none",
      source: "unavailable",
    });
  }
}
