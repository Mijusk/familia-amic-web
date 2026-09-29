import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const legal = [
    { href: `/${lang}/legal/avis-legal`, label: dict.legal.pages["avis-legal"].title },
    { href: `/${lang}/legal/privacitat`, label: dict.legal.pages.privacitat.title },
    { href: `/${lang}/legal/cookies`, label: dict.legal.pages.cookies.title },
    { href: `/${lang}/legal/accessibilitat`, label: dict.legal.pages.accessibilitat.title },
  ];
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <h2 className="font-display text-lg font-extrabold">{dict.footer.contact}</h2>
          <address className="mt-3 space-y-1 not-italic text-muted">
            <p>{site.address}</p>
            <p>
              <a href={`mailto:${site.email}`} className="text-foreground underline underline-offset-4">
                {site.email}
              </a>
            </p>
            {site.phones.map((phone) => (
              <p key={phone}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                  {phone}
                </a>
              </p>
            ))}
          </address>
        </div>
        <div>
          <h2 className="font-display text-lg font-extrabold">{dict.footer.follow}</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                Instagram
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-extrabold">{dict.footer.legal}</h2>
          <ul className="mt-3 space-y-1">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} {site.name} · {dict.nav.tagline}. {dict.footer.rights}
      </p>
    </footer>
  );
}
