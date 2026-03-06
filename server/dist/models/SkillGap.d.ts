import mongoose from 'mongoose';
export declare const SkillGap: mongoose.Model<{
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    employeeId: string;
    department: string;
    employeeName: string;
    requiredSkills: mongoose.Types.DocumentArray<{
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }> & {
        priority: "Low" | "Medium" | "High" | "Critical";
        skillName: string;
        requiredProficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        category?: string | null | undefined;
        requiredProficiencyScore?: number | null | undefined;
    }>;
    currentSkills: mongoose.Types.DocumentArray<{
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }> & {
        skillName: string;
        proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        lastAssessedDate?: NativeDate | null | undefined;
        yearsOfExperience?: number | null | undefined;
        proficiencyScore?: number | null | undefined;
    }>;
    skillGaps: mongoose.Types.DocumentArray<{
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }> & {
        skillName: string;
        identifiedDate: NativeDate;
        currentLevel?: string | null | undefined;
        priority?: "Low" | "Medium" | "High" | "Critical" | null | undefined;
        category?: string | null | undefined;
        requiredLevel?: string | null | undefined;
        gapScore?: number | null | undefined;
    }>;
    recommendedTrainings: mongoose.Types.DocumentArray<{
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }> & {
        targetSkills: string[];
        priority?: string | null | undefined;
        trainingId?: string | null | undefined;
        trainingName?: string | null | undefined;
        estimatedDuration?: number | null | undefined;
        estimatedCost?: number | null | undefined;
    }>;
    overallGapScore: number;
    totalGapsIdentified: number;
    criticalGapsCount: number;
    notes?: string | null | undefined;
    location?: string | null | undefined;
    designation?: string | null | undefined;
    employmentType?: string | null | undefined;
    grade?: string | null | undefined;
    assessedBy?: string | null | undefined;
    lastAssessmentDate?: NativeDate | null | undefined;
    nextReviewDate?: NativeDate | null | undefined;
    developmentPlan?: {
        progress: number;
        planStatus: "In Progress" | "On Hold" | "Completed" | "Active" | "Draft";
        planCreatedDate?: NativeDate | null | undefined;
        planStartDate?: NativeDate | null | undefined;
        targetCompletionDate?: NativeDate | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=SkillGap.d.ts.map