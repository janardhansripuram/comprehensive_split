import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp,
  setDoc,
  increment
} from '@firebase/firestore';
import { db } from '@/config/firebase';
import { 
  User,
  Expense, 
  Income, 
  Budget, 
  Group, 
  Split,
  SettlementRequest,
  Reminder, 
  Friend,
  FriendRequest,
  SavingsGoal,
  Investment,
  WalletTransaction,
  Notification,
  Achievement,
  AIInsight,
  CurrencyRate,
  SystemActivity,
  GroupInvitation,
  GroupActivity,
  GroupSavingsGoal,
  ExpenseTemplate,
  BudgetAlert,
  SpendingInsight
} from '@/types';
// Collection Names
const USERS_COLLECTION = 'users';
const EXPENSES_COLLECTION = 'expenses';
const FRIEND_REQUESTS_COLLECTION = 'friend_requests';
const FRIENDS_SUBCOLLECTION = 'friends';
const GROUPS_COLLECTION = 'groups';
const ACTIVITY_LOG_SUBCOLLECTION = 'activityLog';
const INCOME_COLLECTION = 'income';
const REMINDERS_COLLECTION = 'reminders';
const BUDGETS_COLLECTION = 'budgets';
const SPLIT_EXPENSES_COLLECTION = 'split_expenses';
const SAVINGS_GOALS_COLLECTION = 'savings_goals';
const GOAL_CONTRIBUTIONS_COLLECTION = 'goal_contributions';
const GROUP_SAVINGS_GOALS_COLLECTION = 'group_savings_goals';
const GROUP_GOAL_CONTRIBUTIONS_SUBCOLLECTION = 'contributions';
const GROUP_INVITATIONS_COLLECTION = 'group_invitations';
const GLOBAL_CATEGORIES_COLLECTION = 'global_categories';
const APP_SETTINGS_COLLECTION = 'app_settings';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const INVESTMENTS_COLLECTION = 'investments';
const SITE_CONTENT_COLLECTION = 'site_content';
const BLOG_POSTS_COLLECTION = 'blog_posts';
const NOTIFICATIONS_COLLECTION = 'notifications';
const MAIL_COLLECTION = 'mail';
const MESSAGES_COLLECTION = 'messages';
const CHAT_MESSAGES_SUBCOLLECTION = 'chat_messages';
const ACHIEVEMENTS_SUBCOLLECTION = 'achievements';
// User Management
export const createUserProfile = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const referralCode = generateReferralCode();
  
  await setDoc(userRef, {
    ...userData,
    walletBalances: { USD: 0 },
    referralCode,
    rewardPoints: 0,
    streakCount: 0,
    subscriptionPlan: 'free',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { 
    id: userSnap.id, 
    ...userSnap.data(),
    createdAt: userSnap.data().createdAt?.toDate?.() || userSnap.data().createdAt,
    updatedAt: userSnap.data().updatedAt?.toDate?.() || userSnap.data().updatedAt,
    lastExpenseDate: userSnap.data().lastExpenseDate?.toDate?.() || userSnap.data().lastExpenseDate,
  } as User : null;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Wallet Management
export const addFundsToWallet = async (userId: string, amount: number, currency: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const walletField = `walletBalances.${currency}`;
  
  await updateDoc(userRef, {
    [walletField]: increment(amount),
    updatedAt: serverTimestamp()
  });

  // Record transaction
  await addDoc(collection(db, 'walletTransactions'), {
    fromUserId: 'system',
    toUserId: userId,
    amount,
    currency,
    type: 'add_funds',
    description: `Added ${amount} ${currency} to wallet`,
    status: 'completed',
    createdAt: serverTimestamp()
  });
};

export const transferFunds = async (
  fromUserId: string, 
  toUserId: string, 
  amount: number, 
  currency: string,
  description: string,
  splitId?: string
): Promise<void> => {
  const batch = writeBatch(db);
  
  // Update sender wallet
  const fromUserRef = doc(db, 'users', fromUserId);
  batch.update(fromUserRef, {
    [`walletBalances.${currency}`]: increment(-amount),
    updatedAt: serverTimestamp()
  });
  
  // Update receiver wallet
  const toUserRef = doc(db, 'users', toUserId);
  batch.update(toUserRef, {
    [`walletBalances.${currency}`]: increment(amount),
    updatedAt: serverTimestamp()
  });
  
  // Record transaction
  const transactionRef = doc(collection(db, 'walletTransactions'));
  batch.set(transactionRef, {
    fromUserId,
    toUserId,
    amount,
    currency,
    type: 'transfer',
    description,
    splitId,
    status: 'completed',
    createdAt: serverTimestamp()
  });
  
  await batch.commit();
};

// Expense Management with AI OCR
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const expensesRef = collection(db, 'expenses');
  const docRef = await addDoc(expensesRef, {
    ...expense,
    date: Timestamp.fromDate(new Date(expense.date)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Update user streak
  await updateUserStreak(expense.userId);
  
  return docRef.id;
};

export const processReceiptWithAI = async (imageUrl: string): Promise<any> => {
  // Simulate AI OCR processing
  // In real implementation, this would call Firebase Functions with Genkit
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        merchant: 'Sample Store',
        amount: 25.99,
        date: new Date().toISOString().split('T')[0],
        category: 'Food & Dining',
        confidence: 0.95
      });
    }, 2000);
  });
};

