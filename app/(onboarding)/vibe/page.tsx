'use client';

import { useRouter } from 'next/navigation';
import { VibeForm } from '@/components/onboarding/vibe-form';

export default function VibePage() {
  const router = useRouter();
  return (
    <VibeForm
      onContinue={() => {
        router.push('/photo');
      }}
    />
  );
}
