export type PlanType = 'free' | 'plus' | 'premium' | 'pro';

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  price: number;
  searchLimit: number | 'unlimited';
  maxUsers: number;
  features: string[];
  highlighted?: boolean;
  color: 'gray' | 'amber' | 'cyan' | 'purple';
  badge?: string;
}

export interface UserSubscription {
  plan: PlanType;
  status: 'active' | 'expired' | 'cancelled' | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface SearchHistoryItem {
  id: string;
  make: string;
  model: string;
  year: string;
  system?: string;
  date: string;
  fileId: string;
  driveUrl?: string;
}

