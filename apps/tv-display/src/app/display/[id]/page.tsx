/**
 * TV Display Page
 * 
 * Main display page that integrates all components for TV display functionality.
 * Handles content carousel, prayer times overlay, offline management, and status monitoring.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DisplayConfig, PrayerTimes } from '@masjid-suite/shared-types';

// Component imports
import ContentCarousel from '../../../components/ContentCarousel';
import PrayerTimesOverlay from '../../../components/PrayerTimesOverlay';
import OfflineHandler, { useOffline, FallbackContent } from '../../../components/OfflineHandler';
import DisplayStatus from '../../../components/DisplayStatus';
import ClientOnly from '../../../components/ClientOnly';

interface DisplayPageState {
  config: DisplayConfig | null;
  prayerTimes: PrayerTimes | null;
  prayerTimeConfig: any | null; // PrayerTimeConfig from API
  isLoading: boolean;
  error: string | null;
  lastConfigUpdate: Date | null;
}

function DisplayPageContent() {
  const params = useParams();
  const displayId = params.id as string;
  
  const [state, setState] = useState<DisplayPageState>({
    config: null,
    prayerTimes: null,
    prayerTimeConfig: null,
    isLoading: true,
    error: null,
    lastConfigUpdate: null
  });

  const { state: offlineState, actions: offlineActions } = useOffline();

  // Load initial configuration and data
  useEffect(() => {
    loadDisplayData();
  }, [displayId]);

  // Auto-refresh configuration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadDisplayData(true); // Silent refresh
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [displayId]);

  // Load display configuration and data
  const loadDisplayData = useCallback(async (silentRefresh = false) => {
    if (!silentRefresh) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      // Try to load from API first, fallback to cache if offline
      const promises = [];

      // Load display configuration
      if (offlineState.networkStatus.isOnline) {
        promises.push(
          fetch(`/api/displays/${displayId}/config`)
            .then(res => res.json())
            .then(data => {
              const config = data.data;
              offlineActions.setCachedData('config', config);
              return { type: 'config', data: config };
            })
            .catch(error => {
              console.error('Failed to load config:', error);
              const cachedConfig = offlineActions.getCachedData('config');
              return { type: 'config', data: cachedConfig };
            })
        );

        // Load prayer times
        promises.push(
          fetch(`/api/displays/${displayId}/prayer-times`)
            .then(res => res.json())
            .then(data => {
              const prayerData = data.data;
              const prayerConfig = data.meta;
              offlineActions.setCachedData('prayerTimes', prayerData);
              offlineActions.setCachedData('prayerTimeConfig', prayerConfig);
              return { 
                type: 'prayer', 
                data: prayerData, 
                config: prayerConfig 
              };
            })
            .catch(error => {
              console.error('Failed to load prayer times:', error);
              const cachedPrayerTimes = offlineActions.getCachedData('prayerTimes');
              const cachedPrayerConfig = offlineActions.getCachedData('prayerTimeConfig');
              return { 
                type: 'prayer', 
                data: cachedPrayerTimes, 
                config: cachedPrayerConfig 
              };
            })
        );
      } else {
        // Load from cache when offline
        const cachedConfig = offlineActions.getCachedData('config');
        const cachedPrayerTimes = offlineActions.getCachedData('prayerTimes');
        const cachedPrayerConfig = offlineActions.getCachedData('prayerTimeConfig');
        
        promises.push(
          Promise.resolve({ type: 'config', data: cachedConfig }),
          Promise.resolve({ 
            type: 'prayer', 
            data: cachedPrayerTimes, 
            config: cachedPrayerConfig 
          })
        );
      }

      const results = await Promise.allSettled(promises);
      
      let newConfig = state.config;
      let newPrayerTimes = state.prayerTimes;
      let newPrayerTimeConfig = state.prayerTimeConfig;

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const resultValue = result.value as any;
          const { type, data, config } = resultValue;
          if (type === 'config' && data) {
            newConfig = data;
          } else if (type === 'prayer') {
            if (data) newPrayerTimes = data;
            if (config) newPrayerTimeConfig = config;
          }
        }
      });

      setState(prev => ({
        ...prev,
        config: newConfig,
        prayerTimes: newPrayerTimes,
        prayerTimeConfig: newPrayerTimeConfig,
        isLoading: false,
        error: null,
        lastConfigUpdate: new Date()
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load display data';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  }, [displayId, offlineState.networkStatus.isOnline, offlineActions, state.config, state.prayerTimes, state.prayerTimeConfig]);

  // Handle configuration updates
  const handleConfigUpdate = useCallback((newConfig: DisplayConfig) => {
    setState(prev => ({
      ...prev,
      config: newConfig,
      lastConfigUpdate: new Date()
    }));
    offlineActions.setCachedData('config', newConfig);
  }, [offlineActions]);

  // Handle errors from child components
  const handleError = useCallback((error: Error, component?: string) => {
    console.error(`Error in ${component || 'DisplayPage'}:`, error);
    
    // For critical errors, show fallback content
    if (error.message.includes('network') || error.message.includes('fetch')) {
      setState(prev => ({
        ...prev,
        error: `Network error: ${error.message}`
      }));
    }
  }, []);

  // Loading state
  if (state.isLoading && !state.config) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading Display</h2>
          <p className="text-gray-300">Initializing TV display system...</p>
        </div>
      </div>
    );
  }

  // Error state without config
  if (state.error && !state.config) {
    return (
      <div className="h-screen w-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold mb-4">Display Error</h2>
          <p className="text-xl mb-6">{state.error}</p>
          <button
            onClick={() => loadDisplayData()}
            className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Fallback when no config is available
  if (!state.config) {
    return (
      <FallbackContent 
        message="Display configuration unavailable" 
        showRetryButton={true}
      />
    );
  }

  // Main display layout
  return (
    <div 
      className={`
        h-screen w-screen overflow-hidden relative
        ${state.config.orientation === 'portrait' ? 'portrait' : 'landscape'}
      `}
      style={{
        backgroundColor: '#000000'
      }}
    >
      {/* Main content carousel */}
      <ContentCarousel
        displayId={displayId}
        config={{
          carouselInterval: state.config.carousel_interval,
          contentTransitionType: state.config.content_transition_type as 'fade' | 'slide' | 'zoom' | 'none',
          maxContentItems: state.config.max_content_items,
          showSponsorshipAmounts: state.config.show_sponsorship_amounts,
          sponsorshipTierColors: state.config.sponsorship_tier_colors
        }}
        onContentChange={(content) => {
          // Could send analytics or update status
          console.log('Content changed:', content?.title);
        }}
        onError={(error) => handleError(error, 'ContentCarousel')}
        className="h-full w-full"
        showDebugInfo={state.config.show_debug_info}
      />

      {/* Prayer times overlay */}
      {state.prayerTimes && state.prayerTimeConfig && state.config.prayer_time_position !== 'hidden' && (
        <PrayerTimesOverlay
          prayerTimes={state.prayerTimes}
          config={state.prayerTimeConfig}
          position={state.config.prayer_time_position}
          fontSize={state.config.prayer_time_font_size as 'small' | 'medium' | 'large' | 'extra_large'}
          color={state.config.prayer_time_color}
          backgroundOpacity={state.config.prayer_time_background_opacity}
          layout={state.config.prayer_time_layout}
          alignment={state.config.prayer_time_alignment}
          locale={(state.config.language || 'ms') as 'en' | 'ms'}
          className="z-20"
        />
      )}

      {/* Display status monitoring */}
      {state.config.show_debug_info && (
        <DisplayStatus
          displayId={displayId}
          showDebugInfo={true}
          autoRefresh={true}
          refreshInterval={state.config.heartbeat_interval}
          className="z-30"
        />
      )}

      {/* Development info overlay */}
      <ClientOnly fallback={null}>
        {state.config.show_debug_info && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs z-40">
            <div className="font-semibold mb-1">Display Info</div>
            <div>ID: {displayId}</div>
            <div>Resolution: {state.config.resolution}</div>
            <div>Orientation: {state.config.orientation}</div>
            <div>Carousel: {state.config.carousel_interval}s</div>
            <div>Max Items: {state.config.max_content_items}</div>
            {state.lastConfigUpdate && (
              <div>Updated: {state.lastConfigUpdate.toLocaleTimeString()}</div>
            )}
          </div>
        )}
      </ClientOnly>

      {/* Configuration update notification */}
      <ClientOnly fallback={null}>
        {state.config.show_debug_info && state.lastConfigUpdate && Date.now() - state.lastConfigUpdate.getTime() < 5000 && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded-full animate-pulse"></div>
              <span className="font-medium">Configuration Updated</span>
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}

