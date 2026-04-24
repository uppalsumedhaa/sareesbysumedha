'use client';

import { useRouter } from 'next/navigation';
import { StylingForm } from '@/components/onboarding/styling-form';

export default function StylingPage() {
  const router = useRouter();
  return <StylingForm onContinue={() => router.push('/results')} />;
}
