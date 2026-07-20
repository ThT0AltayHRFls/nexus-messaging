import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    if (!username || !password || !displayName) {
      res.status(400).json({ error: "Username, password, and display name required" });
      return;
    }
    if (username.length < 3 || username.length > 50) {
      res.status(400).json({ error: "Username must be 3-50 characters" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()));

    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(usersTable)
      .values({
        username: username.toLowerCase(),
        displayName,
        passwordHash,
        isOnline: true,
        lastSeen: new Date(),
      })
      .returning();

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()));

    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    await db
      .update(usersTable)
      .set({ isOnline: true, lastSeen: new Date() })
      .where(eq(usersTable.id, user.id));

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: { ...safeUser, isOnline: true }, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
