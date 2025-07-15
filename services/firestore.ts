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
  Expense, 
  Income, 
  Budget, 
  Group, 
  GroupInvitation,
  GroupActivity,
  GroupSavingsGoal,
  Split, 
  Reminder, 
  Friend,
  User,
  ExpenseTemplate,
  BudgetAlert,
  SpendingInsight,
  ExportData
} from '@/types';

// User Management
export const createUserProfile = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as User : null;
};

// Expense Management
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const expensesRef = collection(db, 'expenses');
  const docRef = await addDoc(expensesRef, {
    ...expense,
    date: Timestamp.fromDate(new Date(expense.date)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
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

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }
  
  if (filters?.groupId) {
    q = query(q, where('groupId', '==', filters.groupId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date),
    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
  } as Expense));
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<void> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  const updateData = { ...updates };
  
  if (updates.date) {
    updateData.date = Timestamp.fromDate(new Date(updates.date));
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

// Expense Templates
export const saveExpenseTemplate = async (template: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  const templatesRef = collection(db, 'expenseTemplates');
  return await addDoc(templatesRef, {
    ...template,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getExpenseTemplates = async (userId: string) => {
  const q = query(
    collection(db, 'expenseTemplates'),
    where('userId', '==', userId),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
  } as ExpenseTemplate));
};

export const deleteExpenseTemplate = async (templateId: string) => {
  const templateRef = doc(db, 'expenseTemplates', templateId);
  await deleteDoc(templateRef);
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
    date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date),
    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
  } as Income));
};

export const updateIncome = async (incomeId: string, updates: Partial<Income>) => {
  const incomeRef = doc(db, 'income', incomeId);
  await updateDoc(incomeRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteIncome = async (incomeId: string) => {
  const incomeRef = doc(db, 'income', incomeId);
  await deleteDoc(incomeRef);
};

// Budget Management
export const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const budgetRef = collection(db, 'budgets');
  const docRef = await addDoc(budgetRef, {
    ...budget,
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
    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
  } as Budget));
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
  const budgetRef = doc(db, 'budgets', budgetId);
  await updateDoc(budgetRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteBudget = async (budgetId: string) => {
  const budgetRef = doc(db, 'budgets', budgetId);
  await deleteDoc(budgetRef);
};

// Budget Alerts
export const createBudgetAlert = async (alert: Omit<BudgetAlert, 'id' | 'createdAt'>) => {
  const alertsRef = collection(db, 'budgetAlerts');
  return await addDoc(alertsRef, {
    ...alert,
    createdAt: serverTimestamp()
  });
};

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
  } as BudgetAlert));
};

export const markBudgetAlertAsRead = async (alertId: string) => {
  const alertRef = doc(db, 'budgetAlerts', alertId);
  await updateDoc(alertRef, { read: true });
};

// Spending Insights
export const createSpendingInsight = async (insight: Omit<SpendingInsight, 'id' | 'createdAt'>) => {
  const insightsRef = collection(db, 'spendingInsights');
  return await addDoc(insightsRef, {
    ...insight,
    createdAt: serverTimestamp()
  });
};

export const getSpendingInsights = async (userId: string) => {
  const q = query(
    collection(db, 'spendingInsights'),
    where('userId', '==', userId),
    orderBy('priority', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as SpendingInsight));
};

export const markInsightAsRead = async (insightId: string) => {
  const insightRef = doc(db, 'spendingInsights', insightId);
  await updateDoc(insightRef, { read: true });
};

