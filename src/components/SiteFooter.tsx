import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Terms and Privacy Notice", href: "/terms" },
  { label: "Send us feedback", href: "/feedback" },
  { label: "Help", href: "/help" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--pv-base)] p-6 text-center text-[15px] leading-5 text-[var(--pv-footer-text)]">
      <div className="mb-[14px] flex justify-center">
        <Image
          src="/images/brand/prime-video-logo.png"
          alt="Prime Video"
          width={107}
          height={32}
          className="h-8 w-[107px] object-contain"
        />
      </div>
      <ul>
        {links.map((l) => (
          <li key={l.href} className="inline-block p-1">
            <Link
              href={l.href}
              className="text-[var(--pv-link)] transition-colors duration-200 ease-in-out hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li className="inline-block p-1">
          © 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates
        </li>
      </ul>
    </footer>
  );
}
