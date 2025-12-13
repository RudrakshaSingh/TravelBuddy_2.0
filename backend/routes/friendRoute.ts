import { Router } from "express";

import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controller/friendController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireProfile);

router.get("/", getFriends);
router.get("/requests", getFriendRequests);

router.post("/request/:id", sendFriendRequest);
router.post("/accept/:id", acceptFriendRequest);
router.post("/reject/:id", rejectFriendRequest);

router.delete("/remove/:id", removeFriend);

export default router;
