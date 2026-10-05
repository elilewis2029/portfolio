"use client";
import { useRef } from "react";

/** Tap a photo to see it full-size in a native <dialog>; tap anywhere or press Esc to close. No library. */
export default function Lightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="block w-full cursor-zoom-in text-left" onClick={() => ref.current?.showModal()} aria-label={`Open full-size photo${alt ? `: ${alt}` : ""}`}>
        {children}
      </button>
      <dialog ref={ref} onClick={() => ref.current?.close()} className="lightbox m-auto max-h-[100vh] max-w-[100vw] bg-transparent p-0 backdrop:bg-black/90">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[100vh] max-w-[100vw] cursor-zoom-out object-contain" />
      </dialog>
    </>
  );
}
