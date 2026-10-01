import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { communityCopy } from "@/content/copy/community";
import { getGalleryPhotos } from "@/cms/repository";
import { GALLERY_TOPICS } from "@/cms/schemas";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoGallery, type GalleryGroup } from "@/components/community/PhotoGallery";

export async function PhotosView({ locale }: { locale: Locale }) {
  const t = communityCopy[locale].photos;
  const photos = await getGalleryPhotos(locale);
  const groups: GalleryGroup[] = GALLERY_TOPICS.map((topic) => ({
    id: topic,
    title: t.topics[topic],
    items: photos
      .filter((p) => p.topic === topic)
      .map((p) => ({
        id: p.id,
        src: p.src,
        width: p.width,
        height: p.height,
        blurDataURL: p.blurDataURL,
        alt: p.alt.text,
        altLang: p.alt.lang,
        caption: p.caption?.text ?? null,
        captionLang: p.caption?.lang,
      })),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "photos") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} star={null} />
      <Section tone="paper">
        <PhotoGallery groups={groups} copy={{ open: t.open, close: t.close, previous: t.previous, next: t.next, counter: t.counter }} />
        <div className="mt-14">
          <ButtonLink href={href(locale, "tour")} size="lg" arrow>
            {t.visitCta}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
