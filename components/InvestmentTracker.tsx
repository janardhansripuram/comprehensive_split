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
  addInvestment, 
  getInvestments, 
  updateInvestment,
  deleteInvestment 
} from '@/services/firestore';
import { Investment, INVESTMENT_TYPES, CURRENCIES } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Plus, DollarSign, Calendar, ChartBar as BarChart3, X, CreditCard as Edit3, Trash2 } from 'lucide-react-native';

interface InvestmentTrackerProps {
  visible: boolean;
  onClose: () => void;
}

export default function InvestmentTracker({ visible, onClose }: InvestmentTrackerProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'stock',
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    currency: 'USD',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (visible && user) {
      loadInvestments();
    }
  }, [visible, user]);

  const loadInvestments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getInvestments(user.uid);
      setInvestments(data);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async () => {
    if (!formData.name.trim() || !formData.quantity.trim() || !formData.purchasePrice.trim() || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (selectedInvestment) {
        await updateInvestment(selectedInvestment.id, {
          type: formData.type as any,
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
          quantity: parseFloat(formData.quantity),
          purchasePrice: parseFloat(formData.purchasePrice),
          currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice),
          currency: formData.currency,
          purchaseDate: new Date(formData.purchaseDate),
          notes: formData.notes.trim(),
        });
      } else {
        await addInvestment({
          userId: user.uid,
          type: formData.type as any,
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
          quantity: parseFloat(formData.quantity),
          purchasePrice: parseFloat(formData.purchasePrice),
          currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice),
          currency: formData.currency,
          purchaseDate: new Date(formData.purchaseDate),
          notes: formData.notes.trim(),
        });
      }

      Alert.alert('Success', `Investment ${selectedInvestment ? 'updated' : 'added'} successfully!`);
      resetForm();
      setShowAddModal(false);
      setSelectedInvestment(null);
      loadInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
      Alert.alert('Error', 'Failed to save investment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormData({
      type: investment.type,
      name: investment.name,
      symbol: investment.symbol || '',
      quantity: investment.quantity.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      currency: investment.currency,
      purchaseDate: investment.purchaseDate.toISOString().split('T')[0],
      notes: investment.notes || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    Alert.alert(
      'Delete Investment',
      'Are you sure you want to delete this investment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvestment(investmentId);
              loadInvestments();
            } catch (error) {
              console.error('Error deleting investment:', error);
              Alert.alert('Error', 'Failed to delete investment');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      type: 'stock',
      name: '',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      currency: 'USD',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const calculateTotalValue = () => {
    return investments.reduce((total, investment) => {
      return total + (investment.quantity * investment.currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return investments.reduce((total, investment) => {
      const purchaseValue = investment.quantity * investment.purchasePrice;
      const currentValue = investment.quantity * investment.currentPrice;
      return total + (currentValue - purchaseValue);
    }, 0);
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
    investmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    investmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    investmentInfo: {
      flex: 1,
    },
    investmentName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    investmentSymbol: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
      marginBottom:  8,
    },
    investmentType: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    investmentActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
    },
    investmentDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    gainLoss: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    gainLossLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    gainLossValue: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
    },
    gainValue: {
      color: colors.success,
    },
    lossValue: {
      color: colors.error,
    },
    addButton: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    formModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    formModalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '90%',
    },
    formModalTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 24,
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
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    typeButton: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    typeButtonTextSelected: {
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
              <Text style={styles.title}>Investments</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    resetForm();
                    setSelectedInvestment(null);
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
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
                    <Text style={styles.summaryValue}>${calculateTotalValue().toFixed(2)}</Text>
                    <Text style={styles.summaryLabel}>Total Value</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryValue,
                      { color: calculateTotalGainLoss() >= 0 ? '#4ADE80' : '#F87171' }
                    ]}>
                      {calculateTotalGainLoss() >= 0 ? '+' : ''}{calculateTotalGainLoss().toFixed(2)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total Gain/Loss</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{investments.length}</Text>
                    <Text style={styles.summaryLabel}>Investments</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Investments List */}
              {investments.length === 0 ? (
                <View style={styles.emptyState}>
                  <BarChart3 size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    No investments yet. Add your first investment to start tracking your portfolio!
                  </Text>
                </View>
              ) : (
                investments.map((investment) => {
                  const currentValue = investment.quantity * investment.currentPrice;
                  const purchaseValue = investment.quantity * investment.purchasePrice;
                  const gainLoss = currentValue - purchaseValue;
                  const gainLossPercentage = (gainLoss / purchaseValue) * 100;
                  
                  return (
                    <View key={investment.id} style={styles.investmentCard}>
                      <View style={styles.investmentHeader}>
                        <View style={styles.investmentInfo}>
                          <Text style={styles.investmentName}>{investment.name}</Text>
                          {investment.symbol && (
                            <Text style={styles.investmentSymbol}>{investment.symbol}</Text>
                          )}
                          <Text style={styles.investmentType}>
                            {INVESTMENT_TYPES.find(t => t.value === investment.type)?.label || investment.type}
                          </Text>
                        </View>
                        <View style={styles.investmentActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleEditInvestment(investment)}
                          >
                            <Edit3 size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteInvestment(investment.id)}
                          >
                            <Trash2 size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.investmentDetails}>
                        <Text style={styles.detailLabel}>Quantity</Text>
                        <Text style={styles.detailValue}>{investment.quantity}</Text>
                      </View>

                      <View style={styles.investmentDetails}>
                        <Text style={styles.detailLabel}>Purchase Price</Text>
                        <Text style={styles.detailValue}>
                          {CURRENCIES.find(c => c.code === investment.currency)?.symbol || investment.currency}
                          {investment.purchasePrice.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.investmentDetails}>
                        <Text style={styles.detailLabel}>Current Price</Text>
                        <Text style={styles.detailValue}>
                          {CURRENCIES.find(c => c.code === investment.currency)?.symbol || investment.currency}
                          {investment.currentPrice.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.investmentDetails}>
                        <Text style={styles.detailLabel}>Current Value</Text>
                        <Text style={styles.detailValue}>
                          {CURRENCIES.find(c => c.code === investment.currency)?.symbol || investment.currency}
                          {currentValue.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.gainLoss}>
                        <Text style={styles.gainLossLabel}>Gain/Loss</Text>
                        <Text style={[
                          styles.gainLossValue,
                          gainLoss >= 0 ? styles.gainValue : styles.lossValue
                        ]}>
                          {gainLoss >= 0 ? '+' : ''}
                          {CURRENCIES.find(c => c.code === investment.currency)?.symbol || investment.currency}
                          {gainLoss.toFixed(2)} ({gainLoss >= 0 ? '+' : ''}
                          {gainLossPercentage.toFixed(2)}%)
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Investment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.formModalOverlay}>
          <View style={styles.formModalContent}>
            <Text style={styles.formModalTitle}>
              {selectedInvestment ? 'Edit Investment' : 'Add Investment'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Investment Type</Text>
                <View style={styles.typeSelector}>
                  {INVESTMENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        formData.type === type.value && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === type.value && styles.typeButtonTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Apple Inc., Bitcoin, Rental Property"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Symbol/Ticker (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.symbol}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, symbol: text }))}
                  placeholder="e.g., AAPL, BTC"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Purchase Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.purchasePrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, purchasePrice: text }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Price</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currentPrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentPrice: text }))}
                  placeholder="0.00 (defaults to purchase price if empty)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Currency</Text>
                <View style={styles.typeSelector}>
                  {CURRENCIES.slice(0, 4).map((currency) => (
                    <TouchableOpacity
                      key={currency.code}
                      style={[
                        styles.typeButton,
                        formData.currency === currency.code && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, currency: currency.code }))}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.currency === currency.code && styles.typeButtonTextSelected,
                        ]}
                      >
                        {currency.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Purchase Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.purchaseDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, purchaseDate: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.formButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setSelectedInvestment(null);
                  }}
                >
                  <Text style={styles.formButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonPrimary]}
                  onPress={handleAddInvestment}
                  disabled={loading}
                >
                  <Text style={[styles.formButtonText, styles.formButtonTextPrimary]}>
                    {loading ? 'Saving...' : selectedInvestment ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}