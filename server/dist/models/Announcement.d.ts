import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    strict: false;
}> & {
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    strict: false;
}, {
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    strict: false;
}>> & mongoose.FlatRecord<{
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        replies: mongoose.Types.DocumentArray<{
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }> & {
            id: string;
            text: string;
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            likedBy: string[];
            likesCount: number;
            role?: string | null | undefined;
            department?: string | null | undefined;
        }>;
        isEdited: boolean;
        editHistory: mongoose.Types.DocumentArray<{
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }> & {
            originalText?: string | null | undefined;
            editedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    attachments: string[];
    isPinned: boolean;
    title: string;
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High" | "Critical";
    category: "IT" | "HR" | "General" | "hr" | "Event" | "feedback" | "Policy" | "Urgent" | "general" | "it" | "policy" | "event" | "urgent" | "celebration" | "announcement" | "company-news" | "policy-update" | "hr-update" | "it-update" | "team-update" | "event-activity" | "achievement" | "training-learning" | "facility-update" | "safety-security" | "general-information";
    targetAudience: string[];
    likedBy: string[];
    likes: number;
    views: number;
    reactions: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        emoji: string;
        label: string;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    reactionsCount: number;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasEngaged: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        duration?: number | null | undefined;
        browser?: string | null | undefined;
        viewSource?: "email" | "dashboard" | "direct-link" | "notification" | null | undefined;
    }>;
    viewsCount: number;
    sharesCount: number;
    engagementRate: number;
    layoutType: "content-only" | "content-with-image" | "image-only";
    subLayout: "left-image" | "top-image" | "right-image";
    isPoll: boolean;
    pollOptions: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }> & {
        id: string;
        text: string;
        votes: number;
        votedBy: string[];
    }>;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    date?: string | null | undefined;
    description?: string | null | undefined;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    role?: string | null | undefined;
    content?: string | null | undefined;
    publishedBy?: string | null | undefined;
    publishedOn?: string | null | undefined;
    expiresOn?: string | null | undefined;
    imageUrl?: string | null | undefined;
    author?: string | null | undefined;
    authorId?: string | null | undefined;
    time?: string | null | undefined;
    expiresAt?: string | null | undefined;
    firstReactedBy?: string | null | undefined;
    firstReactedAt?: NativeDate | null | undefined;
    latestReactedBy?: string | null | undefined;
    latestReactedAt?: NativeDate | null | undefined;
    firstCommentedBy?: string | null | undefined;
    firstCommentedAt?: NativeDate | null | undefined;
    pollExpiresAt?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Announcement.d.ts.map