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
  getUserProfile, 
  addFundsToWallet, 
  transferFunds,
  calculateNetWorth 
} from '@/services/firestore';
import { User, CURRENCIES } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  Plus,
  Send,
  TrendingUp,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react-native';

interface WalletManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function WalletManager({ visible, onClose }: WalletManagerProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [netWorth, setNetWorth] = useState<{ [currency: string]: number }>({});
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [addFundsForm, setAddFundsForm] = useState({
    amount: '',
    currency: 'USD',
  });
  
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    amount: '',
    currency: 'USD',
    description: '',
  });

  useEffect(() => {
    if (visible && user) {
      loadWalletData();
    }
  }, [visible, user]);

  const loadWalletData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [profile, netWorthData] = await Promise.all([
        getUserProfile(user.uid),
        calculateNetWorth(user.uid)
      ]);
      
      setUserProfile(profile);
      setNetWorth(netWorthData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!addFundsForm.amount.trim() || !user) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await addFundsToWallet(user.uid, parseFloat(addFundsForm.amount), addFundsForm.currency);
      Alert.alert('Success', 'Funds added successfully!');
      setAddFundsForm({ amount: '', currency: 'USD' });
      setShowAddFunds(false);
      loadWalletData();
    } catch (error) {
      console.error('Error adding funds:', error);
      Alert.alert('Error', 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.toUserId.trim() || !transferForm.amount.trim() || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await transferFunds(
        user.uid,
        transferForm.toUserId,
        parseFloat(transferForm.amount),
        transferForm.currency,
        transferForm.description || 'Wallet transfer'
      );
      
      Alert.alert('Success', 'Transfer completed successfully!');
      setTransferForm({ toUserId: '', amount: '', currency: 'USD', description: '' });
      setShowTransfer(false);
      loadWalletData();
    } catch (error) {
      console.error('Error transferring funds:', error);
      Alert.alert('Error', 'Failed to transfer funds');
    } finally {
      setLoading(false);
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
      padding: 24,
    },
    walletCard: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
    },
    walletTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
      marginBottom: 16,
    },
    balanceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    balanceItem: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 16,
      minWidth: 120,
    },
    balanceAmount: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    balanceCurrency: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
      opacity: 0.8,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      marginBottom: 8,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    netWorthCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    netWorthTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    netWorthGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    netWorthItem: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      minWidth: 100,
    },
    netWorthAmount: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.success,
      marginBottom: 2,
    },
    netWorthCurrency: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    formModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    formModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    formModalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
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
    currencySelector: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    currencyButton: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currencyButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    currencyButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    currencyButtonTextSelected: {
      color: '#FFFFFF',
    },
    formButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    formButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    formButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    formButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    formButtonTextPrimary: {
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
              <Text style={styles.title}>Wallet</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Wallet Balances */}
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.walletCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.walletTitle}>Wallet Balances</Text>
                <View style={styles.balanceGrid}>
                  {userProfile?.walletBalances && Object.entries(userProfile.walletBalances).map(([currency, amount]) => (
                    <View key={currency} style={styles.balanceItem}>
                      <Text style={styles.balanceAmount}>
                        {CURRENCIES.find(c => c.code === currency)?.symbol || currency}{amount.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceCurrency}>{currency}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowAddFunds(true)}
                >
                  <View style={styles.actionIcon}>
                    <Plus size={24} color={colors.success} />
                  </View>
                  <Text style={styles.actionText}>Add Funds</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowTransfer(true)}
                >
                  <View style={styles.actionIcon}>
                    <Send size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.actionText}>Transfer</Text>
                </TouchableOpacity>
              </View>

              {/* Net Worth */}
              <View style={styles.netWorthCard}>
                <Text style={styles.netWorthTitle}>Estimated Net Worth</Text>
                <View style={styles.netWorthGrid}>
                  {Object.entries(netWorth).map(([currency, amount]) => (
                    <View key={currency} style={styles.netWorthItem}>
                      <Text style={styles.netWorthAmount}>
                        {CURRENCIES.find(c => c.code === currency)?.symbol || currency}{amount.toFixed(2)}
                      </Text>
                      <Text style={styles.netWorthCurrency}>{currency}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        visible={showAddFunds}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddFunds(false)}
      >
        <View style={styles.formModalOverlay}>
          <View style={styles.formModalContent}>
            <Text style={styles.formModalTitle}>Add Funds</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={addFundsForm.amount}
                onChangeText={(text) => setAddFundsForm(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.currencySelector}>
                {CURRENCIES.slice(0, 4).map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyButton,
                      addFundsForm.currency === currency.code && styles.currencyButtonSelected,
                    ]}
                    onPress={() => setAddFundsForm(prev => ({ ...prev, currency: currency.code }))}
                  >
                    <Text
                      style={[
                        styles.currencyButtonText,
                        addFundsForm.currency === currency.code && styles.currencyButtonTextSelected,
                      ]}
                    >
                      {currency.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.formButton}
                onPress={() => setShowAddFunds(false)}
              >
                <Text style={styles.formButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonPrimary]}
                onPress={handleAddFunds}
                disabled={loading}
              >
                <Text style={[styles.formButtonText, styles.formButtonTextPrimary]}>
                  {loading ? 'Adding...' : 'Add Funds'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        visible={showTransfer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTransfer(false)}
      >
        <View style={styles.formModalOverlay}>
          <View style={styles.formModalContent}>
            <Text style={styles.formModalTitle}>Transfer Funds</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>To User ID</Text>
              <TextInput
                style={styles.input}
                value={transferForm.toUserId}
                onChangeText={(text) => setTransferForm(prev => ({ ...prev, toUserId: text }))}
                placeholder="Enter user ID"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={transferForm.amount}
                onChangeText={(text) => setTransferForm(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={transferForm.description}
                onChangeText={(text) => setTransferForm(prev => ({ ...prev, description: text }))}
                placeholder="Transfer description"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.formButton}
                onPress={() => setShowTransfer(false)}
              >
                <Text style={styles.formButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonPrimary]}
                onPress={handleTransfer}
                disabled={loading}
              >
                <Text style={[styles.formButtonText, styles.formButtonTextPrimary]}>
                  {loading ? 'Transferring...' : 'Transfer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}