import Link from "next/link";
import Image from "next/image";
import { media } from "@/lib/media";
import { getServerT } from "@/lib/i18n/server";

export default async function NotFound() {
  const tr = await getServerT();
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-ink text-white">
      <Image
        src={media.colorCanyon.hero.src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />

      <div className="shell relative z-10 py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-sun">404</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+4vw,4.5rem)]">
            {tr("nf_title", "This one’s off the map")}
          </h1>
          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-white/75">
            {tr("nf_body", "The page you were looking for doesn’t exist — but the Red Sea and the Sinai desert still do.")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/tours" className="btn btn-primary">
              {tr("nf_browse_tours", "Browse all tours")}
            </Link>
            <Link href="/" className="btn btn-ghost-light">
              {tr("nf_back_home", "Back to home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
