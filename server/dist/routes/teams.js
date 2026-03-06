"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Group_1 = __importDefault(require("../models/Group"));
const GroupMember_1 = __importDefault(require("../models/GroupMember"));
const Employee_1 = __importDefault(require("../models/Employee"));
const router = express_1.default.Router();
// ============================================================================
// GROUPS MANAGEMENT
// ============================================================================
// Get all groups with filters and pagination
router.get('/groups', async (req, res) => {
    try {
        const { status, groupType, department, location, search, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '25', } = req.query;
        // Build filter query
        const filter = {};
        if (status) {
            const statuses = status.split(',');
            filter.status = { $in: statuses };
        }
        if (groupType) {
            const types = groupType.split(',');
            filter.groupType = { $in: types };
        }
        if (department) {
            const departments = department.split(',');
            filter.department = { $in: departments };
        }
        if (location) {
            const locations = location.split(',');
            filter.location = { $in: locations };
        }
        if (search) {
            filter.$or = [
                { groupName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { groupId: { $regex: search, $options: 'i' } },
            ];
        }
        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Execute query
        const groups = await Group_1.default.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();
        // Get member counts for each group
        const groupsWithCounts = await Promise.all(groups.map(async (group) => {
            const memberCount = await GroupMember_1.default.countDocuments({
                groupId: group.groupId,
                status: 'active',
            });
            // Get group lead details if exists
            let groupLead = null;
            if (group.groupLeadId) {
                groupLead = await Employee_1.default.findOne({ employeeId: group.groupLeadId })
                    .select('employeeId name email designation')
                    .lean();
            }
            return {
                ...group,
                memberCount,
                groupLead,
            };
        }));
        const total = await Group_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: groupsWithCounts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch groups',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get single group by ID
router.get('/groups/:id', async (req, res) => {
    try {
        const group = await Group_1.default.findOne({ groupId: req.params.id }).lean();
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }
        // Get member count
        const memberCount = await GroupMember_1.default.countDocuments({
            groupId: group.groupId,
            status: 'active',
        });
        // Get group lead details
        let groupLead = null;
        if (group.groupLeadId) {
            groupLead = await Employee_1.default.findOne({ employeeId: group.groupLeadId })
                .select('employeeId name email designation')
                .lean();
        }
        res.json({
            success: true,
            data: {
                ...group,
                memberCount,
                groupLead,
            },
        });
    }
    catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Create new group
router.post('/groups', async (req, res) => {
    try {
        const { groupName, description, groupType, category, parentGroupId, groupLeadId, department, location, maxMembers, status, visibility, autoAssignNewHires, groupEmail, slackChannel, teamsChannel, createdBy, } = req.body;
        // Validate required fields
        if (!groupName || !description || !createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Group name, description, and createdBy are required',
            });
        }
        // Check if group name already exists (case-insensitive)
        const existingGroup = await Group_1.default.findOne({
            groupName: { $regex: new RegExp(`^${groupName}$`, 'i') },
        });
        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: 'A group with this name already exists',
            });
        }
        // Validate group lead if provided
        if (groupLeadId) {
            const employee = await Employee_1.default.findOne({ employeeId: groupLeadId });
            if (!employee) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid group lead employee ID',
                });
            }
        }
        // Create new group
        const newGroup = new Group_1.default({
            groupName,
            description,
            groupType: groupType || 'custom',
            category,
            parentGroupId,
            groupLeadId,
            department,
            location,
            maxMembers,
            status: status || 'active',
            visibility: visibility || 'public',
            autoAssignNewHires: autoAssignNewHires || false,
            groupEmail,
            slackChannel,
            teamsChannel,
            createdBy,
        });
        await newGroup.save();
        // If group lead is specified, add them as a member with lead role
        if (groupLeadId) {
            const leadMember = new GroupMember_1.default({
                groupId: newGroup.groupId,
                userId: groupLeadId, // Assuming employeeId can be used as userId
                employeeId: groupLeadId,
                roleInGroup: 'lead',
                assignmentType: 'permanent',
                isPrimary: true,
                assignedBy: createdBy,
                status: 'active',
            });
            await leadMember.save();
        }
        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: newGroup,
        });
    }
    catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create group',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Update group
