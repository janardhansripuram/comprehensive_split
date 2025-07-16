export interface User {
  id: string;
  email: string;
  displayName?: string;
  defaultCurrency: string;
  walletBalances: { [currency: string]: number };
  referralCode?: string;
  referredBy?: string;
  rewardPoints: number;
  streakCount: number;
  lastExpenseDate?: Date;
  subscriptionPlan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
  groupId?: string;
  splitId?: string;
  merchant?: string;
  extractedData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  userId: string;
  source: string;
  amount: number;
  currency: string;
  date: Date;
  notes?: string;
  category?: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  month?: string;
  startDate?: Date;
  endDate?: Date;
  rollover?: boolean;
  alertThreshold?: number;
  aiSuggested?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  groupId?: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  contributions: {
    userId: string;
    userName: string;
    amount: number;
    date: Date;
  }[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupSavingsGoal extends SavingsGoal {
  groupId: string;
}

export interface Investment {
  id: string;
  userId: string;
  type: 'stock' | 'crypto' | 'real_estate' | 'bond' | 'mutual_fund' | 'other';
  name: string;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  type: 'transfer' | 'settlement' | 'add_funds';
  description: string;
  splitId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  displayName?: string;
  email?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  admins: string[];
  members: string[];
  memberDetails?: {
    userId: string;
    displayName: string;
    email: string;
    role: 'creator' | 'admin' | 'member';
    joinedAt: Date;
  }[];
  settings?: {
    allowMembersToAddExpenses: boolean;
    allowMembersToInvite: boolean;
    requireApprovalForExpenses: boolean;
  };
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  invitedEmail: string;
  inviteCode?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  type: 'member_joined' | 'member_left' | 'expense_added' | 'expense_split' | 'payment_made' | 'goal_created' | 'goal_contribution' | 'member_promoted' | 'member_demoted' | 'ownership_transferred' | 'group_updated';
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface Split {
  id: string;
  expenseId: string;
  creatorId: string;
  participants: {
    userId: string;
    userName: string;
    amount: number;
    paid: boolean;
    settled: boolean;
    paymentMethod?: 'wallet' | 'manual';
    settlementRequestId?: string;
  }[];
  type: 'equal' | 'amount' | 'percentage';
  groupId?: string;
  status: 'unsettled' | 'pending' | 'settled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementRequest {
  id: string;
  splitId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  paymentMethod: 'wallet' | 'manual';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  proofImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  dueDate: Date;
  completed: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
  amount?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'group_invite' | 'settlement_request' | 'reminder' | 'achievement' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'first_expense' | 'first_budget' | 'savings_goal' | 'streak_7' | 'streak_30' | 'referral' | 'group_creator';
  title: string;
  description: string;
  badgeUrl?: string;
  rewardPoints: number;
  unlockedAt: Date;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredUserId: string;
  rewardPoints: number;
  status: 'pending' | 'awarded';
  createdAt: Date;
}

export interface SystemActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  metadata?: any;
  createdAt: Date;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'budget_suggestion' | 'anomaly_detection' | 'spending_summary' | 'savings_tip';
  title: string;
  description: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}

export interface SpendingInsight extends AIInsight {}

export interface BudgetAlert {
  id: string;
  userId: string;
  budgetId: string;
  category: string;
  type: 'threshold' | 'exceeded' | 'rollover';
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CurrencyRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  updatedAt: Date;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers?: string[];
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ExpenseTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Constants
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Business',
  'Groceries',
  'Gas & Fuel',
  'Insurance',
  'Rent & Mortgage',
  'Subscriptions',
  'Gifts & Donations',
  'Personal Care',
  'Home & Garden',
  'Sports & Fitness',
  'Technology',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Bonus',
  'Gift',
  'Refund',
  'Side Hustle',
  'Pension',
  'Social Security',
  'Unemployment',
  'Other'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stocks' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'bond', label: 'Bonds' },
  { value: 'mutual_fund', label: 'Mutual Funds' },
  { value: 'other', label: 'Other' },
];

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic expense tracking',
      'Up to 3 groups',
      'Basic reports',
      'Manual receipt entry'
    ],
    limits: {
      groups: 3,
      monthlyExpenses: 100,
      aiQueries: 5
    }
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited expense tracking',
      'Unlimited groups',
      'Advanced reports & analytics',
      'AI-powered receipt scanning',
      'Budget suggestions',
      'Anomaly detection',
      'Priority support'
    ],
    limits: {
      groups: -1, // unlimited
      monthlyExpenses: -1, // unlimited
      aiQueries: -1 // unlimited
    }
  }
};