import { Router } from "express";
import { db } from "@workspace/db";
import { videosTable, videoLikesTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getRouteParamInt } from "../lib/params.js";

const router = Router();

// Get videos
router.get("/feed/videos", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const page = parseInt((req.query.page as string) || "0");
    const limit = 10;
    const offset = page * limit;

    const videos = await db
      .select({
        id: videosTable.id,
        userId: videosTable.userId,
        userName: usersTable.displayName,
        userAvatar: usersTable.avatarUrl,
        title: videosTable.title,
        description: videosTable.description,
        videoUrl: videosTable.videoUrl,
        thumbnailUrl: videosTable.thumbnailUrl,
        duration: videosTable.duration,
        likesCount: videosTable.likesCount,
        viewsCount: videosTable.viewsCount,
        commentsCount: videosTable.commentsCount,
        createdAt: videosTable.createdAt,
      })
      .from(videosTable)
      .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
      .orderBy(desc(videosTable.createdAt))
      .limit(limit)
      .offset(offset);

    const withLikes = await Promise.all(
      videos.map(async (v) => {
        const [liked] = await db
          .select({ id: videoLikesTable.id })
          .from(videoLikesTable)
          .where(
            and(
              eq(videoLikesTable.videoId, v.id),
              eq(videoLikesTable.userId, userId)
            )
          );
        return { ...v, isLiked: !!liked };
      })
    );

    res.json(withLikes);
  } catch {
    res.status(500).json({ error: "Failed to get videos" });
  }
});

// Upload/create video
router.post("/feed/videos", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body;

    if (!videoUrl) {
      res.status(400).json({ error: "Video URL required" });
      return;
    }

    const [video] = await db
      .insert(videosTable)
      .values({
        userId,
        title: title || null,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration || null,
      })
      .returning();

    const [user] = await db
      .select({ displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.status(201).json({
      ...video,
      userName: user.displayName,
      userAvatar: user.avatarUrl,
      isLiked: false,
    });
  } catch {
    res.status(500).json({ error: "Failed to create video" });
  }
});

// Like video
router.post("/feed/videos/:id/like", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const videoId = getRouteParamInt(req, "id");

    await db
      .insert(videoLikesTable)
      .values({ videoId, userId })
      .onConflictDoNothing();

    await db
      .update(videosTable)
      .set({ likesCount: sql`${videosTable.likesCount} + 1` })
      .where(eq(videosTable.id, videoId));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to like video" });
  }
});

// Unlike video
router.delete("/feed/videos/:id/like", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const videoId = getRouteParamInt(req, "id");

    await db
      .delete(videoLikesTable)
      .where(
        and(
          eq(videoLikesTable.videoId, videoId),
          eq(videoLikesTable.userId, userId)
        )
      );

    await db
      .update(videosTable)
      .set({ likesCount: sql`GREATEST(${videosTable.likesCount} - 1, 0)` })
      .where(eq(videosTable.id, videoId));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to unlike video" });
  }
});

export default router;
