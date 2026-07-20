import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import conversationsRouter from "./conversations.js";
import channelsRouter from "./channels.js";
import feedRouter from "./feed.js";
import storiesRouter from "./stories.js";
import uploadRouter from "./upload.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(conversationsRouter);
router.use(channelsRouter);
router.use(feedRouter);
router.use(storiesRouter);
router.use(uploadRouter);

export default router;
