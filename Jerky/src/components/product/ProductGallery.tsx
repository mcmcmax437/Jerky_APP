"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  name,
  caption,
}: {
  images: { src: string; kind: string }[];
  name: string;
  caption: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <figure className="grid gap-4">
      <div className="aspect-[3/4] bg-ink-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.src} alt={`${caption} ${name}.`} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3" role="tablist" aria-label={name}>
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
                className={`h-20 w-16 overflow-hidden border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  selected ? "border-copper" : "border-white/15"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
      <figcaption className="text-sm text-text-light/70">{caption}</figcaption>
    </figure>
  );
}
