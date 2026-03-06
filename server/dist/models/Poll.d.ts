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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    comments: mongoose.Types.DocumentArray<{
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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    comments: mongoose.Types.DocumentArray<{
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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    comments: mongoose.Types.DocumentArray<{
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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    comments: mongoose.Types.DocumentArray<{
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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    comments: mongoose.Types.DocumentArray<{
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
    options: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }> & {
        id: string;
        text: string;
        votes: number;
        percentage: number;
        voters: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }> & {
            timestamp: NativeDate;
            userName: string;
            employeeId: string;
            location?: string | null | undefined;
            role?: string | null | undefined;
            department?: string | null | undefined;
            device?: "desktop" | "mobile" | "tablet" | null | undefined;
            voteChangedFrom?: string | null | undefined;
            voteChangedAt?: NativeDate | null | undefined;
            optionalComment?: string | null | undefined;
        }>;
    }>;
    title: string;
    category: "general" | "employee-feedback" | "opinion-poll" | "event-planning" | "team-decision" | "preference-survey" | "satisfaction-check" | "quick-poll";
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    author: string;
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasVoted: boolean;
        location?: string | null | undefined;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
        viewToVoteTime?: number | null | undefined;
    }>;
    viewsCount: number;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    totalVotes: number;
    selectedDepartments: string[];
    allowVoteChange: boolean;
    allowComments: boolean;
    participationRate: number;
    viewToVoteConversion: number;
    voteToCommentRate: number;
    nonVoters: mongoose.Types.DocumentArray<{
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
    description?: string | null | undefined;
    expiresAt?: NativeDate | null | undefined;
    authorRole?: string | null | undefined;
    authorDepartment?: string | null | undefined;
    firstVotedBy?: string | null | undefined;
    firstVotedAt?: NativeDate | null | undefined;
    latestVotedBy?: string | null | undefined;
    latestVotedAt?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Poll.d.ts.map