// Main page component with offline wrapper
export default function DisplayPage() {
  const params = useParams();
  const displayId = params.id as string;
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Validate display ID
  if (!displayId || typeof displayId !== 'string') {
    return (
      <div className="h-screen w-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold mb-4">Invalid Display ID</h2>
          <p className="text-xl">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  // Load debug setting from cache or API
  useEffect(() => {
    const loadDebugSetting = async () => {
      try {
        // Try to get from localStorage first (cached config)
        const cachedConfig = localStorage.getItem(`display_${displayId}_config`);
        if (cachedConfig) {
          const config = JSON.parse(cachedConfig);
          setShowDebugInfo(config.data?.show_debug_info || false);
        } else {
          // Fetch from API
          const res = await fetch(`/api/displays/${displayId}/config`);
          const data = await res.json();
          setShowDebugInfo(data.data?.show_debug_info || false);
        }
      } catch (error) {
        console.error('Failed to load debug setting:', error);
        // Default to false on error
        setShowDebugInfo(false);
      }
    };

    loadDebugSetting();
  }, [displayId]);

  return (
    <OfflineHandler
      displayId={displayId}
      maxCacheAge={24} // 24 hours
      maxRetries={5}
      retryDelay={30} // 30 seconds
      enableFallbackContent={true}
      showDebugInfo={showDebugInfo}
    >
      <DisplayPageContent />
    </OfflineHandler>
  );
}