import dynamic from 'next/dynamic';

const OnboardingFlow = dynamic(() => import('../../components/OnboardingFlow'), { ssr: false });

export default function OnboardingPage() {
  return <OnboardingFlow />;
} 