"use client";
import { useRef, useState } from "react";

/**
 * Tap a photo to see it full-size in a native <dialog>. Closes on the × button, a tap on the photo or backdrop, or Esc;
 * focus returns to the photo that opened it (native dialog behaviour). The page behind it is scroll-locked (globals.css).
 * The full-size photo and its caption are only rendered while the dialog is open: rendered closed, every caption sat in
 * the page a second time (text readers and search engines saw each caption twice) and every original was downloaded up front.
 */
export default function Lightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const label = alt ? `Full-size photo: ${alt}` : "Full-size photo";
  return (
    <>
      <button type="button" className="block w-full cursor-zoom-in text-left" onClick={() => { setOpen(true); ref.current?.showModal(); }} aria-label={`Open ${label.toLowerCase()}`}>
        {children}
      </button>
      <dialog
        ref={ref}
        aria-label={label}
        onClick={() => ref.current?.close()}
        onClose={() => setOpen(false)}
        className="lightbox m-auto max-h-[100vh] max-w-[100vw] bg-transparent p-0 backdrop:bg-black/90"
      >
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="fixed right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl leading-none text-white hover:bg-black/80"
          style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          ×
        </button>
        {open && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-[100vh] max-w-[100vw] cursor-zoom-out object-contain" />
            {alt && <p className="pointer-events-none fixed inset-x-0 bottom-0 bg-black/60 px-4 py-2 text-center text-sm text-white">{alt}</p>}
          </>
        )}
      </dialog>
    </>
  );
}
