/**
 * DisplayStatus Component
 * 
 * Monitors display status, health indicators, performance metrics,
 * error reporting, and provides admin debugging tools for TV displays
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DisplayStatus as DisplayStatusType, DisplayAnalytics } from '@masjid-suite/shared-types';

interface DisplayStatusProps {
  displayId: string;
  showDebugInfo?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  className?: string;
}

interface PerformanceMetrics {
  responseTime: number;
  loadTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface SystemInfo {
  userAgent: string;
  screenResolution: string;
  viewport: string;
  deviceMemory?: number;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  battery?: {
    level: number;
    charging: boolean;
  };
}

interface StatusState {
  status: DisplayStatusType | null;
  metrics: PerformanceMetrics;
  systemInfo: SystemInfo;
  errors: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'network' | 'display' | 'content' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  isLoading: boolean;
  lastUpdated: Date | null;
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function DisplayStatus({
  displayId,
  showDebugInfo = false,
  autoRefresh = true,
  refreshInterval = 30,
  className = ''
}: DisplayStatusProps) {
  const [state, setState] = useState<StatusState>({
    status: null,
    metrics: {
      responseTime: 0,
      loadTime: 0,
      errorRate: 0,
      uptime: 100
    },
    systemInfo: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'
    },
    errors: [],
    isLoading: true,
    lastUpdated: null,
    healthGrade: 'A'
  });

  // Initialize system info collection
  useEffect(() => {
    collectSystemInfo();
  }, []);

  // Auto-refresh status
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDisplayStatus();
        sendHeartbeat();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, displayId]);

  // Initial load
  useEffect(() => {
    fetchDisplayStatus();
  }, [displayId]);

  // Collect system information
  const collectSystemInfo = useCallback(() => {
    const newSystemInfo: SystemInfo = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };

    // Device memory (if available)
    if ('deviceMemory' in navigator) {
      newSystemInfo.deviceMemory = (navigator as any).deviceMemory;
    }

    // Network connection info (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      newSystemInfo.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }

    // Battery info (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        newSystemInfo.battery = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
        
        setState(prev => ({
          ...prev,
          systemInfo: { 
            ...prev.systemInfo, 
            ...(newSystemInfo.battery && { battery: newSystemInfo.battery })
          }
        }));
      });
    }

    setState(prev => ({
      ...prev,
      systemInfo: newSystemInfo
    }));
  }, []);

  // Fetch display status from API
  const fetchDisplayStatus = useCallback(async () => {
    const startTime = performance.now();

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`/api/displays/${displayId}/status`);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const status: DisplayStatusType = data.data;

      // Update metrics
      const newMetrics: PerformanceMetrics = {
        responseTime,
        loadTime: performance.now(),
        errorRate: state.metrics.errorRate, // Keep existing error rate
        uptime: status.uptime_percentage || 100
      };

      // Calculate health grade
      const healthGrade = calculateHealthGrade(newMetrics, status);

      setState(prev => ({
        ...prev,
        status,
        metrics: newMetrics,
        lastUpdated: new Date(),
        healthGrade,
        isLoading: false
      }));

    } catch (error) {
      const errorObj = {
        id: Date.now().toString(),
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        type: 'network' as const,
        severity: 'high' as const
      };

      setState(prev => ({
        ...prev,
        errors: [errorObj, ...prev.errors.slice(0, 9)], // Keep last 10 errors
        isLoading: false,
        metrics: {
          ...prev.metrics,
          errorRate: Math.min(prev.metrics.errorRate + 1, 100)
        }
      }));
    }
  }, [displayId, state.metrics.errorRate]);

  // Send heartbeat with performance data
  const sendHeartbeat = useCallback(async () => {
    try {
      const heartbeatData = {
        // Required fields (API expects these at root level)
        is_online: true,
        content_load_time: state.metrics.loadTime,
        api_response_time: state.metrics.responseTime,
        error_count_24h: state.errors.length,
        
        // Optional system information (also at root level)
        browser_info: state.systemInfo.userAgent,
        screen_resolution: state.systemInfo.screenResolution,
        device_info: JSON.stringify({
          viewport: state.systemInfo.viewport,
          deviceMemory: state.systemInfo.deviceMemory,
          connection: state.systemInfo.connection,
          battery: state.systemInfo.battery
        }),
        
        // Optional performance metrics
        memory_usage: state.systemInfo.deviceMemory,
        network_status: navigator.onLine ? 'online' : 'offline' as 'online' | 'offline' | 'limited'
      };

      await fetch(`/api/displays/${displayId}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heartbeatData)
      });

    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }, [displayId, state.metrics, state.systemInfo, state.errors.length]);

  // Calculate health grade based on metrics
  const calculateHealthGrade = (
    metrics: PerformanceMetrics, 
    status: DisplayStatusType
  ): 'A' | 'B' | 'C' | 'D' | 'F' => {
    let score = 100;

    // Response time impact (max -30 points)
    if (metrics.responseTime > 5000) score -= 30;
    else if (metrics.responseTime > 3000) score -= 20;
    else if (metrics.responseTime > 1000) score -= 10;

    // Error rate impact (max -40 points)
    score -= Math.min(metrics.errorRate * 2, 40);

    // Uptime impact (max -30 points)
    if (metrics.uptime < 95) score -= 30;
    else if (metrics.uptime < 98) score -= 20;
    else if (metrics.uptime < 99.5) score -= 10;

    // 24h error count impact
    if (status.error_count_24h > 10) score -= 20;
    else if (status.error_count_24h > 5) score -= 10;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Status indicator colors
  const getStatusColor = (isOnline: boolean, grade: string) => {
    if (!isOnline) return 'bg-red-500';
    
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Format uptime percentage
  const formatUptime = (uptime: number): string => {
    return `${uptime.toFixed(2)}%`;
  };

  // Format response time
  const formatResponseTime = (time: number): string => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
      metrics: {
        ...prev.metrics,
        errorRate: 0
      }
    }));
  }, []);

  if (!showDebugInfo && state.status?.is_online) {
    // Minimal status indicator for normal operation
    return (
      <div className={`fixed top-2 right-2 z-50 ${className}`}>
        <div 
          className={`w-3 h-3 rounded-full ${getStatusColor(state.status.is_online, state.healthGrade)}`}
          data-testid="display-status"
          data-status={state.status.is_online ? 'online' : 'offline'}
        />
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Status card */}
      <div 
        className="bg-black/80 text-white rounded-lg p-4 min-w-80 shadow-lg"
        data-testid="display-status"
        data-status={state.status?.is_online ? 'online' : 'offline'}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Display Status</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(state.status?.is_online || false, state.healthGrade)}`} />
            <span className="text-lg font-bold">{state.healthGrade}</span>
          </div>
        </div>

        {/* Loading state */}
        {state.isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Loading status...</p>
          </div>
        )}

        {/* Status info */}
        {state.status && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Online:</span>
              <span className={state.status.is_online ? 'text-green-400' : 'text-red-400'}>
                {state.status.is_online ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span>{formatUptime(state.metrics.uptime)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Response:</span>
              <span>{formatResponseTime(state.metrics.responseTime)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Errors (24h):</span>
              <span className={state.status.error_count_24h > 0 ? 'text-yellow-400' : 'text-green-400'}>
                {state.status.error_count_24h}
              </span>
            </div>

            {state.lastUpdated && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Updated:</span>
                <span>{state.lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Debug info */}
        {showDebugInfo && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium mb-2">System Info</summary>
              <div className="space-y-1 text-gray-300">
                <div>Resolution: {state.systemInfo.screenResolution}</div>
                <div>Viewport: {state.systemInfo.viewport}</div>
                {state.systemInfo.deviceMemory && (
                  <div>Memory: {state.systemInfo.deviceMemory}GB</div>
                )}
                {state.systemInfo.connection && (
                  <div>
                    Connection: {state.systemInfo.connection.effectiveType} 
                    ({state.systemInfo.connection.downlink}Mbps)
                  </div>
                )}
                {state.systemInfo.battery && (
                  <div>
                    Battery: {state.systemInfo.battery.level}% 
                    {state.systemInfo.battery.charging ? ' (charging)' : ''}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Error log */}
        {state.errors.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium">Recent Errors ({state.errors.length})</span>
              <button
                onClick={clearErrors}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {state.errors.slice(0, 5).map((error) => (
                <div key={error.id} className="text-xs p-2 bg-red-900/30 rounded">
                  <div className="flex justify-between items-start">
                    <span className="text-red-400">{error.type}</span>
                    <span className="text-gray-400">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-300 mt-1 truncate">
                    {error.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-4 pt-3 border-t border-gray-600 flex space-x-2">
          <button
            onClick={fetchDisplayStatus}
            disabled={state.isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs"
          >
            Refresh
          </button>
          <button
            onClick={sendHeartbeat}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
          >
            Ping
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisplayStatus;