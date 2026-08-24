import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/common/Card';
import Heading from '@/components/common/Heading';
import Text from '@/components/common/Text';
import { KYC_LOGO_SRC } from '@/constants/kycConstants';

export const metadata = { title: 'Dashboard — Allvest (Demo)' };

/**
 * Placeholder landing spot for the "Go to Dashboard" CTA. The real app has a
 * full dashboard; this demo only needs somewhere for the flow to end.
 */
export default function DashboardPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4 dark:bg-homepage-authBg">
      <Card bg="gradient" rounded="2xl" padding="lg" border="default" className="w-full max-w-md text-center">
        <Image
          src={KYC_LOGO_SRC}
          alt="Allvest"
          width={256}
          height={59}
          className="mx-auto mb-5 h-7 w-auto"
        />
        <Heading as="h1" size="base" font="sora" weight="semibold" className="text-[16px] md:text-[16px]">
          Dashboard placeholder
        </Heading>
        <Text className="mt-2 text-[14px]" align="center" color="text-gray-600 dark:text-homepage-lightWhite">
          The KYC demo ends here. The production dashboard lives in the main
          application.
        </Text>
        <Link
          href="/kyc"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-[14px] font-bold text-black transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Restart KYC demo
        </Link>
      </Card>
    </main>
  );
}
