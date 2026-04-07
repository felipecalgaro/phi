'use client';

import { AspectRatio } from '../ui/aspect-ratio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getResponseDataSchema } from '@/utils/get-response-data-object';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

type LessonVideoPlayerProps = {
  slug: string;
  initialSignedUrl: string;
  initialExpiresAt: number;
};

const signedVideoUrlResponseSchema = getResponseDataSchema(
  z.object({
    url: z.url(),
    expiresAt: z.number(),
  }),
);

const REFRESH_BUFFER_MS = 60_000;

export function LessonVideoPlayer({
  slug,
  initialSignedUrl,
  initialExpiresAt,
}: LessonVideoPlayerProps) {
  const requestIdRef = useRef<string>(crypto.randomUUID());
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const [videoSrc, setVideoSrc] = useState(initialSignedUrl);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [hasFatalError, setHasFatalError] = useState(false);

  const { refetch: refetchSignedVideoUrl } = useQuery({
    queryKey: ['lesson-video-url', slug],
    enabled: false,
    retry: false,
    queryFn: async () => {
      let parsedResponse: z.infer<typeof signedVideoUrlResponseSchema>;
      try {
        const response = await fetch(`/api/lessons/${slug}/video-url`, {
          method: 'GET',
          cache: 'no-store',
        });

        parsedResponse = signedVideoUrlResponseSchema.parse(await response.json());
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            request_id: requestIdRef.current,
            lesson_slug: slug,
            error_type: 'video_url_fetch_error',
          },
        });

        throw new Error('Internal server error');
      }

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error);
      }

      return parsedResponse.data;
    },
  });

  const clearRefreshTimer = useCallback(() => {
    if (!refreshTimerRef.current) {
      return;
    }

    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = null;
  }, []);

  const swapVideoSourcePreservingTime = useCallback(async (
    nextVideoSrc: string,
    nextExpiresAt: number,
  ) => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      setVideoSrc(nextVideoSrc);
      setExpiresAt(nextExpiresAt);
      return;
    }

    const currentTime = videoElement.currentTime;
    const wasPaused = videoElement.paused;

    await new Promise<void>((resolve) => {
      const handleLoadedMetadata = async () => {
        if (currentTime > 0) {
          try {
            videoElement.currentTime = currentTime;
          } catch { }
        }

        if (!wasPaused) {
          try {
            await videoElement.play();
          } catch { }
        }

        resolve();
      };

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, {
        once: true,
      });

      setVideoSrc(nextVideoSrc);
      setExpiresAt(nextExpiresAt);
    });
  }, []);

  const refreshVideoUrl = useCallback(async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      const response = await refetchSignedVideoUrl();

      if (response.error) {
        if (response.error.message === 'Unauthenticated') {
          router.push('/acing-aufnahmetest/login');
          return;
        }

        if (response.error.message === 'Subscription required') {
          router.push('/acing-aufnahmetest/purchase');
          return;
        }

        Sentry.captureException(response.error, {
          tags: {
            request_id: requestIdRef.current,
            lesson_slug: slug,
            error_type: 'video_url_refresh_error',
          },
        });

        setHasFatalError(true);
        return;
      }

      if (!response.data) {
        Sentry.captureException(new Error('video_url_response_missing_data'), {
          tags: {
            request_id: requestIdRef.current,
            lesson_slug: slug,
            error_type: 'video_url_refresh_error',
          },
        });

        setHasFatalError(true);
        return;
      }

      await swapVideoSourcePreservingTime(
        response.data.url,
        response.data.expiresAt,
      );
      setHasFatalError(false);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          request_id: requestIdRef.current,
          lesson_slug: slug,
          error_type: 'video_url_refresh_error',
        },
      });

      setHasFatalError(true);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refetchSignedVideoUrl, router, slug, swapVideoSourcePreservingTime]);

  useEffect(() => {
    clearRefreshTimer();

    const msUntilRefresh = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 5_000);

    refreshTimerRef.current = setTimeout(() => {
      void refreshVideoUrl();
    }, msUntilRefresh);

    return clearRefreshTimer;
  }, [clearRefreshTimer, expiresAt, refreshVideoUrl]);

  if (hasFatalError) {
    return (
      <div className='bg-black/80 aspect-video w-full flex items-center justify-center'>
        <p className='text-white font-medium'>Failed to load video</p>
      </div>
    );
  }

  return (
    <AspectRatio ratio={16 / 9} className='bg-black/80 w-full'>
      <video
        ref={videoRef}
        disablePictureInPicture
        controlsList='nodownload noremoteplayback'
        className='size-full'
        controls
        playsInline
        src={videoSrc}
        preload='metadata'
        onError={() => {
          Sentry.captureException(new Error('video_playback_error'), {
            tags: {
              request_id: requestIdRef.current,
              lesson_slug: slug,
              error_type: 'video_playback_error',
            },
            extra: {
              mediaErrorCode: videoRef.current?.error?.code,
            },
          });

          void refreshVideoUrl();
        }}
      />
    </AspectRatio>
  );
}
