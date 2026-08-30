import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase Client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Nexus Supabase configuration is missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============= SERVERS/COMMUNITIES =============

export const serverAPI = {
  // Create Server
  async createServer(data: {
    name: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  }) {
    try {
      const { data: server, error } = await supabase
        .from('servers')
        .insert([
          {
            name: data.name,
            description: data.description,
            icon: data.icon,
            is_public: data.isPublic,
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: server };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get User's Servers
  async getUserServers(userId: number) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*, server_members(*)')
        .eq('server_members.user_id', userId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Create Channel
  async createChannel(serverId: number, data: {
    name: string;
    type: 'TEXT' | 'VOICE';
    description?: string;
  }) {
    try {
      const { data: channel, error } = await supabase
        .from('server_channels')
        .insert([
          {
            server_id: serverId,
            name: data.name,
            type: data.type,
            description: data.description,
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get Server Channels
  async getServerChannels(serverId: number) {
    try {
      const { data, error } = await supabase
        .from('server_channels')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Send Channel Message
  async sendChannelMessage(channelId: number, data: {
    content?: string;
    type: 'text' | 'image' | 'video' | 'audio';
    mediaUrl?: string;
  }) {
    try {
      const { data: message, error } = await supabase
        .from('channel_messages')
        .insert([
          {
            channel_id: channelId,
            content: data.content,
            type: data.type,
            media_url: data.mediaUrl,
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: message };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Manage Roles
  async createRole(serverId: number, data: {
    name: string;
    color?: string;
    permissions: string[];
  }) {
    try {
      const { data: role, error } = await supabase
        .from('roles')
        .insert([
          {
            server_id: serverId,
            name: data.name,
            color: data.color,
            permissions: data.permissions,
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: role };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// ============= PUBLIC COMMUNITIES =============

export const communityAPI = {
  // Get All Public Communities
  async getPublicCommunities(filters?: {
    category?: string;
    search?: string;
    limit?: number;
  }) {
    try {
      let query = supabase.from('public_communities').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query
        .order('member_count', { ascending: false })
        .limit(filters?.limit || 50);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Join Community
  async joinCommunity(communityId: number, userId: number) {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: communityId,
            user_id: userId,
            joined_at: new Date(),
            role: 'MEMBER',
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Leave Community
  async leaveCommunity(communityId: number, userId: number) {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// ============= USER PROFILE =============

export const profileAPI = {
  // Update Profile
  async updateProfile(userId: number, data: any) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          bio: data.bio,
          avatar_url: data.avatarUrl,
          banner_url: data.bannerUrl,
          pronouns: data.pronouns,
          website: data.website,
          location: data.location,
          theme: data.theme,
          updated_at: new Date(),
        })
        .eq('id', userId)
        .select();

      if (error) throw error;
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Update Privacy Settings
  async updatePrivacySettings(userId: number, data: any) {
    try {
      const { data: settings, error } = await supabase
        .from('privacy_settings')
        .upsert(
          {
            user_id: userId,
            profile_visibility: data.profileVisibility,
            show_online_status: data.showOnlineStatus,
            show_activity: data.showActivity,
            allow_friend_requests: data.allowFriendRequests,
            block_dms: data.blockDMs,
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (error) throw error;
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Update Notification Settings
  async updateNotificationSettings(userId: number, data: any) {
    try {
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: userId,
            push_enabled: data.pushEnabled,
            email_enabled: data.emailEnabled,
            sound_enabled: data.soundEnabled,
            vibration_enabled: data.vibrationEnabled,
            silent_hours_enabled: data.silentHoursEnabled,
            silent_start: data.silentStart,
            silent_end: data.silentEnd,
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (error) throw error;
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get User Stats
  async getUserStats(userId: number) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// ============= MODERATION =============

export const moderationAPI = {
  // Block User
  async blockUser(userId: number, blockedUserId: number) {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .insert([
          {
            user_id: userId,
            blocked_user_id: blockedUserId,
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Unblock User
  async unblockUser(userId: number, blockedUserId: number) {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get Blocked Users
  async getBlockedUsers(userId: number) {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*, blocked_user:blocked_user_id(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Report User/Content
  async reportContent(data: {
    reportedUserId?: number;
    contentId?: number;
    reason: string;
    description?: string;
  }) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .insert([
          {
            reported_user_id: data.reportedUserId,
            content_id: data.contentId,
            reason: data.reason,
            description: data.description,
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// ============= REAL-TIME SUBSCRIPTIONS =============

export const realtimeAPI = {
  // Subscribe to Server Messages
  subscribeToServerMessages(serverId: number, callback: (payload: any) => void) {
    return supabase
      .channel(`server:${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_messages',
          filter: `server_id=eq.${serverId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to User Status
  subscribeToUserStatus(userId: number, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to Notifications
  subscribeToNotifications(userId: number, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ============= SEARCH =============

export const searchAPI = {
  // Global Search
  async globalSearch(query: string, limit = 20) {
    try {
      const searchPromises = [
        supabase.from('users').select('id, username, display_name, avatar_url').ilike('username', `%${query}%`).limit(5),
        supabase.from('public_communities').select('id, name, icon, member_count').ilike('name', `%${query}%`).limit(5),
        supabase.from('servers').select('id, name, icon').ilike('name', `%${query}%`).limit(5),
      ];

      const results = await Promise.all(searchPromises);
      
      return {
        success: true,
        data: {
          users: results[0].data,
          communities: results[1].data,
          servers: results[2].data,
        },
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Search in Channel
  async searchInChannel(channelId: number, query: string) {
    try {
      const { data, error } = await supabase
        .from('channel_messages')
        .select('*')
        .eq('channel_id', channelId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  },
};

export default supabase;
