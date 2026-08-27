import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentCarousel } from '../ContentCarousel';

describe('ContentCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('caps a YouTube slide at 300 seconds even when its assigned duration is longer', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        data: [
          {
            id: 'video-1',
            title: 'Long YouTube Slide',
            type: 'youtube_video',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            carousel_duration: 600,
            transition_type: 'fade',
            image_display_mode: 'contain',
            display_order: 1,
          },
          {
            id: 'image-2',
            title: 'Next slide',
            type: 'image',
            url: 'https://example.com/image.jpg',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            carousel_duration: 10,
            transition_type: 'fade',
            image_display_mode: 'contain',
            display_order: 2,
          },
        ],
        meta: {
          total: 2,
          next_refresh: new Date().toISOString(),
          carousel_interval: 10,
        },
      }),
    } as any);

    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    render(
      <ContentCarousel
        displayId="display-1"
        config={{
          carouselInterval: 10,
          contentTransitionType: 'fade',
          maxContentItems: 10,
          imageDisplayMode: 'contain',
          imageBackgroundColor: '#000000',
        }}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(screen.getByTestId('content-carousel')).toBeInTheDocument();

    const scheduledDurations = timeoutSpy.mock.calls
      .map((call) => Number(call[1]))
      .filter((value) => Number.isFinite(value));

    expect(scheduledDurations.length).toBeGreaterThan(0);
    expect(Math.max(...scheduledDurations)).toBeLessThanOrEqual(300000);
    expect(scheduledDurations.some((value) => value === 300000)).toBe(true);
  });
});
