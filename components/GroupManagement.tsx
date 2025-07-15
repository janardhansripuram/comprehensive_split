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
  Switch,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  updateGroup, 
  addGroupMember, 
  removeGroupMember, 
  promoteToAdmin, 
  demoteFromAdmin, 
  transferGroupOwnership,
  leaveGroup,
  getFriends
} from '@/services/firestore';
import { Group, Friend } from '@/types';
import {
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User,
  Edit3,
  Save,
  X,
  ChevronRight,
  LogOut,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react-native';

interface GroupManagementProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onGroupUpdated: () => void;
}

export default function GroupManagement({ 
  visible, 
  onClose, 
  group, 
  onGroupUpdated 
}: GroupManagementProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showEditName, setShowEditName] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [groupSettings, setGroupSettings] = useState(group.settings || {
    allowMembersToAddExpenses: true,
    allowMembersToInvite: false,
    requireApprovalForExpenses: false,
  });
  const [loading, setLoading] = useState(false);

  const isCreator = group.creatorId === user?.uid;
  const isAdmin = group.admins?.includes(user?.uid || '') || isCreator;

  useEffect(() => {
    if (visible && user) {
      loadFriends();
    }
  }, [visible, user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsData = await getFriends(user.uid);
      // Filter out friends who are already group members
      const availableFriends = friendsData.filter(
        friend => !group.members.includes(friend.friendId)
      );
      setFriends(availableFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!groupName.trim() || !isAdmin) return;

    setLoading(true);
    try {
      await updateGroup(group.id, { name: groupName.trim() });
      setShowEditName(false);
      onGroupUpdated();
      Alert.alert('Success', 'Group name updated successfully');
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Error', 'Failed to update group name');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (key: string, value: boolean) => {
    if (!isAdmin) return;

    const newSettings = { ...groupSettings, [key]: value };
    setGroupSettings(newSettings);

    try {
      await updateGroup(group.id, { settings: newSettings });
      onGroupUpdated();
    } catch (error) {
      console.error('Error updating group settings:', error);
      Alert.alert('Error', 'Failed to update group settings');
    }
  };

  const handleAddMember = async (friendId: string) => {
    try {
      await addGroupMember(group.id, friendId);
      setShowAddMember(false);
      onGroupUpdated();
      loadFriends();
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return;

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeGroupMember(group.id, memberId);
              onGroupUpdated();
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    if (!isCreator) return;

    try {
      await promoteToAdmin(group.id, memberId, user!.uid);
      onGroupUpdated();
      Alert.alert('Success', 'Member promoted to admin');
    } catch (error) {
      console.error('Error promoting member:', error);
      Alert.alert('Error', 'Failed to promote member');
    }
  };

  const handleDemoteFromAdmin = async (adminId: string) => {
    if (!isCreator) return;

    Alert.alert(
      'Demote Admin',
      'Are you sure you want to demote this admin to a regular member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Demote',
          style: 'destructive',
          onPress: async () => {
            try {
              await demoteFromAdmin(group.id, adminId, user!.uid);
              onGroupUpdated();
              Alert.alert('Success', 'Admin demoted to member');
            } catch (error) {
              console.error('Error demoting admin:', error);
              Alert.alert('Error', 'Failed to demote admin');
            }
          },
        },
      ]
    );
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    Alert.alert(
      'Transfer Ownership',
      'Are you sure you want to transfer ownership of this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            try {
              await transferGroupOwnership(group.id, newOwnerId, user!.uid);
              setShowTransferOwnership(false);
              onGroupUpdated();
              Alert.alert('Success', 'Group ownership transferred');
            } catch (error) {
              console.error('Error transferring ownership:', error);
              Alert.alert('Error', 'Failed to transfer ownership');
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = async () => {
    if (isCreator) {
      Alert.alert('Error', 'You cannot leave a group you created. Transfer ownership first.');
      return;
    }

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(group.id, user!.uid, user!.displayName || 'User');
              onClose();
              Alert.alert('Success', 'You have left the group');
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const getMemberRole = (memberId: string) => {
    if (group.creatorId === memberId) return 'creator';
    if (group.admins?.includes(memberId)) return 'admin';
    return 'member';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown size={16} color={colors.warning} />;
      case 'admin':
        return <Shield size={16} color={colors.primary} />;
      default:
        return <User size={16} color={colors.textSecondary} />;
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    groupNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    groupNameText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    editButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 8,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    settingLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    settingDescription: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    memberInfo: {
      flex: 1,
      marginLeft: 12,
    },
    memberName: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
    },
    memberRole: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    memberActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
    },
    addMemberButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    addMemberButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    dangerZone: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 24,
    },
    dangerButton: {
      backgroundColor: colors.error + '20',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    dangerButtonText: {
      color: colors.error,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    editNameModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editNameContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      width: '80%',
      maxWidth: 300,
    },
    editNameTitle: {
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
    editNameButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    editNameButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    editNameButtonPrimary: {
      backgroundColor: colors.primary,
    },
    editNameButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    editNameButtonTextPrimary: {
      color: '#FFFFFF',
    },
    friendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    friendName: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginLeft: 12,
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
              <Text style={styles.title}>Group Settings</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Group Name */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Group Information</Text>
                <View style={styles.groupNameContainer}>
                  <Text style={styles.groupNameText}>{group.name}</Text>
                  {isAdmin && (
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => setShowEditName(true)}
                    >
                      <Edit3 size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Group Settings */}
              {isAdmin && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Group Settings</Text>
                  
                  <View style={styles.settingItem}>
                    <View>
                      <Text style={styles.settingLabel}>Allow members to add expenses</Text>
                      <Text style={styles.settingDescription}>
                        Members can add expenses to the group
                      </Text>
                    </View>
                    <Switch
                      value={groupSettings.allowMembersToAddExpenses}
                      onValueChange={(value) => handleUpdateSettings('allowMembersToAddExpenses', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={groupSettings.allowMembersToAddExpenses ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>

                  <View style={styles.settingItem}>
                    <View>
                      <Text style={styles.settingLabel}>Allow members to invite</Text>
                      <Text style={styles.settingDescription}>
                        Members can invite new people to the group
                      </Text>
                    </View>
                    <Switch
                      value={groupSettings.allowMembersToInvite}
                      onValueChange={(value) => handleUpdateSettings('allowMembersToInvite', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={groupSettings.allowMembersToInvite ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>

                  <View style={styles.settingItem}>
                    <View>
                      <Text style={styles.settingLabel}>Require expense approval</Text>
                      <Text style={styles.settingDescription}>
                        Expenses need admin approval before being added
                      </Text>
                    </View>
                    <Switch
                      value={groupSettings.requireApprovalForExpenses}
                      onValueChange={(value) => handleUpdateSettings('requireApprovalForExpenses', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={groupSettings.requireApprovalForExpenses ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>
                </View>
              )}

              {/* Members */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
                
                {(isAdmin && (groupSettings.allowMembersToInvite || isCreator)) && (
                  <TouchableOpacity 
                    style={styles.addMemberButton}
                    onPress={() => setShowAddMember(true)}
                  >
                    <Text style={styles.addMemberButtonText}>Add Member</Text>
                  </TouchableOpacity>
                )}

                {group.memberDetails?.map((member) => (
                  <View key={member.userId} style={styles.memberItem}>
                    {getRoleIcon(member.role)}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.displayName} {member.userId === user?.uid && '(You)'}
                      </Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                    
                    {isAdmin && member.userId !== user?.uid && (
                      <View style={styles.memberActions}>
                        {isCreator && member.role === 'member' && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handlePromoteToAdmin(member.userId)}
                          >
                            <Shield size={16} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                        
                        {isCreator && member.role === 'admin' && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDemoteFromAdmin(member.userId)}
                          >
                            <User size={16} color={colors.textSecondary} />
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleRemoveMember(member.userId)}
                        >
                          <UserMinus size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Danger Zone */}
              <View style={styles.dangerZone}>
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                
                {isCreator && (
                  <TouchableOpacity 
                    style={styles.dangerButton}
                    onPress={() => setShowTransferOwnership(true)}
                  >
                    <Text style={styles.dangerButtonText}>Transfer Ownership</Text>
                  </TouchableOpacity>
                )}
                
                {!isCreator && (
                  <TouchableOpacity 
                    style={styles.dangerButton}
                    onPress={handleLeaveGroup}
                  >
                    <Text style={styles.dangerButtonText}>Leave Group</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditName}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditName(false)}
      >
        <View style={styles.editNameModal}>
          <View style={styles.editNameContent}>
            <Text style={styles.editNameTitle}>Edit Group Name</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.editNameButtons}>
              <TouchableOpacity
                style={styles.editNameButton}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.editNameButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editNameButton, styles.editNameButtonPrimary]}
                onPress={handleUpdateGroupName}
                disabled={loading}
              >
                <Text style={[styles.editNameButtonText, styles.editNameButtonTextPrimary]}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMember}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMember(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Member</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowAddMember(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContainer}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => handleAddMember(friend.friendId)}
                >
                  <User size={20} color={colors.primary} />
                  <Text style={styles.friendName}>
                    {friend.displayName || friend.email}
                  </Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        visible={showTransferOwnership}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransferOwnership(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Transfer Ownership</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowTransferOwnership(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContainer}>
              {group.memberDetails?.filter(member => member.userId !== user?.uid).map((member) => (
                <TouchableOpacity
                  key={member.userId}
                  style={styles.friendItem}
                  onPress={() => handleTransferOwnership(member.userId)}
                >
                  {getRoleIcon(member.role)}
                  <Text style={styles.friendName}>{member.displayName}</Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}