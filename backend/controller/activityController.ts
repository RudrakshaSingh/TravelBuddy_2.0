import { NextFunction, Request, Response } from "express";

import { IActivity } from "../interfaces/activityInterface";
import { Activity } from "../models/activityModel";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { activityZodSchema } from "../validation/activityValidation";

// Create Activity
export const createActivity = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const {
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            location,
            photos,
            videos,
            gender,
            price,
            foreignerPrice,
            maxCapacity,
        } = req.body;

        // Validate request body
        const validatedData = activityZodSchema.parse(req.body);

        const activity = await Activity.create({
            ...(validatedData as any),
            createdBy: userId,
            participants: [userId], // Creator is automatically a participant
        }) as unknown as IActivity;

        if (!activity) {
            throw new ApiError(500, "Failed to create activity");
        }

        // Add activity to user's joined activities
        await User.findByIdAndUpdate(userId, {
            $push: { JoinActivity: activity._id },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, activity, "Activity created successfully"));
    }
);

// Get All Activities
export const getActivities = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const activities = await Activity.find().populate("createdBy", "firstName lastName imageUrl");

        return res
            .status(200)
            .json(new ApiResponse(200, activities, "Activities fetched successfully"));
    }
);

// Get Activity by ID
export const getActivityById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const activity = await Activity.findById(id)
            .populate("createdBy", "firstName lastName imageUrl")
            .populate("participants", "firstName lastName imageUrl");

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, activity, "Activity fetched successfully"));
    }
);

// Update Activity
export const updateActivity = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = req.user._id;

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        if (activity.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to update this activity");
        }

        const updatedActivity = await Activity.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, updatedActivity, "Activity updated successfully"));
    }
);

// Delete Activity
export const deleteActivity = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = req.user._id;

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        if (activity.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to delete this activity");
        }

        await Activity.findByIdAndDelete(id);

        // Remove activity from all participants' joined activities
        await User.updateMany(
            { JoinActivity: id },
            { $pull: { JoinActivity: id } }
        );

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Activity deleted successfully"));
    }
);

// Join Activity
export const joinActivity = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = req.user._id;

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        if (activity.participants?.includes(userId)) {
            throw new ApiError(400, "You have already joined this activity");
        }

        if (activity.maxCapacity && (activity.participants?.length || 0) >= activity.maxCapacity) {
            throw new ApiError(400, "Activity is full");
        }

        activity.participants?.push(userId);
        await activity.save();

        await User.findByIdAndUpdate(userId, {
            $push: { JoinActivity: id },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Joined activity successfully"));
    }
);

// Leave Activity
export const leaveActivity = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = req.user._id;

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        if (!activity.participants?.includes(userId)) {
            throw new ApiError(400, "You are not a participant of this activity");
        }

        // Remove from activity
        activity.participants = activity.participants.filter(
            (participantId: any) => participantId.toString() !== userId.toString()
        );
        await activity.save();

        // Remove from user
        await User.findByIdAndUpdate(userId, {
            $pull: { JoinActivity: id },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Left activity successfully"));
    }
);

// Get Participants
export const getParticipants = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const activity = await Activity.findById(id).populate(
            "participants",
            "firstName lastName imageUrl nationality travelStyle"
        );

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, activity.participants, "Participants fetched successfully"));
    }
);

// Invite Users
export const inviteUsers = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { userIds } = req.body; // Array of user IDs to invite
        const userId = req.user._id;

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        if (activity.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, "Only the creator can invite users");
        }

        // Filter out users who are already participants or already invited
        const newInvites = userIds.filter((inviteUserId: string) => {
            const isParticipant = activity.participants?.some(
                (p: any) => p.toString() === inviteUserId
            );
            const isAlreadyInvited = activity.invitedUsers?.some(
                (invite: any) => invite.userId.toString() === inviteUserId
            );
            return !isParticipant && !isAlreadyInvited;
        });

        if (newInvites.length === 0) {
            return res.status(200).json(new ApiResponse(200, null, "No new users to invite"));
        }

        const inviteObjects = newInvites.map((inviteUserId: string) => ({
            userId: inviteUserId,
            status: "Pending",
        }));

        // Use $push with $each correctly for Mongoose
        await Activity.findByIdAndUpdate(id, {
            $push: { invitedUsers: { $each: inviteObjects } }
        });

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Users invited successfully"));
    }
);

// Respond to Invite
export const respondToInvite = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body; // "Accepted" or "Rejected"
        const userId = req.user._id;

        if (!["Accepted", "Rejected"].includes(status)) {
            throw new ApiError(400, "Invalid status");
        }

        const activity = await Activity.findById(id);

        if (!activity) {
            throw new ApiError(404, "Activity not found");
        }

        const invitation = activity.invitedUsers?.find(
            (invite: any) => invite.userId.toString() === userId.toString()
        );

        if (!invitation) {
            throw new ApiError(400, "No invitation found for this activity");
        }

        if (invitation.status !== "Pending") {
            throw new ApiError(400, "You have already responded to this invitation");
        }

        // Update invitation status
        // Since we are modifying a subdocument array item, we need to locate it
        // and update it. Or we can just pull and push, or map.
        // Easiest is to modify the local object and save, but Mongoose subdoc arrays can be tricky with types.
        // Let's rely on Mongoose finding strict match.

        // Actually, updating array element via findOneAndUpdate is cleaner for concurrency, but finding subdoc by id is hard if they don't have ids.
        // But here we filtered by userId.

        // Let's try modifying the found activity document and saving.
        invitation.status = status;

        if (status === "Accepted") {
            if (activity.maxCapacity && (activity.participants?.length || 0) >= activity.maxCapacity) {
                throw new ApiError(400, "Activity is full. Cannot accept invitation.");
            }
            activity.participants?.push(userId);

            // Also add to user's joined activities
            await User.findByIdAndUpdate(userId, {
                $push: { JoinActivity: id },
            });
        }

        await activity.save();

        return res
            .status(200)
            .json(new ApiResponse(200, null, `Invitation ${status.toLowerCase()} successfully`));
    }
);
