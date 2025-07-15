import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getGroupActivities } from '@/services/firestore';
import { GroupActivity } from '@/types';
import {
  Activity,
  UserPlus,
  UserMinus,
  DollarSign,
  Users,
  CreditCard,
  Target,
  Crown,
  Shield,
  Settings,
  X,
  Clock,
} from 'lucide-react-native';

interface GroupActivityLogProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function GroupActivityLog({ 
  visible, 
  onClose, 
  groupId, 
  groupName 
}: GroupActivityLogProps) {
  const { colors } = useTheme();
  
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadActivities();
    }
  }, [visible]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const activitiesData = await getGroupActivities(groupId);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus size={20} color={colors.success} />;
      case 'member_left':
        return <UserMinus size={20} color={colors.error} />;
      case 'expense_added':
        return <DollarSign size={20} color={colors.primary} />;
      case 'expense_split':
        return <Users size={20} color={colors.secondary} />;
      case 'payment_made':
        return <CreditCard size={20} color={colors.success} />;
      case 'goal_created':
        return <Target size={20} color={colors.accent} />;
      case 'goal_contribution':
        return <Target size={20} color={colors.success} />;
      case 'member_promoted':
        return <Shield size={20} color={colors.primary} />;
      case 'member_demoted':
        return <Shield size={20} color={colors.textSecondary} />;
      case 'ownership_transferred':
        return <Crown size={20} color={colors.warning} />;
      case 'group_updated':
        return <Settings size={20} color={colors.textSecondary} />;
      default:
        return <Activity size={20} color={colors.textSecondary} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'member_joined':
      case 'goal_contribution':
      case 'payment_made':
        return colors.success;
      case 'member_left':
        return colors.error;
      case 'expense_added':
      case 'member_promoted':
        return colors.primary;
      case 'expense_split':
        return colors.secondary;
      case 'goal_created':
        return colors.accent;
      case 'ownership_transferred':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
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
    subtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      padding: 8,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    activityItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 4,
    },
    activityUser: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    activityTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    activityMetadata: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    metadataText: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
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
            <View>
              <Text style={styles.title}>Activity Log</Text>
              <Text style={styles.subtitle}>{groupName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading && activities.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Clock size={48} color={colors.textSecondary} />
                <Text style={styles.loadingText}>Loading activities...</Text>
              </View>
            ) : activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Activity size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  No activities yet. Group activities will appear here as members interact with the group.
                </Text>
              </View>
            ) : (
              activities.map((activity) => (
                <View 
                  key={activity.id} 
                  style={[
                    styles.activityItem,
                    { borderLeftColor: getActivityColor(activity.type) }
                  ]}
                >
                  <View style={styles.activityHeader}>
                    <View style={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                      <Text style={styles.activityUser}>
                        by {activity.userName}
                      </Text>
                      <Text style={styles.activityTime}>
                        {formatTimeAgo(activity.createdAt)}
                      </Text>
                      
                      {activity.metadata && (
                        <View style={styles.activityMetadata}>
                          {activity.type === 'goal_created' && (
                            <Text style={styles.metadataText}>
                              Target: ${activity.metadata.targetAmount}
                            </Text>
                          )}
                          {activity.type === 'goal_contribution' && (
                            <Text style={styles.metadataText}>
                              Amount: ${activity.metadata.amount}
                            </Text>
                          )}
                          {(activity.type === 'member_promoted' || activity.type === 'member_demoted') && (
                            <Text style={styles.metadataText}>
                              Member role updated
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}