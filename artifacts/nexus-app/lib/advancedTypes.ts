/**
 * Advanced Types for Nexus Premium
 * Discord-like communities, servers, moderation, and advanced settings
 */

// ============= COMMUNITY/SERVER SYSTEM =============

export interface Server {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  banner?: string;
  ownerId: number;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  maxMembers?: number;
  inviteCode?: string;
  verificationLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  defaultRole?: Role;
  categories: ServerCategory[];
  roles: Role[];
  settings: ServerSettings;
}

export interface ServerCategory {
  id: number;
  serverId: number;
  name: string;
  position: number;
  permissionOverrides?: PermissionOverride[];
  channels: ServerChannel[];
}

export interface ServerChannel {
  id: number;
  serverId: number;
  categoryId?: number;
  name: string;
  description?: string;
  type: 'TEXT' | 'VOICE' | 'ANNOUNCEMENT';
  position: number;
  isNsfw: boolean;
  topic?: string;
  slowMode?: number; // seconds
  bitrate?: number; // for voice
  userLimit?: number; // for voice
  permissionOverrides?: PermissionOverride[];
  lastMessageId?: number;
  messages?: Message[];
}

export interface Role {
  id: number;
  serverId: number;
  name: string;
  color?: string;
  position: number;
  permissions: Permission[];
  isDefault: boolean;
  icon?: string;
  memberCount?: number;
}

export interface Permission {
  id: number;
  roleId: number;
  permission: string; // e.g., 'SEND_MESSAGES', 'MANAGE_ROLES', etc
  allowed: boolean;
}

export interface PermissionOverride {
  id: number;
  channelId: number;
  type: 'ROLE' | 'USER';
  targetId: number;
  permissions: Permission[];
}

export interface ServerMember {
  id: number;
  serverId: number;
  userId: number;
  user: User;
  roles: Role[];
  nickname?: string;
  avatar?: string;
  joinedAt: string;
  isBanned: boolean;
  isMuted: boolean;
  isDeafened?: boolean;
  customStatus?: string;
}

export interface ServerSettings {
  serverId: number;
  autoModeration: boolean;
  explicitContentFilter: 'DISABLED' | 'MEMBERS_WITHOUT_ROLES' | 'ALL_MEMBERS';
  allowInvites: boolean;
  defaultNotificationLevel: 'ALL' | 'MENTIONS' | 'NOTHING';
  logChannel?: number;
  bannerUrl?: string;
  splashUrl?: string;
}

// ============= PUBLIC COMMUNITIES =============

export interface PublicCommunity {
  id: number;
  name: string;
  description: string;
  icon: string;
  banner: string;
  category: CommunityCategory;
  tags: string[];
  memberCount: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isFeatured: boolean;
  language: string;
  rules?: string[];
  membershipRequired?: 'FREE' | 'PAID' | 'INVITE_ONLY';
  nsfw: boolean;
  discoveryRank?: number;
}

export type CommunityCategory = 
  | 'GAMING' 
  | 'EDUCATION' 
  | 'LIFESTYLE' 
  | 'ENTERTAINMENT' 
  | 'BUSINESS' 
  | 'HOBBIES' 
  | 'OTHER';

export interface CommunityMember {
  id: number;
  communityId: number;
  userId: number;
  user: User;
  joinedAt: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  customTitle?: string;
}

// ============= ADVANCED USER PROFILE =============

export interface AdvancedUserProfile extends User {
  banner?: string;
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  pronouns?: string;
  website?: string;
  socialLinks?: SocialLink[];
  badges?: Badge[];
  profiles?: ConnectedProfile[];
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  displayPreferences: DisplayPreferences;
}

export interface SocialLink {
  platform: 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'TWITCH' | 'GITHUB';
  username: string;
  url: string;
  verified: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt?: string;
}

export interface ConnectedProfile {
  platform: string;
  username: string;
  profileUrl: string;
  connectedAt: string;
}

// ============= SETTINGS SYSTEM =============

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12H' | '24H';
  defaultView: 'COMPACT' | 'COMFORTABLE' | 'COZY';
  animationsEnabled: boolean;
  adultContentVisible: boolean;
  dataCollection: boolean;
  betaFeatures: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  showOnlineStatus: boolean;
  showActivity: boolean;
  showLastSeen: boolean;
  allowFriendRequests: boolean;
  allowGroupInvites: boolean;
  blockDirectMessages: boolean;
  allowSearch: boolean;
  showPhoneNumber: boolean;
  showEmail: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  silentHours: {
    enabled: boolean;
    start: string; // "23:00"
    end: string;   // "08:00"
  };
  messageNotifications: {
    allMessages: boolean;
    friendsOnly: boolean;
    mutedWords: string[];
  };
  serverNotifications: Record<number, 'ALL' | 'MENTIONS' | 'NOTHING'>;
  keywords: string[];
}

