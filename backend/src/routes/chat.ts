import { Router } from "express";
import * as controller from "../controllers/chat";
import { getUser } from "../middlewares/user.middleware";
import { use } from "../utils/use";

const router = Router();

router.get("/:chatID", getUser, use(controller.getChatMessages));

router.get("/messages/unread", getUser, use(controller.getUnreadMessages));

router.patch("/messages/read", getUser, use(controller.markAsRead));

export default router;
