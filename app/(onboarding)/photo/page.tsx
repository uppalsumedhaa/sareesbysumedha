'use client';

import { useRouter } from 'next/navigation';
import { PhotoForm } from '@/components/onboarding/photo-form';

export default function PhotoPage() {
  const router = useRouter();
  const advance = () => router.push('/styling');
  return <PhotoForm onContinue={advance} onSkip={advance} />;
}
