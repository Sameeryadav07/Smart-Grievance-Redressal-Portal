// ─── Enums (string literals since SQLite doesn't support Prisma enums) ───
export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type UserRole = 'CITIZEN' | 'ADMIN' | 'DEPT_OFFICER';

// ─── Extended types ───
export interface ComplaintWithRelations {
  id: number;
  trackingId: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  locationLat: number | null;
  locationLng: number | null;
  locationAddress: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  categoryId: number | null;
  departmentId: number | null;
  user: { name: string; email: string };
  department: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  aiAnalysis: AIAnalysisData | null;
  updates: ComplaintUpdateData[];
}

export interface AIAnalysisData {
  id: number;
  complaintId: number;
  tamperingScore: number;
  elaImagePath: string | null;
  metadataFlags: string;
  duplicateOfId: number | null;
  similarityScore: number | null;
  autoCategory: string | null;
  categoryConfidence: number | null;
  isFlagged: boolean;
  analysisData: string | null;
  createdAt: string;
}

export interface ComplaintUpdateData {
  id: number;
  complaintId: number;
  officerId: number | null;
  status: string;
  comment: string;
  createdAt: string;
  officer?: { name: string } | null;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  flaggedCount: number;
  byCategory: { name: string; count: number }[];
  byDepartment: { name: string; count: number }[];
  byStatus: { status: string; count: number }[];
  recentComplaints: ComplaintWithRelations[];
}

export interface AIAnalysisResult {
  tamperingScore: number;
  elaImagePath: string | null;
  metadataFlags: string[];
  duplicateOf: { id: number; trackingId: string; title: string } | null;
  similarityScore: number | null;
  autoCategory: string | null;
  categoryConfidence: number | null;
  isFlagged: boolean;
}

// ─── Extend next-auth types ───
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      departmentId: number | null;
    };
  }
  interface User {
    role: UserRole;
    departmentId: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    departmentId: number | null;
  }
}
