import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getExpenses, getIncome, getBudgets } from '@/services/firestore';
import { Expense, Income, Budget } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  PieChart,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ChartData {
  categoryData: { category: string; amount: number; color: string }[];
  monthlyData: { month: string; expenses: number; income: number }[];
  budgetData: { category: string; budgeted: number; spent: number }[];
}

interface InteractiveChartsProps {
  visible: boolean;
  onClose: () => void;
}

export default function InteractiveCharts({ visible, onClose }: InteractiveChartsProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [chartData, setChartData] = useState<ChartData>({
    categoryData: [],
    monthlyData: [],
    budgetData: [],
  });
  const [selectedChart, setSelectedChart] = useState<'pie' | 'bar' | 'trend'>('pie');
  const [loading, setLoading] = useState(false);

  const chartColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.success,
    colors.warning,
    colors.error,
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
  ];

  useEffect(() => {
    if (visible && user) {
      loadChartData();
    }
  }, [visible, user]);

  const loadChartData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [expenses, income, budgets] = await Promise.all([
        getExpenses(user.uid),
        getIncome(user.uid),
        getBudgets(user.uid),
      ]);

      // Process category data for pie chart
      const categoryTotals: { [key: string]: number } = {};
      expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const categoryData = Object.entries(categoryTotals)
        .map(([category, amount], index) => ({
          category,
          amount,
          color: chartColors[index % chartColors.length],
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8);

      // Process monthly data for trend chart
      const monthlyData = [];
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

        monthlyData.push({
          month: date.toLocaleDateString('default', { month: 'short' }),
          expenses: monthExpenses,
          income: monthIncome,
        });
      }

      // Process budget data
      const budgetData = budgets.map(budget => {
        const categoryExpenses = expenses
          .filter(e => e.category === budget.category)
          .reduce((sum, e) => sum + e.amount, 0);
        
        return {
          category: budget.category,
          budgeted: budget.amount,
          spent: categoryExpenses,
        };
      });

      setChartData({
        categoryData,
        monthlyData,
        budgetData,
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPieChart = () => {
    const total = chartData.categoryData.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = 0;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending by Category</Text>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {chartData.categoryData.map((item, index) => {
              const percentage = (item.amount / total) * 100;
              const angle = (item.amount / total) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              return (
                <View
                  key={index}
                  style={[
                    styles.pieSlice,
                    {
                      backgroundColor: item.color,
                      transform: [
                        { rotate: `${startAngle}deg` },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.pieChartCenter}>
            <Text style={styles.pieChartCenterText}>${total.toFixed(0)}</Text>
            <Text style={styles.pieChartCenterLabel}>Total</Text>
          </View>
        </View>
        <View style={styles.legend}>
          {chartData.categoryData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.category}</Text>
              <Text style={styles.legendAmount}>${item.amount.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBarChart = () => {
    const maxAmount = Math.max(...chartData.budgetData.map(item => Math.max(item.budgeted, item.spent)));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Budget vs Actual Spending</Text>
        <View style={styles.barChartContainer}>
          {chartData.budgetData.map((item, index) => (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    styles.budgetBar,
                    { height: (item.budgeted / maxAmount) * 150 },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    styles.spentBar,
                    { height: (item.spent / maxAmount) * 150 },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.category.slice(0, 8)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.barLegend}>
          <View style={styles.barLegendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Budgeted</Text>
          </View>
          <View style={styles.barLegendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Spent</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    const maxAmount = Math.max(
      ...chartData.monthlyData.map(item => Math.max(item.expenses, item.income))
    );

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>6-Month Income vs Expenses</Text>
        <View style={styles.trendChartContainer}>
          {chartData.monthlyData.map((item, index) => (
            <View key={index} style={styles.trendBar}>
              <View style={styles.trendBarContainer}>
                <View
                  style={[
                    styles.trendBarIncome,
                    { height: maxAmount > 0 ? (item.income / maxAmount) * 120 : 4 },
                  ]}
                />
                <View
                  style={[
                    styles.trendBarExpense,
                    { height: maxAmount > 0 ? (item.expenses / maxAmount) * 120 : 4 },
                  ]}
                />
              </View>
              <Text style={styles.trendMonth}>{item.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.trendLegend}>
          <View style={styles.barLegendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.barLegendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Expenses</Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '95%',
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    chartSelector: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 12,
    },
    chartSelectorButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartSelectorButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chartSelectorText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginTop: 4,
    },
    chartSelectorTextActive: {
      color: '#FFFFFF',
    },
    scrollContainer: {
      flex: 1,
    },
    chartContainer: {
      padding: 24,
    },
    chartTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    pieChartContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    pieChart: {
      width: 200,
      height: 200,
      borderRadius: 100,
      position: 'relative',
      overflow: 'hidden',
    },
    pieSlice: {
      position: 'absolute',
      width: '50%',
      height: '50%',
      top: '50%',
      left: '50%',
      transformOrigin: '0 0',
    },
    pieChartCenter: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      top: 60,
    },
    pieChartCenterText: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    pieChartCenterLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    legend: {
      marginTop: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    legendText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    legendAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    barChartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 200,
      marginBottom: 16,
    },
    barGroup: {
      alignItems: 'center',
    },
    barContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      marginBottom: 8,
    },
    bar: {
      width: 12,
      borderRadius: 6,
      minHeight: 4,
    },
    budgetBar: {
      backgroundColor: colors.primary,
    },
    spentBar: {
      backgroundColor: colors.error,
    },
    barLabel: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    barLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    barLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendChartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 160,
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
    trendBarIncome: {
      width: 8,
      backgroundColor: colors.success,
      borderRadius: 4,
      minHeight: 4,
    },
    trendBarExpense: {
      width: 8,
      backgroundColor: colors.error,
      borderRadius: 4,
      minHeight: 4,
    },
    trendMonth: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    trendLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Interactive Charts</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.chartSelector}>
            <TouchableOpacity
              style={[
                styles.chartSelectorButton,
                selectedChart === 'pie' && styles.chartSelectorButtonActive,
              ]}
              onPress={() => setSelectedChart('pie')}
            >
              <PieChart size={20} color={selectedChart === 'pie' ? '#FFFFFF' : colors.text} />
              <Text
                style={[
                  styles.chartSelectorText,
                  selectedChart === 'pie' && styles.chartSelectorTextActive,
                ]}
              >
                Categories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chartSelectorButton,
                selectedChart === 'bar' && styles.chartSelectorButtonActive,
              ]}
              onPress={() => setSelectedChart('bar')}
            >
              <BarChart3 size={20} color={selectedChart === 'bar' ? '#FFFFFF' : colors.text} />
              <Text
                style={[
                  styles.chartSelectorText,
                  selectedChart === 'bar' && styles.chartSelectorTextActive,
                ]}
              >
                Budget
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chartSelectorButton,
                selectedChart === 'trend' && styles.chartSelectorButtonActive,
              ]}
              onPress={() => setSelectedChart('trend')}
            >
              <TrendingUp size={20} color={selectedChart === 'trend' ? '#FFFFFF' : colors.text} />
              <Text
                style={[
                  styles.chartSelectorText,
                  selectedChart === 'trend' && styles.chartSelectorTextActive,
                ]}
              >
                Trends
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {selectedChart === 'pie' && renderPieChart()}
            {selectedChart === 'bar' && renderBarChart()}
            {selectedChart === 'trend' && renderTrendChart()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}