/**
 * ContentCarousel Component
 * 
 * Main carousel component for cycling through display content with smooth transitions,
 * sponsorship overlays, and touch/click interaction handling for TV displays
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DisplayContent, ContentType, SponsorshipTier } from '@masjid-suite/shared-types';
import ContentViewer from './ContentViewer';
import SponsorshipOverlay from './SponsorshipOverlay';

// Extended content type with sponsor info from API response
interface DisplayContentWithSponsor extends DisplayContent {
  sponsor_name?: string;
}

interface ContentCarouselProps {
  displayId: string;
  config: {
    carouselInterval: number; // seconds
    contentTransitionType: 'fade' | 'slide' | 'zoom' | 'none';
    maxContentItems: number;
    showSponsorshipAmounts: boolean;
    sponsorshipTierColors: {
      bronze: string;
      silver: string;
      gold: string;
      platinum: string;
    };
  };
  onContentChange?: (content: DisplayContent | null) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface ContentState {
  content: DisplayContentWithSponsor[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export function ContentCarousel({
  displayId,
  config,
  onContentChange,
  onError,
  className = ''
}: ContentCarouselProps) {
  const [state, setState] = useState<ContentState>({
    content: [],
    currentIndex: 0,
    isLoading: true,
    error: null,
    lastFetch: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Fetch content from API
  const fetchContent = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/displays/${displayId}/content?status=active&limit=${config.maxContentItems}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch content');
      }

      const activeContent = data.data.filter((item: DisplayContent) => {
        const now = new Date();
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        return startDate <= now && now <= endDate && item.status === 'active';
      });

      setState(prev => ({
        ...prev,
        content: activeContent,
        isLoading: false,
        error: null,
        lastFetch: new Date(),
        // Reset to first item if current index is out of bounds
        currentIndex: prev.currentIndex >= activeContent.length ? 0 : prev.currentIndex
      }));

      // Notify parent of content change
      if (activeContent.length > 0) {
        onContentChange?.(activeContent[0]);
      } else {
        onContentChange?.(null);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [displayId, config.maxContentItems, onContentChange, onError]);

  // Navigate to next content item
  const nextContent = useCallback(() => {
    setState(prev => {
      if (prev.content.length === 0) return prev;
      
      const newIndex = (prev.currentIndex + 1) % prev.content.length;
      const newContent = prev.content[newIndex];
      
      onContentChange?.(newContent);
      
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  }, [onContentChange]);

  // Navigate to previous content item
  const previousContent = useCallback(() => {
    setState(prev => {
      if (prev.content.length === 0) return prev;
      
      const newIndex = prev.currentIndex === 0 ? prev.content.length - 1 : prev.currentIndex - 1;
      const newContent = prev.content[newIndex];
      
      onContentChange?.(newContent);
      
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  }, [onContentChange]);

  // Set up automatic content rotation
  useEffect(() => {
    if (state.content.length <= 1 || config.carouselInterval <= 0) {
      return;
    }

    intervalRef.current = setInterval(nextContent, config.carouselInterval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [nextContent, config.carouselInterval, state.content.length]);

  // Fetch content on mount and periodically refresh
  useEffect(() => {
    fetchContent();

    // Refresh content every 5 minutes
    const refreshInterval = setInterval(fetchContent, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchContent]);

  // Touch event handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        previousContent();
      } else {
        nextContent();
      }
    }

    touchStartRef.current = null;
  }, [nextContent, previousContent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousContent();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextContent();
          break;
        case ' ':
          e.preventDefault();
          nextContent();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextContent, previousContent]);

  // Get transition classes based on config
  const getTransitionClasses = () => {
    switch (config.contentTransitionType) {
      case 'fade':
        return 'transition-opacity duration-1000 ease-in-out';
      case 'slide':
        return 'transition-transform duration-700 ease-in-out';
      case 'zoom':
        return 'transition-all duration-800 ease-in-out';
      case 'none':
        return '';
      default:
        return 'transition-opacity duration-1000 ease-in-out';
    }
  };

  // Loading state
  if (state.isLoading && state.content.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && state.content.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-red-900 ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-300 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Content Load Error</h2>
          <p className="text-red-200 text-lg mb-4">{state.error}</p>
          <button
            onClick={fetchContent}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No content state
  if (state.content.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-blue-900 ${className}`}>
        <div className="text-center p-8">
          <div className="text-blue-300 text-6xl mb-4">📺</div>
          <h2 className="text-white text-2xl font-bold mb-2">No Active Content</h2>
          <p className="text-blue-200 text-lg">No content is currently scheduled for display</p>
        </div>
      </div>
    );
  }

  const currentContent = state.content[state.currentIndex];
  const transitionClasses = getTransitionClasses();

  return (
    <div
      ref={containerRef}
      className={`relative h-full overflow-hidden bg-black ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content display */}
      <div className={`relative h-full ${transitionClasses}`}>
        <ContentViewer
          content={currentContent}
          onError={onError}
          className="h-full"
        />
        
        {/* Sponsorship overlay */}
        {currentContent.sponsorship_tier && (
          <SponsorshipOverlay
            content={currentContent}
            showAmount={config.showSponsorshipAmounts}
            className="absolute bottom-4 right-4"
          />
        )}
      </div>

      {/* Navigation indicators */}
      {state.content.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {state.content.map((_, index) => (
            <button
              key={index}
              onClick={() => setState(prev => ({ ...prev, currentIndex: index }))}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === state.currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to content ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content info overlay (for debugging/development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-sm">
          <div>Content: {state.currentIndex + 1} of {state.content.length}</div>
          <div>Title: {currentContent.title}</div>
          <div>Type: {currentContent.type}</div>
          {currentContent.sponsorship_tier && (
            <div>Tier: {currentContent.sponsorship_tier}</div>
          )}
        </div>
      )}

      {/* Refresh indicator */}
      {state.isLoading && state.content.length > 0 && (
        <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm">
          Refreshing...
        </div>
      )}
    </div>
  );
}

export default ContentCarousel;