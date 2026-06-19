/**
 * PortfolioShowcase
 * -----------------
 * Drop-in "samples" section for the home page — shows real exports across
 * the Basic / Standard / Advance thumbnail tiers, plus a Shorts rail.
 *
 * HOW TO WIRE THIS UP
 * 1. Save this file as src/components/portfolio-showcase.tsx (next to your
 *    other custom components — same level as components/ui).
 * 2. In HomePage, import and render it:
 *      import PortfolioShowcase from "@/components/portfolio-showcase";
 *      ...
 *      <PortfolioShowcase />
 * 3. Edit the THUMBNAILS and SHORTS arrays below — replace each `src` with
 *    the real filename from your /public folder (e.g. "/my-edit-01.jpg").
 *    Titles, channel names, views, captions are placeholder copy — change
 *    or delete freely.
 * 4. Needs lucide-react (already a shadcn/ui dependency in most setups).
 *    If missing: npm install lucide-react
 */

import { useState } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Share2 } from "lucide-react";

type TierKey = "basic" | "standard" | "advance" | "shorts";

interface ThumbItem {
  id: string;
  src: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
}

interface ShortItem {
  id: string;
  src: string;
  caption: string;
  likes: string;
}

interface TierDef {
  key: TierKey;
  code: string;
  label: string;
  note: string;
}

const TIERS: TierDef[] = [
  { key: "basic", code: "01", label: "Basic", note: "Clean crop, bold text, same-day turnaround." },
  { key: "standard", code: "02", label: "Standard", note: "Custom render, color grade, cut-out subject." },
  { key: "advance", code: "03", label: "Advance", note: "Full composite, lighting FX, layered scene." },
  { key: "shorts", code: "—", label: "Shorts", note: "Vertical edits, cut for the swipe." },
];

// 👇 Replace src with your actual filenames from /public. Root-level paths
// (e.g. "/file.jpg") work as-is since your public folder is served at "/".
const THUMBNAILS: Record<"basic" | "standard" | "advance", ThumbItem[]> = {
  basic: [
    { id: "b1", src: "/basic.jpeg", title: "I Tried This for 30 Days Straight", channel: "Daily Uploads", views: "18K views", duration: "9:14" },
    { id: "b2", src: "/WhatsApp Image 2026-06-18 at 3.42.12 PM.jpeg", title: "My Honest First Impression", channel: "The Vlog Life", views: "6.2K views", duration: "5:02" },
    // { id: "b3", src: "/", title: "What Nobody Tells You About This", channel: "Creator Studio", views: "31K views", duration: "11:47" },
  ],
  standard: [
    { id: "s1", src: "/WhatsApp Image 2026-06-16 at 2.53.52 PM (1).jpeg", title: "This Changed Everything for Me", channel: "Weekend Projects", views: "44K views", duration: "13:21" },
    { id: "s2", src: "/standard.jpeg", title: "Ranking Every Option So You Don't Have To", channel: "The Vlog Life", views: "72K views", duration: "16:08" },
    // { id: "s3", src: "/advanced.jpeg", title: "I Wasn't Ready for This Result", channel: "Daily Uploads", views: "28K views", duration: "8:55" },
  ],
  advance: [
    { id: "a1", src: "/advanced.jpeg", title: "The Build Nobody Thought Would Work", channel: "Creator Studio", views: "112K views", duration: "19:30" },
    { id: "a2", src: "/WhatsApp Image 2026-06-18 at 3.42.00 PM.jpeg", title: "I Spent 100 Hours on This", channel: "Weekend Projects", views: "203K views", duration: "22:14" },
    // { id: "a3", src: "/advance-3.jpg", title: "Why Everyone Got This Wrong", channel: "The Vlog Life", views: "89K views", duration: "14:02" },
  ],
};

const SHORTS: ShortItem[] = [
  { id: "sh1", src: "/shorts-3.mp4", caption: "Wait for the ending", likes: "24.1K" },
  { id: "sh2", src: "/shorts-2.mp4", caption: "POV: it actually worked", likes: "9.8K" },
  { id: "sh3", src: "/shorts-1.mp4", caption: "Day 1 vs Day 30", likes: "41K" },
];

