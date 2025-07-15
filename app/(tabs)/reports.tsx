import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getExpenses, getIncome, getBudgets } from '@/services/firestore';
import { Expense, Income, Budget } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import DataExport from '@/components/DataExport';
import InteractiveCharts from '@/components/InteractiveCharts';
import { ChartPie as PieChart, ChartBar as BarChart, TrendingUp, TrendingDown, Calendar, Download, Filter, DollarSign, Target, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ReportData {
  totalExpenses: number;
  totalIncome: number;
  netSavings: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; expenses: number; income: number }[];
  budgetPerformance: { category: string; budgeted: number; spent: number; percentage: number }[];
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [reportData, setReportData] = useState<ReportData>({
    totalExpenses: 0,
    totalIncome: 0,
    netSavings: 0,
    topCategories: [],
    monthlyTrend: [],
    budgetPerformance: [],
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const periods = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'this-year', label: 'This Year' },
  ];

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, selectedPeriod]);

  const loadReportData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [expenses, income, budgets] = await Promise.all([
        getExpenses(user.uid),
        getIncome(user.uid),
        getBudgets(user.uid),
      ]);

      // Filter data based on selected period
      const filteredExpenses = filterByPeriod(expenses, selectedPeriod);
      const filteredIncome = filterByPeriod(income, selectedPeriod);

      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0);

      // Calculate top categories
      const categoryTotals: { [key: string]: number } = {};
      filteredExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        
        const monthExpenses = expenses
          .filter(e => e.date.toISOString().slice(0, 7) === monthKey)
          .reduce((sum, e) => sum + e.amount, 0);
        
        const monthIncome = income
          .filter(i => i.date.toISOString().slice(0, 7) === monthKey)
          .reduce((sum, i) => sum + i.amount, 0);

        monthlyTrend.push({
          month: date.toLocaleDateString('default', { month: 'short' }),
          expenses: monthExpenses,
          income: monthIncome,
        });
      }

      // Calculate budget performance
      const budgetPerformance = budgets.map(budget => {
        const categoryExpenses = filteredExpenses
          .filter(e => e.category === budget.category)
          .reduce((sum, e) => sum + e.amount, 0);
        
        return {
          category: budget.category,
          budgeted: budget.amount,
          spent: categoryExpenses,
          percentage: budget.amount > 0 ? (categoryExpenses / budget.amount) * 100 : 0,
        };
      });

      setReportData({
        totalExpenses,
        totalIncome,
        netSavings: totalIncome - totalExpenses,
        topCategories,
        monthlyTrend,
        budgetPerformance,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (data: any[], period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        return data.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 24,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 24,
    },
    periodSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 8,
    },
    periodButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    periodButtonTextActive: {
      color: '#FFFFFF',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginTop: 8,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    summaryCard: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
      opacity: 0.8,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    categoryCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    categoryBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    categoryBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    categoryAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginLeft: 16,
    },
    categoryPercentage: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    trendCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trendChart: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 120,
      marginBottom: 16,
    },
    trendBar: {
      alignItems: 'center',
    },
    trendBarContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      marginBottom: 8,
    },
    expenseBar: {
      width: 8,
      backgroundColor: colors.error,
      borderRadius: 4,
      minHeight: 4,
    },
    incomeBar: {
      width: 8,
      backgroundColor: colors.success,
      borderRadius: 4,
      minHeight: 4,
    },
    trendMonth: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    budgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    budgetItem: {
      marginBottom: 20,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    budgetCategory: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    budgetPercentage: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    budgetProgress: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    budgetProgressFill: {
      height: '100%',
      borderRadius: 4,
    },
    budgetAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    budgetAmount: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Analyze your spending patterns</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowChartsModal(true)}
          >
            <PieChart size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Interactive Charts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowExportModal(true)}
          >
            <Download size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.accent]}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${reportData.totalExpenses.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${reportData.totalIncome.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Income</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                ${Math.abs(reportData.netSavings).toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>
                Net {reportData.netSavings >= 0 ? 'Savings' : 'Deficit'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Top Categories */}
        <Text style={styles.sectionTitle}>Top Spending Categories</Text>
        <View style={styles.categoryCard}>
          {reportData.topCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      { width: `${category.percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.categoryPercentage}>
                  {category.percentage.toFixed(1)}% of total spending
                </Text>
              </View>
              <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Trend */}
        <Text style={styles.sectionTitle}>6-Month Trend</Text>
        <View style={styles.trendCard}>
          <View style={styles.trendChart}>
            {reportData.monthlyTrend.map((month, index) => {
              const maxAmount = Math.max(
                ...reportData.monthlyTrend.map(m => Math.max(m.expenses, m.income))
              );
              return (
                <View key={index} style={styles.trendBar}>
                  <View style={styles.trendBarContainer}>
                    <View
                      style={[
                        styles.expenseBar,
                        { height: maxAmount > 0 ? (month.expenses / maxAmount) * 100 : 4 }
                      ]}
                    />
                    <View
                      style={[
                        styles.incomeBar,
                        { height: maxAmount > 0 ? (month.income / maxAmount) * 100 : 4 }
                      ]}
                    />
                  </View>
                  <Text style={styles.trendMonth}>{month.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Budget Performance */}
        {reportData.budgetPerformance.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Budget Performance</Text>
            <View style={styles.budgetCard}>
              {reportData.budgetPerformance.map((budget, index) => (
                <View key={index} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={styles.budgetPercentage}>
                      {budget.percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.budgetProgress}>
                    <View
                      style={[
                        styles.budgetProgressFill,
                        {
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.percentage > 100 
                            ? colors.error 
                            : budget.percentage > 80 
                            ? colors.warning 
                            : colors.success,
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.budgetAmounts}>
                    <Text style={styles.budgetAmount}>
                      Spent: ${budget.spent.toFixed(2)}
                    </Text>
                    <Text style={styles.budgetAmount}>
                      Budget: ${budget.budgeted.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Data Export Modal */}
      <DataExport
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Interactive Charts Modal */}
      <InteractiveCharts
        visible={showChartsModal}
        onClose={() => setShowChartsModal(false)}
      />
    </View>
  );
}