// Friend Management
export const sendFriendRequest = async (fromUserId: string, toEmail: string): Promise<string> => {
  const friendRequestRef = collection(db, 'friendRequests');
  const docRef = await addDoc(friendRequestRef, {
    fromUserId,
    toEmail,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getFriendRequests = async (userEmail: string): Promise<any[]> => {
  const q = query(
    collection(db, 'friendRequests'),
    where('toEmail', '==', userEmail),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    createdAt: serverTimestamp()
  });

  const friendship2Ref = doc(collection(db, 'friends'));
  batch.set(friendship2Ref, {
    userId: toUserId,
    friendId: fromUserId,
    createdAt: serverTimestamp()
  });

  await batch.commit();
};

export const getFriends = async (userId: string): Promise<any[]> => {
  const q = query(
    collection(db, 'friends'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Group Management
export const createGroup = async (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const groupRef = collection(db, 'groups');
  const docRef = await addDoc(groupRef, {
    ...group,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Add initial activity log
  await addGroupActivity({
    groupId: docRef.id,
    userId: group.creatorId,
    userName: 'Creator',
    type: 'group_created',
    description: `Created group "${group.name}"`,
  });
  
  return docRef.id;
};

export const getGroups = async (userId: string): Promise<Group[]> => {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
  } as Group));
};

export const addGroupMember = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

export const removeGroupMember = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    members: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
};

export const updateGroup = async (groupId: string, updates: Partial<Group>) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const promoteToAdmin = async (groupId: string, userId: string, promotedBy: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    admins: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId: promotedBy,
    userName: 'Admin',
    type: 'member_promoted',
    description: `Promoted member to admin`,
    metadata: { promotedUserId: userId }
  });
};

export const demoteFromAdmin = async (groupId: string, userId: string, demotedBy: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    admins: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId,
    userId: demotedBy,
    userName: 'Creator',
    type: 'member_demoted',
    description: `Demoted admin to member`,
    metadata: { demotedUserId: userId }
  });
};

export const transferGroupOwnership = async (groupId: string, newOwnerId: string, currentOwnerId: string) => {
  const batch = writeBatch(db);
  const groupRef = doc(db, 'groups', groupId);
  
  batch.update(groupRef, {
    creatorId: newOwnerId,
    admins: arrayUnion(currentOwnerId),
    updatedAt: serverTimestamp()
  });
  
  await batch.commit();
  
  await addGroupActivity({
    groupId,
    userId: currentOwnerId,
    userName: 'Former Owner',
    type: 'ownership_transferred',
    description: `Transferred group ownership`,
    metadata: { newOwnerId }
  });
};

