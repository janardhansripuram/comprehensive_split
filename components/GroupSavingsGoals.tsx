import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  createSavingsGoal,
  getGroupSavingsGoals,
  contributeToSavingsGoal
} from '@/services/firestore';
import { GroupSavingsGoal } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Target,
  Plus,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  X,
  Save,
} from 'lucide-react-native';

interface GroupSavingsGoalsProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const ProgressBar = Platform.OS === 'ios' ? ProgressViewIOS : ProgressBarAndroid;

export default function GroupSavingsGoals({ 
  visible, 
  onClose, 
  groupId, 
  groupName 
}: GroupSavingsGoalsProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [goals, setGoals] = useState<GroupSavingsGoal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GroupSavingsGoal | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    currency: 'USD',
  });
  
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    if (visible) {
      loadSavingsGoals();
    }
  }, [visible]);

  const loadSavingsGoals = async () => {
    setLoading(true);
    try {
      const goalsData = await getGroupSavingsGoals(groupId);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.name.trim() || !newGoal.targetAmount.trim() || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createSavingsGoal({
        groupId,
        name: newGoal.name.trim(),
        description: newGoal.description.trim(),
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        currency: newGoal.currency,
        targetDate: newGoal.targetDate ? new Date(newGoal.targetDate) : undefined,
        createdBy: user.uid,
        contributions: [],
        status: 'active',
      });

      Alert.alert('Success', 'Savings goal created successfully!');
      setNewGoal({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        currency: 'USD',
      });
      setShowCreateModal(false);
      loadSavingsGoals();
    } catch (error) {
      console.error('Error creating savings goal:', error);
      Alert.alert('Error', 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount.trim() || !selectedGoal || !user) {
      Alert.alert('Error', 'Please enter a valid contribution amount');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Contribution amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await contributeToSavingsGoal(selectedGoal.id, {
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        amount,
      });

      Alert.alert('Success', 'Contribution added successfully!');
      setContributionAmount('');
      setShowContributeModal(false);
      setSelectedGoal(null);
      loadSavingsGoals();
    } catch (error) {
      console.error('Error contributing to goal:', error);
      Alert.alert('Error', 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (goal: GroupSavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.primary;
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
    subtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    goalInfo: {
      flex: 1,
    },
    goalName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    goalDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    goalAmount: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
      marginBottom: 4,
    },
    goalTarget: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.background,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'capitalize',
    },
    progressSection: {
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      textAlign: 'center',
    },
    goalStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    contributeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    contributeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    contributionsList: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    contributionsTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 12,
    },
    contributionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    contributionUser: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    contributionAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.success,
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
    createModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    createModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    createModalTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    modalButtonTextPrimary: {
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
              <View>
                <Text style={styles.title}>Savings Goals</Text>
                <Text style={styles.subtitle}>{groupName}</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {goals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Target size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    No savings goals yet. Create your first goal to start saving together as a group!
                  </Text>
                </View>
              ) : (
                goals.map((goal) => {
                  const progressPercentage = getProgressPercentage(goal);
                  const isCompleted = goal.status === 'completed' || progressPercentage >= 100;
                  
                  return (
                    <View key={goal.id} style={styles.goalCard}>
                      <View style={styles.goalHeader}>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalName}>{goal.name}</Text>
                          {goal.description && (
                            <Text style={styles.goalDescription}>{goal.description}</Text>
                          )}
                          <Text style={styles.goalAmount}>
                            ${goal.currentAmount.toFixed(2)}
                          </Text>
                          <Text style={styles.goalTarget}>
                            of ${goal.targetAmount.toFixed(2)} goal
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                            {isCompleted ? 'Completed' : goal.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.progressSection}>
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          style={styles.progressBar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                        </LinearGradient>
                        <Text style={styles.progressText}>
                          {progressPercentage.toFixed(1)}% Complete
                        </Text>
                      </View>

                      <View style={styles.goalStats}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{goal.contributions.length}</Text>
                          <Text style={styles.statLabel}>Contributors</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
                          </Text>
                          <Text style={styles.statLabel}>Remaining</Text>
                        </View>
                        {goal.targetDate && (
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                              {Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                            </Text>
                            <Text style={styles.statLabel}>Days Left</Text>
                          </View>
                        )}
                      </View>

                      {!isCompleted && (
                        <TouchableOpacity
                          style={styles.contributeButton}
                          onPress={() => {
                            setSelectedGoal(goal);
                            setShowContributeModal(true);
                          }}
                        >
                          <Text style={styles.contributeButtonText}>Contribute</Text>
                        </TouchableOpacity>
                      )}

                      {goal.contributions.length > 0 && (
                        <View style={styles.contributionsList}>
                          <Text style={styles.contributionsTitle}>Recent Contributions</Text>
                          {goal.contributions.slice(0, 3).map((contribution, index) => (
                            <View key={index} style={styles.contributionItem}>
                              <Text style={styles.contributionUser}>
                                {contribution.userName}
                              </Text>
                              <Text style={styles.contributionAmount}>
                                +${contribution.amount.toFixed(2)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalContent}>
            <Text style={styles.createModalTitle}>Create Savings Goal</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Goal Name *</Text>
              <TextInput
                style={styles.input}
                value={newGoal.name}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Vacation Fund"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newGoal.description}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
                placeholder="What are you saving for?"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Amount *</Text>
              <TextInput
                style={styles.input}
                value={newGoal.targetAmount}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetAmount: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newGoal.targetDate}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetDate: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateGoal}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {loading ? 'Creating...' : 'Create Goal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        visible={showContributeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContributeModal(false)}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalContent}>
            <Text style={styles.createModalTitle}>
              Contribute to {selectedGoal?.name}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contribution Amount *</Text>
              <TextInput
                style={styles.input}
                value={contributionAmount}
                onChangeText={setContributionAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowContributeModal(false);
                  setSelectedGoal(null);
                  setContributionAmount('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleContribute}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {loading ? 'Contributing...' : 'Contribute'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}