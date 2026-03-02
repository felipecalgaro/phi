import { verifySession } from '@/lib/dal';
import { env } from '@/lib/env';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { redirect } from 'next/navigation';
import { AspectRatio } from '../ui/aspect-ratio';

interface LessonPlayerProps {
  slug: string;
}

async function getVideoUrl(slug: string) {
  const { isAuthenticated, userRole } = await verifySession();

  if (!isAuthenticated) {
    redirect("/acing-aufnahmetest/login");
  }

  if (userRole === "BASIC") {
    redirect("/acing-aufnahmetest/purchase");
  }

  const distributionDomain = env.CLOUDFRONT_DOMAIN;
  const keyPairId = env.CLOUDFRONT_PUBLIC_KEY;
  const privateKey = env.CLOUDFRONT_PRIVATE_KEY;

  const videoUrl = `https://${distributionDomain}/videos/${slug}.mp4`;

  try {
    const signedUrl = getSignedUrl({
      url: videoUrl,
      keyPairId,
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    return signedUrl
  } catch (error) {
    console.log(error);
    return
  }
}

export async function LessonPlayer({ slug }: LessonPlayerProps) {
  const signedUrl = await getVideoUrl(slug);

  if (!signedUrl) {
    return (
      <div className='bg-black/80 aspect-video w-full flex items-center justify-center'>
        <p className="text-white font-medium">Failed to load video</p>
      </div>
    )
  }

  return (
    <AspectRatio ratio={16 / 9} className="bg-black/80 w-full">
      <video
        disablePictureInPicture
        controlsList='nodownload noremoteplayback'
        className='size-full'
        controls
        playsInline
        src={signedUrl}
        preload='metadata'
      />
    </AspectRatio>
  );
}
