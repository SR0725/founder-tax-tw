// Filing obligations are decided by this rule table, never by a model.
// Every rule is a draft until someone checks it against the source and flips `verified`.

export type Company = {
  id: string;
  name: string;
  state: "Delaware" | "Wyoming";
  formed: string;
  members: { name: string; share: number; taxResident: string }[];
  taxClass: "partnership" | "disregarded";
  plainEnglish: string;
};

export type Jurisdiction = "US federal" | "Delaware" | "Wyoming" | "Taiwan";

export type Obligation = {
  id: string;
  companyId: string | "personal";
  jurisdiction: Jurisdiction;
  form: string;
  title: string;
  due: string; // ISO date
  penalty: string;
  maxPenalty: number; // USD, used for the exposure total; 0 when unknown
  fee?: string;
  why: string;
  need: string[];
  question?: string; // when set, the filing only applies if the founder answers yes
  source: string;
  verified: boolean;
};

// Synthetic founder. Shaped like a real Taiwanese founder's setup, with invented names and numbers.
export const founder = { name: "Ray", residence: "Taipei, Taiwan" };

export const companies: Company[] = [
  {
    id: "formosa",
    name: "Formosa Labs LLC",
    state: "Delaware",
    formed: "2024-03-12",
    members: [
      { name: "Ray", share: 60, taxResident: "Taiwan" },
      { name: "Co-founder", share: 40, taxResident: "Taiwan" },
    ],
    taxClass: "partnership",
    plainEnglish:
      "Two members, so the IRS treats it as a partnership. It files its own return and hands each member a K-1.",
  },
  {
    id: "kuroshio",
    name: "Kuroshio Studio LLC",
    state: "Wyoming",
    formed: "2026-08-04",
    members: [{ name: "Ray", share: 100, taxResident: "Taiwan" }],
    taxClass: "disregarded",
    plainEnglish:
      "One foreign owner, so the IRS ignores it for income tax but still demands an information return about money moving between you and the company.",
  },
];

