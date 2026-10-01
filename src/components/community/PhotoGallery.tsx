"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  blurDataURL: string | null;
  alt: string;
  altLang?: string;
  caption: string | null;
  captionLang?: string;
};

export type GalleryGroup = { id: string; title: string; items: GalleryItem[] };

type Copy = { open: string; close: string; previous: string; next: string; counter: string };

/** Same-origin, resized URL for the no-JavaScript "view larger" link. */
const largeUrl = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;

/**
 * Photo grid with an accessible viewer. Each thumbnail is a real link to a
 * large version, so it works without JavaScript; with JavaScript it opens a
 * native modal <dialog> (focus is trapped and Escape closes it), with
 * previous/next buttons and arrow keys. Focus returns to the thumbnail.
 */
export function PhotoGallery({ groups, copy }: { groups: GalleryGroup[]; copy: Copy }) {
  const all = groups.flatMap((g) => g.items);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const show = useCallback(
    (i: number) => {
      setIndex(((i % all.length) + all.length) % all.length);
    },
    [all.length],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
  }, [index]);

  const close = () => dialog.current?.close();

  const onClose = () => {
    setIndex(null);
    opener.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (index === null) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(index - 1);
    }
  };

  const current = index !== null ? all[index] : undefined;

  return (
    <>
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`photos-${g.id}`} className="mt-14 first:mt-0">
          <h2 id={`photos-${g.id}`} className="display-md">
            {g.title}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {g.items.map((p) => {
              const i = all.indexOf(p);
              return (
                <li key={p.id}>
                  <a
                    href={largeUrl(p.src)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      opener.current = e.currentTarget;
                      show(i);
                    }}
                    className="group block overflow-hidden rounded-[var(--radius-card)] bg-sand focus-visible:outline-offset-4"
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      lang={p.altLang}
                      width={p.width}
                      height={p.height}
                      sizes="(min-width: 1024px) 380px, 50vw"
                      className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      {...(p.blurDataURL ? { placeholder: "blur" as const, blurDataURL: p.blurDataURL } : {})}
                    />
                    <span className="sr-only">{copy.open}</span>
                  </a>
                  {p.caption ? (
                    <p className="mt-2 text-sm text-ink-soft" lang={p.captionLang}>
                      {p.caption}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <dialog
        ref={dialog}
        onClose={onClose}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === dialog.current) close();
        }}
        aria-label={current ? copy.counter.replace("{n}", String((index ?? 0) + 1)).replace("{total}", String(all.length)) : undefined}
        className="m-auto max-h-[94vh] w-[min(96vw,1100px)] rounded-[var(--radius-card)] bg-ink p-0 text-cream backdrop:bg-ink/80"
      >
        {current ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm text-cream/80" aria-live="polite">
                {copy.counter.replace("{n}", String((index ?? 0) + 1)).replace("{total}", String(all.length))}
              </p>
              <button type="button" onClick={close} className="inline-flex min-h-11 items-center rounded-full bg-cream/10 px-4 text-sm font-semibold hover:bg-cream/20">
                {copy.close}
              </button>
            </div>
            <div className="relative flex items-center justify-center bg-black/30">
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                lang={current.altLang}
                width={current.width}
                height={current.height}
                sizes="(min-width: 1100px) 1100px, 96vw"
                className="h-auto max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <button type="button" onClick={() => show((index ?? 0) - 1)} className="inline-flex min-h-11 items-center rounded-full bg-cream/10 px-4 text-sm font-semibold hover:bg-cream/20">
                <span aria-hidden="true">←</span>&nbsp;{copy.previous}
              </button>
              <p className="flex-1 text-center text-sm text-cream/85" lang={current.captionLang}>
                {current.caption ?? ""}
              </p>
              <button type="button" onClick={() => show((index ?? 0) + 1)} className="inline-flex min-h-11 items-center rounded-full bg-cream/10 px-4 text-sm font-semibold hover:bg-cream/20">
                {copy.next}&nbsp;<span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