export const getExpenses = async (userId: string, filters?: any): Promise<Expense[]> => {
  let q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters?.groupId) {
    q = query(q, where('groupId', '==', filters.groupId));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    date: doc.data().date?.toDate?.() || new Date(doc.data().date),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    recurringEndDate: doc.data().recurringEndDate?.toDate?.() || doc.data().recurringEndDate,
  } as Expense));
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<void> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  const updateData = { ...updates };
  
  if (updates.date) {
    updateData.date = Timestamp.fromDate(new Date(updates.date));
  }
  if (updates.recurringEndDate) {
    updateData.recurringEndDate = Timestamp.fromDate(new Date(updates.recurringEndDate));
  }
  
  await updateDoc(expenseRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  await deleteDoc(expenseRef);
};

export const bulkDeleteExpenses = async (expenseIds: string[]): Promise<void> => {
  const batch = writeBatch(db);
  
  expenseIds.forEach(id => {
    const expenseRef = doc(db, 'expenses', id);
    batch.delete(expenseRef);
  });
  
  await batch.commit();
};

// Income Management
export const addIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const incomeRef = collection(db, 'income');
  const docRef = await addDoc(incomeRef, {
    ...income,
    date: Timestamp.fromDate(new Date(income.date)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getIncome = async (userId: string): Promise<Income[]> => {
  const q = query(
    collection(db, 'income'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    date: doc.data().date?.toDate?.() || new Date(doc.data().date),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
  } as Income));
};

// Budget Management with AI Suggestions
export const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const budgetRef = collection(db, 'budgets');
  const docRef = await addDoc(budgetRef, {
    ...budget,
    startDate: budget.startDate ? Timestamp.fromDate(new Date(budget.startDate)) : null,
    endDate: budget.endDate ? Timestamp.fromDate(new Date(budget.endDate)) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getBudgets = async (userId: string, month?: string): Promise<Budget[]> => {
  let q = query(
    collection(db, 'budgets'),
    where('userId', '==', userId)
  );
  
  if (month) {
    q = query(q, where('month', '==', month));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
  } as Budget));
};

export const generateAIBudgetSuggestions = async (userId: string): Promise<Budget[]> => {
  // Simulate AI budget suggestions based on spending patterns
  const expenses = await getExpenses(userId);
  const categorySpending: { [key: string]: number[] } = {};
  
  expenses.forEach(expense => {
    if (!categorySpending[expense.category]) {
      categorySpending[expense.category] = [];
    }
    categorySpending[expense.category].push(expense.amount);
  });
  
  const suggestions: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  
  Object.entries(categorySpending).forEach(([category, amounts]) => {
    const avgSpending = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const suggestedAmount = Math.ceil(avgSpending * 1.1); // 10% buffer
    
    suggestions.push({
      userId,
      category,
      amount: suggestedAmount,
      currency: 'USD',
      period: 'monthly',
      aiSuggested: true
    });
  });
  
  return suggestions;
};

// Savings Goals
export const createSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const goalRef = collection(db, 'savingsGoals');
  const docRef = await addDoc(goalRef, {
    ...goal,
    targetDate: goal.targetDate ? Timestamp.fromDate(new Date(goal.targetDate)) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSavingsGoals = async (userId: string, groupId?: string): Promise<SavingsGoal[]> => {
  let q = query(
    collection(db, 'savingsGoals'),
    where('userId', '==', userId)
  );
  
  if (groupId) {
    q = query(
      collection(db, 'savingsGoals'),
      where('groupId', '==', groupId)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate?.() || doc.data().targetDate,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    contributions: doc.data().contributions?.map((contrib: any) => ({
      ...contrib,
      date: contrib.date?.toDate?.() || contrib.date
    })) || []
  } as SavingsGoal));
};

export const contributeToSavingsGoal = async (goalId: string, contribution: {
  userId: string;
  userName: string;
  amount: number;
}): Promise<void> => {
  const goalRef = doc(db, 'savingsGoals', goalId);
  
  await updateDoc(goalRef, {
    currentAmount: increment(contribution.amount),
    contributions: arrayUnion({
      ...contribution,
      date: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
};

// Investment & Asset Tracking
export const addInvestment = async (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const investmentRef = collection(db, 'investments');
  const docRef = await addDoc(investmentRef, {
    ...investment,
    purchaseDate: Timestamp.fromDate(new Date(investment.purchaseDate)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getInvestments = async (userId: string): Promise<Investment[]> => {
  const q = query(
    collection(db, 'investments'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    purchaseDate: doc.data().purchaseDate?.toDate?.() || new Date(doc.data().purchaseDate),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
  } as Investment));
};

export const updateInvestment = async (investmentId: string, updates: Partial<Investment>): Promise<void> => {
  const investmentRef = doc(db, 'investments', investmentId);
  const updateData = { ...updates };
  
  if (updates.purchaseDate) {
    updateData.purchaseDate = Timestamp.fromDate(new Date(updates.purchaseDate));
  }
  
  await updateDoc(investmentRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

export const deleteInvestment = async (investmentId: string): Promise<void> => {
  const investmentRef = doc(db, 'investments', investmentId);
  await deleteDoc(investmentRef);
};

export const calculateNetWorth = async (userId: string): Promise<{ [currency: string]: number }> => {
  const [user, investments] = await Promise.all([
    getUserProfile(userId),
    getInvestments(userId)
  ]);
  
  const netWorth: { [currency: string]: number } = { ...user?.walletBalances || {} };
  
  investments.forEach(investment => {
    const currentValue = investment.quantity * investment.currentPrice;
    netWorth[investment.currency] = (netWorth[investment.currency] || 0) + currentValue;
  });
  
  return netWorth;
};

// Split Expenses with Advanced Settlement
export const createSplit = async (split: Omit<Split, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const splitRef = collection(db, 'splits');
  const docRef = await addDoc(splitRef, {
    ...split,
    status: 'unsettled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSplits = async (userId: string): Promise<Split[]> => {
  // Get splits where user is creator or participant
  const creatorQuery = query(
    collection(db, 'splits'),
    where('creatorId', '==', userId)
  );

  const creatorSnapshot = await getDocs(creatorQuery);
  const creatorSplits = creatorSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
  } as Split));

  // Get all splits and filter by participant
  const allSplitsQuery = query(collection(db, 'splits'));
  const allSplitsSnapshot = await getDocs(allSplitsQuery);
  const participantSplits = allSplitsSnapshot.docs
    .map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    } as Split))
    .filter(split => split.participants.some(p => p.userId === userId) && split.creatorId !== userId);

  const allSplits = [...creatorSplits, ...participantSplits];
  return allSplits.filter((split, index, self) => 
    index === self.findIndex(s => s.id === split.id)
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateSplit = async (splitId: string, updates: Partial<Split>): Promise<void> => {
  const splitRef = doc(db, 'splits', splitId);
  await updateDoc(splitRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const createSettlementRequest = async (request: Omit<SettlementRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const requestRef = collection(db, 'settlementRequests');
  const docRef = await addDoc(requestRef, {
    ...request,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Create notification for the payer
  await createNotification({
    userId: request.toUserId,
    type: 'settlement_request',
    title: 'Settlement Request',
    message: `You have a new settlement request for ${request.amount} ${request.currency}`,
    data: { settlementRequestId: docRef.id }
  });
  
  return docRef.id;
};

export const approveSettlementRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'settlementRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) return;
  
  const request = requestSnap.data() as SettlementRequest;
  
  await updateDoc(requestRef, {
    status: 'approved',
    updatedAt: serverTimestamp()
  });
  
  // Update split status
  const splitRef = doc(db, 'splits', request.splitId);
  const splitSnap = await getDoc(splitRef);
  
  if (splitSnap.exists()) {
    const split = splitSnap.data() as Split;
    const updatedParticipants = split.participants.map(p =>
      p.userId === request.fromUserId ? { ...p, settled: true } : p
    );
    
    const allSettled = updatedParticipants.every(p => p.settled);
    
    await updateDoc(splitRef, {
      participants: updatedParticipants,
      status: allSettled ? 'settled' : 'pending',
      updatedAt: serverTimestamp()
    });
  }
};

export const settleViaWallet = async (splitId: string, fromUserId: string, toUserId: string, amount: number, currency: string): Promise<void> => {
  // Transfer funds
  await transferFunds(fromUserId, toUserId, amount, currency, 'Split settlement', splitId);
  
  // Update split status
  const splitRef = doc(db, 'splits', splitId);
  const splitSnap = await getDoc(splitRef);
  
  if (splitSnap.exists()) {
    const split = splitSnap.data() as Split;
    const updatedParticipants = split.participants.map(p =>
      p.userId === fromUserId ? { ...p, paid: true, settled: true, paymentMethod: 'wallet' } : p
    );
    
    const allSettled = updatedParticipants.every(p => p.settled);
    
    await updateDoc(splitRef, {
      participants: updatedParticipants,
      status: allSettled ? 'settled' : 'pending',
      updatedAt: serverTimestamp()
    });
  }
};

// Friend Management
export const sendFriendRequest = async (fromUserId: string, toEmail: string): Promise<string> => {
  console.log('Sending friend request from:', fromUserId, 'to:', toEmail);
  const senderProfile = await getUserProfile(fromUserId);
  if (!senderProfile) {
    throw new Error('Sender profile not found');
  }

  // Check if request already exists
  const existingQuery = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', fromUserId),
    where('toEmail', '==', toEmail.toLowerCase()),
    where('status', '==', 'pending')
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    console.log('Friend request already exists');
    return existingSnapshot.docs[0].id;
  }

  const friendRequestRef = collection(db, 'friendRequests');
  const docRef = await addDoc(friendRequestRef, {
    fromUserId,
    fromUserName: senderProfile.displayName || senderProfile.email || 'Unknown User',
    fromUserEmail: senderProfile.email,
    toEmail: toEmail.toLowerCase(),
    status: 'pending',
    createdAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const getFriendRequests = async (userEmail: string): Promise<FriendRequest[]> => {
  console.log('Fetching friend requests for email:', userEmail);
  const q = query(
    collection(db, 'friendRequests'),
    where('toEmail', '==', userEmail.toLowerCase()),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  console.log('Friend requests snapshot size:', snapshot.size);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as FriendRequest));
};

export const acceptFriendRequest = async (requestId: string, fromUserId: string, toUserId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Update request status
  const requestRef = doc(db, 'friendRequests', requestId);
  batch.update(requestRef, { status: 'accepted' });

  // Add friendship both ways
  const friendship1Ref = doc(collection(db, 'friends'));
  batch.set(friendship1Ref, {
    userId: fromUserId,
    friendId: toUserId,
    status: 'accepted',
    createdAt: serverTimestamp()
  });

  const friendship2Ref = doc(collection(db, 'friends'));
  batch.set(friendship2Ref, {
    userId: toUserId,
    friendId: fromUserId,
    status: 'accepted',
    createdAt: serverTimestamp()
  });

  await batch.commit();
};

export const getFriends = async (userId: string): Promise<Friend[]> => {
  const q = query(
    collection(db, 'friends'),
    where('userId', '==', userId),
    where('status', '==', 'accepted')
  );

  console.log('Fetching friends for userId:', userId);
  const snapshot = await getDocs(q);
  console.log('Friends snapshot size:', snapshot.size);
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as Friend));
};

// Group Management (Enhanced)
export const createGroup = async (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const creatorProfile = await getUserProfile(group.creatorId);
  const inviteCode = generateInviteCode();
  
  const groupRef = collection(db, 'groups');
  const docRef = await addDoc(groupRef, {
    ...group,
    admins: [group.creatorId],
    inviteCode,
    memberDetails: [{
      userId: group.creatorId,
      displayName: creatorProfile?.displayName || 'Creator',
      email: creatorProfile?.email || '',
      role: 'creator',
      joinedAt: serverTimestamp()
    }],
    settings: {
      allowMembersToAddExpenses: true,
      allowMembersToInvite: false,
      requireApprovalForExpenses: false,
      ...group.settings
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId: docRef.id,
    userId: group.creatorId,
    userName: creatorProfile?.displayName || 'Creator',
    type: 'group_updated',
    description: `Created group "${group.name}"`,
  });
  
  return docRef.id;
};

export const getGroups = async (userId: string): Promise<Group[]> => {
  console.log('Fetching groups for userId:', userId);
   try {
    if (!userId) return [];
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where('memberIds', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const groups = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            createdBy: data.createdBy,
            memberIds: data.memberIds || [],
            memberDetails: data.memberDetails || [],
            imageUrl: data.imageUrl || undefined,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : undefined,
        } as Group
    });
    groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return groups;
  } catch (error) {
    console.error("[firestore.getGroupsForUser] Error getting groups for user: ", error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<void> => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const addGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const userProfile = await getUserProfile(userId);
  if (!userProfile) {
    throw new Error('User profile not found');
  }
  
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayUnion(userId),
    memberDetails: arrayUnion({
      userId,
      displayName: userProfile.displayName || 'Member',
      email: userProfile.email || '',
      role: 'member',
      joinedAt: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId,
    userName: userProfile.displayName || 'Member',
    type: 'member_joined',
    description: 'Joined the group',
  });
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) return;
  
  const group = groupSnap.data() as Group;
  const memberDetails = group.memberDetails?.find(m => m.userId === userId);
  
  await updateDoc(groupRef, {
    members: arrayRemove(userId),
    admins: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
  
  // Remove from memberDetails array (requires getting current array, modifying it, and setting it back)
  const updatedMemberDetails = group.memberDetails?.filter(m => m.userId !== userId) || [];
  await updateDoc(groupRef, { memberDetails: updatedMemberDetails });
  
  await addGroupActivity({
    groupId,
    userId,
    userName: memberDetails?.displayName || 'Member',
    type: 'member_left',
    description: 'Left the group',
  });
};

export const promoteToAdmin = async (groupId: string, userId: string, promotedBy: string): Promise<void> => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) return;
  
  const group = groupSnap.data() as Group;
  const memberDetails = group.memberDetails?.find(m => m.userId === userId);
  const updatedMemberDetails = group.memberDetails?.map(m => 
    m.userId === userId ? { ...m, role: 'admin' } : m
  ) || [];
  
  await updateDoc(groupRef, {
    admins: arrayUnion(userId),
    memberDetails: updatedMemberDetails,
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId: promotedBy,
    userName: group.memberDetails?.find(m => m.userId === promotedBy)?.displayName || 'Admin',
    type: 'member_promoted',
    description: `Promoted ${memberDetails?.displayName || 'Member'} to admin`,
  });
};

export const demoteFromAdmin = async (groupId: string, userId: string, demotedBy: string): Promise<void> => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) return;
  
  const group = groupSnap.data() as Group;
  const memberDetails = group.memberDetails?.find(m => m.userId === userId);
  const updatedMemberDetails = group.memberDetails?.map(m => 
    m.userId === userId ? { ...m, role: 'member' } : m
  ) || [];
  
  await updateDoc(groupRef, {
    admins: arrayRemove(userId),
    memberDetails: updatedMemberDetails,
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId: demotedBy,
    userName: group.memberDetails?.find(m => m.userId === demotedBy)?.displayName || 'Admin',
    type: 'member_demoted',
    description: `Demoted ${memberDetails?.displayName || 'Admin'} to member`,
  });
};

export const transferGroupOwnership = async (groupId: string, newOwnerId: string, currentOwnerId: string): Promise<void> => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) return;
  
  const group = groupSnap.data() as Group;
  const newOwnerDetails = group.memberDetails?.find(m => m.userId === newOwnerId);
  const currentOwnerDetails = group.memberDetails?.find(m => m.userId === currentOwnerId);
  
  const updatedMemberDetails = group.memberDetails?.map(m => {
    if (m.userId === newOwnerId) return { ...m, role: 'creator' };
    if (m.userId === currentOwnerId) return { ...m, role: 'admin' };
    return m;
  }) || [];
  
  await updateDoc(groupRef, {
    creatorId: newOwnerId,
    admins: arrayUnion(newOwnerId),
    memberDetails: updatedMemberDetails,
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId: currentOwnerId,
    userName: currentOwnerDetails?.displayName || 'Previous Owner',
    type: 'ownership_transferred',
    description: `Transferred ownership to ${newOwnerDetails?.displayName || 'New Owner'}`,
  });
};

export const leaveGroup = async (groupId: string, userId: string, userName: string): Promise<void> => {
  await removeGroupMember(groupId, userId);
  
  await addGroupActivity({
    groupId,
    userId,
    userName,
    type: 'member_left',
    description: 'Left the group',
  });
};

export const joinGroupByInviteCode = async (inviteCode: string, userId: string): Promise<void> => {
  const q = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Invalid invite code');
  }
  
  const groupDoc = snapshot.docs[0];
  const group = groupDoc.data() as Group;
  
  if (group.members.includes(userId)) {
    throw new Error('Already a member of this group');
  }
  
  const userProfile = await getUserProfile(userId);
  
  await updateDoc(groupDoc.ref, {
    members: arrayUnion(userId),
    memberDetails: arrayUnion({
      userId,
      displayName: userProfile?.displayName || 'Member',
      email: userProfile?.email || '',
      role: 'member',
      joinedAt: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId: groupDoc.id,
    userId,
    userName: userProfile?.displayName || 'Member',
    type: 'member_joined',
    description: 'Joined the group via invite link',
  });
};

export const createGroupInvitation = async (invitation: Omit<GroupInvitation, 'id' | 'createdAt'>): Promise<string> => {
  const invitationRef = collection(db, 'groupInvitations');
  const docRef = await addDoc(invitationRef, {
    ...invitation,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getGroupInvitations = async (userEmail: string): Promise<GroupInvitation[]> => {
  const q = query(
    collection(db, 'groupInvitations'),
    where('invitedEmail', '==', userEmail.toLowerCase()),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as GroupInvitation));
};

export const acceptGroupInvitation = async (invitationId: string, userId: string, userName: string): Promise<void> => {
  const invitationRef = doc(db, 'groupInvitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);
  
  if (!invitationSnap.exists()) {
    throw new Error('Invitation not found');
  }
  
  const invitation = invitationSnap.data() as GroupInvitation;
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation is no longer pending');
  }
  
  if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    await updateDoc(invitationRef, { status: 'expired' });
    throw new Error('Invitation has expired');
  }
  
  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'accepted'
  });
  
  // Add user to group
  await addGroupMember(invitation.groupId, userId);
  
  // Add activity
  await addGroupActivity({
    groupId: invitation.groupId,
    userId,
    userName,
    type: 'member_joined',
    description: 'Joined via invitation',
  });
};

export const declineGroupInvitation = async (invitationId: string): Promise<void> => {
  const invitationRef = doc(db, 'groupInvitations', invitationId);
  await updateDoc(invitationRef, {
    status: 'declined'
  });
};

// Group Activity Log
export const addGroupActivity = async (activity: Omit<GroupActivity, 'id' | 'createdAt'>) => {
  const activityRef = collection(db, 'groupActivities');
  await addDoc(activityRef, {
    ...activity,
    createdAt: serverTimestamp()
  });
};

export const getGroupActivities = async (groupId: string): Promise<GroupActivity[]> => {
  const q = query(
    collection(db, 'groupActivities'),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as GroupActivity));
};

// Group Savings Goals
export const getGroupSavingsGoals = async (groupId: string): Promise<GroupSavingsGoal[]> => {
  const q = query(
    collection(db, 'savingsGoals'),
    where('groupId', '==', groupId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate?.() || doc.data().targetDate,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    contributions: doc.data().contributions?.map((contrib: any) => ({
      ...contrib,
      date: contrib.date?.toDate?.() || contrib.date
    })) || []
  } as GroupSavingsGoal));
};

export const contributeToGoal = async (goalId: string, contribution: {
  userId: string;
  userName: string;
  amount: number;
}): Promise<void> => {
  const goalRef = doc(db, 'savingsGoals', goalId);
  
  await updateDoc(goalRef, {
    currentAmount: increment(contribution.amount),
    contributions: arrayUnion({
      ...contribution,
      date: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
};

// Reminders & Financial Calendar
export const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
  const reminderRef = collection(db, 'reminders');
  return await addDoc(reminderRef, {
    ...reminder,
    dueDate: Timestamp.fromDate(new Date(reminder.dueDate)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getReminders = async (userId: string) => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('dueDate', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
  } as Reminder));
};

export const getFinancialCalendarEvents = async (userId: string, startDate: Date, endDate: Date) => {
  // Get reminders in date range
  const remindersQuery = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    where('dueDate', '>=', Timestamp.fromDate(startDate)),
    where('dueDate', '<=', Timestamp.fromDate(endDate))
  );
  
  // Get recurring expenses
  const recurringExpensesQuery = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('isRecurring', '==', true)
  );
  
  const [remindersSnapshot, expensesSnapshot] = await Promise.all([
    getDocs(remindersQuery),
    getDocs(recurringExpensesQuery)
  ]);
  
  const events = [];
  
  // Add reminders
  remindersSnapshot.docs.forEach(doc => {
    const reminder = { id: doc.id, ...doc.data() } as Reminder;
    events.push({
      id: reminder.id,
      type: 'reminder',
      title: reminder.title,
      date: reminder.dueDate,
      amount: reminder.amount,
      currency: reminder.currency,
      category: reminder.category
    });
  });
  
  // Project recurring expenses
  expensesSnapshot.docs.forEach(doc => {
    const expense = { id: doc.id, ...doc.data() } as Expense;
    const projectedDates = calculateRecurringDates(expense, startDate, endDate);
    
    projectedDates.forEach(date => {
      events.push({
        id: `${expense.id}-${date.getTime()}`,
        type: 'recurring_expense',
        title: expense.description,
        date,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category
      });
    });
  });
  
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Notifications
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  const notificationRef = collection(db, 'notifications');
  return await addDoc(notificationRef, {
    ...notification,
    read: false,
    createdAt: serverTimestamp()
  });
};

export const getNotifications = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as Notification));
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};

// Achievements & Gamification
export const unlockAchievement = async (userId: string, type: string, title: string, description: string, rewardPoints: number) => {
  // Check if achievement already exists
  const existingQuery = query(
    collection(db, 'achievements'),
    where('userId', '==', userId),
    where('type', '==', type)
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) return; // Already unlocked
  
  const achievementRef = collection(db, 'achievements');
  await addDoc(achievementRef, {
    userId,
    type,
    title,
    description,
    rewardPoints,
    unlockedAt: serverTimestamp()
  });
  
  // Award points to user
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    rewardPoints: increment(rewardPoints)
  });
  
  // Create notification
  await createNotification({
    userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `You earned "${title}" and ${rewardPoints} points!`,
    data: { achievementType: type }
  });
};

export const getUserAchievements = async (userId: string) => {
  const q = query(
    collection(db, 'achievements'),
    where('userId', '==', userId),
    orderBy('unlockedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    unlockedAt: doc.data().unlockedAt?.toDate?.() || doc.data().unlockedAt,
  } as Achievement));
};

// Referral System
export const processReferral = async (referralCode: string, newUserId: string) => {
  // Find referrer
  const referrerQuery = query(
    collection(db, 'users'),
    where('referralCode', '==', referralCode)
  );
  
  const referrerSnapshot = await getDocs(referrerQuery);
  if (referrerSnapshot.empty) return;
  
  const referrerId = referrerSnapshot.docs[0].id;
  
  // Create referral reward
  const rewardRef = collection(db, 'referralRewards');
  await addDoc(rewardRef, {
    referrerId,
    referredUserId: newUserId,
    rewardPoints: 100, // 100 points for successful referral
    status: 'awarded',
    createdAt: serverTimestamp()
  });
  
  // Award points to both users
  const batch = writeBatch(db);
  
  const referrerRef = doc(db, 'users', referrerId);
  batch.update(referrerRef, {
    rewardPoints: increment(100)
  });
  
  const newUserRef = doc(db, 'users', newUserId);
  batch.update(newUserRef, {
    rewardPoints: increment(50),
    referredBy: referrerId
  });
  
  await batch.commit();
  
  // Unlock achievements
  await unlockAchievement(referrerId, 'referral', 'Referral Master', 'Successfully referred a friend', 100);
};

// AI Insights
export const generateAIInsights = async (userId: string) => {
  const expenses = await getExpenses(userId);
  const insights = [];
  
  // Spending anomaly detection
  const monthlySpending = calculateMonthlySpending(expenses);
  const avgMonthlySpending = monthlySpending.reduce((sum, amt) => sum + amt, 0) / monthlySpending.length;
  const currentMonthSpending = monthlySpending[monthlySpending.length - 1];
  
  if (currentMonthSpending > avgMonthlySpending * 1.5) {
    insights.push({
      userId,
      type: 'anomaly_detection',
      title: 'Unusual Spending Detected',
      description: `Your spending this month is ${Math.round(((currentMonthSpending / avgMonthlySpending) - 1) * 100)}% higher than usual`,
      priority: 'high',
      read: false
    });
  }
  
  // Save insights
  for (const insight of insights) {
    await addDoc(collection(db, 'aiInsights'), {
      ...insight,
      createdAt: serverTimestamp()
    });
  }
  
  return insights;
};

export const getSpendingInsights = async (userId: string): Promise<SpendingInsight[]> => {
  const q = query(
    collection(db, 'aiInsights'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as SpendingInsight));
};

export const markInsightAsRead = async (insightId: string) => {
  const insightRef = doc(db, 'aiInsights', insightId);
  await updateDoc(insightRef, { read: true });
};

// Budget Alerts
export const getBudgetAlerts = async (userId: string) => {
  const q = query(
    collection(db, 'budgetAlerts'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  }));
};

export const markBudgetAlertAsRead = async (alertId: string) => {
  const alertRef = doc(db, 'budgetAlerts', alertId);
  await updateDoc(alertRef, { read: true });
};

// Currency Conversion
export const getCurrencyRates = async (): Promise<CurrencyRate[]> => {
  const q = query(collection(db, 'currencyRates'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    lastUpdated: doc.data().lastUpdated?.toDate?.() || doc.data().lastUpdated,
  } as CurrencyRate));
};

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await getCurrencyRates();
  const rate = rates.find(r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency);
  
  if (!rate) {
    // Fallback to USD conversion
    const toUsdRate = rates.find(r => r.fromCurrency === fromCurrency && r.toCurrency === 'USD');
    const fromUsdRate = rates.find(r => r.fromCurrency === 'USD' && r.toCurrency === toCurrency);
    
    if (toUsdRate && fromUsdRate) {
      return amount * toUsdRate.rate * fromUsdRate.rate;
    }
    
    return amount; // No conversion available
  }
  
  return amount * rate.rate;
};

