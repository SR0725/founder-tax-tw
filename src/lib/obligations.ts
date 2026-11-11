// Filing obligations are decided by this rule table, never by a model.
// Every rule is a draft until someone checks it against the source and flips `verified`.

type L = { en: string; zh: string };

export type Company = {
  id: string;
  name: string;
  state: "Delaware" | "Wyoming";
  formed: string;
  members: { name: string; share: number; taxResident: string }[];
  taxClass: "partnership" | "disregarded";
  explain: L;
};

export type Jurisdiction = "federal" | "delaware" | "wyoming" | "taiwan";

export const JURISDICTION_LABEL: Record<Jurisdiction, L> = {
  federal: { en: "US federal", zh: "美國聯邦" },
  delaware: { en: "Delaware", zh: "Delaware 州" },
  wyoming: { en: "Wyoming", zh: "Wyoming 州" },
  taiwan: { en: "Taiwan", zh: "台灣" },
};

export type Obligation = {
  id: string;
  companyId: string | "personal";
  jurisdiction: Jurisdiction;
  form: string;
  title: L;
  due: string; // ISO date
  penalty: L;
  maxPenalty: number; // USD, used for the exposure total; 0 when unknown
  fee?: string;
  why: L;
  need: L[];
  question?: L; // when set, the filing only applies if the founder answers yes
  source: string;
  verified: boolean;
};

// Synthetic founder. Shaped like a real Taiwanese founder's setup, with invented names and numbers.
export const founder = { name: "Ray", residence: { en: "Taipei, Taiwan", zh: "台灣台北" } };

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
    explain: {
      en: "Two members, so the IRS treats it as a partnership. It files its own return and hands each member a K-1.",
      zh: "有兩位成員，所以美國國稅局（IRS）把它當成合夥：公司要自己申報，並發給每位成員一張 K-1。",
    },
  },
  {
    id: "kuroshio",
    name: "Kuroshio Studio LLC",
    state: "Wyoming",
    formed: "2026-08-04",
    members: [{ name: "Ray", share: 100, taxResident: "Taiwan" }],
    taxClass: "disregarded",
    explain: {
      en: "One foreign owner, so the IRS ignores it for income tax but still demands an information return about money moving between you and the company.",
      zh: "只有一位外國老闆，所以所得稅上國稅局當它不存在，但仍然要求你申報自己和公司之間的每一筆金錢往來。",
    },
  },
];

