import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markNotificationAsRead } from '@/services/firestore';
import { Notification } from '@/types';
import {
  Bell,
  X,
  UserPlus,
  Users,
  CreditCard,
  Clock,
  Award,
  Info,
  CheckCircle,
} from 'lucide-react-native';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      const notificationsData = await getNotifications(user.uid);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => markNotificationAsRead(n.id)));
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={20} color={colors.primary} />;
      case 'group_invite':
        return <Users size={20} color={colors.secondary} />;
      case 'settlement_request':
        return <CreditCard size={20} color={colors.warning} />;
      case 'reminder':
        return <Clock size={20} color={colors.error} />;
      case 'achievement':
        return <Award size={20} color={colors.success} />;
      case 'system':
        return <Info size={20} color={colors.textSecondary} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return colors.primary;
      case 'group_invite':
        return colors.secondary;
      case 'settlement_request':
        return colors.warning;
      case 'reminder':
        return colors.error;
      case 'achievement':
        return colors.success;
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
    closeButton: {
      padding: 8,
    },
    scrollContainer: {
      flex: 1,
    },
    notificationItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
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
      marginBottom: 8,
    },
    notificationTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    notificationActions: {
      marginLeft: 8,
    },
    markReadButton: {
      padding: 8,
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
    markAllReadButton: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignSelf: 'center',
      marginVertical: 16,
    },
    markAllReadText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.primary,
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
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  No new notifications. You're all caught up!
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.markAllReadButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
                
                {notifications.map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <View style={[
                      styles.notificationIcon,
                      { borderColor: getNotificationColor(notification.type) }
                    ]}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.notificationActions}>
                      <TouchableOpacity
                        style={styles.markReadButton}
                        onPress={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle size={20} color={colors.success} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}