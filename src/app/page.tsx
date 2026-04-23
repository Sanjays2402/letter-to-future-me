"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2, Mail } from "lucide-react";
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
      else setLetter(data);
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
      try {
        await navigator.share({ title: "Letter to Future Me", text });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
    alert("Letter copied");
  };

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-6 pt-12 sm:pt-20 pb-2 text-center">
        <div className="inline-flex items-center gap-2 mb-6 text-xs font-mono text-accent uppercase tracking-[0.4em]">
          <Mail className="h-3 w-3" /> postmarked +1 year
        </div>
        <h1 className="text-4xl sm:text-6xl tracking-tight text-ink">
          A letter from{" "}
          <span className="font-display italic font-medium text-accent-2">
            future you
          </span>.
        </h1>
        <p className="mt-4 text-ink-dim max-w-md mx-auto">
          Tell us what&rsquo;s true today. We&rsquo;ll write back from a year from now.
        </p>
      </header>

      <section className="flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          {!letter ? (
            <motion.form
              key="input"
              onSubmit={submit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl mx-auto"
            >
              <textarea
                value={present}
                onChange={(e) => setPresent(e.target.value)}
                placeholder="What's true for you right now? What's hard, what's hopeful, what you're carrying…"
                rows={6}
                maxLength={800}
                className="w-full bg-bg-2/60 border border-ink-dim/20 rounded-2xl px-6 py-5 text-ink placeholder-ink-dim font-display italic text-lg leading-relaxed focus:border-accent/60 focus:outline-none resize-none"
              />
              <div className="mt-2 text-right text-xs text-ink-dim">{present.length}/800</div>
              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={!present.trim() || loading}
                  className="px-8 py-3 rounded-xl bg-accent text-bg font-semibold hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Walking to the mailbox…" : "Send the letter"}
                </button>
              </div>
              {error && <p className="mt-4 text-center text-sm text-rust">{error}</p>}
            </motion.form>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl mx-auto"
            >
              <div
                className="rounded-lg p-8"
                style={{
                  background: "linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
                  color: "#1d2c3d",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                }}
              >
                <div className="font-mono uppercase text-xs tracking-[0.4em] opacity-60">
                  a letter from
                </div>
                <div className="font-display italic text-2xl sm:text-3xl mt-1">{letter.date}</div>
                <div className="my-4 h-px bg-current opacity-20" />
                <p className="font-display text-lg leading-relaxed whitespace-pre-wrap">
                  {letter.letter}
                </p>
                <div className="mt-5 pt-3 border-t border-current/20">
                  <div className="font-mono uppercase text-[10px] tracking-[0.4em] opacity-60">
                    on the envelope
                  </div>
                  <p className="font-display italic mt-1">&ldquo;{letter.preview}&rdquo;</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <EnvelopeCard ref={cardRef} {...letter} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-ink-dim">
        🌃 letter-to-future-me · postmarked +1 year
      </footer>
    </main>
  );
}
