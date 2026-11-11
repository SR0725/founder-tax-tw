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

export type Lang = "en" | "zh";

export const CATEGORY_LABEL: Record<Category, Record<Lang, string>> = {
  owner_contribution: { en: "Capital from owner", zh: "老闆投入資本" },
  owner_distribution: { en: "Distribution to owner", zh: "分配給老闆" },
  owner_loan: { en: "Loan to or from owner", zh: "老闆與公司間借款" },
  owner_reimbursement: { en: "Reimbursement to owner", zh: "報銷給老闆" },
  related_company_payment: { en: "Payment to related company", zh: "付給關係企業" },
  revenue: { en: "Revenue", zh: "營業收入" },
  expense: { en: "Expense", zh: "費用" },
  unknown: { en: "Unclear", zh: "不明" },
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

export function parseCsv(text: string, lang: Lang = "en"): Txn[] {
  const zh = lang === "zh";
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new CsvError(zh ? "這個檔案是空的。" : "The file is empty.");
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const [d, desc, amt, memo] = [col("date"), col("description"), col("amount"), col("memo")];
  if (d < 0 || desc < 0 || amt < 0) {
    throw new CsvError(zh ? "讀不懂這個檔案。需要有 date、description、amount 三個欄位。" : "We couldn't read this file. It needs the columns: date, description, amount.");
  }
  const rows = lines.slice(1).map((line, i) => {
    const cells = line.split(",").map((c) => c.trim());
    const amount = Number(cells[amt]);
    if (Number.isNaN(amount)) {
      throw new CsvError(zh ? `第 ${i + 2} 列的金額讀不懂：「${cells[amt] ?? ""}」。` : `Row ${i + 2} has an amount we can't read: "${cells[amt] ?? ""}".`);
    }
    return {
      id: `t${i + 1}`,
      date: cells[d] ?? "",
      description: cells[desc] ?? "",
      amount,
      memo: memo >= 0 ? cells[memo] ?? "" : "",
    };
  });
  if (rows.length > 500) throw new CsvError(zh ? "示範版每個檔案最多讀 500 筆交易。" : "This demo reads up to 500 transactions per file.");
  return rows;
}

export function isReportable(category: Category) {
  return REPORTABLE.includes(category);
}

// Keyword fallback used when no model is available. Deliberately conservative: anything
// touching the owner that is not obviously a contribution or draw is marked low confidence.
const RULE_REASON = {
  expense: { en: "Ordinary operating expense paid to an unrelated vendor.", zh: "付給非關係人廠商的一般營業費用。" },
  stripe: { en: "Stripe payout: customer revenue, not a transaction with the owner.", zh: "Stripe 撥款，屬於客戶收入，不是和老闆之間的往來。" },
  contribution: { en: "Money in from the owner.", zh: "老闆匯進公司的錢。" },
  reimbursement: {
    en: "Looks like a reimbursement. Whether it is reported as a reimbursement or a distribution depends on whether the owner has a receipt.",
    zh: "看起來是報銷。要報成報銷還是分配，取決於老闆有沒有收據。",
  },
  loan: {
    en: "The memo suggests the money will come back. Without a loan agreement this may have to be reported as a distribution.",
    zh: "備註顯示這筆錢之後會還。沒有借款合約的話，可能要當成分配申報。",
  },
  distribution: { en: "Money out to the owner.", zh: "公司匯給老闆的錢。" },
  related: {
    en: "Paid to a company the same person owns. Related-party payments are reportable and need an invoice to support the amount.",
    zh: "付給同一個人持有的另一家公司。關係人交易要申報，而且需要發票佐證金額。",
  },
  unknownIn: {
    en: "Money in from an unidentified sender. If it came from the owner it is reportable capital.",
    zh: "來源不明的匯入款。如果是老闆匯的，就是要申報的資本。",
  },
} as const;

export function classifyWithRules(
  txns: Txn[],
  ownerName: string,
  relatedCompanies: string[],
  lang: Lang = "en",
): Classified[] {
  const owner = ownerName.toUpperCase();
  return txns.map((t) => {
    const text = `${t.description} ${t.memo}`.toUpperCase();
    let category: Category = t.amount >= 0 ? "unknown" : "expense";
    let confidence: Confidence = "high";
    let reason: keyof typeof RULE_REASON = "expense";

    if (text.includes("STRIPE")) {
      category = "revenue";
      reason = "stripe";
    } else if (text.includes(owner)) {
      if (t.amount > 0) {
        category = "owner_contribution";
        reason = "contribution";
      } else if (/REIMB/.test(text)) {
        category = "owner_reimbursement";
        confidence = "low";
        reason = "reimbursement";
      } else if (/LOAN|TEMPORARY|RETURN/.test(text)) {
        category = "owner_loan";
        confidence = "low";
        reason = "loan";
      } else {
        category = "owner_distribution";
        reason = "distribution";
      }
    } else if (relatedCompanies.some((c) => text.includes(c.toUpperCase()))) {
      category = "related_company_payment";
      confidence = "low";
      reason = "related";
    } else if (t.amount > 0) {
      confidence = "low";
      reason = "unknownIn";
    }

    return { ...t, category, reportable: isReportable(category), confidence, reason: RULE_REASON[reason][lang] };
  });
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function buildDraft(
  classified: Classified[],
  company: { name: string; state: string },
  owner: { name: string; country: string },
  lang: Lang = "en",
): Pick<Draft, "fields" | "checklist"> {
  const zh = lang === "zh";
  const total = (c: Category) =>
    classified.filter((t) => t.category === c).reduce((s, t) => s + Math.abs(t.amount), 0);
  const rows = (c: Category) => classified.filter((t) => t.category === c);
  const unsure = (c: Category) => rows(c).some((t) => t.confidence === "low");
  const basis = (c: Category) => {
    const r = rows(c);
    const dates = r.map((t) => t.date).join(zh ? "、" : ", ");
    if (r.length === 0) return zh ? "沒有找到符合的交易。" : "No matching transactions found.";
    return zh
      ? `由 ${r.length} 筆交易加總：${dates}。`
      : `Sum of ${r.length} transaction${r.length > 1 ? "s" : ""}: ${dates}.`;
  };

  const S = {
    corp: zh ? "Form 5472 · 申報公司" : "Form 5472 · Reporting corporation",
    owner: zh ? "Form 5472 · 外國股東" : "Form 5472 · Foreign owner",
    txn: zh ? "Form 5472 · 與外國股東的應申報交易" : "Form 5472 · Reportable transactions with the foreign owner",
    proforma: zh ? "形式上的 Form 1120" : "Pro forma Form 1120",
  };
  const profile = zh ? "取自你的公司資料。" : "From your company profile.";
  const money = (c: Category, label: string): DraftField => ({
    section: S.txn,
    label,
    value: usd(total(c)),
    basis: basis(c),
    needsReview: unsure(c),
  });

  const fields: DraftField[] = [
    { section: S.corp, label: zh ? "公司名稱" : "Name", value: company.name, basis: profile, needsReview: false },
    { section: S.corp, label: zh ? "成立州別" : "State of formation", value: company.state, basis: profile, needsReview: false },
    {
      section: S.corp,
      label: zh ? "EIN（雇主識別號碼）" : "Employer Identification Number",
      value: zh ? "缺少" : "Missing",
      basis: zh ? "請上傳 EIN 核發通知書。這個號碼我們絕不用猜的。" : "Upload your EIN confirmation letter. We never guess this number.",
      needsReview: true,
    },
    { section: S.owner, label: zh ? "姓名" : "Name", value: owner.name, basis: profile, needsReview: false },
    {
      section: S.owner,
      label: zh ? "稅務居民國" : "Country of tax residence",
      value: zh && owner.country === "Taiwan" ? "台灣" : owner.country,
      basis: profile,
      needsReview: false,
    },
    money("owner_contribution", zh ? "股東投入的資本" : "Capital contributed by the owner"),
    money("owner_distribution", zh ? "分配給股東的金額" : "Distributions paid to the owner"),
    money("owner_loan", zh ? "股東與公司之間的借款" : "Loans between owner and company"),
    money("owner_reimbursement", zh ? "報銷給股東的金額" : "Reimbursements paid to the owner"),
    money("related_company_payment", zh ? "付給同一股東旗下公司的金額" : "Payments to companies under common ownership"),
    {
      section: S.proforma,
      label: zh ? "表頭註記" : "Header",
      value: "Foreign-owned U.S. DE",
      basis: zh
        ? "稅務上不視為獨立個體的公司，只填名稱、地址、EIN 三欄，並在表頭寫上這行字。"
        : "A disregarded entity files only the name, address and EIN lines, with this text across the top.",
      needsReview: false,
    },
  ];

  const unknown = rows("unknown");
  const checklist: ChecklistItem[] = [
    ...classified
      .filter((t) => t.confidence === "low")
      .map((t) => ({
        id: `txn-${t.id}`,
        text: zh
          ? `確認 ${t.date} 這筆 ${usd(Math.abs(t.amount))} 要怎麼申報（${t.description}）`
          : `Confirm how to report ${usd(Math.abs(t.amount))} on ${t.date} (${t.description})`,
        detail: t.reason,
      })),
    {
      id: "ein",
      text: zh ? "草稿上的 EIN 與國稅局核發通知書一致" : "EIN on the draft matches the IRS confirmation letter",
      detail: zh ? "EIN 填錯，這份申報會被視為沒有申報。" : "A wrong EIN makes the filing count as not filed.",
    },
    {
      id: "owner",
      text: zh ? "股東姓名與開公司時用的護照一致" : "Owner name matches the passport used to form the company",
      detail: zh ? "Form 5472 上的姓名必須和公司設立文件相同。" : "The name on Form 5472 must match formation documents.",
    },
    {
      id: "totals",
      text: zh ? "加總金額與銀行對帳單期末餘額對得起來" : "Totals tie to the bank statement closing balance",
      detail: zh
        ? `共讀取 ${classified.length} 筆交易，其中 ${unknown.length} 筆無法判斷。`
        : `We read ${classified.length} transactions, ${unknown.length} left unclear.`,
    },
    {
      id: "cpa",
      text: zh ? "送交有執照的美國會計師簽名" : "Send to a licensed CPA for signature",
      detail: zh
        ? "審核員負責準備，會計師負責簽名。在這一步之前不會送出任何申報。"
        : "The reviewer prepares; the CPA signs. Nothing is filed before this step.",
    },
  ];

  return { fields, checklist };
}
