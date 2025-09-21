/**
 * ContentViewer Component
 * 
 * Renders different types of content (image, video, text, event poster)
 * with proper loading states, error handling, and responsive design
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DisplayContent, ContentType } from '@masjid-suite/shared-types';

// Extended content type with sponsor info from API response
interface DisplayContentWithSponsor extends DisplayContent {
  sponsor_name?: string;
}

interface ContentViewerProps {
  content: DisplayContentWithSponsor;
  onError?: (error: Error) => void;
  className?: string;
}

interface ViewerState {
  isLoading: boolean;
  error: string | null;
  imageError: boolean;
  videoError: boolean;
}

export function ContentViewer({ content, onError, className = '' }: ContentViewerProps) {
  const [state, setState] = useState<ViewerState>({
    isLoading: true,
    error: null,
    imageError: false,
    videoError: false
  });

  // Reset state when content changes
  useEffect(() => {
    setState({
      isLoading: true,
      error: null,
      imageError: false,
      videoError: false
    });
  }, [content.id]);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setState(prev => ({ ...prev, error: errorObj.message, isLoading: false }));
    onError?.(errorObj);
  }, [onError]);

  const handleLoadComplete = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false, error: null }));
  }, []);

  const renderImageContent = () => {
    return (
      <div className="relative h-full flex items-center justify-center bg-gray-900">
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-pulse text-white">Loading image...</div>
          </div>
        )}
        <img
          src={content.url}
          alt={content.title}
          className={`max-h-full max-w-full object-contain transition-opacity duration-500 ${
            state.isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoadComplete}
          onError={() => {
            setState(prev => ({ ...prev, imageError: true }));
            handleError(`Failed to load image: ${content.title}`);
          }}
        />
        {state.imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">🖼️</div>
              <p>Image failed to load</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVideoContent = () => {
    // Extract YouTube video ID
    const getYouTubeId = (url: string): string | null => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
<<<<<<< HEAD
      return match && match[1] ? match[1] : null;
=======
      return match ? match[1] : null;
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
    };

    const youtubeId = getYouTubeId(content.url);
    
    if (!youtubeId) {
      handleError('Invalid YouTube URL');
      return (
        <div className="h-full flex items-center justify-center bg-red-900">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">📹</div>
            <p>Invalid video URL</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full bg-black">
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-pulse text-white">Loading video...</div>
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
          title={content.title}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={handleLoadComplete}
          onError={() => {
            setState(prev => ({ ...prev, videoError: true }));
            handleError(`Failed to load video: ${content.title}`);
          }}
        />
        {state.videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">📹</div>
              <p>Video failed to load</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTextContent = () => {
<<<<<<< HEAD
    // Text content loads immediately - mark as loaded
    if (state.isLoading) {
      setTimeout(() => handleLoadComplete(), 0);
    }
=======
    useEffect(() => {
      // Text content loads immediately
      handleLoadComplete();
    }, [handleLoadComplete]);
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)

    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-8 leading-tight">
            {content.title}
          </h1>
          {content.description && (
            <p className="text-white/90 text-xl md:text-2xl leading-relaxed">
              {content.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderEventPoster = () => {
    return (
      <div className="relative h-full flex items-center justify-center bg-gray-900">
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-pulse text-white">Loading poster...</div>
          </div>
        )}
        <div className="relative max-h-full max-w-full">
          <img
            src={content.url}
            alt={content.title}
            className={`max-h-full max-w-full object-contain transition-opacity duration-500 ${
              state.isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoadComplete}
            onError={() => {
              setState(prev => ({ ...prev, imageError: true }));
              handleError(`Failed to load poster: ${content.title}`);
            }}
          />
          {/* Event poster overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-white text-2xl md:text-3xl font-bold">
              {content.title}
            </h2>
            {content.description && (
              <p className="text-white/90 text-lg mt-2">
                {content.description}
              </p>
            )}
          </div>
        </div>
        {state.imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">📅</div>
              <p>Event poster failed to load</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render logic based on content type
  const renderContent = () => {
    switch (content.type) {
      case 'image':
        return renderImageContent();
      case 'youtube_video':
        return renderVideoContent();
      case 'text_announcement':
        return renderTextContent();
      case 'event_poster':
        return renderEventPoster();
      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">❓</div>
              <p>Unsupported content type: {content.type}</p>
            </div>
          </div>
        );
    }
  };

  // Error state
  if (state.error && !state.isLoading) {
    return (
      <div className={`h-full flex items-center justify-center bg-red-900 ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-300 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Content Error</h2>
          <p className="text-red-200 text-lg mb-4">{state.error}</p>
          <div className="text-red-300 text-sm">
            <p>Content ID: {content.id}</p>
            <p>Type: {content.type}</p>
            <p>Title: {content.title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {renderContent()}
      
      {/* Content metadata overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded text-xs max-w-xs">
          <div className="font-semibold">{content.title}</div>
          <div>Type: {content.type}</div>
          <div>Duration: {content.duration}s</div>
          {content.sponsorship_amount > 0 && (
            <div>Sponsorship: RM{content.sponsorship_amount}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentViewer;