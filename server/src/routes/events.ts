import express, { Request, Response } from 'express';
import Event from '../models/Event';

const router = express.Router();

// Get all events
router.get('/', async (_req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ startDate: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Failed to read events:', error);
    res.status(500).json({ success: false, message: 'Failed to read events' });
  }
});

// Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to read event:', error);
    res.status(500).json({ success: false, message: 'Failed to read event' });
  }
});

// Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// ==================== RSVP & ENGAGEMENT ====================

// Submit RSVP
router.post('/:id/rsvp', async (req: Request, res: Response) => {
  try {
    const { 
      employeeId, userName, department, role, response, 
      attendanceMode, guestCount, guests, dietaryRestrictions, 
      specialRequirements, optionalNote, declineReason, device 
    } = req.body;
    
    if (!employeeId || !response) {
      return res.status(400).json({ success: false, message: 'Employee ID and response are required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const rsvps = event.rsvps || [];
    const existingRsvpIndex = rsvps.findIndex((r: any) => r.employeeId === employeeId);
    const timestamp = new Date();
    
    // Calculate view-to-RSVP time
    const viewDetail = event.viewDetails?.find((v: any) => v.employeeId === employeeId);
    const viewToRsvpTime = viewDetail 
      ? Math.floor((timestamp.getTime() - new Date(viewDetail.timestamp).getTime()) / 1000)
      : null;

    const rsvpData: any = {
      employeeId,
      userName,
      department,
      role,
      response,
      timestamp,
      viewedAt: viewDetail?.timestamp || timestamp,
      viewToRsvpTime,
      changeHistory: []
    };

    if (response === 'attending') {
      rsvpData.attendanceMode = attendanceMode || 'in-person';
      rsvpData.guestCount = guestCount || 0;
      rsvpData.guests = guests || [];
      rsvpData.dietaryRestrictions = dietaryRestrictions;
      rsvpData.specialRequirements = specialRequirements;
      rsvpData.optionalNote = optionalNote;
    } else if (response === 'declined') {
      rsvpData.declineReason = declineReason;
    } else if (response === 'maybe') {
      rsvpData.optionalNote = optionalNote;
    }

    if (existingRsvpIndex >= 0) {
      // Update existing RSVP
      const oldRsvp = rsvps[existingRsvpIndex];
      rsvpData.changeHistory = [
        ...(oldRsvp.changeHistory || []),
        {
          previousResponse: oldRsvp.response,
          newResponse: response,
          changedAt: timestamp,
          reason: declineReason || optionalNote
        }
      ];
      rsvps[existingRsvpIndex] = rsvpData;
    } else {
      // New RSVP
      rsvps.push(rsvpData);
    }

    event.rsvps = rsvps;
    
    // Update counts
    event.rsvpsCount = rsvps.length;
    event.attendingCount = rsvps.filter((r: any) => r.response === 'attending').length;
    event.declinedCount = rsvps.filter((r: any) => r.response === 'declined').length;
    event.maybeCount = rsvps.filter((r: any) => r.response === 'maybe').length;
    
    // Calculate attendance mode breakdown
    event.inPersonCount = rsvps.filter((r: any) => 
      r.response === 'attending' && r.attendanceMode === 'in-person'
    ).length;
    event.virtualCount = rsvps.filter((r: any) => 
      r.response === 'attending' && r.attendanceMode === 'virtual'
    ).length;
    
    // Track first RSVP
    if (!event.firstRsvpBy) {
      event.firstRsvpBy = userName;
      event.firstRsvpAt = timestamp;
    }
    
    // Always update latest RSVP
    event.latestRsvpBy = userName;
    event.latestRsvpAt = timestamp;
    
    // Calculate RSVP rate
    event.rsvpRate = event.viewsCount > 0 
      ? (event.rsvpsCount / event.viewsCount * 100)
      : 0;
    
    // Calculate attendance projection
    event.attendanceProjection = event.attendingCount + event.maybeCount;
    
    // Update view details
    if (event.viewDetails) {
      const viewIndex = event.viewDetails.findIndex((v: any) => v.employeeId === employeeId);
      if (viewIndex > -1) {
        event.viewDetails[viewIndex].hasResponded = true;
      }
    }
    
    // Update dietary summary
    if (response === 'attending' && dietaryRestrictions) {
      const dietary = event.dietarySummary || { vegetarian: 0, vegan: 0, glutenFree: 0, other: 0 };
      const lower = dietaryRestrictions.toLowerCase();
      if (lower.includes('vegetarian')) dietary.vegetarian++;
      else if (lower.includes('vegan')) dietary.vegan++;
      else if (lower.includes('gluten')) dietary.glutenFree++;
      else dietary.other++;
      event.dietarySummary = dietary;
    }
    
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to submit RSVP:', error);
    res.status(500).json({ success: false, message: 'Failed to submit RSVP' });
  }
});

// Check-in attendee (on event day)
router.post('/:id/checkin', async (req: Request, res: Response) => {
  try {
    const { employeeId, attendanceMode } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const rsvps = event.rsvps || [];
    const rsvpIndex = rsvps.findIndex((r: any) => r.employeeId === employeeId);
    
    if (rsvpIndex < 0) {
      // Walk-in (no RSVP)
      event.walkInsCount = (event.walkInsCount || 0) + 1;
    } else {
      // Update actual attendance
      const eventStartTime = new Date(`${event.startDate} ${event.startTime}`);
      const checkInTime = new Date();
      const diffMinutes = Math.floor((checkInTime.getTime() - eventStartTime.getTime()) / (1000 * 60));
      
      rsvps[rsvpIndex].actualAttendance = {
        attended: true,
        checkInTime,
        attendanceMode: attendanceMode || rsvps[rsvpIndex].attendanceMode,
        isLate: diffMinutes > 0,
        lateByMinutes: diffMinutes > 0 ? diffMinutes : 0,
        leftEarly: false
      };
      
      event.rsvps = rsvps;
    }
    
    event.actualAttendeesCount = (event.actualAttendeesCount || 0) + 1;
    
    // Calculate no-show rate
    const attendedCount = rsvps.filter((r: any) => r.actualAttendance?.attended).length;
    event.noShowsCount = event.attendingCount - attendedCount;
    event.noShowRate = event.attendingCount > 0 
      ? (event.noShowsCount / event.attendingCount * 100)
      : 0;
    
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to check in:', error);
    res.status(500).json({ success: false, message: 'Failed to check in' });
  }
});

// Track view
router.post('/:id/track-view', async (req: Request, res: Response) => {
  try {
    const { employeeId, userName, department, role, device } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const viewDetails = event.viewDetails || [];
    const existingView = viewDetails.find((v: any) => v.employeeId === employeeId);
    
    if (!existingView) {
      viewDetails.push({
        employeeId,
        userName,
        department,
        role,
        timestamp: new Date(),
        hasResponded: false,
        device
      });
      
      event.viewDetails = viewDetails;
      event.viewsCount = viewDetails.length;
      await event.save();
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to track view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view' });
  }
});

// Add comment
router.post('/:id/comment', async (req: Request, res: Response) => {
  try {
    const { employeeId, userName, department, text } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const comments = event.comments || [];
    comments.push({
      id: `comment-${Date.now()}`,
      employeeId,
      userName,
      department,
      text,
      timestamp: new Date(),
      likedBy: [],
      likesCount: 0
    });

    event.comments = comments;
    event.commentsCount = comments.length;
    
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get overall analytics
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // RSVP breakdown
    const rsvpBreakdown = {
      total: event.rsvpsCount,
      attending: event.attendingCount,
      declined: event.declinedCount,
      maybe: event.maybeCount,
      noResponse: event.viewsCount - event.rsvpsCount
    };

    // Attendance mode breakdown
    const attendanceModeBreakdown = {
      inPerson: event.inPersonCount,
      virtual: event.virtualCount
    };

    // Department breakdown
    const departmentRsvps: any = {};
    (event.rsvps || []).forEach((rsvp: any) => {
      if (rsvp.department) {
        if (!departmentRsvps[rsvp.department]) {
          departmentRsvps[rsvp.department] = {
            attending: 0,
            declined: 0,
            maybe: 0
          };
        }
        departmentRsvps[rsvp.department][rsvp.response]++;
      }
    });

    const analytics = {
      overview: {
        views: event.viewsCount,
        rsvps: event.rsvpsCount,
        comments: event.commentsCount,
        rsvpRate: event.rsvpRate,
        attendanceProjection: event.attendanceProjection
      },
      rsvpBreakdown,
      attendanceModeBreakdown,
      departmentRsvps,
      dietarySummary: event.dietarySummary,
      actualAttendance: {
        attended: event.actualAttendeesCount,
        walkIns: event.walkInsCount,
        noShows: event.noShowsCount,
        noShowRate: event.noShowRate
      },
      firstRsvp: event.firstRsvpBy ? {
        by: event.firstRsvpBy,
        at: event.firstRsvpAt
      } : null,
      latestRsvp: event.latestRsvpBy ? {
        by: event.latestRsvpBy,
        at: event.latestRsvpAt
      } : null
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
});

// Get RSVP list
router.get('/:id/analytics/rsvps', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const rsvps = event.rsvps || [];
    
    // Sort by timestamp
    const sortedRsvps = rsvps.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Separate by response type
    const attending = sortedRsvps.filter((r: any) => r.response === 'attending');
    const declined = sortedRsvps.filter((r: any) => r.response === 'declined');
    const maybe = sortedRsvps.filter((r: any) => r.response === 'maybe');

    res.json({ 
      success: true, 
      data: {
        total: rsvps.length,
        attending,
        declined,
        maybe,
        allRsvps: sortedRsvps
      }
    });
  } catch (error) {
    console.error('Failed to get RSVPs:', error);
    res.status(500).json({ success: false, message: 'Failed to get RSVPs' });
  }
});

// Get who viewed
router.get('/:id/analytics/views', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const views = event.viewDetails || [];
    
    const viewedAndResponded = views.filter((v: any) => v.hasResponded);
    const viewedButNotResponded = views.filter((v: any) => !v.hasResponded);

    res.json({
      success: true,
      data: {
        total: views.length,
        viewedAndResponded: viewedAndResponded.length,
        viewedButNotResponded: viewedButNotResponded.length,
        views: views.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      }
    });
  } catch (error) {
    console.error('Failed to get views:', error);
    res.status(500).json({ success: false, message: 'Failed to get views' });
  }
});

// Get RSVP timeline
router.get('/:id/analytics/timeline', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const timeline: any[] = [];

    // Add RSVPs
    (event.rsvps || []).forEach((rsvp: any) => {
      timeline.push({
        type: 'rsvp',
        employeeId: rsvp.employeeId,
        userName: rsvp.userName,
        department: rsvp.department,
        response: rsvp.response,
        attendanceMode: rsvp.attendanceMode,
        timestamp: rsvp.timestamp
      });
    });

    // Add comments
    (event.comments || []).forEach((comment: any) => {
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
  } catch (error) {
    console.error('Failed to get timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to get timeline' });
  }
});

export default router;
