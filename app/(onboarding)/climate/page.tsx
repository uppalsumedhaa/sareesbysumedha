'use client';

import { useRouter } from 'next/navigation';
import { ClimateForm } from '@/components/onboarding/climate-form';

export default function ClimatePage() {
  const router = useRouter();
  return (
    <ClimateForm
      onContinue={() => {
        // Stage 3 (vibe) doesn't exist yet. Send back to welcome for now.
        router.push('/');
      }}
    />
  );
}
