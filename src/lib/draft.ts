// Shared types and the deterministic half of drafting.
// The model only classifies transactions and explains itself. All arithmetic happens here.

export const CATEGORIES = [
  "owner_contribution",
  "owner_distribution",
  "owner_loan",
  "owner_reimbursement",
  "related_company_payment",
  "revenue",
  "expense",
  "unknown",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Confidence = "high" | "low";

export const CATEGORY_LABEL: Record<Category, string> = {
  owner_contribution: "Capital from owner",
  owner_distribution: "Distribution to owner",
  owner_loan: "Loan to or from owner",
  owner_reimbursement: "Reimbursement to owner",
  related_company_payment: "Payment to related company",
  revenue: "Revenue",
  expense: "Expense",
  unknown: "Unclear",
};

const REPORTABLE: Category[] = [
  "owner_contribution",
  "owner_distribution",
  "owner_loan",
  "owner_reimbursement",
  "related_company_payment",
];

export type Txn = { id: string; date: string; description: string; amount: number; memo: string };

export type Classified = Txn & {
  category: Category;
  reportable: boolean;
  confidence: Confidence;
  reason: string;
};

export type DraftField = {
  section: string;
  label: string;
  value: string;
  basis: string;
  needsReview: boolean;
};

export type ChecklistItem = { id: string; text: string; detail: string };

export type Draft = {
  source: "claude" | "rules";
  sourceNote: string;
  transactions: Classified[];
  fields: DraftField[];
  checklist: ChecklistItem[];
};

export class CsvError extends Error {}

export function parseCsv(text: string): Txn[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new CsvError("The file is empty.");
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const [d, desc, amt, memo] = [col("date"), col("description"), col("amount"), col("memo")];
  if (d < 0 || desc < 0 || amt < 0) {
    throw new CsvError("We couldn't read this file. It needs the columns: date, description, amount.");
  }
  const rows = lines.slice(1).map((line, i) => {
    const cells = line.split(",").map((c) => c.trim());
    const amount = Number(cells[amt]);
    if (Number.isNaN(amount)) {
      throw new CsvError(`Row ${i + 2} has an amount we can't read: "${cells[amt] ?? ""}".`);
    }
    return {
      id: `t${i + 1}`,
      date: cells[d] ?? "",
      description: cells[desc] ?? "",
      amount,
      memo: memo >= 0 ? cells[memo] ?? "" : "",
    };
  });
  if (rows.length > 500) throw new CsvError("This demo reads up to 500 transactions per file.");
  return rows;
}

export function isReportable(category: Category) {
  return REPORTABLE.includes(category);
}

// Keyword fallback used when no model is available. Deliberately conservative: anything
// touching the owner that is not obviously a contribution or draw is marked low confidence.
export function classifyWithRules(txns: Txn[], ownerName: string, relatedCompanies: string[]): Classified[] {
  const owner = ownerName.toUpperCase();
  return txns.map((t) => {
    const text = `${t.description} ${t.memo}`.toUpperCase();
    let category: Category = t.amount >= 0 ? "unknown" : "expense";
    let confidence: Confidence = "high";
    let reason = "Ordinary operating expense paid to an unrelated vendor.";

    if (text.includes("STRIPE")) {
      category = "revenue";
      reason = "Stripe payout: customer revenue, not a transaction with the owner.";
    } else if (text.includes(owner)) {
      if (t.amount > 0) {
        category = "owner_contribution";
        reason = "Money in from the owner.";
      } else if (/REIMB/.test(text)) {
        category = "owner_reimbursement";
        confidence = "low";
        reason = "Looks like a reimbursement. Whether it is reported as a reimbursement or a distribution depends on whether the owner has a receipt.";
      } else if (/LOAN|TEMPORARY|RETURN/.test(text)) {
        category = "owner_loan";
        confidence = "low";
        reason = "The memo suggests the money will come back. Without a loan agreement this may have to be reported as a distribution.";
      } else {
        category = "owner_distribution";
        reason = "Money out to the owner.";
      }
    } else if (relatedCompanies.some((c) => text.includes(c.toUpperCase()))) {
      category = "related_company_payment";
      confidence = "low";
      reason = "Paid to a company the same person owns. Related-party payments are reportable and need an invoice to support the amount.";
    } else if (t.amount > 0) {
      confidence = "low";
      reason = "Money in from an unidentified sender. If it came from the owner it is reportable capital.";
    }

    return { ...t, category, reportable: isReportable(category), confidence, reason };
  });
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function buildDraft(
  classified: Classified[],
  company: { name: string; state: string },
  owner: { name: string; country: string },
): Pick<Draft, "fields" | "checklist"> {
  const total = (c: Category) =>
    classified.filter((t) => t.category === c).reduce((s, t) => s + Math.abs(t.amount), 0);
  const rows = (c: Category) => classified.filter((t) => t.category === c);
  const unsure = (c: Category) => rows(c).some((t) => t.confidence === "low");
  const basis = (c: Category) => {
    const r = rows(c);
    return r.length === 0 ? "No matching transactions found." : `Sum of ${r.length} transaction${r.length > 1 ? "s" : ""}: ${r.map((t) => t.date).join(", ")}.`;
  };
  const money = (c: Category, label: string): DraftField => ({
    section: "Form 5472 · Reportable transactions with the foreign owner",
    label,
    value: usd(total(c)),
    basis: basis(c),
    needsReview: unsure(c),
  });

  const fields: DraftField[] = [
    { section: "Form 5472 · Reporting corporation", label: "Name", value: company.name, basis: "From your company profile.", needsReview: false },
    { section: "Form 5472 · Reporting corporation", label: "State of formation", value: company.state, basis: "From your company profile.", needsReview: false },
    { section: "Form 5472 · Reporting corporation", label: "Employer Identification Number", value: "Missing", basis: "Upload your EIN confirmation letter. We never guess this number.", needsReview: true },
    { section: "Form 5472 · Foreign owner", label: "Name", value: owner.name, basis: "From your company profile.", needsReview: false },
    { section: "Form 5472 · Foreign owner", label: "Country of tax residence", value: owner.country, basis: "From your company profile.", needsReview: false },
    money("owner_contribution", "Capital contributed by the owner"),
    money("owner_distribution", "Distributions paid to the owner"),
    money("owner_loan", "Loans between owner and company"),
    money("owner_reimbursement", "Reimbursements paid to the owner"),
    money("related_company_payment", "Payments to companies under common ownership"),
    { section: "Pro forma Form 1120", label: "Header", value: "Foreign-owned U.S. DE", basis: "A disregarded entity files only the name, address and EIN lines, with this text across the top.", needsReview: false },
  ];

  const unknown = rows("unknown");
  const checklist: ChecklistItem[] = [
    ...classified
      .filter((t) => t.confidence === "low")
      .map((t) => ({
        id: `txn-${t.id}`,
        text: `Confirm how to report ${usd(Math.abs(t.amount))} on ${t.date} (${t.description})`,
        detail: t.reason,
      })),
    { id: "ein", text: "EIN on the draft matches the IRS confirmation letter", detail: "A wrong EIN makes the filing count as not filed." },
    { id: "owner", text: "Owner name matches the passport used to form the company", detail: "The name on Form 5472 must match formation documents." },
    { id: "totals", text: "Totals tie to the bank statement closing balance", detail: `We read ${classified.length} transactions, ${unknown.length} left unclear.` },
    { id: "cpa", text: "Send to a licensed CPA for signature", detail: "The reviewer prepares; the CPA signs. Nothing is filed before this step." },
  ];

  return { fields, checklist };
}