export const leaveGroup = async (groupId: string, userId: string, userName: string) => {
  const batch = writeBatch(db);
  const groupRef = doc(db, 'groups', groupId);
  
  batch.update(groupRef, {
    members: arrayRemove(userId),
    admins: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
  
  await batch.commit();
  
  await addGroupActivity({
    groupId,
    userId,
    userName,
    type: 'member_left',
    description: `Left the group`,
  });
};

// Group Invitations
export const createGroupInvitation = async (invitation: Omit<GroupInvitation, 'id' | 'createdAt'>): Promise<string> => {
  const invitationRef = collection(db, 'groupInvitations');
  const docRef = await addDoc(invitationRef, {
    ...invitation,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getGroupInvitations = async (email: string): Promise<GroupInvitation[]> => {
  const q = query(
    collection(db, 'groupInvitations'),
    where('invitedEmail', '==', email),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  } as GroupInvitation));
};

export const acceptGroupInvitation = async (invitationId: string, userId: string, userName: string) => {
  const invitationRef = doc(db, 'groupInvitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);
  
  if (!invitationSnap.exists()) {
    throw new Error('Invitation not found');
  }
  
  const invitation = invitationSnap.data() as GroupInvitation;
  const batch = writeBatch(db);
  
  // Update invitation status
  batch.update(invitationRef, { status: 'accepted' });
  
  // Add user to group
  const groupRef = doc(db, 'groups', invitation.groupId);
  batch.update(groupRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
  
  await batch.commit();
  
  // Add activity log
  await addGroupActivity({
    groupId: invitation.groupId,
    userId,
    userName,
    type: 'member_joined',
    description: `Joined the group`,
  });
};

export const declineGroupInvitation = async (invitationId: string) => {
  const invitationRef = doc(db, 'groupInvitations', invitationId);
  await updateDoc(invitationRef, { status: 'declined' });
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
export const createSavingsGoal = async (goal: Omit<GroupSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const goalRef = collection(db, 'groupSavingsGoals');
  const docRef = await addDoc(goalRef, {
    ...goal,
    targetDate: goal.targetDate ? Timestamp.fromDate(new Date(goal.targetDate)) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId: goal.groupId,
    userId: goal.createdBy,
    userName: 'Member',
    type: 'goal_created',
    description: `Created savings goal "${goal.name}"`,
    metadata: { goalId: docRef.id, targetAmount: goal.targetAmount }
  });
  
  return docRef.id;
};

export const getGroupSavingsGoals = async (groupId: string): Promise<GroupSavingsGoal[]> => {
  const q = query(
    collection(db, 'groupSavingsGoals'),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate?.() || doc.data().targetDate,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    contributions: doc.data().contributions?.map((contrib: any) => ({
      ...contrib,
      date: contrib.date?.toDate?.() || contrib.date
    })) || []
  } as GroupSavingsGoal));
};

export const contributeToSavingsGoal = async (goalId: string, contribution: {
  userId: string;
  userName: string;
  amount: number;
}) => {
  const goalRef = doc(db, 'groupSavingsGoals', goalId);
  const goalSnap = await getDoc(goalRef);
  
  if (!goalSnap.exists()) {
    throw new Error('Savings goal not found');
  }
  
  const goal = goalSnap.data() as GroupSavingsGoal;
  
  await updateDoc(goalRef, {
    currentAmount: increment(contribution.amount),
    contributions: arrayUnion({
      ...contribution,
      date: serverTimestamp()
    }),
    updatedAt: serverTimestamp()
  });
  
  await addGroupActivity({
    groupId: goal.groupId,
    userId: contribution.userId,
    userName: contribution.userName,
    type: 'goal_contribution',
    description: `Contributed $${contribution.amount} to "${goal.name}"`,
    metadata: { goalId, amount: contribution.amount }
  });
};
// Split Management
export const createSplit = async (split: Omit<Split, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const splitRef = collection(db, 'splits');
  const docRef = await addDoc(splitRef, {
    ...split,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSplits = async (userId: string): Promise<Split[]> => {
  // Get splits where user is creator or participant
  const creatorQuery = query(
    collection(db, 'splits'),
    where('creatorId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const creatorSnapshot = await getDocs(creatorQuery);
  const creatorSplits = creatorSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
  } as Split));

  // Get all splits and filter by participant
  const allSplitsQuery = query(collection(db, 'splits'));
  const allSplitsSnapshot = await getDocs(allSplitsQuery);
  const participantSplits = allSplitsSnapshot.docs
    .map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
    } as Split))
    .filter(split => split.participants.some(p => p.userId === userId) && split.creatorId !== userId);

  // Combine and deduplicate
  const allSplits = [...creatorSplits, ...participantSplits];
  const uniqueSplits = allSplits.filter((split, index, self) => 
    index === self.findIndex(s => s.id === split.id)
  );

  return uniqueSplits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateSplit = async (splitId: string, updates: Partial<Split>): Promise<void> => {
  const splitRef = doc(db, 'splits', splitId);
  await updateDoc(splitRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Reminder Management
export const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
  const reminderRef = collection(db, 'reminders');
  return await addDoc(reminderRef, {
    ...reminder,
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

export const updateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
  const reminderRef = doc(db, 'reminders', reminderId);
  await updateDoc(reminderRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteReminder = async (reminderId: string) => {
  const reminderRef = doc(db, 'reminders', reminderId);
  await deleteDoc(reminderRef);
};

// Data Export
export const generateExportData = async (userId: string, dateFrom: Date, dateTo: Date): Promise<ExportData> => {
  const [expenses, income, budgets] = await Promise.all([
    getExpenses(userId),
    getIncome(userId),
    getBudgets(userId)
  ]);

  // Filter by date range
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateFrom && expenseDate <= dateTo;
  });

  const filteredIncome = income.filter(inc => {
    const incomeDate = new Date(inc.date);
    return incomeDate >= dateFrom && incomeDate <= dateTo;
  });

  // Calculate summary
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Calculate top categories
  const categoryTotals: { [key: string]: number } = {};
  filteredExpenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    expenses: filteredExpenses,
    income: filteredIncome,
    budgets,
    dateRange: { from: dateFrom, to: dateTo },
    summary: {
      totalExpenses,
      totalIncome,
      netSavings,
      topCategories
    }
  };
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
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date),
      createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
    } as Expense));
    callback(expenses);
  });
};

export const subscribeToReminders = (userId: string, callback: (reminders: Reminder[]) => void) => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('dueDate', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    } as Reminder));
    callback(reminders);
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
    } as Group));
    callback(groups);
  });
};

export const subscribeToBudgetAlerts = (userId: string, callback: (alerts: BudgetAlert[]) => void) => {
  const q = query(
    collection(db, 'budgetAlerts'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    } as BudgetAlert));
    callback(alerts);
  });
};