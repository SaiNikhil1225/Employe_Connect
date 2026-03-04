import express, { Request, Response } from 'express';
import Survey from '../models/Survey';

const router = express.Router();

// Get all surveys
router.get('/', async (_req: Request, res: Response) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.json({ success: true, data: surveys });
  } catch (error) {
    console.error('Failed to read surveys:', error);
    res.status(500).json({ success: false, message: 'Failed to read surveys' });
  }
});

// Get survey by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Failed to read survey:', error);
    res.status(500).json({ success: false, message: 'Failed to read survey' });
  }
});

// Create new survey
router.post('/', async (req: Request, res: Response) => {
  try {
    const survey = new Survey(req.body);
    await survey.save();
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    console.error('Failed to create survey:', error);
    res.status(500).json({ success: false, message: 'Failed to create survey' });
  }
});

// Update survey
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Failed to update survey:', error);
    res.status(500).json({ success: false, message: 'Failed to update survey' });
  }
});

// Delete survey
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.json({ success: true, message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Failed to delete survey:', error);
    res.status(500).json({ success: false, message: 'Failed to delete survey' });
  }
});

// ==================== RESPONSE & ENGAGEMENT ====================

// Start survey response
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { employeeId, userName, department, role, location, device, browser, isAnonymous } = req.body;
    
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Check if user already started
    const responses = survey.responses || [];
    const existingResponse = responses.find((r: any) => r.employeeId === employeeId);
    
    if (existingResponse && existingResponse.status === 'completed') {
      return res.status(400).json({ success: false, message: 'You have already completed this survey' });
    }

    const responseId = `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    if (existingResponse) {
      // Resume existing response
      return res.json({ success: true, data: survey, responseId: existingResponse.responseId });
    }

    // New response
    const newResponse = {
      responseId,
      employeeId: isAnonymous ? null : employeeId,
      userName: isAnonymous ? null : userName,
      department: isAnonymous ? null : department,
      role: isAnonymous ? null : role,
      location: isAnonymous ? null : location,
      startedAt: timestamp,
      lastActiveAt: timestamp,
      status: 'in-progress',
      completionPercentage: 0,
      answers: [],
      answeredQuestions: 0,
      skippedQuestions: 0,
      isAnonymous,
      device,
      browser,
      partialSaves: [],
      surveyVersion: 1
    };

    responses.push(newResponse);
    survey.responses = responses;
    
    // Update view details
    if (survey.viewDetails) {
      const viewIndex = survey.viewDetails.findIndex((v: any) => v.employeeId === employeeId);
      if (viewIndex > -1) {
        survey.viewDetails[viewIndex].hasStarted = true;
      }
    }
    
    await survey.save();
    res.json({ success: true, data: survey, responseId });
  } catch (error) {
    console.error('Failed to start survey:', error);
    res.status(500).json({ success: false, message: 'Failed to start survey' });
  }
});

// Submit survey response (complete or partial)
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { responseId, answers, isComplete } = req.body;
    
    if (!responseId) {
      return res.status(400).json({ success: false, message: 'Response ID is required' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const responses = survey.responses || [];
    const responseIndex = responses.findIndex((r: any) => r.responseId === responseId);
    
    if (responseIndex < 0) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    const timestamp = new Date();
    const response = responses[responseIndex];
    
    // Update answers
    response.answers = answers;
    response.answeredQuestions = answers.filter((a: any) => !a.skipped).length;
    response.skippedQuestions = answers.filter((a: any) => a.skipped).length;
    response.lastActiveAt = timestamp;
    response.completionPercentage = (response.answeredQuestions / survey.totalQuestions * 100);

    if (isComplete) {
      response.status = 'completed';
      response.submittedAt = timestamp;
      response.totalTimeTaken = Math.floor((timestamp.getTime() - new Date(response.startedAt).getTime()) / 1000);
      
      survey.totalResponses = (survey.totalResponses || 0) + 1;
      survey.completedResponses = (survey.completedResponses || 0) + 1;
      
      if (response.isAnonymous) {
        survey.anonymousResponses = (survey.anonymousResponses || 0) + 1;
      }
      
      // Track first response
      if (!survey.firstRespondedBy && !response.isAnonymous) {
        survey.firstRespondedBy = response.userName;
        survey.firstRespondedAt = timestamp;
      }
      
      // Always update latest response
      if (!response.isAnonymous) {
        survey.latestRespondedBy = response.userName;
        survey.latestRespondedAt = timestamp;
      }
      
      // Update view details
      if (survey.viewDetails) {
        const viewIndex = survey.viewDetails.findIndex((v: any) => v.employeeId === response.employeeId);
        if (viewIndex > -1) {
          survey.viewDetails[viewIndex].hasCompleted = true;
        }
      }
      
      // Calculate response rate
      survey.responseRate = survey.viewsCount > 0 
        ? (survey.completedResponses / survey.viewsCount * 100)
        : 0;
      
      // Calculate completion rate
      const startedCount = responses.filter((r: any) => r.status !== 'not-started').length;
      survey.completionRate = startedCount > 0 
        ? (survey.completedResponses / startedCount * 100)
        : 0;
        
      // Update device breakdown
      if (response.device) {
        const deviceBreakdown = survey.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 };
        deviceBreakdown[response.device as keyof typeof deviceBreakdown]++;
        survey.deviceBreakdown = deviceBreakdown;
      }
      
      // Process question-level analytics
      survey.questions = survey.questions.map((question: any, index: number) => {
        const answer = answers.find((a: any) => a.questionId === question.id);
        
        if (answer && !answer.skipped) {
          question.responsesCount = (question.responsesCount || 0) + 1;
          
          // For MCQ and Rating questions, update distribution
          if (question.questionType === 'mcq-single' || question.questionType === 'rating-5') {
            const distribution = question.answerDistribution || [];
            const optionIndex = distribution.findIndex((d: any) => d.option === answer.answer);
            
            if (optionIndex >= 0) {
              distribution[optionIndex].count++;
            } else {
              distribution.push({ option: answer.answer, count: 1, percentage: 0 });
            }
            
            // Recalculate percentages
            const total = distribution.reduce((sum: number, d: any) => sum + d.count, 0);
            distribution.forEach((d: any) => {
              d.percentage = (d.count / total * 100);
            });
            
            question.answerDistribution = distribution;
            
            // Calculate average rating
            if (question.questionType === 'rating-5') {
              const sum = distribution.reduce((s: number, d: any) => s + (parseInt(d.option) * d.count), 0);
              question.avgRating = sum / total;
            }
          }
          
          // For text questions, store response
          if (question.questionType === 'text-short' || question.questionType === 'text-long') {
            question.textResponses = question.textResponses || [];
            question.textResponses.push({
              responseId,
              text: answer.answer,
              wordCount: answer.answer.split(' ').length,
              sentiment: 'neutral' // TODO: Implement sentiment analysis
            });
          }
        }
        
        // Calculate skip rate
        question.skipRate = question.responsesCount > 0 
          ? ((survey.completedResponses - question.responsesCount) / survey.completedResponses * 100)
          : 0;
        
        return question;
      }) as any;
      
    } else {
      // Partial save
      response.status = 'in-progress';
      response.partialSaves = response.partialSaves || [];
      response.partialSaves.push({
        savedAt: timestamp,
        progress: response.completionPercentage,
        answeredCount: response.answeredQuestions
      });
      
      survey.partialResponses = responses.filter((r: any) => r.status === 'in-progress').length;
    }

    responses[responseIndex] = response;
    survey.responses = responses;
    
    await survey.save();
    res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Failed to submit response:', error);
    res.status(500).json({ success: false, message: 'Failed to submit response' });
  }
});

// Track view
router.post('/:id/track-view', async (req: Request, res: Response) => {
  try {
    const { employeeId, userName, department, role, device } = req.body;
    
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const viewDetails = survey.viewDetails || [];
    const existingView = viewDetails.find((v: any) => v.employeeId === employeeId);
    
    if (!existingView) {
      viewDetails.push({
        employeeId,
        userName,
        department,
        role,
        timestamp: new Date(),
        hasStarted: false,
        hasCompleted: false,
        device
      });
      
      survey.viewDetails = viewDetails;
      survey.viewsCount = viewDetails.length;
      await survey.save();
    }

    res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Failed to track view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view' });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get overall analytics
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    // Response breakdown
    const responseBreakdown = {
      total: survey.totalResponses,
      completed: survey.completedResponses,
      partial: survey.partialResponses,
      anonymous: survey.anonymousResponses
    };

    // Question-level summary
    const questionSummary = survey.questions.map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      responsesCount: q.responsesCount,
      skipRate: q.skipRate,
      avgRating: q.avgRating,
      answerDistribution: q.answerDistribution
    }));

    // Department breakdown
    const departmentStats = survey.departmentStats || [];

    const analytics = {
      overview: {
        views: survey.viewsCount,
        responses: survey.totalResponses,
        completed: survey.completedResponses,
        responseRate: survey.responseRate,
        completionRate: survey.completionRate,
        avgCompletionTime: survey.avgCompletionTime
      },
      responseBreakdown,
      questionSummary,
      departmentStats,
      deviceBreakdown: survey.deviceBreakdown,
      firstResponse: survey.firstRespondedBy ? {
        by: survey.firstRespondedBy,
        at: survey.firstRespondedAt
      } : null,
      latestResponse: survey.latestRespondedBy ? {
        by: survey.latestRespondedBy,
        at: survey.latestRespondedAt
      } : null
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
});

// Get who responded (detailed response list)
router.get('/:id/analytics/responses', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const responses = survey.responses || [];
    
    const completed = responses.filter((r: any) => r.status === 'completed');
    const partial = responses.filter((r: any) => r.status === 'in-progress');
    const anonymous = responses.filter((r: any) => r.isAnonymous);

    res.json({ 
      success: true, 
      data: {
        total: responses.length,
        completed: completed.length,
        partial: partial.length,
        anonymous: anonymous.length,
        allResponses: responses.sort((a: any, b: any) => 
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        )
      }
    });
  } catch (error) {
    console.error('Failed to get responses:', error);
    res.status(500).json({ success: false, message: 'Failed to get responses' });
  }
});

// Get individual response details
router.get('/:id/analytics/responses/:responseId', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const response = survey.responses?.find((r: any) => r.responseId === req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Failed to get response details:', error);
    res.status(500).json({ success: false, message: 'Failed to get response details' });
  }
});

// Get question-specific analytics
router.get('/:id/analytics/questions/:questionId', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const question = survey.questions.find((q: any) => q.id === req.params.questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    console.error('Failed to get question analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get question analytics' });
  }
});

// Get who viewed
router.get('/:id/analytics/views', async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const views = survey.viewDetails || [];
    
    const viewedAndCompleted = views.filter((v: any) => v.hasCompleted);
    const viewedAndStarted = views.filter((v: any) => v.hasStarted);
    const viewedOnly = views.filter((v: any) => !v.hasStarted);

    res.json({
      success: true,
      data: {
        total: views.length,
        viewedAndCompleted: viewedAndCompleted.length,
        viewedAndStarted: viewedAndStarted.length,
        viewedOnly: viewedOnly.length,
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

export default router;
