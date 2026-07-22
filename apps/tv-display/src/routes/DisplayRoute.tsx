'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DisplayConfig, PrayerTimes } from '@masjid-suite/shared-types';
import ContentCarousel from '@/components/ContentCarousel';
import PrayerTimesOverlay from '@/components/PrayerTimesOverlay';
import OfflineHandler, { useOffline, FallbackContent } from '@/components/OfflineHandler';
import DisplayStatus from '@/components/DisplayStatus';
import ClientOnly from '@/components/ClientOnly';
import BlackScreenOverlay from '@/components/BlackScreenOverlay';
import { jakimFallbackService } from '@masjid-suite/supabase-client';
import { readZoneSessionState } from '@/lib/zone-session-state';
import { EnhancedSupabaseService } from '@/lib/services/enhanced-supabase';

interface DisplayPageContentProps {
  displayId: string;
}

interface DisplayPageState {
  config: DisplayConfig | null;
  prayerTimes: PrayerTimes | null;
  prayerTimeConfig: any | null;
  isLoading: boolean;
  error: string | null;
  lastConfigUpdate: Date | null;
}

function mapDisplayRowToConfig(display: any): DisplayConfig {
  return {
    id: display.id,
    masjid_id: display.masjid_id,
    display_name: display.display_name,
    location_description: display.location_description || null,
    orientation: display.orientation || 'landscape',
    resolution: display.resolution || '1920x1080',
    carousel_interval: display.carousel_interval ?? 10,
    content_transition_type: display.content_transition_type || 'fade',
    max_content_items: display.max_content_items ?? 10,
    image_display_mode: display.image_display_mode || 'contain',
    image_background_color: display.image_background_color || '#000000',
    prayer_time_position: display.prayer_time_position || 'bottom',
    prayer_time_color: display.prayer_time_color || '#FFFFFF',
    prayer_time_font_size: display.prayer_time_font_size || 'large',
    prayer_time_background_opacity: display.prayer_time_background_opacity ?? 0.8,
    prayer_time_layout: display.prayer_time_layout || 'horizontal',
    prayer_time_alignment: display.prayer_time_alignment || 'center',
    auto_refresh_interval: display.auto_refresh_interval ?? 60,
    heartbeat_interval: display.heartbeat_interval ?? 60,
    offline_cache_duration: display.offline_cache_duration ?? 24,
    max_retry_attempts: display.max_retry_attempts ?? 5,
    retry_backoff_multiplier: display.retry_backoff_multiplier ?? 2,
    show_debug_info: display.show_debug_info ?? false,
    black_screen_enabled: display.black_screen_enabled ?? false,
    black_screen_schedule_type: display.black_screen_schedule_type || 'daily',
    black_screen_start_time: display.black_screen_start_time || null,
    black_screen_end_time: display.black_screen_end_time || null,
    black_screen_days: display.black_screen_days || [],
    black_screen_message: display.black_screen_message || null,
    black_screen_show_clock: display.black_screen_show_clock ?? true,
    is_touch_enabled: display.is_touch_enabled ?? false,
    is_active: display.is_active ?? true,
    last_heartbeat: display.last_heartbeat || null,
    created_at: display.created_at || new Date().toISOString(),
    updated_at: display.updated_at || new Date().toISOString(),
  };
}

async function fetchDisplayConfigWithFallback(displayId: string): Promise<DisplayConfig | null> {
  try {
    const response = await fetch(`/api/displays/${displayId}/config?t=${Date.now()}`, {
      cache: 'no-store',
    });
    const text = await response.text();

    if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
      throw new Error('Display config API returned HTML fallback');
    }

    const payload = JSON.parse(text);
    if (payload?.data) {
      return payload.data as DisplayConfig;
    }
  } catch (error) {
    console.warn('[DisplayRoute] Config API failed, using Supabase fallback:', error);
  }

  const supabaseService = new EnhancedSupabaseService();
  const display = await supabaseService.getTVDisplay(displayId, true);

  if (!display) {
    return null;
  }

  return mapDisplayRowToConfig(display);
}

