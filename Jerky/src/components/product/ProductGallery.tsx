"use client";

import { useEffect, useState } from "react";

export function ProductGallery({
  images,
  name,
  caption,
  zoomLabel,
}: {
  images: { src: string; kind: string }[];
  name: string;
  caption: string;
  zoomLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!current) return null;

  return (
    <figure className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 sm:gap-4">
      <div className="flex flex-col gap-3" role="tablist" aria-label={name}>
        {images.map((image, index) => {
          const selected = index === active;
          return (
            <button
              key={`${image.src}-${image.kind}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${index + 1}. ${caption}`}
              onClick={() => setActive(index)}
              className={`aspect-square overflow-hidden rounded-xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                selected ? "border-[#c4a574]" : "border-white/15"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt="" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-ink-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.src} alt={`${caption} ${name}.`} className="aspect-[4/5] w-full object-cover sm:aspect-square" />
        <button
          type="button"
          aria-label={zoomLabel}
          onClick={() => setZoomed(true)}
          className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-text-light"
        >
          <ZoomMark />
        </button>
      </div>
      <figcaption className="col-span-2 text-sm text-text-light/60">{caption}</figcaption>
      {zoomed ? (
        <button
          type="button"
          aria-label={zoomLabel}
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={`${caption} ${name}.`} className="max-h-[88vh] max-w-full object-contain" />
        </button>
      ) : null}
    </figure>
  );
}

function ZoomMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 15.5 20 20M11 8.5v5M8.5 11h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
