'use client';

import { useRouter } from 'next/navigation';
import { OccasionForm } from '@/components/onboarding/occasion-form';

export default function OccasionPage() {
  const router = useRouter();
  return (
    <OccasionForm
      onContinue={() => {
        router.push('/climate');
      }}
    />
  );
}
