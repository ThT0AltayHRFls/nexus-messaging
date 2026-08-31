import { Router } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyViewsTable, usersTable } from "@workspace/db";
import { eq, gt, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Get stories (grouped by user)
router.get("/stories", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const now = new Date();

    const stories = await db
      .select({
        id: storiesTable.id,
        userId: storiesTable.userId,
        userName: usersTable.displayName,
        userAvatar: usersTable.avatarUrl,
        contentUrl: storiesTable.contentUrl,
        contentType: storiesTable.contentType,
        text: storiesTable.text,
        expiresAt: storiesTable.expiresAt,
        createdAt: storiesTable.createdAt,
      })
      .from(storiesTable)
      .innerJoin(usersTable, eq(storiesTable.userId, usersTable.id))
      .where(gt(storiesTable.expiresAt, now))
      .orderBy(storiesTable.userId, storiesTable.createdAt);

    // Get viewed story IDs
    const viewedStories = await db
      .select({ storyId: storyViewsTable.storyId })
      .from(storyViewsTable)
      .where(eq(storyViewsTable.userId, userId));

    const viewedIds = new Set(viewedStories.map((v) => v.storyId));

    // Group by user
    const grouped = stories.reduce<
      Map<
        number,
        {
          userId: number;
          userName: string;
          userAvatar: string | null;
          stories: any[];
          hasUnviewed: boolean;
        }
      >
    >((acc, story) => {
      if (!acc.has(story.userId)) {
        acc.set(story.userId, {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          stories: [],
          hasUnviewed: false,
        });
      }
      const group = acc.get(story.userId)!;
      const viewed = viewedIds.has(story.id);
      group.stories.push({ ...story, viewed });
      if (!viewed) group.hasUnviewed = true;
      return acc;
    }, new Map());

    res.json(Array.from(grouped.values()));
  } catch {
    res.status(500).json({ error: "Failed to get stories" });
  }
});

// Create story
router.post("/stories", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { contentUrl, contentType = "image", text } = req.body;

    if (!contentUrl) {
      res.status(400).json({ error: "Content URL required" });
      return;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [story] = await db
      .insert(storiesTable)
      .values({ userId, contentUrl, contentType, text, expiresAt })
      .returning();

    res.status(201).json(story);
  } catch {
    res.status(500).json({ error: "Failed to create story" });
  }
});

export default router;
