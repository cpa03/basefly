import { getLegacyPriceDisplayString } from "@saasfly/common";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Generate FAQ answer with dynamic pricing
 */
function generateFAQAnswers(locale: "en" | "zh" | "ja" | "ko"): {
  freePlanCost: string;
  proMonthlyCost: string;
  businessMonthlyCost: string;
  annualPlans: string;
  trialPeriod: string;
} {
  const proMonthly = getLegacyPriceDisplayString("PRO", "monthly");
  const proYearly = getLegacyPriceDisplayString("PRO", "yearly");
  const businessMonthly = getLegacyPriceDisplayString("BUSINESS", "monthly");
  const businessYearly = getLegacyPriceDisplayString("BUSINESS", "yearly");

  switch (locale) {
    case "zh":
      return {
        freePlanCost:
          "我们的免费计划完全免费，没有月费或年费。这是一个开始使用和探索我们基本功能的好方法。",
        proMonthlyCost: `专业月度计划的价格是每月${proMonthly}美元。它提供了访问我们核心功能的权限，并且是按月计费的。`,
        businessMonthlyCost: `商务月度计划的价格是每月${businessMonthly}美元。它提供高级功能，并且也是按月计费，增加了灵活性。`,
        annualPlans: `是的，我们提供年度订阅计划，以便更多的节省。专业年度计划的费用是每年${proYearly}美元，商务年度计划是每年${businessYearly}美元。`,
        trialPeriod:
          "我们为专业月度和专业年度计划提供14天的免费试用期。这是一个在承诺付费订阅之前体验所有功能的好方法。",
      };
    case "ja":
      return {
        freePlanCost:
          "私たちの無料プランは完全に無料で、月額料金や年間料金はかかりません。基本的な機能を使い始めるには最適な方法です。",
        proMonthlyCost: `プロ月額プランは月に${proMonthly}ドルで、核心機能へのアクセスを提供し、月額で課金されます。`,
        businessMonthlyCost: `ビジネス月額プランは月に${businessMonthly}ドルで、高度な機能を提供し、柔軟性を高めるために月額で課金されます。`,
        annualPlans: `はい、さらなる節約のために年間サブスクリプションプランを提供しています。プロ年間プランは年間${proYearly}ドル、ビジネス年間プランは年間${businessYearly}ドルです。`,
        trialPeriod:
          "プロ月額プランとプロ年間プランの両方に14日間の無料トライアルを提供しています。これは、有料サブスクリプションを行う前に全ての機能を体験するのに最適な方法です。",
      };
    case "ko":
      return {
        freePlanCost:
          "저희 물료 플랜은 완전히 물료이며, 월간 또는 연간 요금이 없습니다. 기본 기능을 시작하고 탐색하는 데 좋은 방법입니다.",
        proMonthlyCost: `프로 월간 플랜은 월 ${proMonthly}달러입니다. 이 플랜은 핵심 기능에 대한 접근을 제공하며 월간으로 청구됩니다.`,
        businessMonthlyCost: `비즈니스 월간 플랜은 월 ${businessMonthly}달러입니다. 이 플랜은 고급 기능을 제공하며 유연성을 더하기 위해 월간으로 청구됩니다.`,
        annualPlans: `네, 더 큰 절약을 위해 연간 구독 플랜을 제공합니다. 프로 연간 플랜은 연 ${proYearly}달러이며, 비즈니스 연간 플랜은 연 ${businessYearly}달러입니다.`,
        trialPeriod:
          "저희는 프로 월간 및 프로 연간 플랜에 대해 14일 물료 체험 기간을 제공합니다. 유료 구독을 하기 전에 모든 기능을 경험할 수 있는 좋은 방법입니다.",
      };
    default: // en
      return {
        freePlanCost:
          "Our free plan is completely free, with no monthly or annual charges. It's a great way to get started and explore our basic features.",
        proMonthlyCost: `The Pro Monthly plan is priced at ${proMonthly} per month. It provides access to our core features and is billed on a monthly basis.`,
        businessMonthlyCost: `The Business Monthly plan is available for ${businessMonthly} per month. It offers advanced features and is billed on a monthly basis for added flexibility.`,
        annualPlans: `Yes, we offer annual subscription plans for even more savings. The Pro Annual plan is ${proYearly} per year, and the Business Annual plan is ${businessYearly} per year.`,
        trialPeriod:
          "We offer a 14-day free trial for both the Pro Monthly and Pro Annual plans. It's a great way to experience all the features before committing to a paid subscription.",
      };
  }
}

/**
 * FAQ questions by locale
 */
const FAQ_QUESTIONS: Record<"en" | "zh" | "ja" | "ko", string[]> = {
  en: [
    "What is the cost of the free plan?",
    "How much does the Pro Monthly plan cost?",
    "What is the price of the Business Monthly plan?",
    "Do you offer any annual subscription plans?",
    "Is there a trial period for the paid plans?",
  ],
  zh: [
    "免费计划的费用是多少？",
    "专业月度计划的费用是多少？",
    "商务月度计划的价格是多少？",
    "你们提供年度订阅计划吗？",
    "付费计划有试用期吗？",
  ],
  ja: [
    "無料プランの費用はいくらですか？",
    "プロ月額プランの費用はいくらですか？",
    "ビジネス月額プランの価格はいくらですか？",
    "年間サブスクリプションプランを提供していますか？",
    "有料プランには試用期間がありますか？",
  ],
  ko: [
    "물료 플랜의 비용은 얼마인가요?",
    "프로 월간 플랜의 비용은 얼마인가요?",
    "비즈니스 월간 플랜의 가격은 얼마인가요?",
    "연간 구독 플랜을 제공하나요?",
    "유료 플랜에는 체험 기간이 있나요?",
  ],
};

/**
 * Generate FAQ items for a locale
 */
function generateFAQItems(locale: "en" | "zh" | "ja" | "ko"): FAQItem[] {
  const answers = generateFAQAnswers(locale);
  const questions = FAQ_QUESTIONS[locale];

  return [
    {
      id: "item-1",
      question: questions[0]!,
      answer: answers.freePlanCost,
    },
    {
      id: "item-2",
      question: questions[1]!,
      answer: answers.proMonthlyCost,
    },
    {
      id: "item-3",
      question: questions[2]!,
      answer: answers.businessMonthlyCost,
    },
    {
      id: "item-4",
      question: questions[3]!,
      answer: answers.annualPlans,
    },
    {
      id: "item-5",
      question: questions[4]!,
      answer: answers.trialPeriod,
    },
  ];
}

export const priceFaqDataMap: Record<string, FAQItem[]> = {
  zh: generateFAQItems("zh"),
  en: generateFAQItems("en"),
  ja: generateFAQItems("ja"),
  ko: generateFAQItems("ko"),
};
