import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyToken } from "./lib/auth.js";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

let io: Server;

export function setupSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    try {
      const { userId } = verifyToken(token);
      socket.data.userId = userId;
      await db
        .update(usersTable)
        .set({ isOnline: true, lastSeen: new Date() })
        .where(eq(usersTable.id, userId));
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;

    socket.on("join-conversation", (conversationId: number) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId: number) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on("typing", ({ conversationId }: { conversationId: number }) => {
      socket.to(`conv:${conversationId}`).emit("user-typing", {
        userId,
        conversationId,
      });
    });

    socket.on(
      "stop-typing",
      ({ conversationId }: { conversationId: number }) => {
        socket.to(`conv:${conversationId}`).emit("user-stop-typing", {
          userId,
          conversationId,
        });
      }
    );

    socket.on("disconnect", async () => {
      try {
        await db
          .update(usersTable)
          .set({ isOnline: false, lastSeen: new Date() })
          .where(eq(usersTable.id, userId));
      } catch {
        // ignore
      }
    });
  });
}

export function getIo(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
