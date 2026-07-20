import { Router } from "express";
import { db } from "@workspace/db";
import {
  conversationsTable,
  conversationMembersTable,
  messagesTable,
  usersTable,
  messageReactionsTable,
} from "@workspace/db";
import { eq, and, desc, lt, inArray, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getIo } from "../socket.js";

const router = Router();

function safeUser(user: any) {
  if (!user) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// Get my conversations
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;

    const memberships = await db
      .select({ conversationId: conversationMembersTable.conversationId })
      .from(conversationMembersTable)
      .where(eq(conversationMembersTable.userId, userId));

    if (memberships.length === 0) {
      res.json([]);
      return;
    }

    const ids = memberships.map((m) => m.conversationId);
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(inArray(conversationsTable.id, ids));

    const result = await Promise.all(
      conversations.map(async (conv) => {
        // Get last message
        const [lastMsg] = await db
          .select({
            id: messagesTable.id,
            senderId: messagesTable.senderId,
            senderName: usersTable.displayName,
            content: messagesTable.content,
            type: messagesTable.type,
            createdAt: messagesTable.createdAt,
            isDeleted: messagesTable.isDeleted,
          })
          .from(messagesTable)
          .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
          .where(eq(messagesTable.conversationId, conv.id))
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        // Get member count
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(conversationMembersTable)
          .where(eq(conversationMembersTable.conversationId, conv.id));

        // For direct conversations, get other user
        let otherUser = null;
        if (conv.type === "direct") {
          const members = await db
            .select({
              id: usersTable.id,
              username: usersTable.username,
              displayName: usersTable.displayName,
              avatarUrl: usersTable.avatarUrl,
              isOnline: usersTable.isOnline,
              lastSeen: usersTable.lastSeen,
            })
            .from(conversationMembersTable)
            .innerJoin(
              usersTable,
              eq(conversationMembersTable.userId, usersTable.id)
            )
            .where(
              and(
                eq(conversationMembersTable.conversationId, conv.id),
                eq(conversationMembersTable.userId, userId)
              )
            );
          // get the other member
          const allMembers = await db
            .select({
              id: usersTable.id,
              username: usersTable.username,
              displayName: usersTable.displayName,
              avatarUrl: usersTable.avatarUrl,
              isOnline: usersTable.isOnline,
              lastSeen: usersTable.lastSeen,
            })
            .from(conversationMembersTable)
            .innerJoin(
              usersTable,
              eq(conversationMembersTable.userId, usersTable.id)
            )
            .where(eq(conversationMembersTable.conversationId, conv.id));

          otherUser = allMembers.find((m) => m.id !== userId) || null;
        }

        return {
          ...conv,
          lastMessage: lastMsg || null,
          membersCount: Number(countResult?.count || 0),
          otherUser,
        };
      })
    );

    // Sort by last message time
    result.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.createdAt).getTime();
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Create conversation
router.post("/conversations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { type, name, description, avatarUrl, isPrivate, memberIds, targetUserId } = req.body;

    if (!type) {
      res.status(400).json({ error: "Type required" });
      return;
    }

    // For direct conversations, check if one already exists
    if (type === "direct" && targetUserId) {
      const existing = await db
        .select({ conversationId: conversationMembersTable.conversationId })
        .from(conversationMembersTable)
        .where(eq(conversationMembersTable.userId, userId));

      const myConvIds = existing.map((e) => e.conversationId);

      if (myConvIds.length > 0) {
        const targetMemberships = await db
          .select({ conversationId: conversationMembersTable.conversationId })
          .from(conversationMembersTable)
          .where(
            and(
              eq(conversationMembersTable.userId, targetUserId),
              inArray(conversationMembersTable.conversationId, myConvIds)
            )
          );

        const sharedConvIds = targetMemberships.map((t) => t.conversationId);
        if (sharedConvIds.length > 0) {
          const [directConv] = await db
            .select()
            .from(conversationsTable)
            .where(
              and(
                inArray(conversationsTable.id, sharedConvIds),
                eq(conversationsTable.type, "direct")
              )
            );
          if (directConv) {
            res.json(directConv);
            return;
          }
        }
      }
    }

    const [conv] = await db
      .insert(conversationsTable)
      .values({
        type,
        name: name || null,
        description: description || null,
        avatarUrl: avatarUrl || null,
        isPrivate: isPrivate || false,
        createdBy: userId,
      })
      .returning();

    // Add creator as owner
    await db.insert(conversationMembersTable).values({
      conversationId: conv.id,
      userId,
      role: "owner",
    });

    // Add other members
    const extras: number[] = [];
    if (targetUserId) extras.push(targetUserId);
    if (memberIds && Array.isArray(memberIds)) extras.push(...memberIds);

    for (const memberId of extras) {
      if (memberId !== userId) {
        await db.insert(conversationMembersTable).values({
          conversationId: conv.id,
          userId: memberId,
          role: "member",
        });
      }
    }

    res.status(201).json(conv);
  } catch {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get conversation by ID
router.get("/conversations/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const convId = parseInt(req.params.id);

    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, convId));

    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Check membership
    const [member] = await db
      .select()
      .from(conversationMembersTable)
      .where(
        and(
          eq(conversationMembersTable.conversationId, convId),
          eq(conversationMembersTable.userId, userId)
        )
      );

    if (!member && conv.type !== "channel") {
      res.status(403).json({ error: "Not a member" });
      return;
    }

    let otherUser = null;
    if (conv.type === "direct") {
      const allMembers = await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          displayName: usersTable.displayName,
          avatarUrl: usersTable.avatarUrl,
          isOnline: usersTable.isOnline,
          lastSeen: usersTable.lastSeen,
          bio: usersTable.bio,
          statusText: usersTable.statusText,
        })
        .from(conversationMembersTable)
        .innerJoin(
          usersTable,
          eq(conversationMembersTable.userId, usersTable.id)
        )
        .where(eq(conversationMembersTable.conversationId, convId));
      otherUser = allMembers.find((m) => m.id !== userId) || null;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversationMembersTable)
      .where(eq(conversationMembersTable.conversationId, convId));

    res.json({
      ...conv,
      membersCount: Number(countResult?.count || 0),
      myRole: member?.role || "viewer",
      otherUser,
    });
  } catch {
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// Update conversation
router.put("/conversations/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const convId = parseInt(req.params.id);

    const [member] = await db
      .select()
      .from(conversationMembersTable)
      .where(
        and(
          eq(conversationMembersTable.conversationId, convId),
          eq(conversationMembersTable.userId, userId)
        )
      );

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const { name, description, avatarUrl, isPrivate, noMessages, noLinks, noFiles } = req.body;

    const [updated] = await db
      .update(conversationsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(noMessages !== undefined && { noMessages }),
        ...(noLinks !== undefined && { noLinks }),
        ...(noFiles !== undefined && { noFiles }),
      })
      .where(eq(conversationsTable.id, convId))
      .returning();

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Get messages
router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const convId = parseInt(req.params.id);
    const before = req.query.before ? parseInt(req.query.before as string) : undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 100);

    const msgs = await db
      .select({
        id: messagesTable.id,
        conversationId: messagesTable.conversationId,
        senderId: messagesTable.senderId,
        senderName: usersTable.displayName,
        senderAvatar: usersTable.avatarUrl,
        content: messagesTable.content,
        type: messagesTable.type,
        mediaUrl: messagesTable.mediaUrl,
        mediaSize: messagesTable.mediaSize,
        mediaName: messagesTable.mediaName,
        mediaMime: messagesTable.mediaMime,
        replyToId: messagesTable.replyToId,
        isEdited: messagesTable.isEdited,
        isDeleted: messagesTable.isDeleted,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(
        and(
          eq(messagesTable.conversationId, convId),
          ...(before ? [lt(messagesTable.id, before)] : [])
        )
      )
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);

    // Fetch reply-to messages
    const withReplies = await Promise.all(
      msgs.map(async (msg) => {
        if (msg.replyToId) {
          const [replyMsg] = await db
            .select({
              id: messagesTable.id,
              senderId: messagesTable.senderId,
              senderName: usersTable.displayName,
              content: messagesTable.content,
              type: messagesTable.type,
              createdAt: messagesTable.createdAt,
            })
            .from(messagesTable)
            .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
            .where(eq(messagesTable.id, msg.replyToId));
          return { ...msg, replyTo: replyMsg || null };
        }
        return { ...msg, replyTo: null };
      })
    );

    res.json(withReplies.reverse());
  } catch {
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send message
router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const convId = parseInt(req.params.id);
    const {
      content,
      type = "text",
      mediaUrl,
      mediaSize,
      mediaName,
      mediaMime,
      replyToId,
    } = req.body;

    if (!content && !mediaUrl) {
      res.status(400).json({ error: "Content or media required" });
      return;
    }

    const [msg] = await db
      .insert(messagesTable)
      .values({
        conversationId: convId,
        senderId: userId,
        content: content || null,
        type,
        mediaUrl: mediaUrl || null,
        mediaSize: mediaSize || null,
        mediaName: mediaName || null,
        mediaMime: mediaMime || null,
        replyToId: replyToId || null,
      })
      .returning();

    const [sender] = await db
      .select({
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const fullMessage = {
      ...msg,
      senderName: sender.displayName,
      senderAvatar: sender.avatarUrl,
      replyTo: null,
    };

    // Emit to all members in the room
    try {
      getIo().to(`conv:${convId}`).emit("new-message", fullMessage);
    } catch {
      // socket.io might not be initialized in tests
    }

    res.status(201).json(fullMessage);
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Edit message
router.put("/conversations/:id/messages/:messageId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;

    const [msg] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, messageId));

    if (!msg || msg.senderId !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const [updated] = await db
      .update(messagesTable)
      .set({ content, isEdited: true, editedAt: new Date() })
      .where(eq(messagesTable.id, messageId))
      .returning();

    try {
      getIo().to(`conv:${msg.conversationId}`).emit("message-edited", updated);
    } catch {}

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to edit message" });
  }
});