async function fetchPrayerTimesWithFallback(displayId: string): Promise<{ prayerData: PrayerTimes | null; prayerConfig: any | null }> {
  try {
    const response = await fetch(`/api/displays/${displayId}/prayer-times?t=${Date.now()}`, {
      cache: 'no-store',
    });
    const text = await response.text();

    if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
      throw new Error('Prayer times API returned HTML fallback');
    }

    const payload = JSON.parse(text);
    return {
      prayerData: payload?.data ?? null,
      prayerConfig: payload?.meta ?? null,
    };
  } catch (error) {
    console.warn('[DisplayRoute] Prayer times API failed, using Supabase fallback:', error);
  }

  try {
    const supabaseService = new EnhancedSupabaseService();
    const display = await supabaseService.getTVDisplay(displayId, true);

    if (!display?.masjid_id) {
      return { prayerData: null, prayerConfig: null };
    }

    const today = new Date().toISOString().split('T')[0] || '';
    const prayerData = await supabaseService.getPrayerTimes(display.masjid_id, today, true);

    const prayerConfig = {
      position: display.prayer_time_position || 'bottom',
      show_seconds: false,
      highlight_current_prayer: true,
      next_prayer_countdown: true,
      adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
    };

    return {
      prayerData: prayerData ?? null,
      prayerConfig,
    };
  } catch (fallbackError) {
    console.warn('[DisplayRoute] Supabase prayer fallback failed:', fallbackError);
    return { prayerData: null, prayerConfig: null };
  }
}