// Expense Templates
export const saveExpenseTemplate = async (template: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const templateRef = collection(db, 'expenseTemplates');
  const docRef = await addDoc(templateRef, {
    ...template,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getExpenseTemplates = async (userId: string): Promise<ExpenseTemplate[]> => {
  const q = query(
    collection(db, 'expenseTemplates'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
  } as ExpenseTemplate));
};

export const deleteExpenseTemplate = async (templateId: string): Promise<void> => {
  const templateRef = doc(db, 'expenseTemplates', templateId);
  await deleteDoc(templateRef);
};

// Utility Functions
const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const updateUserStreak = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const user = userSnap.data() as User;
  const today = new Date();
  const lastExpenseDate = user.lastExpenseDate ? new Date(user.lastExpenseDate) : null;
  
  let newStreakCount = user.streakCount || 0;
  
  if (lastExpenseDate) {
    const daysDiff = Math.floor((today.getTime() - lastExpenseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreakCount += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreakCount = 1;
    }
    // Same day = no change
  } else {
    newStreakCount = 1;
  }
  
  await updateDoc(userRef, {
    streakCount: newStreakCount,
    lastExpenseDate: Timestamp.fromDate(today),
    updatedAt: serverTimestamp()
  });
  
  // Check for streak achievements
  if (newStreakCount === 7) {
    await unlockAchievement(userId, 'streak_7', '7-Day Streak', 'Logged expenses for 7 consecutive days', 50);
  } else if (newStreakCount === 30) {
    await unlockAchievement(userId, 'streak_30', '30-Day Streak', 'Logged expenses for 30 consecutive days', 200);
  }
};

const calculateRecurringDates = (expense: Expense, startDate: Date, endDate: Date): Date[] => {
  const dates = [];
  const expenseDate = new Date(expense.date);
  let currentDate = new Date(expenseDate);
  
  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      dates.push(new Date(currentDate));
    }
    
    switch (expense.recurringType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        return dates;
    }
    
    if (expense.recurringEndDate && currentDate > new Date(expense.recurringEndDate)) {
      break;
    }
  }
  
  return dates;
};

const calculateMonthlySpending = (expenses: Expense[]): number[] => {
  const monthlyTotals: { [key: string]: number } = {};
  
  expenses.forEach(expense => {
    const monthKey = expense.date.toISOString().slice(0, 7); // YYYY-MM
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
  });
  
  return Object.values(monthlyTotals);
};

// Real-time listeners
export const subscribeToExpenses = (userId: string, callback: (expenses: Expense[]) => void): (() => void) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      date: doc.data().date?.toDate?.() || new Date(doc.data().date),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
    } as Expense));
    callback(expenses);
  });
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    } as Notification));
    callback(notifications);
  });
};

export const subscribeToGroups = (userId: string, callback: (groups: Group[]) => void) => {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      memberDetails: doc.data().memberDetails?.map((member: any) => ({
        ...member,
        joinedAt: member.joinedAt?.toDate?.() || new Date(member.joinedAt)
      })) || []
    } as Group));
    callback(groups);
  });
};