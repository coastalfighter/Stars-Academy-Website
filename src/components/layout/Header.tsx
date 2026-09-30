"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { primaryNav, site } from "@/content/site";
import { services } from "@/content/services";
import { ButtonLink } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";
import { CalmToggle } from "./CalmToggle";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: close on Escape, trap focus, lock page scroll.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="hidden bg-ink text-cream/90 md:block">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <p>Pediatric developmental day treatment · Batesville, Arkansas</p>
          <p className="flex items-center gap-5">
            <span>{site.hours.display}</span>
            <a className="font-semibold text-gold underline-offset-4 hover:underline" href={site.phone.href}>
              {site.phone.display}
            </a>
          </p>
        </div>
      </div>

      <div
        className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled || open ? "bg-cream/85 shadow-[0_1px_0_rgb(23_21_58/0.08)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <nav aria-label="Primary" className="container-x flex h-18 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg" onClick={close}>
            <StarMark className="h-10 w-10" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight">STARS</span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-muted">Academy</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Wrappers own the responsive visibility so it can't be overridden by
                the components' own display classes. */}
            <div className="hidden sm:block">
              <CalmToggle />
            </div>
            <div className="hidden sm:block">
              <ButtonLink href="/schedule-a-tour" variant="primary">
                Schedule a tour
              </ButtonLink>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/70 lg:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                {open ? (
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="h-[calc(100dvh-4.5rem)] overflow-y-auto bg-cream/95 backdrop-blur-xl lg:hidden"
      >
        <div className="container-x flex flex-col gap-8 py-8">
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="block rounded-2xl px-3 py-3 font-display text-2xl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <p className="eyebrow mb-3">Services</p>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-ink-soft hover:bg-ink/5"
                  >
                    <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: s.color }} />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <ButtonLink href="/schedule-a-tour" onClick={close} size="lg">
              Schedule a tour
            </ButtonLink>
            <a href={site.phone.href} className="text-center font-semibold text-teal-deep">
              Call {site.phone.display}
            </a>
            <CalmToggle className="self-center" />
          </div>
        </div>
      </div>
    </header>
  );
}
