// User approval status enum
export type UserApprovalStatus = "pending" | "approved" | "rejected";

// User approval table type
export interface UserApproval {
  id: string;
  user_id: string;
  home_masjid_id: string;
  status: UserApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserApprovalInsert {
  user_id: string;
  home_masjid_id: string;
  status?: UserApprovalStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
}

export interface UserApprovalUpdate {
  status?: UserApprovalStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
}

// User approval with details (joined with user and profile data)
export interface UserApprovalWithDetails {
  approval_id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  user_phone: string | null;
  profile_complete: boolean;
  requested_at: string;
}

// User approval history (with review information)
export interface UserApprovalHistory {
  approval_id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  status: UserApprovalStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewer_email: string | null;
  review_notes: string | null;
}

// Approval action request types
export interface ApproveUserRequest {
  approval_id: string;
  approver_id: string;
  notes?: string;
}

export interface RejectUserRequest {
  approval_id: string;
  rejector_id: string;
  notes: string; // Required for rejection
}

// Home masjid lock status
export interface HomeMasjidLockStatus {
  is_locked: boolean;
  approved_at: string | null;
  home_masjid_id: string | null;
}
