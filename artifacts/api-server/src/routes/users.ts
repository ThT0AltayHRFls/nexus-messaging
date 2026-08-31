import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  contactsTable,
  blockedUsersTable,
} from "@workspace/db";
import { eq, and, like, ne } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getRouteParamInt } from "../lib/params.js";

const router = Router();

// Search users
router.get("/users/search", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const q = (req.query.q as string) || "";
    if (!q || q.length < 1) {
      res.json([]);
      return;
    }

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
        bio: usersTable.bio,
        isOnline: usersTable.isOnline,
        lastSeen: usersTable.lastSeen,
      })
      .from(usersTable)
      .where(
        and(
          ne(usersTable.id, userId),
          like(usersTable.username, `%${q.toLowerCase()}%`)
        )
      )
      .limit(20);

    res.json(users);
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

// Get user by ID
router.get("/users/:userId", requireAuth, async (req, res) => {
  try {
    const targetId = getRouteParamInt(req, "userId");
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        bio: usersTable.bio,
        age: usersTable.age,
        avatarUrl: usersTable.avatarUrl,
        statusText: usersTable.statusText,
        statusType: usersTable.statusType,
        isOnline: usersTable.isOnline,
        lastSeen: usersTable.lastSeen,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, targetId));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update my profile
router.put("/users/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { displayName, bio, age, avatarUrl } = req.body;

    const [updated] = await db
      .update(usersTable)
      .set({
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(age !== undefined && { age }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Update status
router.put("/users/me/status", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { statusText, statusType } = req.body;

    const expiresAt =
      statusType === "24h"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : null;

    const [updated] = await db
      .update(usersTable)
      .set({
        statusText,
        statusType,
        statusExpiresAt: expiresAt,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Block user
router.post("/users/:userId/block", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const blockedUserId = getRouteParamInt(req, "userId");

    await db
      .insert(blockedUsersTable)
      .values({ userId, blockedUserId })
      .onConflictDoNothing();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to block user" });
  }
});

// Unblock user
router.delete("/users/:userId/block", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const blockedUserId = getRouteParamInt(req, "userId");

    await db
      .delete(blockedUsersTable)
      .where(
        and(
          eq(blockedUsersTable.userId, userId),
          eq(blockedUsersTable.blockedUserId, blockedUserId)
        )
      );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// Add contact
router.post("/contacts/:userId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const contactUserId = getRouteParamInt(req, "userId");

    await db
      .insert(contactsTable)
      .values({ userId, contactUserId })
      .onConflictDoNothing();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// Get contacts
router.get("/contacts", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;

    const contacts = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
        isOnline: usersTable.isOnline,
        lastSeen: usersTable.lastSeen,
      })
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.contactUserId, usersTable.id))
      .where(eq(contactsTable.userId, userId));

    res.json(contacts);
  } catch {
    res.status(500).json({ error: "Failed to get contacts" });
  }
});

export default router;
