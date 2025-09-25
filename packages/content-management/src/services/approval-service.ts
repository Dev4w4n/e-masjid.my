/**
 * T023: Approval Service Implementation
 *
 * Service layer for content approval workflows
 */

import supabase from '@masjid-suite/supabase-client';
import type { Tables } from '@masjid-suite/shared-types';
import type {
  ApprovalRequest,
  RejectionRequest,
} from '@masjid-suite/shared-types';
import type {
  PaginatedResponse,
  ContentQueryOptions,
  ApprovalHistoryItem,
  ResubmissionRequest,
} from '../types/content';
import {
  validateApprovalPermissions,
  getUserPermissions,
} from '../utils/permission-validator';

// Use the correct DisplayContent type from database
type DisplayContent = Tables<'display_content'>;

/**
 * Get pending content for masjid admin approval
 */
export async function getPendingContent(
  masjidId: string,
  options: Partial<ContentQueryOptions> = {}
): Promise<PaginatedResponse<DisplayContent>> {
  let query = supabase
    .from('display_content')
    .select('*', { count: 'exact' })
    .eq('masjid_id', masjidId)
    .eq('status', 'pending');

  // Apply pagination
  const limit = options.limit || 20;
  const offset = ((options.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  // Apply sorting (newest first for pending content)
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch pending content: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page: options.page || 1,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Approve content and return updated content
 */
export async function approveContent(
  contentId: string,
  request: ApprovalRequest
): Promise<DisplayContent> {
  // First validate that the content exists and is pending
  const { data: existingContent, error: fetchError } = await supabase
    .from('display_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (fetchError) {
    throw new Error(`Content not found: ${fetchError.message}`);
  }

  if (!existingContent) {
    throw new Error('Content not found');
  }

  if (existingContent.status !== 'pending') {
    throw new Error('Content is not in pending status');
  }

  // Use permission validator for authorization
  const permissionResult = await validateApprovalPermissions(
    request.approver_id,
    existingContent.masjid_id
  );

  if (!permissionResult.canApprove) {
    // Check if user is an admin but for different masjid
    const userPermissions = await getUserPermissions(request.approver_id);
    if (userPermissions.canApprove && userPermissions.adminMasjids.length > 0) {
      throw new Error('User not authorized for this masjid');
    }
    throw new Error('User not authorized to approve content');
  }

  // Update the content status to active (approved)
  const { data, error } = await supabase
    .from('display_content')
    .update({
      status: 'active' as const,
      approved_by: request.approver_id,
      approved_at: new Date().toISOString(),
      approval_notes: request.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to approve content: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to approve content - no data returned');
  }

  return data;
}

/**
 * Reject content and return updated content
 */
export async function rejectContent(
  contentId: string,
  request: RejectionRequest
): Promise<DisplayContent> {
  if (!request.reason || request.reason.trim() === '') {
    throw new Error('Rejection reason is required');
  }

  // First validate that the content exists and is pending
  const { data: existingContent, error: fetchError } = await supabase
    .from('display_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (fetchError) {
    throw new Error(`Content not found: ${fetchError.message}`);
  }

  if (existingContent.status !== 'pending') {
    throw new Error('Content is not in pending status');
  }

  // Use permission validator for authorization
  const permissionResult = await validateApprovalPermissions(
    request.rejector_id,
    existingContent.masjid_id
  );

  if (!permissionResult.canReject) {
    throw new Error('User not authorized to reject content');
  }

  // Update the content status to rejected
  const { data, error } = await supabase
    .from('display_content')
    .update({
      status: 'rejected' as const,
      approved_by: request.rejector_id, // Schema uses approved_by for both approve/reject
      approved_at: new Date().toISOString(), // Schema uses approved_at for both timestamps
      rejection_reason: request.reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reject content: ${error.message}`);
  }

  return data;
}

/**
 * Get approval history for a specific content item
 */
export async function getApprovalHistory(
  contentId: string
): Promise<ApprovalHistoryItem[]> {
  // This would typically come from an audit log table
  // For now, we'll simulate it based on the content record
  const { data, error } = await supabase
    .from('display_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return [];
    }
    throw new Error(`Failed to fetch approval history: ${error.message}`);
  }

  const history: ApprovalHistoryItem[] = [];

  // Add approval/rejection history if exists
  if (data.approved_by && data.approved_at) {
    const historyItem: ApprovalHistoryItem = {
      id: `${data.id}-approval`,
      content_id: data.id,
      action_type: data.status === 'active' ? 'approved' : 'rejected',
      performed_by: data.approved_by,
      performed_at: new Date(data.approved_at),
    };

    // Add optional fields only if they exist
    if (data.rejection_reason) {
      historyItem.reason = data.rejection_reason;
    }

    history.push(historyItem);
  }

  return history;
}

/**
 * Request resubmission of rejected content
 */
export async function requestResubmission(
  rejectedContentId: string,
  updates: ResubmissionRequest,
  userId?: string
): Promise<DisplayContent> {
  // First validate that the content exists and is rejected
  const { data: originalContent, error: fetchError } = await supabase
    .from('display_content')
    .select('*')
    .eq('id', rejectedContentId)
    .single();

  if (fetchError) {
    throw new Error(`Content not found: ${fetchError.message}`);
  }

  if (originalContent.status !== 'rejected') {
    throw new Error('Only rejected content can be resubmitted');
  }

  // Validate that the requesting user owns the original content
  if (userId && userId !== originalContent.submitted_by) {
    throw new Error('Not authorized to resubmit this content');
  }

  // Create a new content record based on the rejected one with updates
  const resubmissionData = {
    title: updates.title || originalContent.title,
    description: updates.description || originalContent.description,
    type: originalContent.type,
    url: updates.url || originalContent.url,
    thumbnail_url: originalContent.thumbnail_url,
    duration: originalContent.duration,
    masjid_id: originalContent.masjid_id,
    display_id: originalContent.display_id,
    submitted_by: originalContent.submitted_by,
    status: 'pending' as const,
    start_date: originalContent.start_date,
    end_date: originalContent.end_date,
    sponsorship_amount: originalContent.sponsorship_amount,
    sponsorship_tier: originalContent.sponsorship_tier,
    file_size: originalContent.file_size,
    file_type: originalContent.file_type,
    submitted_at: new Date().toISOString(),
    // Remove fields that don't exist in the schema
    payment_status: originalContent.payment_status,
    payment_reference: originalContent.payment_reference,
  };

  const { data, error } = await supabase
    .from('display_content')
    .insert(resubmissionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create resubmission: ${error.message}`);
  }

  return data;
}

/**
 * Get pending approvals for a masjid admin (legacy function name)
 */
export async function getPendingApprovals(
  masjidId: string,
  options: Partial<ContentQueryOptions> = {}
): Promise<PaginatedResponse<DisplayContent>> {
  return getPendingContent(masjidId, options);
}

/**
 * Get admin's approval statistics
 */
export async function getApprovalStats(
  masjidId: string,
  adminId: string
): Promise<{
  total_approved: number;
  total_rejected: number;
  pending_count: number;
}> {
  // Get pending count
  const { count: pendingCount, error: pendingError } = await supabase
    .from('display_content')
    .select('*', { count: 'exact', head: true })
    .eq('masjid_id', masjidId)
    .eq('status', 'pending');

  if (pendingError) {
    throw new Error(`Failed to fetch pending count: ${pendingError.message}`);
  }

  // Get approved count by this admin
  const { count: approvedCount, error: approvedError } = await supabase
    .from('display_content')
    .select('*', { count: 'exact', head: true })
    .eq('masjid_id', masjidId)
    .eq('approved_by', adminId)
    .eq('status', 'active');

  if (approvedError) {
    throw new Error(`Failed to fetch approved count: ${approvedError.message}`);
  }

  // Get rejected count by this admin
  const { count: rejectedCount, error: rejectedError } = await supabase
    .from('display_content')
    .select('*', { count: 'exact', head: true })
    .eq('masjid_id', masjidId)
    .eq('approved_by', adminId)
    .eq('status', 'rejected');

  if (rejectedError) {
    throw new Error(`Failed to fetch rejected count: ${rejectedError.message}`);
  }

  return {
    total_approved: approvedCount || 0,
    total_rejected: rejectedCount || 0,
    pending_count: pendingCount || 0,
  };
}
