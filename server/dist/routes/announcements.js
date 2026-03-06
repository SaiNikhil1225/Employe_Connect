"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const announcements = await Announcement_1.default.find().sort({ createdAt: -1 });
        res.json({ success: true, data: announcements });
    }
    catch (error) {
        console.error('Failed to read announcements:', error);
        res.status(500).json({ success: false, message: 'Failed to read announcements' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to read announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to read announcement' });
    }
});
router.post('/', validation_1.announcementValidation.create, async (req, res) => {
    try {
        const announcement = new Announcement_1.default(req.body);
        await announcement.save();
        res.status(201).json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to create announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
});
router.put('/:id', validation_1.announcementValidation.update, async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to update announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to update announcement' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, message: 'Announcement deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement' });
    }
});
// Toggle like on announcement
router.post('/:id/like', async (req, res) => {
    try {
        const { userId, userName, department, role } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        // Update legacy likes field
        const likedBy = announcement.likedBy || [];
        const userIndex = likedBy.indexOf(userId);
        // Check if user already has a reaction
        const reactions = announcement.reactions || [];
        const existingReactionIndex = reactions.findIndex((r) => r.employeeId === userId && r.emoji === '❤️');
        if (userIndex > -1 || existingReactionIndex > -1) {
            // User already liked, remove like and reaction
            if (userIndex > -1) {
                likedBy.splice(userIndex, 1);
                announcement.likes = Math.max(0, (announcement.likes || 1) - 1);
            }
            if (existingReactionIndex > -1) {
                reactions.splice(existingReactionIndex, 1);
                announcement.reactionsCount = Math.max(0, (announcement.reactionsCount || 1) - 1);
            }
        }
        else {
            // Add like
            likedBy.push(userId);
            announcement.likes = (announcement.likes || 0) + 1;
            // Add detailed reaction for analytics
            const newReaction = {
                employeeId: userId,
                userName: userName || 'Unknown User',
                department: department || 'Unknown',
                role: role || 'Employee',
                emoji: '❤️',
                label: 'Like',
                timestamp: new Date(),
                device: 'desktop' // Default to desktop, can be enhanced later
            };
            reactions.push(newReaction);
            announcement.reactionsCount = (announcement.reactionsCount || 0) + 1;
            // Track first/latest reaction
            if (!announcement.firstReactedBy) {
                announcement.firstReactedBy = userName || 'Unknown User';
                announcement.firstReactedAt = new Date();
            }
            announcement.latestReactedBy = userName || 'Unknown User';
            announcement.latestReactedAt = new Date();
            // Update view engagement status
            if (announcement.viewDetails) {
                const viewIndex = announcement.viewDetails.findIndex((v) => v.employeeId === userId);
                if (viewIndex > -1) {
                    announcement.viewDetails[viewIndex].hasEngaged = true;
                }
            }
        }
        announcement.likedBy = likedBy;
        announcement.reactions = reactions;
        await announcement.save();
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to toggle like:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle like' });
    }
});
// Add comment to announcement
router.post('/:id/comment', async (req, res) => {
    try {
        const { employeeId, author, userName, department, role, text, device } = req.body;
        if (!author || !text) {
            return res.status(400).json({ success: false, message: 'Author and text are required' });
        }
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const comments = announcement.comments || [];
        const timestamp = new Date();
        // Track first comment
        if (comments.length === 0) {
            announcement.firstCommentedBy = userName || author;
            announcement.firstCommentedAt = timestamp;
        }
        const newComment = {
            id: `comment-${Date.now()}`,
            employeeId: employeeId || author,
            author: userName || author,
            userName: userName || author,
            department,
            role,
            text,
            timestamp,
            device,
            likedBy: [],
            likesCount: 0,
            replies: [],
            isEdited: false,
            editHistory: []
        };
        comments.push(newComment);
        announcement.comments = comments;
        announcement.commentsCount = comments.length;
        // Track first comment
        if (!announcement.firstCommentedBy) {
            announcement.firstCommentedBy = userName || author;
            announcement.firstCommentedAt = timestamp;
        }
        // Update view engagement status
        if (announcement.viewDetails) {
            const viewIndex = announcement.viewDetails.findIndex((v) => v.employeeId === employeeId);
            if (viewIndex > -1) {
                announcement.viewDetails[viewIndex].hasEngaged = true;
            }
        }
        await announcement.save();
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to add comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});
// Add or update reaction on announcement
router.post('/:id/reaction', async (req, res) => {
    try {
        const { employeeId, oderId, userName, department, role, location, emoji, label, device } = req.body;
        const userIdToUse = employeeId || oderId;
        if (!userIdToUse || !userName || !emoji || !label) {
            return res.status(400).json({ success: false, message: 'employeeId, userName, emoji, and label are required' });
        }
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const reactions = announcement.reactions || [];
        const existingReactionIndex = reactions.findIndex((r) => r.employeeId === userIdToUse || r.oderId === userIdToUse);
        const timestamp = new Date();
        if (existingReactionIndex >= 0) {
            // User already reacted
            if (reactions[existingReactionIndex].emoji === emoji) {
                // Same emoji - remove reaction
                reactions.splice(existingReactionIndex, 1);
                announcement.likes = Math.max(0, (announcement.likes || 1) - 1);
                // Remove from likedBy
                const likedBy = announcement.likedBy || [];
                const userIndex = likedBy.indexOf(userIdToUse);
                if (userIndex > -1) {
                    likedBy.splice(userIndex, 1);
                    announcement.likedBy = likedBy;
                }
            }
            else {
                // Different emoji - update reaction
                reactions[existingReactionIndex] = {
                    employeeId: userIdToUse,
                    userName,
                    department,
                    role,
                    location,
                    emoji,
                    label,
                    timestamp,
                    device
                };
            }
        }
        else {
            // New reaction
            reactions.push({
                employeeId: userIdToUse,
                userName,
                department,
                role,
                location,
                emoji,
                label,
                timestamp,
                device
            });
            announcement.likes = (announcement.likes || 0) + 1;
            // Track first reaction
            if (!announcement.firstReactedBy) {
                announcement.firstReactedBy = userName;
                announcement.firstReactedAt = timestamp;
            }
            // Always update latest reaction
            announcement.latestReactedBy = userName;
            announcement.latestReactedAt = timestamp;
            // Add to likedBy if not already there
            const likedBy = announcement.likedBy || [];
            if (!likedBy.includes(userIdToUse)) {
                likedBy.push(userIdToUse);
                announcement.likedBy = likedBy;
            }
        }
        announcement.reactions = reactions;
        announcement.reactionsCount = reactions.length;
        // Update view engagement status
        if (announcement.viewDetails) {
            const viewIndex = announcement.viewDetails.findIndex((v) => v.employeeId === userIdToUse);
            if (viewIndex > -1) {
                announcement.viewDetails[viewIndex].hasEngaged = true;
            }
        }
        await announcement.save();
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to add reaction:', error);
        res.status(500).json({ success: false, message: 'Failed to add reaction' });
    }
});
// Vote on poll
router.post('/:id/vote', async (req, res) => {
    try {
        const { optionIds, oderId } = req.body;
        if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Option IDs are required' });
        }
        if (!oderId) {
            return res.status(400).json({ success: false, message: 'Voter ID is required' });
        }
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        if (!announcement.isPoll || !announcement.pollOptions) {
            return res.status(400).json({ success: false, message: 'This announcement is not a poll' });
        }
        // Check if user has already voted
        const hasAlreadyVoted = announcement.pollOptions.some((option) => option.votedBy && option.votedBy.includes(oderId));
        if (hasAlreadyVoted) {
            return res.status(400).json({ success: false, message: 'User has already voted on this poll' });
        }
        // Update vote counts for selected options
        announcement.pollOptions = announcement.pollOptions.map((option) => {
            if (optionIds.includes(option.id)) {
                return {
                    ...option.toObject ? option.toObject() : option,
                    votes: (option.votes || 0) + 1,
                    votedBy: [...(option.votedBy || []), oderId]
                };
            }
            return option.toObject ? option.toObject() : option;
        });
        // Update total votes
        announcement.totalVotes = (announcement.totalVotes || 0) + 1;
        await announcement.save();
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to vote on poll:', error);
        res.status(500).json({ success: false, message: 'Failed to vote on poll' });
    }
});
// ==================== ANALYTICS ENDPOINTS ====================
// Track view (when user views an announcement)
router.post('/:id/track-view', async (req, res) => {
    try {
        const { employeeId, userName, department, role, location, device, browser, viewSource } = req.body;
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        // Check if user already viewed
        const viewDetails = announcement.viewDetails || [];
        const existingView = viewDetails.find((v) => v.employeeId === employeeId);
        if (!existingView) {
            // New view
            viewDetails.push({
                employeeId,
                userName,
                department,
                role,
                location,
                timestamp: new Date(),
                device,
                browser,
                viewSource,
                hasEngaged: false
            });
            announcement.viewDetails = viewDetails;
            announcement.viewsCount = viewDetails.length;
            announcement.views = viewDetails.length; // Legacy field
            await announcement.save();
        }
        res.json({ success: true, data: announcement });
    }
    catch (error) {
        console.error('Failed to track view:', error);
        res.status(500).json({ success: false, message: 'Failed to track view' });
    }
});
// Get overall analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const viewsCount = (announcement.viewDetails || []).length;
        const reactionsCount = (announcement.reactions || []).length;
        const commentsCount = (announcement.comments || []).length;
        const sharesCount = announcement.sharesCount || 0;
        // Calculate engagement rate
        const engagementRate = viewsCount > 0
            ? ((reactionsCount + commentsCount + sharesCount) / viewsCount * 100).toFixed(2)
            : 0;
        // Reaction breakdown
        const reactionBreakdown = {};
        (announcement.reactions || []).forEach((r) => {
            reactionBreakdown[r.label] = (reactionBreakdown[r.label] || 0) + 1;
        });
        // Department breakdown
        const departmentViewsArray = [];
        const departmentViews = {};
        (announcement.viewDetails || []).forEach((v) => {
            if (v.department) {
                departmentViews[v.department] = (departmentViews[v.department] || 0) + 1;
            }
        });
        Object.entries(departmentViews).forEach(([department, count]) => {
            departmentViewsArray.push({ department, count });
        });
        // Get unique viewers
        const uniqueViewers = new Set((announcement.viewDetails || []).map((v) => v.employeeId));
        const analytics = {
            views: {
                total: viewsCount,
                unique: uniqueViewers.size
            },
            reactions: {
                total: reactionsCount,
                breakdown: reactionBreakdown
            },
            comments: {
                total: commentsCount,
                uniqueCommenters: new Set((announcement.comments || []).map((c) => c.employeeId)).size
            },
            shares: sharesCount,
            engagementRate: parseFloat(engagementRate),
            departmentViews: departmentViewsArray,
            firstReaction: announcement.firstReactedBy ? {
                userName: announcement.firstReactedBy,
                timestamp: announcement.firstReactedAt
            } : null,
            latestReaction: announcement.latestReactedBy ? {
                userName: announcement.latestReactedBy,
                timestamp: announcement.latestReactedAt
            } : null,
            firstComment: announcement.firstCommentedBy ? {
                userName: announcement.firstCommentedBy,
                timestamp: announcement.firstCommentedAt
            } : null
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Failed to get analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});
// Get detailed reactions list (Who Reacted)
router.get('/:id/analytics/reactions', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const reactions = announcement.reactions || [];
        // Sort by timestamp (earliest first)
        const sortedReactions = reactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        res.json({
            success: true,
            data: {
                total: reactions.length,
                reactions: sortedReactions
            }
        });
    }
    catch (error) {
        console.error('Failed to get reactions:', error);
        res.status(500).json({ success: false, message: 'Failed to get reactions' });
    }
});
// Get detailed comments list
router.get('/:id/analytics/comments', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const comments = announcement.comments || [];
        // Sort by timestamp
        const sortedComments = comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Calculate stats
        const uniqueCommenters = new Set(comments.map((c) => c.employeeId)).size;
        const avgCommentsPerPerson = uniqueCommenters > 0 ? (comments.length / uniqueCommenters).toFixed(1) : 0;
        res.json({
            success: true,
            data: {
                total: comments.length,
                uniqueCommenters,
                avgCommentsPerPerson: parseFloat(avgCommentsPerPerson),
                comments: sortedComments
            }
        });
    }
    catch (error) {
        console.error('Failed to get comments:', error);
        res.status(500).json({ success: false, message: 'Failed to get comments' });
    }
});
// Get detailed views list (Who Viewed)
router.get('/:id/analytics/views', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const views = announcement.viewDetails || [];
        // Sort by timestamp
        const sortedViews = views.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Department breakdown
        const departmentBreakdown = {};
        views.forEach((v) => {
            if (v.department) {
                departmentBreakdown[v.department] = (departmentBreakdown[v.department] || 0) + 1;
            }
        });
        // Device breakdown
        const deviceBreakdown = {};
        views.forEach((v) => {
            if (v.device) {
                deviceBreakdown[v.device] = (deviceBreakdown[v.device] || 0) + 1;
            }
        });
        res.json({
            success: true,
            data: {
                total: views.length,
                views: sortedViews,
                departmentBreakdown,
                deviceBreakdown
            }
        });
    }
    catch (error) {
        console.error('Failed to get views:', error);
        res.status(500).json({ success: false, message: 'Failed to get views' });
    }
});
// Get engagement timeline
router.get('/:id/analytics/timeline', async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        const timeline = [];
        // Add views
        (announcement.viewDetails || []).forEach((v) => {
            timeline.push({
                type: 'view',
                employeeId: v.employeeId,
                userName: v.userName,
                department: v.department,
                timestamp: v.timestamp
            });
        });
        // Add reactions
        (announcement.reactions || []).forEach((r) => {
            timeline.push({
                type: 'reaction',
                employeeId: r.employeeId,
                userName: r.userName,
                department: r.department,
                emoji: r.emoji,
                label: r.label,
                timestamp: r.timestamp
            });
        });
        // Add comments
        (announcement.comments || []).forEach((c) => {
            timeline.push({
                type: 'comment',
                employeeId: c.employeeId,
                userName: c.userName,
                department: c.department,
                text: c.text,
                timestamp: c.timestamp
            });
        });
        // Sort by timestamp (newest first)
        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        res.json({
            success: true,
            data: timeline
        });
    }
    catch (error) {
        console.error('Failed to get timeline:', error);
        res.status(500).json({ success: false, message: 'Failed to get timeline' });
    }
});
exports.default = router;
//# sourceMappingURL=announcements.js.map