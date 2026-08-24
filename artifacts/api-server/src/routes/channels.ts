import { Router } from "express";
import { db } from "@workspace/db";
import {
  conversationsTable,
  conversationMembersTable,
  usersTable,
} from "@workspace/db";
import { eq, and, like, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getRouteParamInt } from "../lib/params.js";

const router = Router();

// Search channels
router.get("/channels/search", requireAuth, async (req, res) => {
  try {
    const q = (req.query.q as string) || "";

    const channels = await db
      .select({
        id: conversationsTable.id,
        type: conversationsTable.type,
        name: conversationsTable.name,
        description: conversationsTable.description,
        avatarUrl: conversationsTable.avatarUrl,
        isPrivate: conversationsTable.isPrivate,
        createdAt: conversationsTable.createdAt,
      })
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.type, "channel"),
          eq(conversationsTable.isPrivate, false),
          q ? like(conversationsTable.name, `%${q}%`) : sql`1=1`
        )
      )
      .limit(30);

    const withCounts = await Promise.all(
      channels.map(async (ch) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(conversationMembersTable)
          .where(eq(conversationMembersTable.conversationId, ch.id));

        return { ...ch, membersCount: Number(countResult?.count || 0) };
      })
    );

    res.json(withCounts);
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

// Subscribe to channel
router.post("/channels/:id/subscribe", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const channelId = getRouteParamInt(req, "id");

    await db
      .insert(conversationMembersTable)
      .values({ conversationId: channelId, userId, role: "member" })
      .onConflictDoNothing();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Unsubscribe from channel
router.delete("/channels/:id/subscribe", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const channelId = getRouteParamInt(req, "id");

    await db
      .delete(conversationMembersTable)
      .where(
        and(
          eq(conversationMembersTable.conversationId, channelId),
          eq(conversationMembersTable.userId, userId)
        )
      );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
