"use client";

import { forwardRef } from "react";

type Props = { date: string; letter: string; preview: string };

export const EnvelopeCard = forwardRef<HTMLDivElement, Props>(function EnvelopeCard(
  { date, letter, preview },
  ref
) {
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="relative overflow-hidden flex items-center justify-center"
    >
      {/* night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 25% 5%, rgba(95,163,211,0.30), transparent 65%), radial-gradient(800px 500px at 80% 100%, rgba(95,163,211,0.12), transparent 65%), linear-gradient(180deg, #08111c 0%, #0d1a2c 100%)",
        }}
      />
      {/* stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => {
          const seed = (i * 9301 + 49297) % 233280;
          const x = (seed % 100) / 100;
          const y = (((seed * 1.7) % 100) / 100);
          const size = ((seed % 5) + 1) * 0.4;
          const op = 0.2 + ((seed % 80) / 100);
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
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* paper letter */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          width: 780,
          padding: "70px 75px",
          background: "linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
          color: "#1d2c3d",
          borderRadius: 6,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(29,44,61,0.1)",
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0, transparent 51px, rgba(95,163,211,0.18) 51px, rgba(95,163,211,0.18) 52px), linear-gradient(180deg, #f4ead4 0%, #ecdfb8 100%)",
        }}
      >
        {/* postage stamp */}
        <div
          className="absolute"
          style={{
            top: 30,
            right: 40,
            width: 110,
            height: 130,
            background: "#5fa3d3",
            border: "3px dashed #f4ead4",
            outline: "2px solid #5fa3d3",
            outlineOffset: -8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#08111c",
            fontFamily: "var(--font-libre), serif",
            transform: "rotate(4deg)",
          }}
        >
          <div style={{ fontSize: 36 }}>🌃</div>
          <div style={{ fontSize: 12, marginTop: 4, letterSpacing: "0.15em" }}>
            +1 YEAR
          </div>
        </div>

        <div
          className="font-mono uppercase"
          style={{
            fontSize: 12,
            letterSpacing: "0.4em",
            color: "rgba(29,44,61,0.55)",
          }}
        >
          a letter from
        </div>

        <div
          className="font-display italic"
          style={{ fontSize: 38, marginTop: 4, color: "#1d2c3d" }}
        >
          {date}
        </div>

        <div
          className="my-6 h-px"
          style={{ background: "rgba(29,44,61,0.25)" }}
        />

        <p
          className="font-display flex-1"
          style={{ fontSize: 26, lineHeight: 1.55, color: "#1d2c3d", whiteSpace: "pre-wrap" }}
        >
          {letter}
        </p>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(29,44,61,0.25)" }}>
          <div
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: "0.4em", color: "rgba(29,44,61,0.5)" }}
          >
            written on the envelope
          </div>
          <div
            className="font-display italic mt-2"
            style={{ fontSize: 22, color: "#1d2c3d" }}
          >
            “{preview}”
          </div>
          <div
            className="mt-4 font-mono uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.4em",
              color: "rgba(29,44,61,0.4)",
            }}
          >
            🌃 letter-to-future-me
          </div>
        </div>
      </div>
    </div>
  );
});
