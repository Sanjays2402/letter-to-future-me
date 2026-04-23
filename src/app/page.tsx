"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { EnvelopeCard } from "@/components/envelope-card";

type Letter = { date: string; letter: string; preview: string };

export default function Home() {
  const [present, setPresent] = useState("");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!present.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ present }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Mail truck broke down.");
      else {
        setLetter(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLetter(null);
    setError(null);
    setPresent("");
  };

  const download = async () => {
    if (!cardRef.current) return;
    const png = await toPng(cardRef.current, { pixelRatio: 1, cacheBust: true });
    const a = document.createElement("a");
    a.href = png;
    a.download = `letter-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    if (!letter) return;
    const text = `${letter.date}\n\n${letter.letter}\n\n— ${letter.preview}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Letter to Future Me", text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    alert("Letter copied");
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* STARS — fixed background, full bleed */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {Array.from({ length: 80 }).map((_, i) => {
          const seed = (i * 9301 + 49297) % 233280;
          const x = (seed % 100) / 100;
          const y = ((seed * 1.7) % 100) / 100;
          const size = ((seed % 5) + 1) * 0.4;
          const op = 0.2 + (seed % 80) / 100;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#e6f0fa",
                opacity: op,
                boxShadow: `0 0 ${size * 2}px rgba(230,240,250,${op * 0.6})`,
              }}
            />
          );
        })}
      </div>

      {/* MOON — top-right ornament */}
      <div
        aria-hidden
        className="fixed top-12 right-12 -z-10 hidden sm:block"
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #f4ead4 0%, #d8c89a 60%, transparent 100%)",
          boxShadow: "0 0 60px rgba(244,234,212,0.3)",
        }}
      />

      <section className="flex-1 flex items-center justify-center px-6 py-16 min-h-screen">
        <AnimatePresence mode="wait">
          {!letter ? (
            // ENVELOPE — closed, you write your message INSIDE the envelope flap
            <motion.div
              key="envelope-closed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-3 text-xs font-mono text-accent uppercase tracking-[0.4em]">
                  <span className="h-px w-6 bg-accent/40" />
                  postmarked +1 year
                  <span className="h-px w-6 bg-accent/40" />
                </div>
                <h1 className="font-display italic text-4xl sm:text-5xl text-ink leading-tight">
                  A letter from future you.
                </h1>
              </div>

              <form
                onSubmit={submit}
                className="relative"
                style={{ perspective: 1200 }}
              >
                {/* envelope body */}
                <div
                  className="relative rounded-sm overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
                    color: "#1d2c3d",
                    boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
                    aspectRatio: "1.6 / 1",
                    minHeight: 360,
                  }}
                >
                  {/* envelope flap (top triangle) */}
                  <div
                    aria-hidden
                    className="absolute top-0 left-0 right-0 pointer-events-none"
                    style={{
                      height: "45%",
                      background:
                        "linear-gradient(180deg, #ecdfb8 0%, #d8c89a 100%)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      borderBottom: "1px solid rgba(29,44,61,0.2)",
                    }}
                  />
                  {/* wax seal */}
                  <div
                    aria-hidden
                    className="absolute"
                    style={{
                      top: "calc(45% - 26px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 35%, #ef4444 0%, #b91c1c 80%)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f4ead4",
                      fontFamily: "var(--font-libre), serif",
                      fontStyle: "italic",
                      fontSize: 22,
                    }}
                  >
                    +1
                  </div>

                  {/* address lines (textarea overlay below the flap) */}
                  <div className="absolute inset-0 flex items-end justify-center p-6 pt-[50%]">
                    <textarea
                      value={present}
                      onChange={(e) => setPresent(e.target.value)}
                      placeholder="What's true for you right now? What's hard, what's hopeful, what you're carrying…"
                      rows={4}
                      maxLength={800}
                      className="w-full bg-transparent text-[#1d2c3d] placeholder-[#1d2c3d]/40 font-display italic text-base sm:text-lg leading-relaxed focus:outline-none resize-none"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(29,44,61,0.18) 27px, rgba(29,44,61,0.18) 28px)",
                      }}
                    />
                  </div>

                  {/* postage stamp */}
                  <div
                    aria-hidden
                    className="absolute"
                    style={{
                      bottom: 16,
                      right: 16,
                      width: 56,
                      height: 68,
                      background: "#5fa3d3",
                      border: "2px dashed #f4ead4",
                      outline: "1px solid #5fa3d3",
                      outlineOffset: -5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "rotate(4deg)",
                      fontSize: 28,
                    }}
                  >
                    🌃
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-ink-dim">{present.length}/800</div>
                  <button
                    type="submit"
                    disabled={!present.trim() || loading}
                    className="px-7 py-3 rounded-xl bg-accent text-bg font-semibold hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? "Walking to the mailbox…" : "Send the letter →"}
                  </button>
                </div>
                {error && <p className="mt-3 text-center text-sm text-rust">{error}</p>}
              </form>
            </motion.div>
          ) : (
            // OPENED — letter unfolds upward from the envelope
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-xl"
            >
              {/* unfolded letter, with origami crease lines */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0.85, originY: 1 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-sm p-8 sm:p-10"
                style={{
                  background: "linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
                  color: "#1d2c3d",
                  boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  backgroundImage:
                    "linear-gradient(180deg, transparent 0%, transparent 33%, rgba(29,44,61,0.05) 33%, transparent 33.5%, transparent 66%, rgba(29,44,61,0.05) 66%, transparent 66.5%), linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
                }}
              >
                <div className="font-mono uppercase text-[10px] tracking-[0.5em] opacity-60">
                  a letter from
                </div>
                <div className="font-display italic text-2xl sm:text-3xl mt-1">
                  {letter.date}
                </div>
                <div className="my-4 h-px bg-current opacity-20" />
                <p className="font-display text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {letter.letter}
                </p>
                <div className="mt-6 pt-3 border-t border-current/20">
                  <div className="font-mono uppercase text-[10px] tracking-[0.4em] opacity-60">
                    on the envelope
                  </div>
                  <p className="font-display italic mt-1">&ldquo;{letter.preview}&rdquo;</p>
                </div>
              </motion.div>

              {/* hidden ref for download */}
              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <EnvelopeCard ref={cardRef} {...letter} />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-bg font-semibold hover:bg-accent-2 transition">
                  <Download className="h-4 w-4" /> Download
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-ink-dim/30 px-5 py-3 text-ink hover:border-accent hover:text-accent transition">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink-dim/30 px-5 py-3 text-ink hover:border-accent hover:text-accent transition">
                  <RefreshCw className="h-4 w-4" /> New letter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-ink-dim">
        🌃 letter-to-future-me · postmarked +1 year
      </footer>
    </main>
  );
}