export interface DisplayPreferences {
  compactMode: boolean;
  showAvatarOnMessages: boolean;
  showTimestamps: boolean;
  messageGrouping: 'NONE' | 'BY_SENDER' | 'BY_TIME';
  messageAlignment: 'LEFT' | 'CENTER' | 'RIGHT';
  emojiSet: 'NATIVE' | 'APPLE' | 'GOOGLE' | 'TWITTER' | 'CUSTOM';
  fontSize: 'SMALL' | 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
  colorScheme: 'AUTO' | 'LIGHT' | 'DARK' | 'CUSTOM';
  customThemeColor?: string;
  blurNsfwImages: boolean;
}

// ============= MODERATION =============

export interface ModerationAction {
  id: number;
  serverId: number;
  targetUserId: number;
  moderatorId: number;
  action: 'WARN' | 'MUTE' | 'KICK' | 'BAN' | 'TEMP_BAN';
  reason: string;
  duration?: number; // milliseconds
  expiresAt?: string;
  appliedAt: string;
}

export interface ModerationRule {
  id: number;
  serverId: number;
  name: string;
  description?: string;
  trigger: 'KEYWORD' | 'REGEX' | 'SPAM' | 'CAPS_SPAM' | 'INVITE';
  pattern?: string;
  action: 'DELETE' | 'WARN' | 'MUTE';
  enabled: boolean;
}

export interface AutoModeration {
  serverId: number;
  enabled: boolean;
  rules: ModerationRule[];
  logChannel?: number;
  ignoreRoles?: number[];
}

// ============= VOICE FEATURES =============

export interface VoiceSession {
  id: string;
  channelId: number;
  participants: VoiceParticipant[];
  startTime: string;
  endTime?: string;
  isRecording: boolean;
}

export interface VoiceParticipant {
  userId: number;
  user: User;
  joinedAt: string;
  isMuted: boolean;
  isDeafened: boolean;
  isStreamingScreen: boolean;
  audioQuality?: 'LOW' | 'NORMAL' | 'HIGH' | 'VERY_HIGH';
}

// ============= AUDIT LOG =============

export interface AuditLogEntry {
  id: number;
  serverId: number;
  userId: number;
  action: string;
  targetType: 'USER' | 'ROLE' | 'CHANNEL' | 'SERVER';
  targetId?: number;
  changes: AuditChange[];
  reason?: string;
  timestamp: string;
}

export interface AuditChange {
  key: string;
  oldValue?: any;
  newValue?: any;
}

// ============= INVITES & INVITATIONS =============

export interface ServerInvite {
  code: string;
  serverId: number;
  creatorId: number;
  expiresAt?: string;
  maxUses?: number;
  uses: number;
  isTemporary: boolean;
  createdAt: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  sender: User;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
}

// ============= ACHIEVEMENTS & STATS =============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  userId: number;
  totalMessages: number;
  totalReactions: number;
  serversJoined: number;
  friendsCount: number;
  achievements: Achievement[];
  level: number;
  exp: number;
  streakDays: number;
  lastMessageDate?: string;
}

// ============= TEMPLATE DATA =============

export interface ServerTemplate {
  id: number;
  name: string;
  description: string;
  preview: string;
  categories: {
    name: string;
    channels: {
      name: string;
      type: 'TEXT' | 'VOICE';
      topic?: string;
    }[];
  }[];
  roles?: {
    name: string;
    color: string;
    permissions: string[];
  }[];
  creatorId: number;
  usageCount: number;
  isFeatured: boolean;
  createdAt: string;
}

// ============= QUICK TYPES =============

export interface User {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
  isBot: boolean;
  status: 'ONLINE' | 'IDLE' | 'DO_NOT_DISTURB' | 'INVISIBLE' | 'OFFLINE';
  statusText?: string;
  statusEmoji?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId?: number;
  channelId?: number;
  senderId: number;
  senderName: string;
  content?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  mediaUrl?: string;
  mediaSize?: number;
  mediaName?: string;
  mediaMime?: string;
  replyToId?: number;
  reactions?: Record<string, number[]>;
  isDeleted: boolean;
  isEdited: boolean;
  editedAt?: string;
  pinnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  avatarUrl?: string;
  otherUser?: User;
  members?: User[];
  membersCount?: number;
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}
