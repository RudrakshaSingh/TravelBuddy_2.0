import { Types } from "mongoose";

export interface IGroupMessage {

    chatGroupId: Types.ObjectId;

    senderId: Types.ObjectId;

    message: string;

    type?: "TEXT" | "IMAGE" | "SYSTEM" | "LOCATION" | "DOCUMENT" | "AUDIO";

    attachmentUrl?: string;

    createdAt?: Date;

    updatedAt?: Date
}