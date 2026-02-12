import {
  CLUSTER_LIMITS,
  getLegacyPriceDisplayString,
  LEGACY_PRICING_TIERS,
  type PlanTier,
} from "@saasfly/common";

import { env } from "~/env.mjs";

/**
 * Get the tier based on price amount
 * This replaces hardcoded logic with configuration-driven lookup
 */
function getTierFromAmount(amount: number): PlanTier {
  // Check each tier's monthly price
  for (const [tier, prices] of Object.entries(LEGACY_PRICING_TIERS)) {
    if (prices.monthly === amount) {
      return tier as PlanTier;
    }
  }

  // Fallback logic: 0 = STARTER, otherwise determine by price range
  if (amount === 0) return "STARTER";

  // Get sorted prices to determine tiers
  const tiers = Object.entries(LEGACY_PRICING_TIERS)
    .filter(([_, prices]) => prices.monthly > 0)
    .sort((a, b) => a[1].monthly - b[1].monthly);

  // Find appropriate tier based on price
  for (const [tier, prices] of tiers) {
    if (amount <= prices.monthly) {
      return tier as PlanTier;
    }
  }

  // Default to highest tier if price exceeds all
  return (tiers[tiers.length - 1]?.[0] as PlanTier) ?? "BUSINESS";
}

export interface SubscriptionPlanTranslation {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
}

/**
 * Helper function to generate cluster limit text for benefits
 */
function getClusterLimitText(
  limit: number,
  locale: "en" | "zh" | "ja" | "ko",
): string {
  const texts: Record<typeof locale, string> = {
    en: `Up to ${limit} cluster${limit > 1 ? "s" : ""} per month`,
    zh: `每月最多${limit}个集群`,
    ja: `月に最大${limit}つのクラスター`,
    ko: `월 최대 ${limit}개의 클러스터`,
  };
  return texts[locale];
}

/**
 * Plan configuration with centralized pricing values
 */
const createPlanConfig = (
  tier: PlanTier,
  translations: {
    title: string;
    description: string;
    benefits: string[];
    limitations: string[];
  },
  locale: "en" | "zh" | "ja" | "ko",
): SubscriptionPlanTranslation => {
  const prices = LEGACY_PRICING_TIERS[tier];
  const clusterLimit = CLUSTER_LIMITS[tier];

  // Update first benefit with cluster limit
  const benefits = [...translations.benefits];
  if (tier !== "BUSINESS") {
    benefits[0] = getClusterLimitText(clusterLimit, locale);
  }

  return {
    id: tier.toLowerCase(),
    title: translations.title,
    description: translations.description,
    benefits,
    limitations: translations.limitations,
    prices: {
      monthly: prices.monthly,
      yearly: prices.yearly,
    },
    stripeIds: {
      monthly:
        tier === "STARTER"
          ? null
          : (env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? null),
      yearly:
        tier === "STARTER"
          ? null
          : (env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? null),
    },
  };
};

/**
 * Translations for each locale
 */
