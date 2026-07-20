import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  age: integer("age"),
  avatarUrl: text("avatar_url"),
  statusText: text("status_text"),
  statusType: varchar("status_type", { length: 20 }).default("permanent"),
  statusExpiresAt: timestamp("status_expires_at"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // direct, group, channel
  name: varchar("name", { length: 100 }),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  isPrivate: boolean("is_private").default(false),
  createdBy: integer("created_by").references(() => usersTable.id),
  noMessages: boolean("no_messages").default(false),
  noLinks: boolean("no_links").default(false),
  noFiles: boolean("no_files").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationMembersTable = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversationsTable.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  role: varchar("role", { length: 20 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversationsTable.id)
    .notNull(),
  senderId: integer("sender_id")
    .references(() => usersTable.id)
    .notNull(),
  content: text("content"),
  type: varchar("type", { length: 20 }).default("text").notNull(),
  mediaUrl: text("media_url"),
  mediaSize: integer("media_size"),
  mediaName: text("media_name"),
  mediaMime: text("media_mime"),
  replyToId: integer("reply_to_id"),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
});

export const messageReactionsTable = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .references(() => messagesTable.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  contentUrl: text("content_url").notNull(),
  contentType: varchar("content_type", { length: 20 }).default("image").notNull(),
  text: text("text"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyViewsTable = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id")
    .references(() => storiesTable.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  title: text("title"),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  likesCount: integer("likes_count").default(0),
  viewsCount: integer("views_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoLikesTable = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id")
    .references(() => videosTable.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  contactUserId: integer("contact_user_id")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blockedUsersTable = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  blockedUserId: integer("blocked_user_id")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPhotosTable = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  photoUrl: text("photo_url").notNull(),
  isMain: boolean("is_main").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type Conversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = typeof conversationsTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
