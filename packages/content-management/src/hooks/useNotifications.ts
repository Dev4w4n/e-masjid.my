/**
 * T024: Notification Hooks Implementation
 *
 * React hooks for real-time notifications and approval workflows
 */

import { useState, useEffect } from 'react';
import { supabase } from '@masjid-suite/supabase-client';
import type { Tables } from '@masjid-suite/shared-types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'approval_needed' | 'approved' | 'rejected' | 'resubmitted';
  content_id: string;
  masjid_id: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Hook for managing content status notifications
 * Simplified version that monitors display_content table directly
 */
export function useContentStatusNotifications(userId: string) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's content and derive notifications from status changes
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('display_content')
        .select(
          `
          id,
          title,
          status,
          masjid_id,
          updated_at,
          approved_at,
          rejection_reason
        `
        )
        .eq('submitted_by', userId)
        .in('status', ['active', 'rejected'])
        .order('updated_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      // Transform content into notifications
      const transformedData: NotificationData[] = (data || []).map(item => ({
        id: `${item.id}-${item.status}`,
        title:
          item.status === 'active' ? 'Content Approved' : 'Content Rejected',
        message:
          item.status === 'active'
            ? `Your content "${item.title}" has been approved and is now live.`
            : `Your content "${item.title}" was rejected. ${item.rejection_reason || 'No reason provided.'}`,
        type: item.status === 'active' ? 'approved' : 'rejected',
        content_id: item.id,
        masjid_id: item.masjid_id,
        is_read: false, // Simplified - all considered unread initially
        created_at:
          item.approved_at || item.updated_at || new Date().toISOString(),
      }));

      setNotifications(transformedData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch notifications'
      );
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for content status changes
  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel('user-content-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_content',
          filter: `submitted_by=eq.${userId}`,
        },
        payload => {
          const updatedContent = payload.new as Tables<'display_content'>;
          const oldContent = payload.old as Tables<'display_content'>;

          // Only create notification if status changed to approved or rejected
          if (
            oldContent.status === 'pending' &&
            (updatedContent.status === 'active' ||
              updatedContent.status === 'rejected')
          ) {
            const newNotification: NotificationData = {
              id: `${updatedContent.id}-${updatedContent.status}`,
              title:
                updatedContent.status === 'active'
                  ? 'Content Approved'
                  : 'Content Rejected',
              message:
                updatedContent.status === 'active'
                  ? `Your content "${updatedContent.title}" has been approved and is now live.`
                  : `Your content "${updatedContent.title}" was rejected. ${updatedContent.rejection_reason || 'No reason provided.'}`,
              type:
                updatedContent.status === 'active' ? 'approved' : 'rejected',
              content_id: updatedContent.id,
              masjid_id: updatedContent.masjid_id,
              is_read: false,
              created_at:
                updatedContent.approved_at ||
                updatedContent.updated_at ||
                new Date().toISOString(),
            };

            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
    loading,
    error,
    refetch: fetchNotifications,
  };
}

/**
 * Hook for admin approval notifications
 */
export function useApprovalNotifications(masjidIds: string[]) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending approval count
  const fetchPendingCount = async () => {
    if (masjidIds.length === 0) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { count, error: countError } = await supabase
        .from('display_content')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('masjid_id', masjidIds);

      if (countError) {
        throw countError;
      }

      setPendingCount(count || 0);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch pending count'
      );
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for content changes
  useEffect(() => {
    if (masjidIds.length === 0) return;

    fetchPendingCount();

    const subscription = supabase
      .channel('pending-approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'display_content',
          filter: `masjid_id=in.(${masjidIds.join(',')})`,
        },
        payload => {
          const newContent = payload.new as Tables<'display_content'>;
          if (newContent.status === 'pending') {
            setPendingCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_content',
          filter: `masjid_id=in.(${masjidIds.join(',')})`,
        },
        payload => {
          const oldContent = payload.old as Tables<'display_content'>;
          const newContent = payload.new as Tables<'display_content'>;

          // If content was pending and now isn't, decrease count
          if (
            oldContent.status === 'pending' &&
            newContent.status !== 'pending'
          ) {
            setPendingCount(prev => Math.max(0, prev - 1));
          }
          // If content wasn't pending and now is, increase count
          else if (
            oldContent.status !== 'pending' &&
            newContent.status === 'pending'
          ) {
            setPendingCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [masjidIds]);

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  };
}

/**
 * Hook for content statistics and metrics
 */
export function useContentMetrics(userId: string) {
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('display_content')
        .select('status')
        .eq('submitted_by', userId);

      if (fetchError) {
        throw fetchError;
      }

      const counts = (data || []).reduce(
        (acc, item) => {
          acc.total++;
          if (item.status === 'pending') acc.pending++;
          else if (item.status === 'active') acc.approved++;
          else if (item.status === 'rejected') acc.rejected++;
          return acc;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      );

      setMetrics(counts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [userId]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

/**
 * useContentNotifications - Hook for content-related notifications
 */
export function useContentNotifications(userId: string) {
  return useContentStatusNotifications(userId);
}

/**
 * subscribeToContentUpdates - Subscribe to real-time content updates
 */
export function subscribeToContentUpdates(
  masjidIds: string[],
  callback: (update: any) => void,
  options?: {
    onError?: (error: Error) => void;
    autoReconnect?: boolean;
    reconnectDelay?: number;
  }
): RealtimeChannel {
  const subscription = supabase
    .channel('content-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'display_content',
        filter: `masjid_id=in.(${masjidIds.join(',')})`,
      },
      payload => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * unsubscribeFromContentUpdates - Unsubscribe from real-time content updates
 */
export function unsubscribeFromContentUpdates(subscription: RealtimeChannel) {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  }
}