export function obligationsFor(year: number): Obligation[] {
  const y = year;
  return [
    {
      id: "1099-nec",
      companyId: "formosa",
      jurisdiction: "federal",
      form: "Form 1099-NEC",
      title: { en: "Report payments to US contractors", zh: "申報付給美國承包商的款項" },
      due: `${y}-02-01`,
      penalty: { en: "Charged per late form, rising the longer you wait", zh: "每張逾期表單各罰一筆，拖越久罰越重" },
      maxPenalty: 0,
      why: {
        en: "A US company that pays a US person for services has to report those payments to the IRS and to the contractor.",
        zh: "美國公司付錢請美國人提供服務，必須向國稅局和對方申報這筆款項。",
      },
      need: [
        { en: "Contractor names and W-9 forms", zh: "承包商姓名與 W-9 表" },
        { en: "Total paid to each contractor in the prior year", zh: "去年付給每位承包商的總額" },
      ],
      question: {
        en: "Did Formosa Labs pay any US-based contractor last year?",
        zh: "Formosa Labs 去年有付錢給任何在美國的承包商嗎？",
      },
      source: "https://www.irs.gov/forms-pubs/about-form-1099-nec",
      verified: false,
    },
    {
      id: "1065",
      companyId: "formosa",
      jurisdiction: "federal",
      form: "Form 1065 + 2 Schedule K-1",
      title: { en: "Partnership return for Formosa Labs", zh: "Formosa Labs 的合夥申報" },
      due: `${y}-03-15`,
      penalty: { en: "About $250 per member per month, up to 12 months", zh: "每位成員每月約 250 美元，最多罰 12 個月" },
      maxPenalty: 6000,
      why: {
        en: "A multi-member LLC is taxed as a partnership. It owes this return every year even if it made no profit, and each member gets a K-1 showing their share.",
        zh: "兩人以上的 LLC 在美國稅法上視為合夥。就算沒賺錢也要每年申報，每位成員會拿到一張 K-1，載明自己分到多少。",
      },
      need: [
        { en: "Full-year Stripe payout export", zh: "全年 Stripe 撥款匯出檔" },
        { en: "Bank statements for every company account", zh: "公司所有帳戶的銀行對帳單" },
        {
          en: "What each member took out, and whether it was a salary-like payment or a distribution",
          zh: "每位成員領了多少錢，以及性質是固定報酬還是盈餘分配",
        },
      ],
      source: "https://www.irs.gov/forms-pubs/about-form-1065",
      verified: false,
    },
    {
      id: "8804",
      companyId: "formosa",
      jurisdiction: "federal",
      form: "Form 8804 / 8805",
      title: { en: "Withholding on foreign members' share", zh: "外國成員應分所得的扣繳" },
      due: `${y}-03-15`,
      penalty: {
        en: "Interest and penalties on any tax that should have been withheld",
        zh: "應扣未扣的稅額會加計利息與罰鍰",
      },
      maxPenalty: 0,
      why: {
        en: "When a partnership has foreign members and US business income, it must withhold tax on their share. Whether your income counts depends on where the work is done.",
        zh: "合夥有外國成員、又有美國營業所得時，要替外國成員預先扣繳。你的收入算不算，取決於實際在哪裡工作。",
      },
      need: [
        { en: "Where each member physically works", zh: "每位成員實際工作的地點" },
        { en: "Whether the company has any US office, staff or agent", zh: "公司在美國有沒有辦公室、員工或代理人" },
      ],
      question: {
        en: "Does Formosa Labs have any office, employee or dependent agent in the US?",
        zh: "Formosa Labs 在美國有辦公室、員工或代理人嗎？",
      },
      source: "https://www.irs.gov/forms-pubs/about-form-8804",
      verified: false,
    },
    {
      id: "5472",
      companyId: "kuroshio",
      jurisdiction: "federal",
      form: "Form 5472 + pro forma Form 1120",
      title: { en: "Foreign-owned LLC information return", zh: "外資 LLC 資訊申報" },
      due: `${y}-04-15`,
      penalty: { en: "$25,000 per missed form", zh: "每漏一張罰 25,000 美元" },
      maxPenalty: 25000,
      why: {
        en: "A single-member LLC owned by a foreign person must report every transaction between the owner and the company, including the money you put in to open it.",
        zh: "外國人獨資的 LLC，必須申報老闆和公司之間的每一筆往來，連開公司時匯進去的那筆錢也算。",
      },
      need: [
        {
          en: "Every transfer between you and the company (capital in, money out)",
          zh: "你和公司之間的每一筆轉帳（投入的資本、領出的錢）",
        },
        { en: "Formation costs paid personally", zh: "你個人代墊的開辦費用" },
        { en: "EIN confirmation letter", zh: "EIN（雇主識別號碼）核發通知書" },
      ],
      source: "https://www.irs.gov/forms-pubs/about-form-5472",
      verified: false,
    },
    {
      id: "fbar",
      companyId: "formosa",
      jurisdiction: "federal",
      form: "FinCEN Form 114 (FBAR)",
      title: { en: "Report company accounts held outside the US", zh: "申報公司在美國以外的帳戶" },
      due: `${y}-04-15`,
      penalty: { en: "Civil penalties per unreported account", zh: "每個未申報帳戶各有民事罰鍰" },
      maxPenalty: 0,
      why: {
        en: "A US company whose non-US accounts total more than $10,000 at any point in the year has to report them.",
        zh: "美國公司在美國以外的帳戶，全年任一時點合計超過 10,000 美元就要申報。",
      },
      need: [
        {
          en: "List of non-US bank and payment accounts in the company's name",
          zh: "公司名下所有非美國的銀行與支付帳戶",
        },
        { en: "Highest balance of each during the year", zh: "每個帳戶當年度的最高餘額" },
      ],
      question: {
        en: "Does either company hold more than $10,000 in accounts outside the US?",
        zh: "兩家公司在美國以外的帳戶，合計有超過 10,000 美元嗎？",
      },
      source: "https://www.fincen.gov/report-foreign-bank-and-financial-accounts",
      verified: false,
    },
    {
      id: "tw-income",
      companyId: "personal",
      jurisdiction: "taiwan",
      form: "綜合所得稅 / 基本所得額",
      title: {
        en: "Your personal Taiwan return: overseas income and CFC rules",
        zh: "你個人的台灣報稅：海外所得與受控外國企業（CFC）",
      },
      due: `${y}-05-31`,
      penalty: { en: "Back tax plus a fine; ask a Taiwan CPA", zh: "補稅加罰鍰，請找台灣會計師確認" },
      maxPenalty: 0,
      why: {
        en: "Money you receive from your US companies is overseas income in Taiwan. Taiwan's controlled-foreign-company rules may also tax profit you left inside the company. US services never tell you this.",
        zh: "你從美國公司領到的錢，在台灣屬於海外所得。台灣的受控外國企業（CFC）制度，也可能對你留在公司裡沒領出來的盈餘課稅。美國的報稅服務不會告訴你這件事。",
      },
      need: [
        { en: "Distributions received from each company", zh: "從每家公司領到的分配金額" },
        { en: "Each company's year-end profit", zh: "每家公司的年底盈餘" },
        {
          en: "A Taiwan CPA to confirm how the CFC rules apply to an LLC",
          zh: "請台灣會計師確認 CFC 制度對 LLC 怎麼適用",
        },
      ],
      source: "https://www.ntbt.gov.tw/",
      verified: false,
    },
    {
      id: "de-tax",
      companyId: "formosa",
      jurisdiction: "delaware",
      form: "Delaware LLC annual tax",
      title: { en: "Delaware annual tax", zh: "Delaware 年度稅" },
      due: `${y}-06-01`,
      penalty: { en: "$200 plus 1.5% interest per month", zh: "罰 200 美元，另加每月 1.5% 利息" },
      maxPenalty: 200,
      fee: "$300",
      why: {
        en: "Every Delaware LLC pays a flat annual tax to stay in good standing, whether or not it earned anything.",
        zh: "每家 Delaware LLC 不論有沒有收入，每年都要繳一筆固定的年度稅，公司才能維持有效狀態。",
      },
      need: [
        { en: "Delaware file number", zh: "Delaware 公司檔案編號" },
        { en: "A card to pay with", zh: "一張可以付款的信用卡" },
      ],
      source: "https://corp.delaware.gov/paytaxes/",
      verified: false,
    },
    {
      id: "wy-report",
      companyId: "kuroshio",
      jurisdiction: "wyoming",
      form: "Wyoming annual report",
      title: { en: "Wyoming annual report", zh: "Wyoming 年度報告" },
      due: `${y}-08-01`,
      penalty: {
        en: "The state dissolves the company if it stays unfiled",
        zh: "一直不申報，州政府會直接解散公司",
      },
      maxPenalty: 0,
      fee: "$60",
      why: {
        en: "Wyoming LLCs file a short report each year in the month the company was formed.",
        zh: "Wyoming 的 LLC 每年要在公司成立的那個月份交一份簡短報告。",
      },
      need: [
        { en: "Wyoming filing ID", zh: "Wyoming 申報編號" },
        { en: "Value of assets located in Wyoming (usually zero)", zh: "位於 Wyoming 的資產價值（通常是零）" },
      ],
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
