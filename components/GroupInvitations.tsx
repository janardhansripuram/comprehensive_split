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
  Share,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  createGroupInvitation,
  getGroupInvitations,
  acceptGroupInvitation,
  declineGroupInvitation,
  getFriends
} from '@/services/firestore';
import { GroupInvitation, Friend } from '@/types';
import {
  Mail,
  Link,
  UserPlus,
  Clock,
  Check,
  X,
  Send,
  Copy,
  Share2,
} from 'lucide-react-native';

interface GroupInvitationsProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function GroupInvitations({ 
  visible, 
  onClose, 
  groupId, 
  groupName 
}: GroupInvitationsProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadFriends();
      loadInvitations();
      generateInviteLink();
    }
  }, [visible, user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsData = await getFriends(user.uid);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadInvitations = async () => {
    if (!user?.email) return;
    
    try {
      const invitationsData = await getGroupInvitations(user.email);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const generateInviteLink = () => {
    // Generate a unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 15);
    const link = `https://expenseflow.app/invite/${inviteCode}`;
    setInviteLink(link);
  };

  const handleSendEmailInvite = async () => {
    if (!inviteEmail.trim() || !user) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      await createGroupInvitation({
        groupId,
        groupName,
        invitedBy: user.uid,
        invitedByName: user.displayName || user.email || 'User',
        invitedEmail: inviteEmail.trim().toLowerCase(),
        expiresAt,
        status: 'pending',
      });

      Alert.alert('Success', 'Invitation sent successfully!');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleShareInviteLink = async () => {
    try {
      await Share.share({
        message: `Join "${groupName}" on ExpenseFlow! ${inviteLink}`,
        title: `Join ${groupName}`,
        url: inviteLink,
      });
    } catch (error) {
      console.error('Error sharing invite link:', error);
    }
  };

  const handleCopyInviteLink = async () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copied', 'Invite link copied to clipboard');
  };

  const handleAcceptInvitation = async (invitation: GroupInvitation) => {
    if (!user) return;

    try {
      await acceptGroupInvitation(invitation.id, user.uid, user.displayName || 'User');
      loadInvitations();
      Alert.alert('Success', `You've joined ${invitation.groupName}!`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineGroupInvitation(invitationId);
      loadInvitations();
      Alert.alert('Success', 'Invitation declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      Alert.alert('Error', 'Failed to decline invitation');
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
      maxHeight: '80%',
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    inviteOption: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inviteOptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    inviteOptionTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginLeft: 12,
    },
    inviteOptionDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 16,
    },
    inviteButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    inviteButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    linkContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkText: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    linkActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    linkActionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    linkActionText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginLeft: 4,
    },
    invitationItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    invitationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    invitationInfo: {
      flex: 1,
    },
    invitationGroupName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    invitationFrom: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    invitationDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    invitationActions: {
      flexDirection: 'row',
      gap: 8,
    },
    invitationActionButton: {
      borderRadius: 8,
      padding: 8,
    },
    acceptButton: {
      backgroundColor: colors.success,
    },
    declineButton: {
      backgroundColor: colors.error,
    },
    emailInviteModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emailInviteContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '80%',
      maxWidth: 300,
    },
    emailInviteTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
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
      marginBottom: 16,
    },
    emailInviteButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    emailInviteButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    emailInviteButtonPrimary: {
      backgroundColor: colors.primary,
    },
    emailInviteButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    emailInviteButtonTextPrimary: {
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
              <Text style={styles.title}>Invite to {groupName}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Invite Options */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invite Methods</Text>
                
                <View style={styles.inviteOption}>
                  <View style={styles.inviteOptionHeader}>
                    <Mail size={24} color={colors.primary} />
                    <Text style={styles.inviteOptionTitle}>Email Invitation</Text>
                  </View>
                  <Text style={styles.inviteOptionDescription}>
                    Send a direct invitation to someone's email address
                  </Text>
                  <TouchableOpacity 
                    style={styles.inviteButton}
                    onPress={() => setShowInviteModal(true)}
                  >
                    <Text style={styles.inviteButtonText}>Send Email Invite</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inviteOption}>
                  <View style={styles.inviteOptionHeader}>
                    <Link size={24} color={colors.secondary} />
                    <Text style={styles.inviteOptionTitle}>Shareable Link</Text>
                  </View>
                  <Text style={styles.inviteOptionDescription}>
                    Share a link that anyone can use to join the group
                  </Text>
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>{inviteLink}</Text>
                    <View style={styles.linkActions}>
                      <TouchableOpacity 
                        style={styles.linkActionButton}
                        onPress={handleCopyInviteLink}
                      >
                        <Copy size={16} color={colors.text} />
                        <Text style={styles.linkActionText}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.linkActionButton}
                        onPress={handleShareInviteLink}
                      >
                        <Share2 size={16} color={colors.text} />
                        <Text style={styles.linkActionText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Invitations</Text>
                  {invitations.map((invitation) => (
                    <View key={invitation.id} style={styles.invitationItem}>
                      <View style={styles.invitationHeader}>
                        <View style={styles.invitationInfo}>
                          <Text style={styles.invitationGroupName}>
                            {invitation.groupName}
                          </Text>
                          <Text style={styles.invitationFrom}>
                            Invited by {invitation.invitedByName}
                          </Text>
                          <Text style={styles.invitationDate}>
                            {invitation.createdAt.toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.invitationActions}>
                          <TouchableOpacity
                            style={[styles.invitationActionButton, styles.acceptButton]}
                            onPress={() => handleAcceptInvitation(invitation)}
                          >
                            <Check size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.invitationActionButton, styles.declineButton]}
                            onPress={() => handleDeclineInvitation(invitation.id)}
                          >
                            <X size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Email Invite Modal */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.emailInviteModal}>
          <View style={styles.emailInviteContent}>
            <Text style={styles.emailInviteTitle}>Send Email Invitation</Text>
            <TextInput
              style={styles.input}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.emailInviteButtons}>
              <TouchableOpacity
                style={styles.emailInviteButton}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.emailInviteButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emailInviteButton, styles.emailInviteButtonPrimary]}
                onPress={handleSendEmailInvite}
                disabled={loading}
              >
                <Text style={[styles.emailInviteButtonText, styles.emailInviteButtonTextPrimary]}>
                  {loading ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}