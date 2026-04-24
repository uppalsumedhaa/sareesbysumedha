'use client';

import { useRouter } from 'next/navigation';
import { OccasionForm } from '@/components/onboarding/occasion-form';

export default function OccasionPage() {
  const router = useRouter();
  return (
    <OccasionForm
      onContinue={() => {
        // Stage 2 (climate) doesn't exist yet — send back to welcome for now.
        router.push('/');
      }}
    />
  );
}
