'use client';

import { useRouter } from 'next/navigation';
import { ClimateForm } from '@/components/onboarding/climate-form';

export default function ClimatePage() {
  const router = useRouter();
  return (
    <ClimateForm
      onContinue={() => {
        router.push('/vibe');
      }}
    />
  );
}
