import { site } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer id="contacte" className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6">
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
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-8 text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
      </p>
    </footer>
  );
}
