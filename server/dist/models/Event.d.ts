import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "cancelled" | "completed" | "upcoming" | "ongoing";
    comments: mongoose.Types.DocumentArray<{
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }> & {
        id: string;
        text: string;
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        likedBy: string[];
        likesCount: number;
        department?: string | null | undefined;
    }>;
    description: string;
    startDate: NativeDate;
    title: string;
    category: "location" | "team" | "department" | "optional" | "company-wide" | "mandatory";
    publishedBy: string;
    publishedOn: NativeDate;
    targetAudience: "all" | "custom" | "departments";
    commentsCount: number;
    viewDetails: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        hasResponded: boolean;
        role?: string | null | undefined;
        department?: string | null | undefined;
        device?: "desktop" | "mobile" | "tablet" | null | undefined;
    }>;
    viewsCount: number;
    contactEmail: string;
    eventType: "celebration" | "town-hall" | "training" | "team-building" | "awards" | "social" | "meeting" | "wellness";
    selectedDepartments: string[];
    startTime: string;
    endTime: string;
    mode: "virtual" | "hybrid" | "in-person";
    enableRSVP: boolean;
    organizer: string;
    rsvps: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }> & {
        timestamp: NativeDate;
        userName: string;
        employeeId: string;
        response: "attending" | "declined" | "maybe";
        attendanceMode: "virtual" | "in-person";
        guestCount: number;
        guests: mongoose.Types.DocumentArray<{
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }> & {
            name: string;
            email?: string | null | undefined;
            dietaryRestrictions?: string | null | undefined;
        }>;
        changeHistory: mongoose.Types.DocumentArray<{
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }> & {
            reason?: string | null | undefined;
            previousResponse?: string | null | undefined;
            newResponse?: string | null | undefined;
            changedAt?: NativeDate | null | undefined;
        }>;
        role?: string | null | undefined;
        department?: string | null | undefined;
        viewedAt?: NativeDate | null | undefined;
        dietaryRestrictions?: string | null | undefined;
        specialRequirements?: string | null | undefined;
        optionalNote?: string | null | undefined;
        declineReason?: string | null | undefined;
        viewToRsvpTime?: number | null | undefined;
        actualAttendance?: {
            isLate: boolean;
            attended: boolean;
            leftEarly: boolean;
            checkInTime?: NativeDate | null | undefined;
            checkOutTime?: NativeDate | null | undefined;
            attendanceMode?: "virtual" | "in-person" | null | undefined;
            durationAttended?: number | null | undefined;
            lateByMinutes?: number | null | undefined;
            leftEarlyByMinutes?: number | null | undefined;
        } | null | undefined;
    }>;
    rsvpsCount: number;
    attendingCount: number;
    declinedCount: number;
    maybeCount: number;
    noResponseCount: number;
    inPersonCount: number;
    virtualCount: number;
    actualAttendeesCount: number;
    walkInsCount: number;
    noShowsCount: number;
    noShowRate: number;
    rsvpRate: number;
    attendanceProjection: number;
    feedbackEnabled: boolean;
    feedbackResponses: number;
    address?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    averageRating?: number | null | undefined;
    venue?: string | null | undefined;
    virtualLink?: string | null | undefined;
    maxAttendees?: number | null | undefined;
    maxInPersonAttendees?: number | null | undefined;
    rsvpDeadline?: NativeDate | null | undefined;
    organizerDepartment?: string | null | undefined;
    firstRsvpBy?: string | null | undefined;
    firstRsvpAt?: NativeDate | null | undefined;
    latestRsvpBy?: string | null | undefined;
    latestRsvpAt?: NativeDate | null | undefined;
    dietarySummary?: {
        other: number;
        vegetarian: number;
        vegan: number;
        glutenFree: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Event.d.ts.map