import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getUserAchievements, getUserProfile } from '@/services/firestore';
import { Achievement, User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Trophy,
  Star,
  Calendar,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  X,
  Share2,
} from 'lucide-react-native';

interface AchievementsCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function AchievementsCenter({ visible, onClose }: AchievementsCenterProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadAchievements();
    }
  }, [visible, user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [achievementsData, profile] = await Promise.all([
        getUserAchievements(user.uid),
        getUserProfile(user.uid)
      ]);
      
      setAchievements(achievementsData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'first_expense':
        return <DollarSign size={24} color="#FFFFFF" />;
      case 'first_budget':
        return <Target size={24} color="#FFFFFF" />;
      case 'savings_goal':
        return <TrendingUp size={24} color="#FFFFFF" />;
      case 'streak_7':
      case 'streak_30':
        return <Calendar size={24} color="#FFFFFF" />;
      case 'referral':
        return <Users size={24} color="#FFFFFF" />;
      case 'group_creator':
        return <Users size={24} color="#FFFFFF" />;
      default:
        return <Star size={24} color="#FFFFFF" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'first_expense':
        return ['#10B981', '#059669'];
      case 'first_budget':
        return ['#3B82F6', '#2563EB'];
      case 'savings_goal':
        return ['#8B5CF6', '#7C3AED'];
      case 'streak_7':
        return ['#F59E0B', '#D97706'];
      case 'streak_30':
        return ['#EF4444', '#DC2626'];
      case 'referral':
        return ['#EC4899', '#DB2777'];
      case 'group_creator':
        return ['#6366F1', '#4F46E5'];
      default:
        return ['#10B981', '#059669'];
    }
  };

  const getTotalPoints = () => {
    return achievements.reduce((sum, achievement) => sum + achievement.rewardPoints, 0);
  };

  const getUnlockedCount = () => {
    return achievements.length;
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
      padding: 24,
    },
    summaryCard: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
      opacity: 0.8,
    },
    referralSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    referralTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 12,
    },
    referralCode: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    referralCodeText: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
    },
    shareButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    shareButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    referralDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    achievementItem: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    achievementIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    achievementTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    achievementPoints: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
      marginBottom: 8,
    },
    achievementDate: {
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
    detailModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    detailModalTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    detailModalDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    detailModalIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      alignSelf: 'center',
    },
    detailModalPoints: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
      marginBottom: 24,
      textAlign: 'center',
    },
    detailModalDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    detailModalButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    detailModalButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
  });

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Achievements</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Summary Card */}
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{getTotalPoints()}</Text>
                    <Text style={styles.summaryLabel}>Total Points</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{getUnlockedCount()}</Text>
                    <Text style={styles.summaryLabel}>Achievements</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{userProfile?.streakCount || 0}</Text>
                    <Text style={styles.summaryLabel}>Day Streak</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Referral Section */}
              <View style={styles.referralSection}>
                <Text style={styles.referralTitle}>Refer Friends & Earn Points</Text>
                <View style={styles.referralCode}>
                  <Text style={styles.referralCodeText}>{userProfile?.referralCode || 'ABCDEF'}</Text>
                  <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.referralDescription}>
                  Share your referral code with friends. You'll earn 100 points for each friend who signs up, and they'll get 50 points!
                </Text>
              </View>

              {/* Achievements */}
              <Text style={styles.sectionTitle}>Your Achievements</Text>
              {achievements.length === 0 ? (
                <View style={styles.emptyState}>
                  <Trophy size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    No achievements yet. Start using the app to unlock achievements and earn points!
                  </Text>
                </View>
              ) : (
                <View style={styles.achievementsGrid}>
                  {achievements.map((achievement) => {
                    const colors = getAchievementColor(achievement.type);
                    
                    return (
                      <TouchableOpacity
                        key={achievement.id}
                        style={styles.achievementItem}
                        onPress={() => setSelectedAchievement(achievement)}
                      >
                        <LinearGradient
                          colors={colors}
                          style={styles.achievementIcon}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {getAchievementIcon(achievement.type)}
                        </LinearGradient>
                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementPoints}>+{achievement.rewardPoints} points</Text>
                        <Text style={styles.achievementDate}>
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Achievement Detail Modal */}
      <Modal
        visible={!!selectedAchievement}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedAchievement && (
              <>
                <LinearGradient
                  colors={getAchievementColor(selectedAchievement.type)}
                  style={styles.detailModalIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {getAchievementIcon(selectedAchievement.type)}
                </LinearGradient>
                <Text style={styles.detailModalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.detailModalDescription}>{selectedAchievement.description}</Text>
                <Text style={styles.detailModalPoints}>+{selectedAchievement.rewardPoints} points</Text>
                <Text style={styles.detailModalDate}>
                  Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.detailModalButton}
                  onPress={() => setSelectedAchievement(null)}
                >
                  <Text style={styles.detailModalButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}