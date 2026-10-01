import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { HeroStar } from "@/components/three/HeroStar";
import type { Locale } from "@/i18n/config";

type Props = {
  locale?: Locale;
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Star point to highlight (service index); -1 = all. `null` hides the star. */
  star?: number | null;
  children?: ReactNode;
};

/** Standard hero for every secondary page: breadcrumbs, headline, and the STARS star. */
export function PageHero({ locale = "en", crumbs, eyebrow, title, lede, actions, star = -1, children }: Props) {
  return (
    <header className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      {/* Soft light beside the title on wide screens; the background stays blue. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-10 hidden h-[34rem] w-[34rem] rounded-full bg-white/60 blur-3xl lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/2 h-[26rem] w-[26rem] rounded-full bg-azure/10 blur-3xl" />
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-12">
        <div className={star === null ? "lg:col-span-12" : "lg:col-span-8"}>
          <Breadcrumbs items={crumbs} locale={locale} />
          <p className="eyebrow mt-8">{eyebrow}</p>
          <h1 className="display-xl mt-5 max-w-4xl">{title}</h1>
          {lede ? <div className="lede mt-6 max-w-3xl">{lede}</div> : null}
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
          {children}
        </div>
        {star === null ? null : (
          <div className="hidden lg:col-span-4 lg:block">
            <HeroStar highlight={star} className="mx-auto aspect-square w-full max-w-[380px]" />
          </div>
        )}
      </div>
    </header>
  );
}
