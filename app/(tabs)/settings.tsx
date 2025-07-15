import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@firebase/auth';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import DataExport from '@/components/DataExport';
import NotificationSystem from '@/components/NotificationSystem';
import {
  User,
  Bell,
  Shield,
  Download,
  Moon,
  Sun,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Mail,
  Lock,
  Trash2,
  Database,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [showDataExport, setShowDataExport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const [settings, setSettings] = useState({
    notifications: true,
    budgetAlerts: true,
    emailNotifications: false,
    biometricAuth: false,
    autoBackup: true,
    currency: 'USD',
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      Alert.alert('Error', 'Please type "DELETE" to confirm account deletion');
      return;
    }
    
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd call a delete account function
            Alert.alert('Account Deleted', 'Your account has been deleted successfully');
            setShowDeleteAccount(false);
            setDeleteConfirmation('');
          },
        },
      ]
    );
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile Information',
          value: user?.email || 'Not available',
          onPress: () => {},
        },
        {
          icon: Mail,
          label: 'Email',
          value: user?.email || 'Not available',
          onPress: () => {},
        },
        {
          icon: Lock,
          label: 'Change Password',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: 'Dark Mode',
          component: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : colors.textSecondary}
            />
          ),
        },
        {
          icon: Globe,
          label: 'Currency',
          value: settings.currency,
          onPress: () => {},
        },
        {
          icon: Bell,
          label: 'Notifications',
          component: (
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.notifications ? '#FFFFFF' : colors.textSecondary}
            />
          ),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Biometric Authentication',
          component: (
            <Switch
              value={settings.biometricAuth}
              onValueChange={(value) => updateSetting('biometricAuth', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.biometricAuth ? '#FFFFFF' : colors.textSecondary}
            />
          ),
        },
        {
          icon: Database,
          label: 'Auto Backup',
          component: (
            <Switch
              value={settings.autoBackup}
              onValueChange={(value) => updateSetting('autoBackup', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.autoBackup ? '#FFFFFF' : colors.textSecondary}
            />
          ),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: Download,
          label: 'Export Data',
          onPress: () => setShowDataExport(true),
        },
        {
          icon: Bell,
          label: 'View Notifications',
          onPress: () => setShowNotifications(true),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          onPress: () => {},
        },
        {
          icon: Mail,
          label: 'Contact Us',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          icon: LogOut,
          label: 'Sign Out',
          onPress: handleSignOut,
          textColor: colors.error,
        },
        {
          icon: Trash2,
          label: 'Delete Account',
          onPress: () => setShowDeleteAccount(true),
          textColor: colors.error,
        },
      ],
    },
  ];

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
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    settingItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 2,
    },
    settingValue: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    settingAction: {
      marginLeft: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
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
      marginBottom: 20,
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
    modalButtonDanger: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    modalButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    modalButtonTextDanger: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences and account</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={!item.onPress}
              >
                <View style={styles.settingIcon}>
                  <item.icon size={24} color={item.textColor || colors.text} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, item.textColor && { color: item.textColor }]}>
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  )}
                </View>
                <View style={styles.settingAction}>
                  {item.component || (item.onPress && <ChevronRight size={20} color={colors.textSecondary} />)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Data Export Modal */}
      <DataExport
        visible={showDataExport}
        onClose={() => setShowDataExport(false)}
      />

      {/* Notifications Modal */}
      <NotificationSystem
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteAccount}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteAccount(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All your data will be permanently deleted.
              Type "DELETE" to confirm.
            </Text>
            <TextInput
              style={styles.input}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Type DELETE to confirm"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDanger]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}