const translations = {
  zh: {
    starter: {
      title: "入门版",
      description: "适合初学者",
      benefits: ["每月最多1个集群", "基础分析和报告", "访问基础功能"],
      limitations: [
        "无法优先获取新功能",
        "有限的客户支持",
        "无法自定义品牌",
        "对商业资源的访问受限",
      ],
    },
    pro: {
      title: "专业版",
      description: "解锁高级功能",
      benefits: [
        "每月最多3个集群",
        "高级分析和报告",
        "访问商业模板",
        "优先客户支持",
        "独家网络研讨会和培训",
      ],
      limitations: ["无法自定义品牌", "对商业资源的访问受限"],
    },
    business: {
      title: "商业版",
      description: "适合高级用户",
      benefits: [
        "每月最多10个集群",
        "实时分析和报告",
        "访问所有模板，包括自定义品牌",
        "全天候商业客户支持",
        "个性化的配置和账户管理",
      ],
      limitations: [],
    },
  },
  en: {
    starter: {
      title: "Starter",
      description: "For Beginners",
      benefits: [
        "Up to 1 cluster per month",
        "Basic analytics and reporting",
        "Access to basic features",
      ],
      limitations: [
        "No priority access to new features",
        "Limited customer support",
        "No custom branding",
        "Limited access to business resources",
      ],
    },
    pro: {
      title: "Pro",
      description: "Unlock Advanced Features",
      benefits: [
        "Up to 3 clusters per month",
        "Advanced analytics and reporting",
        "Access to business templates",
        "Priority customer support",
        "Exclusive webinars and training",
      ],
      limitations: [
        "No custom branding",
        "Limited access to business resources",
      ],
    },
    business: {
      title: "Business",
      description: "For Power Users",
      benefits: [
        "Up to 10 clusters per month",
        "Real-time analytics and reporting",
        "Access to all templates, including custom branding",
        "24/7 business customer support",
        "Personalized configuration and account management",
      ],
      limitations: [],
    },
  },
  ja: {
    starter: {
      title: "スターター",
      description: "初心者向け",
      benefits: [
        "月に最大1つのクラスター",
        "基本的な分析とレポート",
        "基本機能へのアクセス",
      ],
      limitations: [
        "新機能への優先アクセスなし",
        "限定的なカスタマーサポート",
        "カスタムブランディングなし",
        "ビジネスリソースへのアクセスが限定的",
      ],
    },
    pro: {
      title: "プロ",
      description: "高度な機能のロックを解除",
      benefits: [
        "月に最大3つのクラスター",
        "高度な分析とレポート",
        "ビジネステンプレートへのアクセス",
        "優先カスタマーサポート",
        "独占的なウェビナーとトレーニング",
      ],
      limitations: [
        "カスタムブランディングなし",
        "ビジネスリソースへのアクセスが限定的",
      ],
    },
    business: {
      title: "ビジネス",
      description: "パワーユーザー向け",
      benefits: [
        "月に最大10つのクラスター",
        "リアルタイムの分析とレポート",
        "すべてのテンプレート（カスタムブランディングを含む）へのアクセス",
        "24/7のビジネスカスタマーサポート",
        "パーソナライズされた設定とアカウント管理",
      ],
      limitations: [],
    },
  },
  ko: {
    starter: {
      title: "스타터",
      description: "초보자를 위한",
      benefits: [
        "월 최대 1개의 클러스터",
        "기본 분석 및 보고",
        "기본 기능에 대한 액세스",
      ],
      limitations: [
        "새로운 기능에 대한 우선 액세스 없음",
        "제한된 고객 지원",
        "맞춤 브랜딩 없음",
        "비즈니스 리소스에 대한 액세스 제한",
      ],
    },
    pro: {
      title: "프로",
      description: "고급 기능 잠금 해제",
      benefits: [
        "월 최대 3개의 클러스터",
        "고급 분석 및 보고",
        "비즈니스 템플릿에 대한 액세스",
        "우선 고객 지원",
        "독점 웹 세미나 및 교육",
      ],
      limitations: ["맞춤 브랜딩 없음", "비즈니스 리소스에 대한 액세스 제한"],
    },
    business: {
      title: "비즈니스",
      description: "파워 사용자를 위한",
      benefits: [
        "월 최대 10개의 클러스터",
        "실시간 분석 및 보고",
        "모든 템플릿에 대한 액세스, 맞춤 브랜딩 포함",
        "24/7 비즈니스 고객 지원",
        "맞춤 설정 및 계정 관리",
      ],
      limitations: [],
    },
  },
};

/**
 * Price data map with centralized pricing values
 */
export const priceDataMap: Record<string, SubscriptionPlanTranslation[]> = {
  zh: [
    createPlanConfig("STARTER", translations.zh.starter, "zh"),
    createPlanConfig("PRO", translations.zh.pro, "zh"),
    createPlanConfig("BUSINESS", translations.zh.business, "zh"),
  ],
  en: [
    createPlanConfig("STARTER", translations.en.starter, "en"),
    createPlanConfig("PRO", translations.en.pro, "en"),
    createPlanConfig("BUSINESS", translations.en.business, "en"),
  ],
  ja: [
    createPlanConfig("STARTER", translations.ja.starter, "ja"),
    createPlanConfig("PRO", translations.ja.pro, "ja"),
    createPlanConfig("BUSINESS", translations.ja.business, "ja"),
  ],
  ko: [
    createPlanConfig("STARTER", translations.ko.starter, "ko"),
    createPlanConfig("PRO", translations.ko.pro, "ko"),
    createPlanConfig("BUSINESS", translations.ko.business, "ko"),
  ],
};

/**
 * @deprecated Use getLegacyPriceDisplayString from @saasfly/common instead
 */
export function formatPrice(amount: number): string {
  const tier = getTierFromAmount(amount);
  return getLegacyPriceDisplayString(tier, "monthly");
}
