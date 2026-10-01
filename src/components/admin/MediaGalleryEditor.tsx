"use client";

import { useRef, useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Film,
  FolderOpen,
  Loader2,
  X,
} from "lucide-react";
import type { MediaImage, MediaVideo } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────────
   Media Gallery Editor for Admin (Tours & Packages)
   Replaces raw JSON strings with real image upload, previews, reordering,
   and media library browsing.
   ────────────────────────────────────────────────────────────────────────── */

interface MediaGalleryEditorProps {
  images: MediaImage[];
  onChange: (images: MediaImage[]) => void;
  title?: string;
  label?: string;
}

export function MediaGalleryEditor({
  images,
  onChange,
  title = "Photo",
  label = "Photo Gallery (First photo is the main hero cover)",
}: MediaGalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUrlAdd, setShowUrlAdd] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customAlt, setCustomAlt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle direct file uploads (single or multiple)
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Upload failed. Please check file format.");
        return;
      }

      if (data.saved && Array.isArray(data.saved)) {
        const newImages: MediaImage[] = data.saved.map((url: string, index: number) => ({
          src: url,
          alt: `${title} photo ${images.length + index + 1}`,
          width: 1600,
          height: 900,
        }));
        onChange([...images, ...newImages]);
      }

      if (data.failed?.length) {
        setError(`Failed to upload ${data.failed.length} file(s).`);
      }
    } catch {
      setError("Network error while uploading. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  }

  function makeHero(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected);
    onChange(next);
  }

  function updateAlt(index: number, alt: string) {
    const next = [...images];
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  function addUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const newImage: MediaImage = {
      src: customUrl.trim(),
      alt: customAlt.trim() || `${title} photo ${images.length + 1}`,
      width: 1600,
      height: 900,
    };
    onChange([...images, newImage]);
    setCustomUrl("");
    setCustomAlt("");
    setShowUrlAdd(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <ImageIcon className="size-4 text-teal-400" />
          <span>{label}</span>
          <span className="text-stone-500 font-normal">({images.length} photos)</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            <FolderOpen className="size-3.5 text-teal-400" />
            Media Library
          </button>
          <button
            type="button"
            onClick={() => setShowUrlAdd(!showUrlAdd)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            <Plus className="size-3.5 text-teal-400" />
            Add via URL
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Dropzone / Upload Box ── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFiles(e.dataTransfer.files);
        }}
        className="group relative border-2 border-dashed border-teal-500/30 hover:border-teal-400/60 bg-teal-950/10 hover:bg-teal-950/20 rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="size-8 text-teal-400 animate-spin" />
              <p className="text-xs font-semibold text-teal-300">
                Uploading photo(s) to server...
              </p>
            </>
          ) : (
            <>
              <div className="size-10 rounded-full bg-teal-500/15 group-hover:bg-teal-500/25 border border-teal-500/30 flex items-center justify-center transition-colors">
                <Upload className="size-5 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200 group-hover:text-white">
                  Click to upload photos or drag & drop here
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  JPG, PNG, WebP or AVIF · Select multiple photos at once
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Add via URL Expandable Bar ── */}
      {showUrlAdd && (
        <form
          onSubmit={addUrl}
          className="p-3 bg-black/40 border border-white/10 rounded-xl flex flex-wrap sm:flex-nowrap gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Image URL or /media/... path"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60"
          />
          <input
            type="text"
            placeholder="Optional caption / alt text"
            value={customAlt}
            onChange={(e) => setCustomAlt(e.target.value)}
            className="w-full sm:w-48 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Add
          </button>
        </form>
      )}

      {/* ── Visual Grid of Current Images ── */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {images.map((img, index) => {
            const isHero = index === 0;
            return (
              <div
                key={`${img.src}-${index}`}
                className={`relative group bg-[#0d1618] border rounded-xl overflow-hidden transition-all duration-200 ${
                  isHero
                    ? "border-teal-500/60 shadow-[0_0_20px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/40"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23666'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12'%3ENo Preview%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  {/* Badge */}
                  {isHero ? (
                    <div className="absolute top-2 left-2 bg-teal-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="size-3 fill-black" />
                      <span>HERO COVER</span>
                    </div>
                  ) : (
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                  )}

                  {/* Top-Right Quick Delete */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 size-7 rounded-lg bg-black/70 hover:bg-rose-600/90 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Card Controls */}
                <div className="p-2.5 space-y-2 bg-[#0d1618]">
                  {/* Alt Text / Caption */}
                  <input
                    type="text"
                    value={img.alt || ""}
                    onChange={(e) => updateAlt(index, e.target.value)}
                    placeholder="Photo description / alt"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50"
                  />

                  {/* Path & Reorder Actions */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span className="truncate max-w-[140px] font-mono text-[10px] text-stone-500" title={img.src}>
                      {img.src.replace("/uploads/media/", ".../")}
                    </span>

                    <div className="flex items-center gap-1">
                      {!isHero && (
                        <button
                          type="button"
                          onClick={() => makeHero(index)}
                          className="px-2 py-0.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-medium rounded border border-teal-500/30 transition-colors cursor-pointer"
                          title="Make this photo the main hero cover"
                        >
                          Set Hero
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="size-6 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-300 transition-colors cursor-pointer"
                        title="Move photo left"
                      >
                        <ArrowLeft className="size-3" />
                      </button>

                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => move(index, 1)}
                        className="size-6 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-300 transition-colors cursor-pointer"
                        title="Move photo right"
                      >
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center py-4 text-xs text-stone-500 italic">
          No photos uploaded yet. Use the upload area above to add photos.
        </p>
      )}

      {/* ── Modal: Select from Media Library ── */}
      {showLibrary && (
        <MediaLibraryModal
          onSelect={(url) => {
            const newImage: MediaImage = {
              src: url,
              alt: `${title} photo ${images.length + 1}`,
              width: 1600,
              height: 900,
            };
            onChange([...images, newImage]);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Single Image Uploader (e.g. Package Cover Image)
   ────────────────────────────────────────────────────────────────────────── */

interface SingleImageUploaderProps {
  image: MediaImage | null | undefined;
  onChange: (image: MediaImage | null) => void;
  label?: string;
  defaultAlt?: string;
}

export function SingleImageUploader({
  image,
  onChange,
  label = "Cover Image",
  defaultAlt = "Cover photo",
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const form = new FormData();
      form.append("files", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (data.saved?.[0]) {
        onChange({
          src: data.saved[0],
          alt: defaultAlt,
          width: 1600,
          height: 900,
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="text-[11px] font-normal text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
        >
          <FolderOpen className="size-3" />
          Choose from library
        </button>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {image?.src ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-video max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt || "Cover"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Upload className="size-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-teal-500/50 bg-white/5 hover:bg-teal-950/10 rounded-xl p-4 text-center cursor-pointer transition-colors max-w-sm"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 py-2 text-teal-400 text-xs">
              <Loader2 className="size-4 animate-spin" /> Uploading...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-stone-400 group-hover:text-white text-xs">
              <Upload className="size-4 text-teal-400" /> Click to upload cover photo
            </div>
          )}
        </div>
      )}

      {showLibrary && (
        <MediaLibraryModal
          onSelect={(url) => {
            onChange({
              src: url,
              alt: defaultAlt,
              width: 1600,
              height: 900,
            });
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Video Uploader (for Tours)
   ────────────────────────────────────────────────────────────────────────── */

interface MediaVideoEditorProps {
  video: MediaVideo | undefined;
  onChange: (video: MediaVideo | undefined) => void;
  tourTitle?: string;
}

export function MediaVideoEditor({
  video,
  onChange,
  tourTitle = "Tour",
}: MediaVideoEditorProps) {
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);

    try {
      const form = new FormData();
      form.append("files", file);

      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));

      if (data.saved?.[0]) {
        onChange({
          src: data.saved[0],
          poster: video?.poster,
          label: `${tourTitle} video`,
        });
      }
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);

    try {
      const form = new FormData();
      form.append("files", file);

      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));

      if (data.saved?.[0]) {
        onChange({
          src: video?.src || "",
          poster: {
            src: data.saved[0],
            alt: `${tourTitle} video preview`,
            width: 1600,
            height: 900,
          },
          label: video?.label,
        });
      }
    } finally {
      setUploadingPoster(false);
      if (posterInputRef.current) posterInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Film className="size-4 text-teal-400" />
          <span>Tour Video (Optional)</span>
        </span>
        {video?.src && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="size-3" /> Remove video
          </button>
        )}
      </label>

      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        className="hidden"
        onChange={handleVideoUpload}
      />
      <input
        ref={posterInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePosterUpload}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Video File Card */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-semibold text-stone-300">Video File (.mp4)</p>
          {video?.src ? (
            <div className="space-y-2">
              <video
                src={video.src}
                controls
                className="w-full aspect-video rounded-lg bg-black object-cover"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[10px] text-stone-500">
                  {video.src}
                </span>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded cursor-pointer transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border border-dashed border-white/15 hover:border-teal-500/50 bg-white/5 rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              {uploadingVideo ? (
                <div className="flex items-center justify-center gap-2 text-teal-400 text-xs">
                  <Loader2 className="size-4 animate-spin" /> Uploading video...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-stone-400">
                  <Upload className="size-5 text-teal-400" />
                  <span className="text-xs font-medium text-stone-300">Upload Video File</span>
                  <span className="text-[10px] text-stone-500">MP4 or WebM format</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Poster Image Card */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-semibold text-stone-300">Poster Image (Thumbnail)</p>
          {video?.poster?.src ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.poster.src}
                alt={video.poster.alt || "Video poster"}
                className="w-full aspect-video rounded-lg bg-black object-cover"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[10px] text-stone-500">
                  {video.poster.src}
                </span>
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded cursor-pointer transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => posterInputRef.current?.click()}
              className="border border-dashed border-white/15 hover:border-teal-500/50 bg-white/5 rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              {uploadingPoster ? (
                <div className="flex items-center justify-center gap-2 text-teal-400 text-xs">
                  <Loader2 className="size-4 animate-spin" /> Uploading poster...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-stone-400">
                  <ImageIcon className="size-5 text-teal-400" />
                  <span className="text-xs font-medium text-stone-300">Upload Poster Photo</span>
                  <span className="text-[10px] text-stone-500">Shows before video plays</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Modal to pick an image from the existing server media library
   ────────────────────────────────────────────────────────────────────────── */

interface MediaLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function MediaLibraryModal({ onSelect, onClose }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<{ url: string; bytes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.files)) {
          setFiles(d.files);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1719] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Choose from Media Library</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-teal-400 gap-2">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs text-stone-400">Loading media library...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No files in media library yet. Upload photos using the upload button.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file) => (
                <button
                  type="button"
                  key={file.url}
                  onClick={() => onSelect(file.url)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-teal-400 bg-black/50 transition-all cursor-pointer text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt="Media file"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23666'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12'%3EFile%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-teal-500 text-black text-[11px] font-bold px-2 py-0.5 rounded shadow">
                      Select
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
