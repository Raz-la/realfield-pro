// ===== PROJECT INTERFACES =====
export interface Project {
    id: string;
    name: string;
    client: string;
    address: string;
    logoUrl?: string;
    status: 'Active' | 'On Hold' | 'Completed';
    phases: Phase[];
    budget: BudgetSegment[];
    createdAt: Date;
    updatedAt: Date;
    lastOpenedAt?: Date;
}

// ===== GANTT CHART INTERFACES =====
export interface Phase {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'Pending' | 'In Progress' | 'Completed';
    color?: string;
    dependencies?: string[]; // Array of phase IDs that must complete before this phase
    criticalPath?: boolean;  // Is this phase on the critical path?
}

// ===== BUDGET INTERFACES =====
export interface BudgetSegment {
    id: string;
    name: string;
    allocated: number;
    spent: number;
    color?: string;
}

// ===== REPORT INTERFACES =====
export interface Report {
    id: string;
    projectId: string;
    title: string;
    date: Date;
    stopWork: boolean;
    location?: string; // Geotag
    // Section B: Status
    constructionPhase: 'Skeleton' | 'Finishing' | 'Systems' | 'Development';
    // Section C: Inspection
    generalOverview: string;
    supervisorNotes: string;
    rejects: string;
    guidelines: string;
    safetyHighlights: string;
    // Legacy support (optional)
    content?: string;
    photos: PhotoItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PhotoItem {
    id: string;
    url: string;
    caption?: string;
    timestamp: Date;
}

// ===== FIREBASE DOCUMENT CONVERTERS =====
// Helper types for converting between Firestore and app types
export interface ProjectFirestore extends Omit<Project, 'createdAt' | 'updatedAt' | 'lastOpenedAt' | 'phases' | 'budget'> {
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
    lastOpenedAt?: { seconds: number; nanoseconds: number };
    phases: PhaseFirestore[];
    budget: BudgetSegment[];
}

export interface PhaseFirestore extends Omit<Phase, 'startDate' | 'endDate'> {
    startDate: { seconds: number; nanoseconds: number };
    endDate: { seconds: number; nanoseconds: number };
}

export interface ReportFirestore extends Omit<Report, 'date' | 'createdAt' | 'updatedAt' | 'photos'> {
    date: { seconds: number; nanoseconds: number };
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
    photos: PhotoItemFirestore[];
}

export interface PhotoItemFirestore extends Omit<PhotoItem, 'timestamp'> {
    timestamp: { seconds: number; nanoseconds: number };
}