router.put('/groups/:id', async (req, res) => {
    try {
        const { groupName, description, groupType, category, parentGroupId, groupLeadId, department, location, maxMembers, status, visibility, autoAssignNewHires, groupEmail, slackChannel, teamsChannel, updatedBy, } = req.body;
        const group = await Group_1.default.findOne({ groupId: req.params.id });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }
        // Check if new group name already exists (excluding current group)
        if (groupName && groupName !== group.groupName) {
            const existingGroup = await Group_1.default.findOne({
                groupName: { $regex: new RegExp(`^${groupName}$`, 'i') },
                groupId: { $ne: req.params.id },
            });
            if (existingGroup) {
                return res.status(400).json({
                    success: false,
                    message: 'A group with this name already exists',
                });
            }
        }
        // Update fields
        if (groupName)
            group.groupName = groupName;
        if (description)
            group.description = description;
        if (groupType)
            group.groupType = groupType;
        if (category !== undefined)
            group.category = category;
        if (parentGroupId !== undefined)
            group.parentGroupId = parentGroupId;
        if (groupLeadId !== undefined)
            group.groupLeadId = groupLeadId;
        if (department !== undefined)
            group.department = department;
        if (location !== undefined)
            group.location = location;
        if (maxMembers !== undefined)
            group.maxMembers = maxMembers;
        if (status)
            group.status = status;
        if (visibility)
            group.visibility = visibility;
        if (autoAssignNewHires !== undefined)
            group.autoAssignNewHires = autoAssignNewHires;
        if (groupEmail !== undefined)
            group.groupEmail = groupEmail;
        if (slackChannel !== undefined)
            group.slackChannel = slackChannel;
        if (teamsChannel !== undefined)
            group.teamsChannel = teamsChannel;
        if (updatedBy)
            group.updatedBy = updatedBy;
        await group.save();
        res.json({
            success: true,
            message: 'Group updated successfully',
            data: group,
        });
    }
    catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Delete group
router.delete('/groups/:id', async (req, res) => {
    try {
        const group = await Group_1.default.findOne({ groupId: req.params.id });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }
        // Check if group has active members
        const memberCount = await GroupMember_1.default.countDocuments({
            groupId: req.params.id,
            status: 'active',
        });
        if (memberCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete group with ${memberCount} active members. Please remove members first.`,
            });
        }
        // Delete group and all member associations
        await Group_1.default.deleteOne({ groupId: req.params.id });
        await GroupMember_1.default.deleteMany({ groupId: req.params.id });
        res.json({
            success: true,
            message: 'Group deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete group',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get group members
router.get('/groups/:id/members', async (req, res) => {
    try {
        const members = await GroupMember_1.default.find({
            groupId: req.params.id,
            status: 'active',
        }).lean();
        // Get employee details for each member
        const membersWithDetails = await Promise.all(members.map(async (member) => {
            const employee = await Employee_1.default.findOne({ employeeId: member.employeeId })
                .select('employeeId name email department designation location profilePhoto')
                .lean();
            return {
                ...member,
                employee,
            };
        }));
        res.json({
            success: true,
            data: membersWithDetails,
        });
    }
    catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group members',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalGroups = await Group_1.default.countDocuments({ status: 'active' });
        const totalMembers = await GroupMember_1.default.countDocuments({ status: 'active' });
        // Get distinct user IDs in groups
        const assignedUsers = await GroupMember_1.default.distinct('employeeId', { status: 'active' });
        const totalEmployees = await Employee_1.default.countDocuments({ status: 'active' });
        const unassignedUsers = totalEmployees - assignedUsers.length;
        // Calculate average group size
        const avgGroupSize = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;
        res.json({
            success: true,
            data: {
                totalGroups,
                totalMembers,
                unassignedUsers,
                avgGroupSize,
            },
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// ============================================================================
// GROUP MEMBERS MANAGEMENT
// ============================================================================
// Get all members with filters
router.get('/members', async (req, res) => {
    try {
        const { groupId, department, location, status, roleInGroup, search, page = '1', limit = '25', } = req.query;
        // Build filter for employees first
        const employeeFilter = {};
        if (department)
            employeeFilter.department = { $in: department.split(',') };
        if (location)
            employeeFilter.location = { $in: location.split(',') };
        if (search) {
            employeeFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const employees = await Employee_1.default.find(employeeFilter).select('employeeId name email department location designation profilePhoto').lean();
        const employeeIds = employees.map(e => e.employeeId);
        // Build filter for group members
        const memberFilter = { employeeId: { $in: employeeIds } };
        if (groupId)
            memberFilter.groupId = groupId;
        if (status)
            memberFilter.status = status;
        if (roleInGroup)
            memberFilter.roleInGroup = { $in: roleInGroup.split(',') };
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const members = await GroupMember_1.default.find(memberFilter)
            .sort({ assignedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
        // Get full details with groups
        const membersWithDetails = await Promise.all(members.map(async (member) => {
            const employee = employees.find(e => e.employeeId === member.employeeId);
            const group = await Group_1.default.findOne({ groupId: member.groupId }).select('groupId groupName groupType').lean();
            // Get all groups for this employee
            const allGroups = await GroupMember_1.default.find({
                employeeId: member.employeeId,
                status: 'active',
            }).lean();
            const groupDetails = await Promise.all(allGroups.map(async (g) => {
                const groupData = await Group_1.default.findOne({ groupId: g.groupId }).select('groupId groupName groupType').lean();
                return {
                    ...groupData,
                    roleInGroup: g.roleInGroup,
                };
            }));
            return {
                ...member,
                employee,
                group,
                allGroups: groupDetails,
            };
        }));
        const total = await GroupMember_1.default.countDocuments(memberFilter);
        res.json({
            success: true,
            data: membersWithDetails,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch members',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Add member to group
router.post('/groups/:groupId/members', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { employeeId, roleInGroup, assignmentType, effectiveFrom, effectiveTo, isPrimary, assignedBy, notes, } = req.body;
        // Validate group exists
        const group = await Group_1.default.findOne({ groupId });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }
        // Validate employee exists
        const employee = await Employee_1.default.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }
        // Check if already assigned
        const existing = await GroupMember_1.default.findOne({
            groupId,
            employeeId,
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Employee is already a member of this group',
            });
        }
        // Check max members limit
        if (group.maxMembers) {
            const currentCount = await GroupMember_1.default.countDocuments({
                groupId,
                status: 'active',
            });
            if (currentCount >= group.maxMembers) {
                return res.status(400).json({
                    success: false,
                    message: `Group has reached maximum member limit of ${group.maxMembers}`,
                });
            }
        }
        // Create new member assignment
        const newMember = new GroupMember_1.default({
            groupId,
            userId: employeeId,
            employeeId,
            roleInGroup: roleInGroup || 'member',
            assignmentType: assignmentType || 'permanent',
            effectiveFrom: effectiveFrom || new Date(),
            effectiveTo,
            isPrimary: isPrimary || false,
            assignedBy,
            notes,
            status: 'active',
        });
        await newMember.save();
        res.status(201).json({
            success: true,
            message: 'Member added to group successfully',
            data: newMember,
        });
    }
    catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add member',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Remove member from group
router.delete('/groups/:groupId/members/:employeeId', async (req, res) => {
    try {
        const { groupId, employeeId } = req.params;
        const member = await GroupMember_1.default.findOneAndDelete({
            groupId,
            employeeId,
        });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in this group',
            });
        }
        res.json({
            success: true,
            message: 'Member removed from group successfully',
        });
    }
    catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove member',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Update member assignment
router.put('/members/:id', async (req, res) => {
    try {
        const member = await GroupMember_1.default.findById(req.params.id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member assignment not found',
            });
        }
        const { roleInGroup, assignmentType, effectiveFrom, effectiveTo, isPrimary, notes, status, } = req.body;
        if (roleInGroup)
            member.roleInGroup = roleInGroup;
        if (assignmentType)
            member.assignmentType = assignmentType;
        if (effectiveFrom)
            member.effectiveFrom = effectiveFrom;
        if (effectiveTo !== undefined)
            member.effectiveTo = effectiveTo;
        if (isPrimary !== undefined)
            member.isPrimary = isPrimary;
        if (notes !== undefined)
            member.notes = notes;
        if (status)
            member.status = status;
        await member.save();
        res.json({
            success: true,
            message: 'Member assignment updated successfully',
            data: member,
        });
    }
    catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get unassigned users
router.get('/users/unassigned', async (req, res) => {
    try {
        const assignedEmployeeIds = await GroupMember_1.default.distinct('employeeId', { status: 'active' });
        const unassignedUsers = await Employee_1.default.find({
            employeeId: { $nin: assignedEmployeeIds },
            status: 'active',
        }).select('employeeId name email department location designation').lean();
        res.json({
            success: true,
            data: unassignedUsers,
        });
    }
    catch (error) {
        console.error('Error fetching unassigned users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unassigned users',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=teams.js.map