export default function PortfolioShowcase() {
  const [active, setActive] = useState<TierKey>("basic");
  const activeIndex = TIERS.findIndex((t) => t.key === active);
  const isShorts = active === "shorts";

  return (
    <section className="relative bg-[#0B0E11] py-20 sm:py-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .pf-scroll::-webkit-scrollbar { display: none; }
        .pf-scroll { scrollbar-width: none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-6">
        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.25em] text-[#FFB648]">
          Portfolio
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#ECEEF0] sm:text-4xl">
            Pick a tier, see the work.
          </h2>
          <p className="max-w-sm font-['Inter'] text-sm text-[#8B939B]">
            Real exports from past orders — shown here exactly as they were delivered.
          </p>
        </div>

        {/* Scrub-bar tab switcher */}
        <div className="mt-10">
          <div className="relative h-[3px] w-full rounded-full bg-[#242A30]">
            <div
              className="absolute left-0 top-0 h-[3px] rounded-full bg-[#FFB648] motion-safe:transition-all motion-safe:duration-500"
              style={{ width: `${((activeIndex + 1) / TIERS.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {TIERS.map((tier) => (
              <button
                key={tier.key}
                type="button"
                onClick={() => setActive(tier.key)}
                className={`flex items-baseline gap-2 font-['Inter'] text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#FFB648] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11] ${
                  active === tier.key ? "text-[#ECEEF0]" : "text-[#8B939B] hover:text-[#ECEEF0]"
                }`}
              >
                <span className="font-['JetBrains_Mono'] text-xs text-[#FFB648]">{tier.code}</span>
                {tier.label}
              </button>
            ))}
          </div>

          <p className="mt-2 font-['Inter'] text-xs text-[#8B939B]">{TIERS[activeIndex].note}</p>
        </div>

        {/* Content shelf */}
        <div className="pf-scroll mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {isShorts
            ? SHORTS.map((item) => <ShortCard key={item.id} item={item} />)
            : THUMBNAILS[active as "basic" | "standard" | "advance"].map((item) => (
                <ThumbCard key={item.id} item={item} tier={active} />
              ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href="/services"
            className="font-['Inter'] text-sm font-medium text-[#FFB648] underline-offset-4 hover:text-[#ECEEF0] hover:underline"
          >
            Compare full packages →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ThumbCard({ item, tier }: { item: ThumbItem; tier: TierKey }) {
  return (
    <div className="group relative w-[280px] flex-none snap-start sm:w-[300px]">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#15191D] ring-1 ring-[#242A30]">
        <img
          src={item.src}
          alt={item.title}
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]"
        />

        {tier === "advance" && (
          <span className="absolute left-2 top-2 rounded-full bg-[#FF7A45] px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-medium text-[#0B0E11]">
            ADV
          </span>
        )}

        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[11px] text-white">
          {item.duration}
        </span>

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 motion-safe:transition-opacity motion-safe:duration-200 group-hover:bg-black/20 group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60">
            <span className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#242A30] font-['Inter'] text-[11px] font-semibold text-[#ECEEF0]">
          {item.channel.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 font-['Inter'] text-[13px] font-medium leading-snug text-[#ECEEF0]">
            {item.title}
          </p>
          <p className="mt-0.5 font-['Inter'] text-[12px] text-[#8B939B]">
            {item.channel} · {item.views}
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortCard({ item }: { item: ShortItem }) {
  return (
    <div className="group relative w-[170px] flex-none snap-start">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#15191D] ring-1 ring-[#242A30]">
        <video
          src={item.src}
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 pt-10">
          <p className="line-clamp-2 font-['Inter'] text-[12px] font-medium text-white">{item.caption}</p>
        </div>

        <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4">
          <Heart className="h-4 w-4 text-white/90 drop-shadow" />
          <MessageCircle className="h-4 w-4 text-white/90 drop-shadow" />
          <Share2 className="h-4 w-4 text-white/90 drop-shadow" />
        </div>
      </div>

      <p className="mt-2 font-['JetBrains_Mono'] text-[11px] text-[#8B939B]">♥ {item.likes}</p>
    </div>
  );
}