/** The STARS star, redrawn from the existing brand mark. */
export function StarMark({ className = "h-9 w-9", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect width="48" height="48" rx="12" fill="#17153a" />
      <path
        d="M24 7.5 28.6 18.6l12 1-9.1 7.9 2.8 11.7L24 33l-10.3 6.2 2.8-11.7-9.1-7.9 12-1Z"
        fill="#f28fe0"
        stroke="#d6418f"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
