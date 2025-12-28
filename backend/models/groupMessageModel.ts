import mongoose, { Schema } from "mongoose";

import { IGroupMessage } from "../interfaces/groupMessageInterface";

const groupMessageSchema = new Schema<IGroupMessage>(
  {
    chatGroupId: {
      type: Schema.Types.ObjectId,
      ref: "ChatGroup",
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: false,
      trim: true,
    },

    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "SYSTEM", "LOCATION", "DOCUMENT", "AUDIO"],
      default: "TEXT",
    },

    attachmentUrl: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

// Indexes for efficient group chat queries
groupMessageSchema.index({ chatGroupId: 1, createdAt: -1 });
groupMessageSchema.index({ senderId: 1 });

export const GroupMessage = mongoose.model<IGroupMessage>(
  "GroupMessage",
  groupMessageSchema
);
