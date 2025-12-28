import { Router } from "express";

import {
  getGroupChatByActivity,
  getGroupChatMessages,
  sendGroupChatMessage,
} from "../controller/groupChatController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// all group chat routes require auth
router.use(requireProfile);

// fetch group chat by activity
router.get("/activity/:activityId", getGroupChatByActivity);

// messages
router.post("/:chatId/messages", upload.single("attachment"), sendGroupChatMessage);
router.get("/:chatId/messages", getGroupChatMessages);


export default router;
