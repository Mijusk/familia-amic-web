import Link from "next/link";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Activity } from "@/lib/activities";
import { scheduleText } from "@/lib/activity-format";
import { Cover } from "@/components/content/cover";

type Props = { lang: string; activity: Activity; t: Dictionary["activities"]; badges: { event: string; weekly: string }; headingLevel?: "h2" | "h3" };

export function ActivityCard({ lang, activity: a, t, badges, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const puntual = a.kind === "puntual";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-brand/10">
      <div className="relative">
        <Cover src={a.image_url} tone={puntual ? "warm" : "mint"} />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${puntual ? "bg-warm-soft text-warm" : "bg-surface text-accent"}`}>
          {puntual ? badges.event : badges.weekly}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-accent">{scheduleText(lang, t, a)}</p>
        <Heading className="mt-1 font-display text-xl font-extrabold leading-snug" lang={a.lang}>
          <Link href={`/${lang}/activitats/${a.slug}`} className="after:absolute after:inset-0">
            {a.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-3 text-muted" lang={a.lang}>
          {a.summary}
        </p>
      </div>
    </article>
  );
}
