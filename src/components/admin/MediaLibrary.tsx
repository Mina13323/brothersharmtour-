"use client";

/**
 * Media library — your uploads land in the runtime store and are referenced
 * from tour/package editors by their /uploads/... URL. Images that ship with
 * the website are listed too, marked "Built in", and are read-only here.
 * Validation (type, size, magic bytes) happens server-side in lib/uploads.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, CheckCircle2 } from "lucide-react";

interface MediaFile {
  url: string;
  bytes: number;
  modified: string;
  /** Ships with the website (part of the deployment) — not deletable here. */
  seed?: boolean;
}

function human(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setFiles(d.files);
      })
      .catch(() => setMessage({ kind: "err", text: "Could not load the library." }));
  }, []);

  useEffect(load, [load]);

  async function upload(fileList: FileList) {
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      Array.from(fileList).slice(0, 10).forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (data.saved?.length) {
        setMessage({
          kind: "ok",
          text: `Uploaded ${data.saved.length} file${data.saved.length === 1 ? "" : "s"}.`,
        });
      }
      if (data.failed?.length) {
        setMessage({
          kind: "err",
          text: `Rejected: ${data.failed.map((f: { name: string; error: string }) => `${f.name} (${f.error})`).join(", ")}`,
        });
      }
      load();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(url: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setFiles((list) => list.filter((f) => f.url !== url));
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.message ?? "Delete failed." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(url: string) {
    const absolute = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
      void absolute;
    } catch {
      setMessage({ kind: "err", text: "Copy failed — select the URL manually." });
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Media Library</h1>
        <p className="text-sm text-stone-400 mt-1">
          Images and videos for tours, packages and reviews. Copy a file&apos;s URL
          into an editor field to use it. Files marked{" "}
          <span className="font-semibold text-stone-300">Built in</span> ship
          with the website and can only be changed by a developer.
        </p>
      </header>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-teal-500/40 transition-colors"
      >
        <Upload className="size-8 text-stone-500 mx-auto mb-3" />
        <p className="text-sm text-stone-300">
          Drag files here, or{" "}
          <button
            onClick={() => inputRef.current?.click()}
            className="text-teal-400 font-semibold hover:text-teal-300"
          >
            browse
          </button>
        </p>
        <p className="text-[11px] text-stone-500 mt-2">
          JPG, PNG, WebP, AVIF or MP4 · up to 8 MB each · validated server-side
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,.mp4"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {message ? (
        <p
          className={`text-xs rounded-xl px-4 py-2.5 border ${
            message.kind === "ok"
              ? "text-teal-300 bg-teal-500/10 border-teal-500/20"
              : "text-red-300 bg-red-500/10 border-red-500/20"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {files.length === 0 ? (
        <div className="bg-[#101c1f] border border-white/10 rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-stone-400">
            Nothing uploaded yet. The site&apos;s built-in images live in
            /media/ and are managed by the media build script — this library is
            for your own uploads.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <li
              key={file.url}
              className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden group"
            >
              <div className="aspect-[4/3] bg-black/40 relative">
                {file.url.match(/\.(mp4)$/) ? (
                  <video src={file.url} className="size-full object-cover" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[11px] font-mono text-stone-400 truncate" title={file.url}>
                  {file.url}
                </p>
                <p className="text-[10px] text-stone-600">
                  {human(file.bytes)} · {new Date(file.modified).toLocaleDateString("en-GB")}
                  {file.seed ? (
                    <span className="ml-1.5 rounded px-1.5 py-0.5 bg-white/5 text-stone-400 border border-white/10">
                      Built in
                    </span>
                  ) : null}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-teal-300 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg px-2 py-1.5"
                  >
                    {copied === file.url ? (
                      <>
                        <CheckCircle2 className="size-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" /> Copy URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => remove(file.url)}
                    disabled={busy || !!file.seed}
                    title={
                      file.seed
                        ? "This image ships with the website and cannot be deleted here."
                        : "Delete this upload"
                    }
                    className="inline-flex items-center justify-center text-[11px] font-semibold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