function DisplayPageContent({ displayId }: DisplayPageContentProps) {

  const [state, setState] = useState<DisplayPageState>({
    config: null,
    prayerTimes: null,
    prayerTimeConfig: null,
    isLoading: true,
    error: null,
    lastConfigUpdate: null,
  });

  const { state: offlineState, actions: offlineActions } = useOffline();

  useEffect(() => {
    loadDisplayData();
  }, [displayId]);

  const loadDisplayData = useCallback(
    async (silentRefresh = false) => {
      if (!silentRefresh) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const promises = [];

        if (offlineState.networkStatus.isOnline) {
          promises.push(
            fetchDisplayConfigWithFallback(displayId)
              .then(config => {
                offlineActions.setCachedData('config', config);
                return { type: 'config', data: config };
              })
              .catch(error => {
                console.error('Failed to load config:', error);
                const cachedConfig = offlineActions.getCachedData('config');
                return { type: 'config', data: cachedConfig };
              }),
          );

          promises.push(
            fetchPrayerTimesWithFallback(displayId)
              .then(({ prayerData, prayerConfig }) => {
                offlineActions.setCachedData('prayerTimes', prayerData);
                offlineActions.setCachedData('prayerTimeConfig', prayerConfig);
                return {
                  type: 'prayer',
                  data: prayerData,
                  config: prayerConfig,
                };
              })
              .catch(async (error) => {
                console.error('Failed to load prayer times:', error);

                const currentZoneCode = readZoneSessionState()?.zone_code;

                if (currentZoneCode) {
                  try {
                    const fallbackTimes = await jakimFallbackService.getPrayerTimes(currentZoneCode);
                    if (fallbackTimes) {
                      const now = new Date().toISOString();
                      const prayerData: PrayerTimes = {
                        id: `fallback-${currentZoneCode}-${fallbackTimes.date}`,
                        masjid_id: `zone-${currentZoneCode}`,
                        prayer_date: fallbackTimes.date,
                        fajr_time: fallbackTimes.fajr,
                        sunrise_time: fallbackTimes.sunrise || '00:00',
                        dhuhr_time: fallbackTimes.dhuhr,
                        asr_time: fallbackTimes.asr,
                        maghrib_time: fallbackTimes.maghrib,
                        isha_time: fallbackTimes.isha,
                        source: 'CACHED_FALLBACK',
                        fetched_at: now,
                        created_at: now,
                        updated_at: now,
                      };

                      const fallbackConfig = {
                        zone_code: currentZoneCode,
                        location_name: currentZoneCode,
                        show_seconds: false,
                        highlight_current_prayer: true,
                        next_prayer_countdown: true,
                        adjustments: {
                          fajr: 0,
                          sunrise: 0,
                          dhuhr: 0,
                          asr: 0,
                          maghrib: 0,
                          isha: 0,
                        },
                      };

                      offlineActions.setCachedData('prayerTimes', prayerData);
                      offlineActions.setCachedData('prayerTimeConfig', fallbackConfig);

                      return {
                        type: 'prayer',
                        data: prayerData,
                        config: fallbackConfig,
                      };
                    }
                  } catch (fallbackError) {
                    console.error('JAKIM fallback failed:', fallbackError);
                  }
                }

                const cachedPrayerTimes = offlineActions.getCachedData('prayerTimes');
                const cachedPrayerConfig = offlineActions.getCachedData('prayerTimeConfig');
                return {
                  type: 'prayer',
                  data: cachedPrayerTimes,
                  config: cachedPrayerConfig,
                };
              }),
          );
        } else {
          const cachedConfig = offlineActions.getCachedData('config');
          const cachedPrayerTimes = offlineActions.getCachedData('prayerTimes');
          const cachedPrayerConfig = offlineActions.getCachedData('prayerTimeConfig');

          promises.push(
            Promise.resolve({ type: 'config', data: cachedConfig }),
            Promise.resolve({
              type: 'prayer',
              data: cachedPrayerTimes,
              config: cachedPrayerConfig,
            }),
          );
        }

        const results = await Promise.allSettled(promises);

        let newConfig: DisplayConfig | null = null;
        let newPrayerTimes: PrayerTimes | null = null;
        let newPrayerTimeConfig: any | null = null;

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
          config: newConfig || prev.config,
          prayerTimes: newPrayerTimes || prev.prayerTimes,
          prayerTimeConfig: newPrayerTimeConfig || prev.prayerTimeConfig,
          isLoading: false,
          error: null,
          lastConfigUpdate: new Date(),
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load display data';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [displayId, offlineState.networkStatus.isOnline, offlineActions],
  );

  useEffect(() => {
    import('@/lib/services/enhanced-supabase').then(({ EnhancedSupabaseService }) => {
      const supabaseService = new EnhancedSupabaseService();

      const unsubscribeDisplay = supabaseService.subscribeToDisplayChanges(displayId, () => {
        loadDisplayData(true);
      });

      const unsubscribeContent = supabaseService.subscribeToContentChanges(displayId, () => {
        loadDisplayData(true);
      });

      const unsubscribeCommands = supabaseService.subscribeToDisplayCommands(displayId, (command) => {
        switch (command) {
          case 'hard_reload':
            supabaseService.clearAllCaches();
            offlineActions.setCachedData('config', null);
            offlineActions.setCachedData('prayerTimes', null);
            offlineActions.setCachedData('prayerTimeConfig', null);
            window.location.reload();
            break;
          case 'soft_reload':
            loadDisplayData(true);
            break;
          case 'clear_cache':
            supabaseService.clearAllCaches();
            offlineActions.setCachedData('config', null);
            offlineActions.setCachedData('prayerTimes', null);
            offlineActions.setCachedData('prayerTimeConfig', null);
            loadDisplayData(false);
            break;
          default:
            break;
        }
      });

      return () => {
        unsubscribeDisplay();
        unsubscribeContent();
        unsubscribeCommands();
      };
    }).catch(error => {
      console.error('[DisplayRoute] Failed to setup real-time subscriptions:', error);
    });
  }, [displayId, loadDisplayData, offlineActions]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDisplayData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [displayId, loadDisplayData]);

  const handleConfigUpdate = useCallback((newConfig: DisplayConfig) => {
    setState(prev => ({
      ...prev,
      config: newConfig,
      lastConfigUpdate: new Date(),
    }));
    offlineActions.setCachedData('config', newConfig);
  }, [offlineActions]);

  const handleError = useCallback((error: Error, component?: string) => {
    console.error(`Error in ${component || 'DisplayPage'}:`, error);
    if (error.message.includes('network') || error.message.includes('fetch')) {
      setState(prev => ({
        ...prev,
        error: `Network error: ${error.message}`,
      }));
    }
  }, []);

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

  if (!state.config) {
    return (
      <FallbackContent
        message="Display configuration unavailable"
        showRetryButton={true}
      />
    );
  }

  return (
    <div
      className={`
        h-screen w-screen overflow-hidden relative
        ${state.config.orientation === 'portrait' ? 'portrait' : 'landscape'}
      `}
      style={{ backgroundColor: '#000000' }}
    >
      <ContentCarousel
        displayId={displayId}
        config={{
          carouselInterval: state.config.carousel_interval,
          contentTransitionType: state.config.content_transition_type as 'fade' | 'slide' | 'zoom' | 'none',
          maxContentItems: state.config.max_content_items,
        }}
        onContentChange={(content) => {
          console.log('Content changed:', content?.title);
        }}
        onError={(error) => handleError(error, 'ContentCarousel')}
        className="h-full w-full"
        showDebugInfo={state.config.show_debug_info}
      />

      {state.prayerTimes && state.prayerTimeConfig && state.config.prayer_time_position !== 'hidden' && (
        <PrayerTimesOverlay
          key={`prayer-times-${state.config.prayer_time_position}-${state.config.prayer_time_layout}-${state.config.prayer_time_font_size}`}
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

      {state.config.show_debug_info && (
        <DisplayStatus
          displayId={displayId}
          showDebugInfo={true}
          autoRefresh={true}
          refreshInterval={state.config.heartbeat_interval}
          className="z-30"
        />
      )}

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

      <ClientOnly fallback={null}>
        <BlackScreenOverlay
          config={{
            enabled: state.config.black_screen_enabled ?? false,
            scheduleType: (state.config.black_screen_schedule_type as 'daily' | 'weekly') || 'daily',
            startTime: state.config.black_screen_start_time || null,
            endTime: state.config.black_screen_end_time || null,
            days: (state.config.black_screen_days || []) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
            message: state.config.black_screen_message || null,
            showClock: state.config.black_screen_show_clock ?? true,
          }}
        />
      </ClientOnly>
    </div>
  );
}

interface DisplayScreenProps {
  displayId: string;
}

function DisplayScreen({ displayId }: DisplayScreenProps) {
  const hasValidDisplayId = Boolean(displayId && typeof displayId === 'string');

  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    if (!hasValidDisplayId) {
      return;
    }

    const loadDebugSetting = async () => {
      try {
        const cachedConfig = localStorage.getItem(`display_${displayId}_config`);
        if (cachedConfig) {
          const config = JSON.parse(cachedConfig);
          setShowDebugInfo(config.data?.show_debug_info || false);
        } else {
          const config = await fetchDisplayConfigWithFallback(displayId);
          setShowDebugInfo(config?.show_debug_info || false);
        }
      } catch (error) {
        console.error('Failed to load debug setting:', error);
        setShowDebugInfo(false);
      }
    };

    loadDebugSetting();
  }, [displayId, hasValidDisplayId]);

  if (!hasValidDisplayId) {
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

  return (
    <OfflineHandler
      displayId={displayId}
      maxCacheAge={24}
      maxRetries={5}
      retryDelay={30}
      enableFallbackContent={true}
      showDebugInfo={showDebugInfo}
    >
      <DisplayPageContent displayId={displayId} />
    </OfflineHandler>
  );
}

export function DisplayRoute() {
  const params = useParams();
  const displayId = params.id as string;

  return <DisplayScreen displayId={displayId} />;
}

export function DisplayPage({ displayId }: DisplayScreenProps) {
  return <DisplayScreen displayId={displayId} />;
}

export default DisplayRoute;