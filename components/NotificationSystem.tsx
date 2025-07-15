import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  getBudgetAlerts, 
  getSpendingInsights, 
  markBudgetAlertAsRead, 
  markInsightAsRead 
} from '@/services/firestore';
import { BudgetAlert, SpendingInsight } from '@/types';
import { Bell, X, TriangleAlert as AlertTriangle, TrendingUp, Target, CircleCheck as CheckCircle, Info, Lightbulb, Award } from 'lucide-react-native';

interface NotificationSystemProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationSystem({ visible, onClose }: NotificationSystemProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadNotifications();
    }
  }, [visible, user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [alertsData, insightsData] = await Promise.all([
        getBudgetAlerts(user.uid),
        getSpendingInsights(user.uid)
      ]);
      
      setAlerts(alertsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await markBudgetAlertAsRead(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      Alert.alert('Error', 'Failed to mark alert as read');
    }
  };

  const handleMarkInsightAsRead = async (insightId: string) => {
    try {
      await markInsightAsRead(insightId);
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error marking insight as read:', error);
      Alert.alert('Error', 'Failed to mark insight as read');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'threshold':
        return <AlertTriangle size={20} color={colors.warning} />;
      case 'exceeded':
        return <AlertTriangle size={20} color={colors.error} />;
      case 'rollover':
        return <Target size={20} color={colors.primary} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp size={20} color={colors.primary} />;
      case 'anomaly':
        return <AlertTriangle size={20} color={colors.warning} />;
      case 'recommendation':
        return <Lightbulb size={20} color={colors.accent} />;
      case 'achievement':
        return <Award size={20} color={colors.success} />;
      default:
        return <Info size={20} color={colors.textSecondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
      marginTop: 24,
    },
    notificationItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
    },
    alertItem: {
      borderLeftColor: colors.warning,
    },
    insightItem: {
      borderLeftColor: colors.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    notificationIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    priorityText: {
      fontSize: 10,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
    },
    dismissButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    dismissButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Budget Alerts */}
            {alerts.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Budget Alerts</Text>
                {alerts.map((alert) => (
                  <View key={alert.id} style={[styles.notificationItem, styles.alertItem]}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        {getAlertIcon(alert.type)}
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>Budget Alert</Text>
                        <Text style={styles.notificationMessage}>{alert.message}</Text>
                        <View style={styles.notificationFooter}>
                          <Text style={styles.notificationDate}>
                            {alert.createdAt.toLocaleDateString()}
                          </Text>
                          <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={() => handleMarkAlertAsRead(alert.id)}
                          >
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Spending Insights */}
            {insights.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Spending Insights</Text>
                {insights.map((insight) => (
                  <View key={insight.id} style={[styles.notificationItem, styles.insightItem]}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        {getInsightIcon(insight.type)}
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>{insight.title}</Text>
                        <Text style={styles.notificationMessage}>{insight.description}</Text>
                        <View style={styles.notificationFooter}>
                          <Text style={styles.notificationDate}>
                            {insight.createdAt.toLocaleDateString()}
                          </Text>
                          <View style={styles.priorityBadge}>
                            <Text 
                              style={[
                                styles.priorityText, 
                                { color: getPriorityColor(insight.priority) }
                              ]}
                            >
                              {insight.priority}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={() => handleMarkInsightAsRead(insight.id)}
                          >
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Empty State */}
            {alerts.length === 0 && insights.length === 0 && (
              <View style={styles.emptyState}>
                <CheckCircle size={48} color={colors.success} />
                <Text style={styles.emptyStateText}>
                  All caught up! No new notifications.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}