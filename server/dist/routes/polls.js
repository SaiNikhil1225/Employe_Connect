"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Poll_1 = __importDefault(require("../models/Poll"));
const router = express_1.default.Router();
// Get all polls
router.get('/', async (_req, res) => {
    try {
        const polls = await Poll_1.default.find().sort({ createdAt: -1 });
        res.json({ success: true, data: polls });
    }
    catch (error) {
        console.error('Failed to read polls:', error);
        res.status(500).json({ success: false, message: 'Failed to read polls' });
    }
});
// Get poll by ID
router.get('/:id', async (req, res) => {
    try {
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        res.json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to read poll:', error);
        res.status(500).json({ success: false, message: 'Failed to read poll' });
    }
});
// Create new poll
router.post('/', async (req, res) => {
    try {
        const poll = new Poll_1.default(req.body);
        await poll.save();
        res.status(201).json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to create poll:', error);
        res.status(500).json({ success: false, message: 'Failed to create poll' });
    }
});
// Update poll
router.put('/:id', async (req, res) => {
    try {
        const poll = await Poll_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        res.json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to update poll:', error);
        res.status(500).json({ success: false, message: 'Failed to update poll' });
    }
});
// Delete poll
router.delete('/:id', async (req, res) => {
    try {
        const poll = await Poll_1.default.findByIdAndDelete(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        res.json({ success: true, message: 'Poll deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete poll:', error);
        res.status(500).json({ success: false, message: 'Failed to delete poll' });
    }
});
// ==================== VOTE & ENGAGEMENT ====================
// Submit vote
router.post('/:id/vote', async (req, res) => {
    try {
        const { employeeId, userName, department, role, location, optionIds, device, comment } = req.body;
        if (!employeeId || !optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Employee ID and option IDs are required' });
        }
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        // Check if user already voted
        const hasVoted = poll.options.some((option) => option.voters.some((v) => v.employeeId === employeeId));
        if (hasVoted && !poll.allowVoteChange) {
            return res.status(400).json({ success: false, message: 'You have already voted on this poll' });
        }
        const timestamp = new Date();
        // Calculate view-to-vote time
        const viewDetail = poll.viewDetails?.find((v) => v.employeeId === employeeId);
        const viewToVoteTime = viewDetail
            ? Math.floor((timestamp.getTime() - new Date(viewDetail.timestamp).getTime()) / 1000)
            : null;
        const voteData = {
            employeeId,
            userName,
            department,
            role,
            location,
            timestamp,
            device,
            optionalComment: comment,
            viewToVoteTime
        };
        if (hasVoted && poll.allowVoteChange) {
            // Remove previous votes
            poll.options = poll.options.map((option) => ({
                ...option.toObject(),
                voters: option.voters.filter((v) => v.employeeId !== employeeId),
                votes: option.votes - (option.voters.some((v) => v.employeeId === employeeId) ? 1 : 0)
            }));
        }
        // Add new votes
        poll.options = poll.options.map((option) => {
            if (optionIds.includes(option.id)) {
                return {
                    ...option.toObject(),
                    voters: [...option.voters, voteData],
                    votes: option.votes + 1
                };
            }
            return option.toObject();
        });
        // Update total votes and calculate percentages
        if (!hasVoted) {
            poll.totalVotes = (poll.totalVotes || 0) + 1;
        }
        // Recalculate percentages
        poll.options = poll.options.map((option) => ({
            ...option,
            percentage: poll.totalVotes > 0 ? (option.votes / poll.totalVotes * 100) : 0
        }));
        // Track first vote
        if (!poll.firstVotedBy) {
            poll.firstVotedBy = userName;
            poll.firstVotedAt = timestamp;
        }
        // Always update latest vote
        poll.latestVotedBy = userName;
        poll.latestVotedAt = timestamp;
        // Update view details
        if (poll.viewDetails) {
            const viewIndex = poll.viewDetails.findIndex((v) => v.employeeId === employeeId);
            if (viewIndex > -1) {
                poll.viewDetails[viewIndex].hasVoted = true;
            }
        }
        // Calculate participation rate
        poll.participationRate = poll.viewsCount > 0
            ? (poll.totalVotes / poll.viewsCount * 100)
            : 0;
        await poll.save();
        res.json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to submit vote:', error);
        res.status(500).json({ success: false, message: 'Failed to submit vote' });
    }
});
// Track view
router.post('/:id/track-view', async (req, res) => {
    try {
        const { employeeId, userName, department, role, location, device } = req.body;
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        const viewDetails = poll.viewDetails || [];
        const existingView = viewDetails.find((v) => v.employeeId === employeeId);
        if (!existingView) {
            viewDetails.push({
                employeeId,
                userName,
                department,
                role,
                location,
                timestamp: new Date(),
                hasVoted: false,
                device
            });
            poll.viewDetails = viewDetails;
            poll.viewsCount = viewDetails.length;
            await poll.save();
        }
        res.json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to track view:', error);
        res.status(500).json({ success: false, message: 'Failed to track view' });
    }
});
// Add comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { employeeId, userName, department, role, text } = req.body;
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        const comments = poll.comments || [];
        comments.push({
            id: `comment-${Date.now()}`,
            employeeId,
            userName,
            department,
            role,
            text,
            timestamp: new Date(),
            likedBy: [],
            likesCount: 0
        });
        poll.comments = comments;
        poll.commentsCount = comments.length;
        // Calculate vote-to-comment rate
        poll.voteToCommentRate = poll.totalVotes > 0
            ? (poll.commentsCount / poll.totalVotes * 100)
            : 0;
        await poll.save();
        res.json({ success: true, data: poll });
    }
    catch (error) {
        console.error('Failed to add comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});
// ==================== ANALYTICS ENDPOINTS ====================
// Get overall analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        // Vote distribution
        const voteDistribution = poll.options.map((option) => ({
            id: option.id,
            text: option.text,
            votes: option.votes,
            percentage: option.percentage
        }));
        // Department breakdown
        const departmentVotes = {};
        poll.options.forEach((option) => {
            option.voters.forEach((voter) => {
                if (!departmentVotes[voter.department]) {
                    departmentVotes[voter.department] = {};
                }
                departmentVotes[voter.department][option.text] =
                    (departmentVotes[voter.department][option.text] || 0) + 1;
            });
        });
        const analytics = {
            overview: {
                views: poll.viewsCount,
                votes: poll.totalVotes,
                comments: poll.commentsCount,
                participationRate: poll.participationRate,
                viewToVoteConversion: poll.viewToVoteConversion
            },
            voteDistribution,
            departmentVotes,
            firstVote: poll.firstVotedBy ? {
                by: poll.firstVotedBy,
                at: poll.firstVotedAt
            } : null,
            latestVote: poll.latestVotedBy ? {
                by: poll.latestVotedBy,
                at: poll.latestVotedAt
            } : null
        };
        res.json({ success: true, data: analytics });
    }
    catch (error) {
        console.error('Failed to get analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});
// Get who voted (detailed voter list)
router.get('/:id/analytics/voters', async (req, res) => {
    try {
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        const allVoters = [];
        poll.options.forEach((option) => {
            option.voters.forEach((voter) => {
                const existingVoter = allVoters.find(v => v.employeeId === voter.employeeId);
                if (!existingVoter) {
                    allVoters.push({
                        ...voter,
                        selectedOptions: [option.text]
                    });
                }
                else {
                    existingVoter.selectedOptions.push(option.text);
                }
            });
        });
        // Sort by timestamp (earliest first)
        allVoters.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        res.json({
            success: true,
            data: {
                total: allVoters.length,
                voters: allVoters
            }
        });
    }
    catch (error) {
        console.error('Failed to get voters:', error);
        res.status(500).json({ success: false, message: 'Failed to get voters' });
    }
});
// Get who viewed (detailed view list)
router.get('/:id/analytics/views', async (req, res) => {
    try {
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        const views = poll.viewDetails || [];
        // Separate into voted and not voted
        const viewedAndVoted = views.filter((v) => v.hasVoted);
        const viewedButNotVoted = views.filter((v) => !v.hasVoted);
        res.json({
            success: true,
            data: {
                total: views.length,
                viewedAndVoted: viewedAndVoted.length,
                viewedButNotVoted: viewedButNotVoted.length,
                views: views.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            }
        });
    }
    catch (error) {
        console.error('Failed to get views:', error);
        res.status(500).json({ success: false, message: 'Failed to get views' });
    }
});
// Get voting timeline
router.get('/:id/analytics/timeline', async (req, res) => {
    try {
        const poll = await Poll_1.default.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }
        const timeline = [];
        // Add all votes
        poll.options.forEach((option) => {
            option.voters.forEach((voter) => {
                timeline.push({
                    type: 'vote',
                    employeeId: voter.employeeId,
                    userName: voter.userName,
                    department: voter.department,
                    option: option.text,
                    timestamp: voter.timestamp
                });
            });
        });
        // Add comments
        (poll.comments || []).forEach((comment) => {
            timeline.push({
                type: 'comment',
                employeeId: comment.employeeId,
                userName: comment.userName,
                department: comment.department,
                text: comment.text,
                timestamp: comment.timestamp
            });
        });
        // Sort by timestamp (newest first)
        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        res.json({ success: true, data: timeline });
    }
    catch (error) {
        console.error('Failed to get timeline:', error);
        res.status(500).json({ success: false, message: 'Failed to get timeline' });
    }
});
exports.default = router;
//# sourceMappingURL=polls.js.map