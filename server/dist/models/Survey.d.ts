import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "closed" | "active" | "draft" | "archived";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    title: string;
    category: "general" | "leadership" | "employee-satisfaction" | "performance-feedback" | "training-needs" | "workplace-environment" | "benefits" | "work-life-balance";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasStarted: boolean;
        hasCompleted: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    questions: mongoose.Types.DocumentArray<{
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }> & {
        id: string;
        options: string[];
        isRequired: boolean;
        order: number;
        questionText: string;
        questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
        responsesCount: number;
        skipRate: number;
        answerDistribution: mongoose.Types.DocumentArray<{
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }> & {
            count?: number | null | undefined;
            option?: string | null | undefined;
            percentage?: number | null | undefined;
        }>;
        textResponses: mongoose.Types.DocumentArray<{
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }> & {
            text?: string | null | undefined;
            responseId?: string | null | undefined;
            wordCount?: number | null | undefined;
            sentiment?: string | null | undefined;
        }>;
        commonKeywords: mongoose.Types.DocumentArray<{
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }> & {
            word?: string | null | undefined;
            frequency?: number | null | undefined;
        }>;
        avgTimeSpent?: number | null | undefined;
        avgRating?: number | null | undefined;
        medianRating?: number | null | undefined;
    }>;
    totalQuestions: number;
    allowAnonymous: boolean;
    allowPartialSubmission: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    selectedDepartments: string[];
    responses: mongoose.Types.DocumentArray<{
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }> & {
        status: "in-progress" | "completed" | "not-started" | "abandoned";
        isAnonymous: boolean;
        responseId: string;
        startedAt: NativeDate;
        completionPercentage: number;
        answers: mongoose.Types.DocumentArray<{
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }> & {
            questionId: string;
            questionText: string;
            questionType: "mcq-single" | "mcq-multiple" | "text-short" | "text-long" | "rating-5" | "yes-no";
            skipped: boolean;
            answer?: any;
            timeSpent?: number | null | undefined;
        }>;
        answeredQuestions: number;
        skippedQuestions: number;
        hasStraightLining: boolean;
        partialSaves: mongoose.Types.DocumentArray<{
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }> & {
            progress?: number | null | undefined;
            savedAt?: NativeDate | null | undefined;
            answeredCount?: number | null | undefined;
        }>;
        surveyVersion: number;
        userName?: string | null | undefined;
        location?: string | null | undefined;
        employeeId?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        ipAddress?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        browser?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        lastActiveAt?: NativeDate | null | undefined;
        totalTimeTaken?: number | null | undefined;
    }>;
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    abandonedResponses: number;
    anonymousResponses: number;
    responseRate: number;
    completionRate: number;
    straightLiningCount: number;
    departmentStats: mongoose.Types.DocumentArray<{
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }> & {
        department?: string | null | undefined;
        responseRate?: number | null | undefined;
        invited?: number | null | undefined;
        responded?: number | null | undefined;
        avgSatisfaction?: number | null | undefined;
    }>;
    nonResponders: mongoose.Types.DocumentArray<{
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }> & {
        userName?: string | null | undefined;
        employeeId?: string | null | undefined;
        department?: string | null | undefined;
        hasViewed?: boolean | null | undefined;
        viewedAt?: NativeDate | null | undefined;
    }>;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    avgCompletionTime?: number | null | undefined;
    medianCompletionTime?: number | null | undefined;
    avgTextResponseLength?: number | null | undefined;
    textResponseRate?: number | null | undefined;
    deviceBreakdown?: {
        desktop: number;
        mobile: number;
        tablet: number;
    } | null | undefined;
    firstRespondedBy?: string | null | undefined;
    firstRespondedAt?: NativeDate | null | undefined;
    latestRespondedBy?: string | null | undefined;
    latestRespondedAt?: NativeDate | null | undefined;
    previousSurveyId?: string | null | undefined;
    comparisonMetrics?: {
        responseRateChange?: number | null | undefined;
        satisfactionChange?: number | null | undefined;
        trendDirection?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Survey.d.ts.map