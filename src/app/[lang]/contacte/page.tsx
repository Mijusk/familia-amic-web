import type { Metadata } from "next";
import { site } from "@/config/site";
import { loadPage } from "@/i18n/page";
import { getCurrentUser } from "@/lib/auth";
import { ContactForm } from "@/components/content/contact-form";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/contacte">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.contact.title, description: dict.contact.lead };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contacte">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.contact;
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title={t.title} lead={t.lead} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <ContactForm
          lang={lang}
          t={t}
          errors={dict.errors}
          common={dict.common}
          initial={user ? { name: user.profile.full_name, email: user.email, phone: user.profile.phone } : undefined}
        />
        <aside className="space-y-4 rounded-lg border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-extrabold">{t.otherWays}</h2>
          <address className="space-y-2 not-italic">
            <p>{site.address}</p>
            <p>
              <a href={`mailto:${site.email}`} className="font-semibold underline underline-offset-4">
                {site.email}
              </a>
            </p>
            {site.phones.map((phone) => (
              <p key={phone}>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </p>
            ))}
            <p>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                WhatsApp
              </a>
            </p>
          </address>
        </aside>
      </div>
    </div>
  );
}
