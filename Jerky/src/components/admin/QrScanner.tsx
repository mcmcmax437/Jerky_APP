"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Icon } from "@/components/brand/Icon";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

function createDetector() {
  const barcodeDetector = (window as Window & { BarcodeDetector?: new (options: { formats: string[] }) => Detector }).BarcodeDetector;
  if (!barcodeDetector) return null;
  return new barcodeDetector({ formats: ["qr_code"] });
}

async function readFrame(video: HTMLVideoElement, detector: Detector | null, canvas: HTMLCanvasElement) {
  if (detector) {
    const found = await detector.detect(video);
    const native = found.find((item) => item.rawValue.trim())?.rawValue.trim();
    if (native) return native;
  }
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);
  const frame = context.getImageData(0, 0, width, height);
  return jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })?.data ?? null;
}

export function QrScanner({
  locale,
  dict,
  action,
}: {
  locale: Locale;
  dict: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const copy = dict.admin.terminal.purchase;
  const videoRef = useRef<HTMLVideoElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setMessage(copy.camera);
      setOpen(false);
      return;
    }
    let stopped = false;
    let stream: MediaStream | null = null;
    const detector = createDetector();
    const canvas = document.createElement("canvas");

    const finish = (value: string) => {
      stopped = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (codeRef.current && formRef.current) {
        codeRef.current.value = value;
        formRef.current.requestSubmit();
      }
      setOpen(false);
    };

    let last = 0;
    const tick = (now: number) => {
      if (stopped) return;
      if (video.readyState < 2 || now - last < 120) {
        requestAnimationFrame(tick);
        return;
      }
      last = now;
      void readFrame(video, detector, canvas)
        .then((value) => {
          if (stopped) return;
          if (value) finish(value);
          else requestAnimationFrame(tick);
        })
        .catch(() => {
          if (!stopped) requestAnimationFrame(tick);
        });
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((next) => {
        if (stopped) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        video.srcObject = next;
        return video.play();
      })
      .then(() => {
        if (!stopped) requestAnimationFrame(tick);
      })
      .catch(() => {
        setMessage(copy.camera);
        setOpen(false);
      });

    return () => {
      stopped = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [copy.camera, open]);

  return (
    <div className="grid max-w-3xl gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setOpen((value) => !value);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <Icon name="qr-code" />
          {open ? copy.stop : copy.scan}
        </button>
        <p className="text-sm text-[#9c9186]">{copy.scanHint}</p>
      </div>
      {message ? <p className="text-sm text-chili">{message}</p> : null}
      {open ? <video ref={videoRef} muted playsInline className="aspect-video w-full max-w-md rounded-xl bg-black object-cover" /> : null}
      <form ref={formRef} action={action}>
        <input type="hidden" name="locale" value={locale} />
        <input ref={codeRef} type="hidden" name="code" />
      </form>
    </div>
  );
}
