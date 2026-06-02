import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from '@/components/UserMenu';
import { Mail } from 'lucide-react';

export function Header() {

  return (
    <header className="border-border sticky top-0 z-50 border-b bg-white" data-testid="header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center" data-testid="link-home">
              <Image
                src="/images/fisapart_logo.png"
                alt="FisApart"
                width={102}
                height={102}
                className="h-[67px] w-auto"
                priority
              />
            </Link>
            {/* Desktop contact link removed - using mobile icon for all breakpoints */}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/contact"
              className="transition-colors p-1 animate-pulse"
              data-testid="link-contact-mobile"
            >
              <Mail className="h-6 w-6 text-blue-600" />
            </Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