// Delete message
router.delete("/conversations/:id/messages/:messageId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const messageId = parseInt(req.params.messageId);

    const [msg] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, messageId));

    if (!msg || msg.senderId !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    await db
      .update(messagesTable)
      .set({ isDeleted: true, content: null })
      .where(eq(messagesTable.id, messageId));

    try {
      getIo()
        .to(`conv:${msg.conversationId}`)
        .emit("message-deleted", { messageId });
    } catch {}

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Add reaction
router.post("/conversations/:id/messages/:messageId/reactions", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const messageId = parseInt(req.params.messageId);
    const convId = parseInt(req.params.id);
    const { emoji } = req.body;

    if (!emoji) {
      res.status(400).json({ error: "Emoji required" });
      return;
    }

    await db
      .insert(messageReactionsTable)
      .values({ messageId, userId, emoji })
      .onConflictDoNothing();

    try {
      getIo().to(`conv:${convId}`).emit("reaction-added", { messageId, userId, emoji });
    } catch {}

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

// Get members
router.get("/conversations/:id/members", requireAuth, async (req, res) => {
  try {
    const convId = parseInt(req.params.id);

    const members = await db
      .select({
        id: conversationMembersTable.id,
        userId: conversationMembersTable.userId,
        conversationId: conversationMembersTable.conversationId,
        role: conversationMembersTable.role,
        joinedAt: conversationMembersTable.joinedAt,
        username: usersTable.username,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
        isOnline: usersTable.isOnline,
        lastSeen: usersTable.lastSeen,
      })
      .from(conversationMembersTable)
      .innerJoin(usersTable, eq(conversationMembersTable.userId, usersTable.id))
      .where(eq(conversationMembersTable.conversationId, convId));

    const result = members.map((m) => ({
      id: m.id,
      userId: m.userId,
      conversationId: m.conversationId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.userId,
        username: m.username,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
        isOnline: m.isOnline,
        lastSeen: m.lastSeen,
      },
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get members" });
  }
});

// Add member
router.post("/conversations/:id/members", requireAuth, async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    const { userId: newUserId } = req.body;

    const [member] = await db
      .insert(conversationMembersTable)
      .values({ conversationId: convId, userId: newUserId, role: "member" })
      .returning();

    res.status(201).json(member);
  } catch {
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Remove member
router.delete("/conversations/:id/members/:userId", requireAuth, async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);

    await db
      .delete(conversationMembersTable)
      .where(
        and(
          eq(conversationMembersTable.conversationId, convId),
          eq(conversationMembersTable.userId, targetUserId)
        )
      );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

export default router;
