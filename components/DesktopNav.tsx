'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/palvelut', label: 'Palvelut', match: '/palvelut' },
  { href: '/tilaukset', label: 'Tilaukset', match: '/tilaukset' },
  { href: '/profiili', label: 'Profiili', match: '/profiili' },
];

/**
 * Top-right navigation links shown on tablet+ viewports (`md:`).
 * On mobile, the equivalent navigation lives in <CustomerTabBar />.
 */
export default function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.match);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-fixla-50 text-fixla-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
