import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import type { Project, Report, ProjectFirestore, ReportFirestore } from '@/types';

// ===== HELPER FUNCTIONS =====

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
    }
    return new Date();
};

// Convert Project from Firestore format
const convertProject = (doc: any): Project => {
    const data = doc.data() as ProjectFirestore;
    return {
        ...data,
        id: doc.id,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        lastOpenedAt: data.lastOpenedAt ? timestampToDate(data.lastOpenedAt) : undefined,
        phases: data.phases?.map(phase => ({
            ...phase,
            startDate: timestampToDate(phase.startDate),
            endDate: timestampToDate(phase.endDate),
        })) || [],
        budget: data.budget || [],
    };
};

// Convert Report from Firestore format
const convertReport = (doc: any): Report => {
    const data = doc.data() as ReportFirestore;
    return {
        ...data,
        id: doc.id,
        date: timestampToDate(data.date),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        photos: data.photos?.map(photo => ({
            ...photo,
            timestamp: timestampToDate(photo.timestamp),
        })) || [],
    };
};

// ===== PROJECT HOOKS =====

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.PROJECTS),
            orderBy('lastOpenedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const projectsData = snapshot.docs.map(convertProject);
                setProjects(projectsData);
                setLoading(false);
            },
            (err) => {
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { projects, loading, error };
}

export function useProject(projectId: string | null) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setProject(convertProject(snapshot));
                } else {
                    setProject(null);
                }
                setLoading(false);
            },
            (err) => {
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [projectId]);

    return { project, loading, error };
}

// ===== REPORT HOOKS =====

export function useReports(projectId: string | null) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.REPORTS),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const reportsData = snapshot.docs.map(convertReport);
                setReports(reportsData);
                setLoading(false);
            },
            (err) => {
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [projectId]);

    return { reports, loading, error };
}

// ===== CRUD OPERATIONS =====

// Create a new project
export async function createProject(
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
        ...projectData,
        phases: projectData.phases.map(phase => ({
            ...phase,
            startDate: Timestamp.fromDate(phase.startDate),
            endDate: Timestamp.fromDate(phase.endDate),
        })),
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
    });
    return docRef.id;
}

// Update a project
export async function updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
    };

    if (updates.phases) {
        updateData.phases = updates.phases.map(phase => ({
            ...phase,
            startDate: Timestamp.fromDate(phase.startDate),
            endDate: Timestamp.fromDate(phase.endDate),
        }));
    }

    await updateDoc(docRef, updateData);
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(docRef);
}

// Update lastOpenedAt when entering a project
export async function touchProject(projectId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(docRef, {
        lastOpenedAt: Timestamp.now(),
    });
}

// Create a new report
export async function createReport(
    projectId: string,
    reportData: Omit<Report, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(
        collection(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.REPORTS),
        {
            ...reportData,
            projectId,
            date: Timestamp.fromDate(reportData.date),
            photos: reportData.photos.map(photo => ({
                ...photo,
                timestamp: Timestamp.fromDate(photo.timestamp),
            })),
            createdAt: now,
            updatedAt: now,
        }
    );
    return docRef.id;
}

// Update a report
export async function updateReport(
    projectId: string,
    reportId: string,
    updates: Partial<Omit<Report, 'id' | 'projectId' | 'createdAt'>>
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.REPORTS, reportId);
    const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
    };

    if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
    }

    if (updates.photos) {
        updateData.photos = updates.photos.map(photo => ({
            ...photo,
            timestamp: Timestamp.fromDate(photo.timestamp),
        }));
    }

    await updateDoc(docRef, updateData);
}

// Delete a report
export async function deleteReport(projectId: string, reportId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.REPORTS, reportId);
    await deleteDoc(docRef);
}
