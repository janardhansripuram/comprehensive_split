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
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  getSplits, 
  getUserProfile, 
  createSettlementRequest, 
  approveSettlementRequest,
  settleViaWallet 
} from '@/services/firestore';
import { Split, SettlementRequest, User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, CreditCard, Wallet, CircleCheck as CheckCircle, Clock, X, Send, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface SettlementManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettlementManager({ visible, onClose }: SettlementManagerProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [splits, setSplits] = useState<Split[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [pendingSettlements, setPendingSettlements] = useState<SettlementRequest[]>([]);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [settlementMethod, setSettlementMethod] = useState<'wallet' | 'manual'>('wallet');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadData();
    }
  }, [visible, user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [splitsData, profileData] = await Promise.all([
        getSplits(user.uid),
        getUserProfile(user.uid)
      ]);
      
      setSplits(splitsData);
      setUserProfile(profileData);
      
      // TODO: Load pending settlement requests
      setPendingSettlements([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUp = (split: Split, participant: any) => {
    setSelectedSplit(split);
    setSelectedParticipant(participant);
    setShowSettleModal(true);
  };

  const handleSubmitSettlement = async () => {
    if (!selectedSplit || !selectedParticipant || !user) return;
    
    setLoading(true);
    try {
      if (settlementMethod === 'wallet') {
        // Check if user has enough balance
        const currency = 'USD'; // Default to USD for now
        const userBalance = userProfile?.walletBalances?.[currency] || 0;
        
        if (userBalance < selectedParticipant.amount) {
          Alert.alert('Insufficient Balance', 'You do not have enough funds in your wallet to complete this settlement.');
          return;
        }
        
        await settleViaWallet(
          selectedSplit.id,
          user.uid,
          selectedSplit.creatorId,
          selectedParticipant.amount,
          currency
        );
        
        Alert.alert('Success', 'Payment completed successfully!');
      } else {
        // Create manual settlement request
        await createSettlementRequest({
          splitId: selectedSplit.id,
          fromUserId: user.uid,
          toUserId: selectedSplit.creatorId,
          amount: selectedParticipant.amount,
          currency: 'USD', // Default to USD for now
          paymentMethod: 'manual',
          notes: settlementNotes,
          status: 'pending'
        });
        
        Alert.alert('Success', 'Payment request sent! The recipient will need to approve it.');
      }
      
      setShowSettleModal(false);
      setSettlementMethod('wallet');
      setSettlementNotes('');
      loadData();
    } catch (error) {
      console.error('Error processing settlement:', error);
      Alert.alert('Error', 'Failed to process settlement');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSettlement = async (settlementId: string) => {
    setLoading(true);
    try {
      await approveSettlementRequest(settlementId);
      Alert.alert('Success', 'Settlement approved!');
      loadData();
    } catch (error) {
      console.error('Error approving settlement:', error);
      Alert.alert('Error', 'Failed to approve settlement');
    } finally {
      setLoading(false);
    }
  };

  const getUnsettledSplits = () => {
    return splits.filter(split => 
      split.status !== 'settled' && 
      (
        // You owe money (you're a participant)
        (split.creatorId !== user?.uid && split.participants.some(p => p.userId === user?.uid && !p.settled)) ||
        // Others owe you money (you're the creator)
        (split.creatorId === user?.uid && split.participants.some(p => p.userId !== user?.uid && !p.settled))
      )
    );
  };

  const getPendingSettlements = () => {
    return pendingSettlements.filter(settlement => 
      settlement.status === 'pending' && settlement.toUserId === user?.uid
    );
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
    summaryTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
      marginBottom: 16,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    balanceIcon: {
      marginRight: 12,
    },
    balanceInfo: {
      flex: 1,
    },
    balanceLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
      opacity: 0.8,
      marginBottom: 4,
    },
    balanceAmount: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    splitCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    splitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    splitInfo: {
      flex: 1,
    },
    splitTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    splitDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    splitAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
    },
    participantItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    participantInfo: {
      flex: 1,
    },
    participantName: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 2,
    },
    participantStatus: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    participantAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginRight: 12,
    },
    settleButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    settleButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
    pendingCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
    },
    pendingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    pendingInfo: {
      flex: 1,
    },
    pendingTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    pendingDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    pendingAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.warning,
    },
    pendingActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 12,
    },
    pendingActionButton: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    approveButton: {
      backgroundColor: colors.success,
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
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
    settleModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settleModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    settleModalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    settleModalAmount: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    methodSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    methodButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    methodButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    methodIcon: {
      marginBottom: 8,
    },
    methodText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.text,
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
      height: 100,
      textAlignVertical: 'top',
    },
    settleModalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    settleModalButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    settleModalButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    settleModalButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    settleModalButtonTextPrimary: {
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
              <Text style={styles.title}>Settlements</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Wallet Balance Summary */}
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.summaryTitle}>Wallet Balances</Text>
                {userProfile?.walletBalances && Object.entries(userProfile.walletBalances).map(([currency, amount]) => (
                  <View key={currency} style={styles.balanceRow}>
                    <View style={styles.balanceIcon}>
                      <Wallet size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.balanceInfo}>
                      <Text style={styles.balanceLabel}>{currency}</Text>
                      <Text style={styles.balanceAmount}>{amount.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </LinearGradient>

              {/* Pending Approval Settlements */}
              {getPendingSettlements().length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Pending Approval</Text>
                  {getPendingSettlements().map((settlement) => (
                    <View key={settlement.id} style={styles.pendingCard}>
                      <View style={styles.pendingHeader}>
                        <View style={styles.pendingInfo}>
                          <Text style={styles.pendingTitle}>Payment Request</Text>
                          <Text style={styles.pendingDescription}>
                            {settlement.notes || 'Manual payment settlement request'}
                          </Text>
                          <Text style={styles.pendingAmount}>
                            ${settlement.amount.toFixed(2)} {settlement.currency}
                          </Text>
                        </View>
                        <Clock size={24} color={colors.warning} />
                      </View>
                      <View style={styles.pendingActions}>
                        <TouchableOpacity
                          style={[styles.pendingActionButton, styles.rejectButton]}
                        >
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.pendingActionButton, styles.approveButton]}
                          onPress={() => handleApproveSettlement(settlement.id)}
                        >
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* Unsettled Splits */}
              <Text style={styles.sectionTitle}>Unsettled Expenses</Text>
              {getUnsettledSplits().length === 0 ? (
                <View style={styles.emptyState}>
                  <CheckCircle size={48} color={colors.success} />
                  <Text style={styles.emptyStateText}>
                    All settled up! No pending expenses to settle.
                  </Text>
                </View>
              ) : (
                getUnsettledSplits().map((split) => {
                  const isCreator = split.creatorId === user?.uid;
                  
                  return (
                    <View key={split.id} style={styles.splitCard}>
                      <View style={styles.splitHeader}>
                        <View style={styles.splitInfo}>
                          <Text style={styles.splitTitle}>
                            {isCreator ? 'You paid' : 'Split expense'}
                          </Text>
                          <Text style={styles.splitDate}>
                            {new Date(split.createdAt).toLocaleDateString()}
                          </Text>
                          <Text style={styles.splitAmount}>
                            Total: ${split.participants.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                          </Text>
                        </View>
                        {isCreator ? (
                          <ArrowDownLeft size={24} color={colors.success} />
                        ) : (
                          <ArrowUpRight size={24} color={colors.error} />
                        )}
                      </View>

                      {split.participants.map((participant) => {
                        // Skip yourself if you're the creator
                        if (isCreator && participant.userId === user?.uid) return null;
                        
                        // Skip settled participants
                        if (participant.settled) return null;
                        
                        // If you're a participant, only show your own entry
                        if (!isCreator && participant.userId !== user?.uid) return null;
                        
                        return (
                          <View key={participant.userId} style={styles.participantItem}>
                            <View style={styles.participantInfo}>
                              <Text style={styles.participantName}>
                                {isCreator ? participant.userName : 'You'}
                              </Text>
                              <Text style={styles.participantStatus}>
                                {participant.paid ? 'Paid, not settled' : 'Not paid'}
                              </Text>
                            </View>
                            <Text style={styles.participantAmount}>
                              ${participant.amount.toFixed(2)}
                            </Text>
                            {!isCreator && !participant.settled && (
                              <TouchableOpacity
                                style={styles.settleButton}
                                onPress={() => handleSettleUp(split, participant)}
                              >
                                <Text style={styles.settleButtonText}>Settle Up</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settle Up Modal */}
      <Modal
        visible={showSettleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettleModal(false)}
      >
        <View style={styles.settleModalOverlay}>
          <View style={styles.settleModalContent}>
            <Text style={styles.settleModalTitle}>Settle Payment</Text>
            
            <Text style={styles.settleModalAmount}>
              ${selectedParticipant?.amount.toFixed(2)}
            </Text>
            
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  settlementMethod === 'wallet' && styles.methodButtonSelected,
                ]}
                onPress={() => setSettlementMethod('wallet')}
              >
                <View style={styles.methodIcon}>
                  <Wallet size={24} color={colors.primary} />
                </View>
                <Text style={styles.methodText}>Wallet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  settlementMethod === 'manual' && styles.methodButtonSelected,
                ]}
                onPress={() => setSettlementMethod('manual')}
              >
                <View style={styles.methodIcon}>
                  <CreditCard size={24} color={colors.secondary} />
                </View>
                <Text style={styles.methodText}>Manual</Text>
              </TouchableOpacity>
            </View>
            
            {settlementMethod === 'manual' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Payment Notes</Text>
                <TextInput
                  style={styles.input}
                  value={settlementNotes}
                  onChangeText={setSettlementNotes}
                  placeholder="Describe how you paid (e.g., 'Paid in cash', 'Sent via Venmo')"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>
            )}
            
            <View style={styles.settleModalButtons}>
              <TouchableOpacity
                style={styles.settleModalButton}
                onPress={() => setShowSettleModal(false)}
              >
                <Text style={styles.settleModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settleModalButton, styles.settleModalButtonPrimary]}
                onPress={handleSubmitSettlement}
                disabled={loading}
              >
                <Text style={[styles.settleModalButtonText, styles.settleModalButtonTextPrimary]}>
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}