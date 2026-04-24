'use client';

import { useRouter } from 'next/navigation';
import { VibeForm } from '@/components/onboarding/vibe-form';

export default function VibePage() {
  const router = useRouter();
  return (
    <VibeForm
      onContinue={() => {
        // Stage 4 (photo) doesn't exist yet. Send back to welcome for now.
        router.push('/');
      }}
    />
  );
}
