'use client';

import { useRouter } from 'next/navigation';
import { PhotoForm } from '@/components/onboarding/photo-form';

export default function PhotoPage() {
  const router = useRouter();
  const advance = () => {
    // Stage 5 (styling preferences) does not exist yet. Return to welcome.
    router.push('/');
  };
  return <PhotoForm onContinue={advance} onSkip={advance} />;
}
