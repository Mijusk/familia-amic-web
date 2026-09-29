import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible_Next, Nunito } from "next/font/google";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import "../globals.css";

// Atkinson Hyperlegible está diseñada para personas con baja visión.
const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});
// Nunito, redondeada y cercana, solo para títulos.
const display = Nunito({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-[17px] leading-relaxed">
        <SiteHeader lang={lang} dict={dict} />
        <main id="contingut" className="flex-1">
          {children}
        </main>
        <SiteFooter lang={lang} dict={dict} />
        <WhatsAppButton label={dict.nav.whatsapp} />
      </body>
    </html>
  );
}