export function obligationsFor(year: number): Obligation[] {
  const y = year;
  return [
    {
      id: "1099-nec",
      companyId: "formosa",
      jurisdiction: "US federal",
      form: "Form 1099-NEC",
      title: "Report payments to US contractors",
      due: `${y}-02-01`,
      penalty: "Charged per late form, rising the longer you wait",
      maxPenalty: 0,
      why: "A US company that pays a US person for services has to report those payments to the IRS and to the contractor.",
      need: ["Contractor names and W-9 forms", "Total paid to each contractor in the prior year"],
      question: "Did Formosa Labs pay any US-based contractor last year?",
      source: "https://www.irs.gov/forms-pubs/about-form-1099-nec",
      verified: false,
    },
    {
      id: "1065",
      companyId: "formosa",
      jurisdiction: "US federal",
      form: "Form 1065 + 2 Schedule K-1",
      title: "Partnership return for Formosa Labs",
      due: `${y}-03-15`,
      penalty: "About $250 per member per month, up to 12 months",
      maxPenalty: 6000,
      why: "A multi-member LLC is taxed as a partnership. It owes this return every year even if it made no profit, and each member gets a K-1 showing their share.",
      need: [
        "Full-year Stripe payout export",
        "Bank statements for every company account",
        "What each member took out, and whether it was a salary-like payment or a distribution",
      ],
      source: "https://www.irs.gov/forms-pubs/about-form-1065",
      verified: false,
    },
    {
      id: "8804",
      companyId: "formosa",
      jurisdiction: "US federal",
      form: "Form 8804 / 8805",
      title: "Withholding on foreign members' share",
      due: `${y}-03-15`,
      penalty: "Interest and penalties on any tax that should have been withheld",
      maxPenalty: 0,
      why: "When a partnership has foreign members and US business income, it must withhold tax on their share. Whether your income counts depends on where the work is done.",
      need: ["Where each member physically works", "Whether the company has any US office, staff or agent"],
      question: "Does Formosa Labs have any office, employee or dependent agent in the US?",
      source: "https://www.irs.gov/forms-pubs/about-form-8804",
      verified: false,
    },
    {
      id: "5472",
      companyId: "kuroshio",
      jurisdiction: "US federal",
      form: "Form 5472 + pro forma Form 1120",
      title: "Foreign-owned LLC information return",
      due: `${y}-04-15`,
      penalty: "$25,000 per missed form",
      maxPenalty: 25000,
      why: "A single-member LLC owned by a foreign person must report every transaction between the owner and the company, including the money you put in to open it.",
      need: [
        "Every transfer between you and the company (capital in, money out)",
        "Formation costs paid personally",
        "EIN confirmation letter",
      ],
      source: "https://www.irs.gov/forms-pubs/about-form-5472",
      verified: false,
    },
    {
      id: "fbar",
      companyId: "formosa",
      jurisdiction: "US federal",
      form: "FinCEN Form 114 (FBAR)",
      title: "Report company accounts held outside the US",
      due: `${y}-04-15`,
      penalty: "Civil penalties per unreported account",
      maxPenalty: 0,
      why: "A US company whose non-US accounts total more than $10,000 at any point in the year has to report them.",
      need: ["List of non-US bank and payment accounts in the company's name", "Highest balance of each during the year"],
      question: "Does either company hold more than $10,000 in accounts outside the US?",
      source: "https://www.fincen.gov/report-foreign-bank-and-financial-accounts",
      verified: false,
    },
    {
      id: "tw-income",
      companyId: "personal",
      jurisdiction: "Taiwan",
      form: "綜合所得稅 / 基本所得額",
      title: "Your personal Taiwan return: overseas income and CFC rules",
      due: `${y}-05-31`,
      penalty: "Back tax plus a fine; ask a Taiwan CPA",
      maxPenalty: 0,
      why: "Money you receive from your US companies is overseas income in Taiwan. Taiwan's controlled-foreign-company rules may also tax profit you left inside the company. US services never tell you this.",
      need: ["Distributions received from each company", "Each company's year-end profit", "A Taiwan CPA to confirm how the CFC rules apply to an LLC"],
      source: "https://www.ntbt.gov.tw/",
      verified: false,
    },
    {
      id: "de-tax",
      companyId: "formosa",
      jurisdiction: "Delaware",
      form: "Delaware LLC annual tax",
      title: "Delaware annual tax",
      due: `${y}-06-01`,
      penalty: "$200 plus 1.5% interest per month",
      maxPenalty: 200,
      fee: "$300",
      why: "Every Delaware LLC pays a flat annual tax to stay in good standing, whether or not it earned anything.",
      need: ["Delaware file number", "A card to pay with"],
      source: "https://corp.delaware.gov/paytaxes/",
      verified: false,
    },
    {
      id: "wy-report",
      companyId: "kuroshio",
      jurisdiction: "Wyoming",
      form: "Wyoming annual report",
      title: "Wyoming annual report",
      due: `${y}-08-01`,
      penalty: "The state dissolves the company if it stays unfiled",
      maxPenalty: 0,
      fee: "$60",
      why: "Wyoming LLCs file a short report each year in the month the company was formed.",
      need: ["Wyoming filing ID", "Value of assets located in Wyoming (usually zero)"],
      source: "https://sos.wyo.gov/Business/",
      verified: false,
    },
  ];
}

export function daysUntil(due: string, now: Date): number {
  const d = new Date(`${due}T00:00:00`);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - start.getTime()) / 86_400_000);
}

export function formatDue(due: string): { month: string; day: string; full: string } {
  const d = new Date(`${due}T00:00:00`);
  return {
    month: d.toLocaleString("en-US", { month: "short" }),
    day: String(d.getDate()),
    full: d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  };
}
