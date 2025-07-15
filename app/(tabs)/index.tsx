import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getExpenses, getIncome, getBudgets, getSplits } from '@/services/firestore';
import { Expense, Income, Budget, Split } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  PieChart,
  Bell,
  CreditCard,
  Wallet,
  Activity,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  netSavings: number;
  budgetUsage: number;
  pendingSplits: number;
  monthlyChange: number;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalIncome: 0,
    netSavings: 0,
    budgetUsage: 0,
    pendingSplits: 0,
    monthlyChange: 0,
  });
  
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [expenses, income, budgets, splits] = await Promise.all([
        getExpenses(user.uid, { limit: 50 }),
        getIncome(user.uid),
        getBudgets(user.uid),
        getSplits(user.uid),
      ]);

      // Calculate current month data
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthExpenses = expenses.filter(e => 
        e.date.toISOString().slice(0, 7) === currentMonth
      );
      const currentMonthIncome = income.filter(i => 
        i.date.toISOString().slice(0, 7) === currentMonth
      );

      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const pendingSplits = splits.filter(s => 
        s.participants.some(p => !p.settled)
      ).length;

      setStats({
        totalExpenses,
        totalIncome,
        netSavings: totalIncome - totalExpenses,
        budgetUsage: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
        pendingSplits,
        monthlyChange: 12.5, // Mock data - would calculate from previous month
      });

      setRecentExpenses(expenses.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Expense',
      color: colors.primary,
      onPress: () => router.push('/expenses'),
    },
    {
      icon: TrendingUp,
      label: 'Add Income',
      color: colors.success,
      onPress: () => router.push('/income'),
    },
    {
      icon: Target,
      label: 'Set Budget',
      color: colors.accent,
      onPress: () => router.push('/budgets'),
    },
    {
      icon: Users,
      label: 'Split Bill',
      color: colors.secondary,
      onPress: () => router.push('/splits'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    greeting: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    scrollContainer: {
      flex: 1,
    },
    statsCard: {
      margin: 24,
      borderRadius: 24,
      padding: 24,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      marginBottom: 20,
    },
    statValue: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: '#FFFFFF',
      opacity: 0.9,
    },
    statChange: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
      opacity: 0.8,
      marginTop: 4,
    },
    quickActionsContainer: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 16,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionItem: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionIcon: {
      marginBottom: 12,
    },
    quickActionLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      textAlign: 'center',
    },
    recentSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    recentExpenseItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    expenseIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    expenseDetails: {
      flex: 1,
    },
    expenseDescription: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    expenseCategory: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    expenseAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.error,
    },
    viewAllButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    viewAllButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!
        </Text>
        <Text style={styles.subtitle}>Here's your financial overview</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Card */}
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.accent]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.totalExpenses.toLocaleString()}</Text>
              <Text style={styles.statLabel}>This Month Spent</Text>
              <Text style={styles.statChange}>
                {stats.monthlyChange > 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}% from last month
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.totalIncome.toLocaleString()}</Text>
              <Text style={styles.statLabel}>This Month Income</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${Math.abs(stats.netSavings).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>
                Net {stats.netSavings >= 0 ? 'Savings' : 'Deficit'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.budgetUsage.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Budget Used</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={action.onPress}
              >
                <View style={styles.quickActionIcon}>
                  <action.icon size={32} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {recentExpenses.map((expense) => (
            <View key={expense.id} style={styles.recentExpenseItem}>
              <View style={styles.expenseIcon}>
                <DollarSign size={24} color={colors.primary} />
              </View>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
              </View>
              <Text style={styles.expenseAmount}>-${expense.amount}</Text>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/expenses')}
          >
            <Text style={styles.viewAllButtonText}>View All Expenses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}