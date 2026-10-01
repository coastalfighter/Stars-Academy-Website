import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { ButtonLink } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";

export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).notFound;
  const { site } = getContent(locale);
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-32 pb-20 text-center">
      <StarMark className="h-16 w-16" />
      <h1 className="display-lg mt-8">{t.title}</h1>
      <p className="lede mt-4 max-w-xl">
        {t.body}{" "}
        <a href={site.phone.href} className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
          {site.phone.display}
        </a>
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href={href(locale, "home")} size="lg">
          {t.home}
        </ButtonLink>
        <ButtonLink href={href(locale, "contact")} size="lg" variant="ghost">
          {t.contact}
        </ButtonLink>
      </div>
    </div>
  );
}
