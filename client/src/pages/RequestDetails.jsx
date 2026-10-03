import {
  useEffect,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import api from "../services/api";

import MagicalLibraryBackground from "../components/library/MagicalLibraryBackground";


const EASE = [0.3, 0, 0.2, 1];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

const chevron = (color) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='${color}' stroke-width='1.6'/%3E%3C/svg%3E")`;


/* ------------------------------------------------------------------ */
/* ROLE THEMES — display only                                          */
/* ------------------------------------------------------------------ */

const THEMES = {
  USER: {
    key: "USER",
    paper: "#eee1c2",
    ink: "#2b1a10",
    accent: "#5a1620",
    gold: "#c9a24a",
    goldDeep: "#8a5a12",
    rule: "rgba(43,26,16,0.22)",
    shellBg: "#17100c",
    shellText: "#eadfc6",
    muted: "#b8a780",
    btnText: "#f3e7c9",
    danger: "#8c2f1f",
    hand: "#1f2f6b",
    card: "#f7eed4",
    fold: "#cdbb92",
    focus: "rgba(201,162,74,0.38)",
    glow: "rgba(201,162,74,0.5)",
    inputLine: "rgba(110,38,56,0.55)",
    inputRule: "rgba(110,38,56,0.16)",
    chevron: "%235a1620",
    innerBorder: "1px solid rgba(201,162,74,0.7)",
    stack: "0 3px 0 #dccfa9, 0 6px 0 #cfc096, 0 30px 50px -28px rgba(0,0,0,0.85)",
    headBorder: "rgba(201,162,74,0.7)",
    fDisplay: "'IM Fell English SC',Georgia,serif",
    fSerif: "'Cormorant Garamond',Georgia,serif",
    headSize: "1.7rem",
    headCase: "none",
    headSpacing: "0",
    labels: {
      title: "The Chapter Record",
      summary: "Chapter Summary",
      journey: "Chapter Journey",
      journeyNote: "Each seal marks a stage this chapter has reached.",
      omens: "The Chapter's Omens",
      omensNote: "What IntelliFlow has read from this chapter.",
      actions: "Workflow Actions",
      docs: "Archived Manuscripts",
      notes: "Marginal Notes",
      history: "The Chapter's History",
      loading: "Loading request details…",
    },
  },

  REVIEWER: {
    key: "REVIEWER",
    paper: "#e9e5d5",
    ink: "#151a3a",
    accent: "#2f3a6b",
    gold: "#b3a468",
    goldDeep: "#5f6390",
    rule: "rgba(21,26,58,0.2)",
    shellBg: "#0a1030",
    shellText: "#e4e6f0",
    muted: "#9aa3c4",
    btnText: "#eef0f8",
    danger: "#8c2f3f",
    hand: "#2a3a8a",
    card: "#f2efe3",
    fold: "#c4c2d2",
    focus: "rgba(179,164,104,0.38)",
    glow: "rgba(179,164,104,0.45)",
    inputLine: "rgba(47,58,107,0.55)",
    inputRule: "rgba(47,58,107,0.16)",
    chevron: "%232f3a6b",
    innerBorder: "1px solid rgba(179,164,104,0.65)",
    stack: "0 3px 0 #d6d2c2, 0 6px 0 #c6c2b3, 0 30px 50px -28px rgba(0,0,10,0.9)",
    headBorder: "rgba(179,164,104,0.7)",
    fDisplay: "'IM Fell English SC',Georgia,serif",
    fSerif: "'Cormorant Garamond',Georgia,serif",
    headSize: "1.7rem",
    headCase: "none",
    headSpacing: "0",
    labels: {
      title: "The Observation Record",
      summary: "Manuscript Summary",
      journey: "Observation Journey",
      journeyNote: "Each star marks a stage this manuscript has passed.",
      omens: "Observed Signals",
      omensNote: "What IntelliFlow has read from this manuscript.",
      actions: "Review Actions",
      docs: "Attached Passages",
      notes: "Observation Notes",
      history: "Observation History",
      loading: "Reading the manuscript…",
    },
  },

  ADMIN: {
    key: "ADMIN",
    paper: "#e7e2d5",
    ink: "#292522",
    accent: "#713a35",
    gold: "#5a4030",
    goldDeep: "#5a4030",
    reached: "#53605a",
    rule: "rgba(41,37,34,0.22)",
    shellBg: "#2b3330",
    shellText: "#e7e2d5",
    muted: "#c3cbbe",
    btnText: "#f1ece0",
    danger: "#9b2929",
    hand: "#3b5069",
    card: "#f1ecdf",
    fold: "#cbbf9f",
    focus: "rgba(155,41,41,0.25)",
    glow: "rgba(155,41,41,0.35)",
    inputLine: "rgba(113,58,53,0.6)",
    inputRule: "rgba(83,96,90,0.25)",
    chevron: "%23713a35",
    innerBorder: "none",
    stack: "0 2px 0 #c4b793, 0 18px 34px -14px rgba(0,0,0,0.75)",
    headBorder: "rgba(216,201,170,0.6)",
    fDisplay: "'Special Elite','Courier New',monospace",
    fSerif: "'Courier Prime','Courier New',monospace",
    headSize: "1.15rem",
    headCase: "uppercase",
    headSpacing: "0.08em",
    labels: {
      title: "The Case File",
      summary: "Case Summary",
      journey: "Observation Timeline",
      journeyNote: "Each entry marks a stage this case has reached.",
      omens: "Review Indicators",
      omensNote: "What IntelliFlow has recorded for this case.",
      actions: "Case Actions",
      docs: "Supporting Documents",
      notes: "Teacher's Notes",
      history: "Observation History",
      loading: "Pulling the case file…",
    },
  },
};


const makeStyles = (t) => `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&family=Special+Elite&family=Work+Sans:wght@400;500;600&display=swap');
.rd-display{font-family:${t.fDisplay}}
.rd-serif{font-family:${t.fSerif};font-variant-numeric:lining-nums}
.rd-sans{font-family:'Work Sans',system-ui,sans-serif}
.rd-hand{font-family:'Caveat','Segoe Script',cursive}
.rd-wrap{overflow-wrap:anywhere}
.rd-input{width:100%;background-color:rgba(255,250,232,0.55);border:1px solid rgba(43,26,16,0.28);border-bottom:2px solid ${t.inputLine};color:${t.ink};padding:0.7rem 0.8rem;font:400 1rem 'Work Sans',system-ui,sans-serif;border-radius:2px;transition:box-shadow .2s,border-color .2s}
.rd-input::placeholder{color:rgba(43,26,16,0.5)}
.rd-input:focus{outline:none;border-color:${t.gold};border-bottom-color:${t.accent};box-shadow:0 0 0 3px ${t.focus}}
.rd-input:disabled{opacity:0.6;cursor:not-allowed}
select.rd-input{appearance:none;-webkit-appearance:none;padding-right:2.4rem;background-image:${chevron(t.chevron)};background-repeat:no-repeat;background-position:right 0.85rem center;cursor:pointer}
select.rd-input option{color:${t.ink};background:${t.paper}}
textarea.rd-input{resize:vertical;min-height:7.5rem;line-height:1.75rem;padding:0.4rem 0.8rem;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.75rem - 1px),${t.inputRule} calc(1.75rem - 1px),${t.inputRule} 1.75rem);background-attachment:local}
.rd-btn:focus-visible,.rd-upload:focus-within{outline:2px solid ${t.goldDeep};outline-offset:3px}
.rd-journey{display:flex;flex-direction:column;gap:1.4rem;border-left:1px solid ${t.gold};padding-left:1.5rem;margin-left:0.6rem;list-style:none}
.rd-step{position:relative}
.rd-seal{position:absolute;left:calc(-1.5rem - 9px);top:2px}
@media (min-width:640px){
  .rd-journey{flex-direction:row;flex-wrap:wrap;gap:1.8rem 0;border-left:0;padding-left:0;margin-left:0}
  .rd-step{flex:1 1 8.5rem;min-width:8.5rem;border-top:1px solid ${t.gold};padding:1.2rem 0.8rem 0 0}
  .rd-seal{left:0;top:-9px}
}
.rd-timeline{list-style:none;margin:0;padding:0 0 0 1.5rem;border-left:1px solid ${t.gold};margin-left:0.6rem}
.rd-timeline>li{position:relative;padding:0 0 1.4rem}
.rd-timeline>li::before{content:"";position:absolute;left:calc(-1.5rem - 5px);top:0.45rem;width:9px;height:9px;border-radius:${t.key === "ADMIN" ? "1px" : "50%"};background:${t.accent};box-shadow:0 0 0 2px ${t.paper},0 0 0 3px ${t.gold}}
@keyframes rd-twinkle{0%,100%{opacity:.25}50%{opacity:.9}}
@keyframes rd-light{0%,100%{opacity:.5}50%{opacity:.8}}
@keyframes rd-settle{from{opacity:0;transform:translateY(-12px) rotate(var(--r0,0deg))}to{opacity:var(--o,.5);transform:translateY(0) rotate(var(--r,0deg))}}
@keyframes rd-mote{from{transform:translate(0,0);opacity:0}15%{opacity:.45}85%{opacity:.35}to{transform:translate(22px,-70px);opacity:0}}
@keyframes rd-redline{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes rd-stampin{from{opacity:0;transform:scale(1.5) rotate(-9deg)}to{opacity:1;transform:scale(1) rotate(-3deg)}}
@keyframes rd-clip{0%{transform:rotate(-14deg) translateY(-6px)}100%{transform:rotate(0) translateY(0)}}
@keyframes rd-note{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
.rd-star{position:absolute;border-radius:50%;background:#eef0ff;animation:rd-twinkle 5s ease-in-out infinite}
.rd-light{animation:rd-light 14s ease-in-out infinite}
.rd-sheet{opacity:var(--o,.5);transform:rotate(var(--r,0deg));animation:rd-settle 1.6s ease-out both}
.rd-mote{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(231,226,213,.55);animation:rd-mote 26s linear infinite}
.rd-redline{display:block;height:3px;margin-top:6px;width:min(14rem,60%);background:#9b2929;opacity:.85;border-radius:2px;transform:rotate(-.6deg);animation:rd-redline 1.1s .5s ease-out both}
.rd-stampin{animation:rd-stampin .6s .3s ease-out both}
.rd-clip{transform-origin:50% 100%;animation:rd-clip .9s .4s ease-out both}
.rd-note{animation:rd-note 1s .9s ease-out both}
.rd-margin{position:absolute;top:0;bottom:0;left:16px;width:3px;border-left:1px solid rgba(155,41,41,.5);border-right:1px solid rgba(155,41,41,.25);pointer-events:none}
@media (min-width:640px){.rd-margin{left:30px}}
.rd-room-desk{display:none}
.rd-room-extra{display:none}
@media (min-width:768px){.rd-room-desk{display:block}}
@media (min-width:1100px){.rd-room-extra{display:block}}
@media (prefers-reduced-motion:reduce){.rd-star,.rd-light,.rd-sheet,.rd-mote,.rd-redline,.rd-stampin,.rd-clip,.rd-note{animation:none}}
`;


/* ------------------------------------------------------------------ */
/* ROLE BACKGROUNDS (reviewer + admin, CSS / SVG only)                 */
/* ------------------------------------------------------------------ */

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 47.3) % 100,
  y: (i * 29.7 + ((i * i) % 13) * 3) % 100,
  s: i % 5 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
  d: (i % 7) * 0.7,
}));

const CONSTELLATIONS = [
  [[8, 14], [18, 8], [30, 15], [40, 7]],
  [[68, 12], [78, 22], [88, 15], [93, 28]],
  [[10, 62], [22, 55], [31, 66], [42, 58]],
  [[72, 70], [82, 62], [90, 74]],
];

function ObservatoryBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex: 0,
        background:
          "radial-gradient(ellipse at 50% 0%, #1b2561 0%, #0a1030 60%, #060a1f 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {CONSTELLATIONS.map((points, i) => (
          <polyline
            key={i}
            points={points.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="rgba(200,205,235,0.28)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {CONSTELLATIONS.flat().map(([x, y], i) => (
        <span
          key={`c${i}`}
          className="rd-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: 4,
            height: 4,
            background: "#e9dca8",
            animationDelay: `${(i % 5) * 0.8}s`,
          }}
        />
      ))}

      {STARS.map((star, i) => (
        <span
          key={i}
          className="rd-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.s,
            height: star.s,
            animationDelay: `${star.d}s`,
          }}
        />
      ))}
    </div>
  );
}


const MOTES = [12, 28, 41, 57, 69, 83];

function ClassroomBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background:
          "linear-gradient(180deg,#46524c 0,#53605a 52%,#4a554f 66%,#5a4030 66.4%,#3b2a20 100%)",
      }}
    >
      {/* wood wainscot on the lower wall */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "48%",
          height: "18%",
          opacity: 0.5,
          background:
            "repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 2px,transparent 2px 64px),#4a3a2e",
          borderTop: "4px solid #5a4030",
        }}
      />

      {/* floor boards */}
      <div
        style={{
          position: "absolute",
          inset: "66.4% 0 0 0",
          background:
            "repeating-linear-gradient(90deg,rgba(0,0,0,.28) 0 2px,transparent 2px 80px)",
        }}
      />

      {/* window light drifting across the room */}
      <div
        className="rd-light"
        style={{
          position: "absolute",
          top: "-10%",
          right: "-6%",
          width: "50%",
          height: "95%",
          background:
            "linear-gradient(245deg,rgba(236,226,190,.2),rgba(236,226,190,0) 70%)",
          clipPath: "polygon(30% 0,100% 0,80% 100%,0 100%)",
        }}
      />

      {/* chalkboard */}
      <div
        className="rd-room-extra"
        style={{
          position: "absolute",
          left: "2%",
          top: "9%",
          width: "24%",
          height: "22%",
          background: "#25302b",
          border: "6px solid #5a4030",
          boxShadow: "inset 0 0 30px rgba(0,0,0,.5)",
          opacity: 0.85,
        }}
      >
        <p
          className="rd-hand"
          style={{
            margin: "8% 8% 0",
            fontSize: "clamp(16px,1.6vw,26px)",
            color: "rgba(231,226,213,.5)",
            lineHeight: 1.2,
          }}
        >
          Observation notes
        </p>
        <p
          className="rd-hand"
          style={{
            margin: "4% 8% 0",
            fontSize: "clamp(14px,1.3vw,22px)",
            color: "rgba(231,226,213,.35)",
            lineHeight: 1.2,
          }}
        >
          reading · counting · quiet time
        </p>
        <span
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            bottom: -12,
            height: 6,
            background: "#5a4030",
          }}
        />
      </div>

      {/* classroom window */}
      <div
        className="rd-room-extra"
        style={{
          position: "absolute",
          right: "4%",
          top: "7%",
          width: "13%",
          height: "26%",
          border: "6px solid #6b4d38",
          background:
            "linear-gradient(180deg,rgba(236,226,190,.35),rgba(200,210,200,.18))",
          display: "grid",
          gridTemplate: "1fr 1fr / 1fr 1fr",
          gap: 4,
          opacity: 0.7,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ background: "rgba(255,250,225,.12)" }} />
        ))}
      </div>

      {/* filing cabinet */}
      <div
        className="rd-room-extra"
        style={{
          position: "absolute",
          right: "3%",
          bottom: "6%",
          width: 78,
          height: 160,
          background: "#4b514d",
          border: "2px solid #2f3431",
          opacity: 0.7,
          padding: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "31%",
              marginBottom: "2%",
              background: "#5a615c",
              border: "1px solid #2f3431",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: "38%",
                width: 24,
                height: 5,
                marginLeft: -12,
                background: "#a9a58f",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 6,
                top: 5,
                width: 16,
                height: 9,
                background: "#d8c9aa",
              }}
            />
          </div>
        ))}
      </div>

      {/* worksheets with a child's drawing and teacher's red marks */}
      <div
        className="rd-sheet rd-room-extra"
        style={{
          "--o": 0.55,
          "--r": "-6deg",
          "--r0": "-16deg",
          position: "absolute",
          right: "13%",
          bottom: "4%",
          width: 120,
          height: 150,
          background: "#ddd3b8",
          boxShadow: "0 8px 16px rgba(0,0,0,.4)",
          backgroundImage:
            "repeating-linear-gradient(180deg,transparent 0 17px,rgba(83,96,90,.35) 17px 18px)",
        }}
      >
        <svg viewBox="0 0 120 150" style={{ position: "absolute", inset: 0 }}>
          <circle cx="92" cy="26" r="9" fill="none" stroke="#c0883a" strokeWidth="2" />
          <path d="M20 118 V84 L44 64 L68 84 V118 Z" fill="none" stroke="#53605a" strokeWidth="2" />
          <rect x="38" y="98" width="12" height="20" fill="none" stroke="#713a35" strokeWidth="2" />
          <path d="M14 40 q10 -6 20 0" fill="none" stroke="#9b2929" strokeWidth="2" />
        </svg>
      </div>

      {/* child-sized desk, empty small chair, hung backpack */}
      <svg
        className="rd-room-desk"
        viewBox="0 0 260 190"
        style={{
          position: "absolute",
          left: "2%",
          bottom: "4%",
          width: "clamp(180px,22vw,320px)",
          opacity: 0.6,
        }}
      >
        <rect x="20" y="92" width="150" height="9" fill="#7a573b" />
        <rect x="20" y="101" width="150" height="3" fill="#2a1d15" />
        <rect x="30" y="104" width="6" height="68" fill="#241812" />
        <rect x="154" y="104" width="6" height="68" fill="#241812" />
        <rect x="36" y="130" width="118" height="4" fill="#241812" />
        <rect x="60" y="82" width="42" height="10" fill="#ddd3b8" />
        <rect x="66" y="86" width="22" height="2" fill="#9b2929" />
        <rect x="186" y="116" width="46" height="6" fill="#7a573b" />
        <rect x="190" y="122" width="5" height="50" fill="#241812" />
        <rect x="226" y="122" width="5" height="50" fill="#241812" />
        <rect x="224" y="70" width="6" height="52" fill="#7a573b" />
        <rect x="222" y="72" width="14" height="3" fill="#7a573b" />
        <rect x="231" y="84" width="22" height="30" rx="5" fill="#713a35" />
        <rect x="236" y="92" width="12" height="9" rx="2" fill="#5a2a26" />
      </svg>

      {/* chalk dust barely moving in the light */}
      {MOTES.map((left, i) => (
        <span
          key={left}
          className="rd-mote"
          style={{
            left: `${left}%`,
            top: `${46 + (i % 3) * 14}%`,
            animationDelay: `${i * 3.8}s`,
          }}
        />
      ))}

      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%,transparent 50%,rgba(0,0,0,.5) 100%)",
        }}
      />
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* PRIMITIVES                                                          */
/* ------------------------------------------------------------------ */

function Sigil({ t, size = 18 }) {
  if (t.key === "ADMIN") {
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" stroke={t.danger} strokeWidth="2.2" aria-hidden="true">
        <path d="M8 36l3-9L31 7l6 6-20 20z" />
        <path d="M27 11l6 6" />
        <path d="M8 36l7-2" />
      </svg>
    );
  }

  if (t.key === "REVIEWER") {
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" stroke={t.gold} strokeWidth="1.6" aria-hidden="true">
        <path d="M22 4l5 13 14 1-11 9 4 14-12-8-12 8 4-14L3 18l14-1z" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" stroke={t.gold} strokeWidth="1.6" aria-hidden="true">
      <circle cx="22" cy="22" r="19" />
      <circle cx="22" cy="22" r="5" />
      <path d="M22 3v38M3 22h38M8.6 8.6l26.8 26.8M35.4 8.6L8.6 35.4" />
    </svg>
  );
}


function Section({ t, title, note, action, reduced, children }) {
  const admin = t.key === "ADMIN";

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ marginTop: "2.4rem" }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Sigil t={t} />
        <h2
          className={admin ? "rd-display" : "rd-serif"}
          style={{
            fontSize: t.headSize,
            fontWeight: 700,
            lineHeight: 1,
            color: t.accent,
            textTransform: t.headCase,
            letterSpacing: t.headSpacing,
          }}
        >
          {title}
        </h2>
        <span
          aria-hidden="true"
          style={{
            flex: 1,
            minWidth: 40,
            height: admin ? 2 : 1,
            background: admin
              ? `linear-gradient(90deg, ${t.danger}, rgba(155,41,41,0))`
              : `linear-gradient(90deg, ${t.gold}, rgba(0,0,0,0))`,
          }}
        />
        {action}
      </div>
      {note && (
        <p className="rd-serif italic" style={{ fontSize: admin ? "0.95rem" : "1.1rem", opacity: 0.8, marginTop: 6 }}>
          {note}
        </p>
      )}
      <div style={{ marginTop: "1.2rem" }}>{children}</div>
    </motion.section>
  );
}


function Page({ t, children, reduced }) {
  const motionProps = {
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 110, damping: 20 },
  };

  if (t.key === "ADMIN") {
    const tab = (left, bg, color, text) => (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -25,
          left,
          padding: "3px 14px",
          background: bg,
          border: "1px solid rgba(41,37,34,0.35)",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          font: "12px 'Courier New',monospace",
          letterSpacing: ".18em",
          color,
        }}
      >
        {text}
      </div>
    );

    return (
      <motion.div
        {...motionProps}
        className="relative"
        style={{
          background: "#d8c9aa",
          padding: "14px 10px",
          border: "1px solid rgba(41,37,34,0.35)",
          borderRadius: "2px 6px 2px 2px",
          boxShadow: t.stack,
        }}
      >
        {tab(22, "#d8c9aa", t.danger, "CASE FILE")}
        {tab(150, "#cbbd9a", t.accent, "OBSERVATIONS")}

        <div
          className="relative"
          style={{
            background: t.paper,
            color: t.ink,
            border: "1px solid rgba(41,37,34,0.25)",
            boxShadow: "1px 2px 0 rgba(0,0,0,0.12)",
          }}
        >
          <div aria-hidden="true" className="rd-margin" />

          <svg
            aria-hidden="true"
            className="rd-clip"
            width="26"
            height="64"
            viewBox="0 0 26 64"
            fill="none"
            stroke="#7d8480"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ position: "absolute", top: -14, right: 34, zIndex: 2 }}
          >
            <path d="M8 48V14a5 5 0 0 1 10 0v38a8 8 0 0 1-16 0V18" />
          </svg>

          <div className="relative">{children}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...motionProps}
      className="relative"
      style={{
        background: t.paper,
        color: t.ink,
        border: "1px solid rgba(43,26,16,0.3)",
        boxShadow: t.stack,
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.16 }} />
      <div aria-hidden="true" className="pointer-events-none absolute" style={{ inset: 8, border: t.innerBorder }} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}


function Stamp({ t, status, label }) {
  const admin = t.key === "ADMIN";

  const ink =
    status === "APPROVED"
      ? "#3d5a2a"
      : status === "REJECTED"
      ? "#9b2929"
      : status === "CHANGES_REQUESTED"
      ? "#8a5a12"
      : admin
      ? "#9b2929"
      : "#5a3b22";

  return (
    <span
      className={`rd-display ${admin ? "rd-stampin" : ""}`}
      style={{
        display: "inline-block",
        fontSize: "1rem",
        letterSpacing: admin ? "0.12em" : "0.04em",
        textTransform: admin ? "uppercase" : "none",
        color: ink,
        border: `${admin ? 2 : 1.5}px solid ${ink}`,
        padding: "2px 12px",
        transform: "rotate(-1.5deg)",
      }}
    >
      {label}
    </span>
  );
}


function Fact({ t, label, children }) {
  return (
    <div style={{ padding: "0.65rem 0", borderBottom: `1px solid ${t.rule}` }}>
      <dt className="rd-sans" style={{ fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", opacity: 0.72 }}>
        {label.toUpperCase()}
      </dt>
      <dd className="rd-serif rd-wrap" style={{ fontSize: t.key === "ADMIN" ? "1.15rem" : "1.25rem", fontWeight: 700, lineHeight: 1.25, marginTop: 2 }}>
        {children}
      </dd>
    </div>
  );
}


function RequestDetails() {

  const reduced = useReducedMotion();


  const requestId =
    window.location.pathname.split(
      "/request/"
    )[1];


  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "intelliflow_user"
        ) || "null"
      );
    } catch {
      return null;
    }
  })();


  const isUser =
    user?.role === "USER";


  const isReviewer =
    user?.role === "REVIEWER";


  const isAdmin =
    user?.role === "ADMIN";


  const t = isAdmin
    ? THEMES.ADMIN
    : isReviewer
    ? THEMES.REVIEWER
    : THEMES.USER;


  const L = t.labels;


  const [
    request,
    setRequest,
  ] = useState(null);


  const [
    auditLogs,
    setAuditLogs,
  ] = useState([]);


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    comments,
    setComments,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    commentMessage,
    setCommentMessage,
  ] = useState("");


  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");


  const [
    submittingStatus,
    setSubmittingStatus,
  ] = useState(false);


  const [
    submittingComment,
    setSubmittingComment,
  ] = useState(false);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const loadRequestData =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const [
          requestData,
          auditData,
          documentData,
          commentData,
        ] = await Promise.all([
          api.getRequestById(
            requestId
          ),
          api.getAuditLogs(
            requestId
          ),
          api.getDocuments(
            requestId
          ),
          api.getComments(
            requestId
          ),
        ]);


        setRequest(
          requestData.request
        );


        setAuditLogs(
          auditData.auditLogs ||
          []
        );


        setDocuments(
          documentData.documents ||
          []
        );


        setComments(
          commentData.comments ||
          []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    if (!requestId) {

      setMessage(
        "Invalid request."
      );

      setLoading(false);

      return;
    }


    loadRequestData();

  }, [requestId]);


  const navigate = (
    path
  ) => {

    window.location.href =
      path;
  };


  const formatStatus = (
    value
  ) => {

    if (!value) {
      return "—";
    }


    return value
      .replaceAll(
        "_",
        " "
      )
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };


  const formatDate = (
    value
  ) => {

    if (!value) {
      return "—";
    }


    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatDateTime = (
    value
  ) => {

    if (!value) {
      return "—";
    }


    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  const getAllowedStatuses = () => {

    if (!request) {
      return [];
    }


    const transitions = {
      DRAFT: [
        "SUBMITTED",
      ],

      SUBMITTED: [
        "UNDER_REVIEW",
      ],

      UNDER_REVIEW: [
        "APPROVED",
        "REJECTED",
        "CHANGES_REQUESTED",
      ],

      CHANGES_REQUESTED: [
        "RESUBMITTED",
      ],

      RESUBMITTED: [
        "UNDER_REVIEW",
      ],

      APPROVED: [],

      REJECTED: [],
    };


    return (
      transitions[
        request.status
      ] || []
    );
  };


  const handleStatusUpdate =
    async (
      status
    ) => {

      if (!status) {
        return;
      }


      const requiresComment =
        [
          "APPROVED",
          "REJECTED",
          "CHANGES_REQUESTED",
        ].includes(
          status
        );


      if (
        requiresComment &&
        !commentMessage.trim()
      ) {

        setMessage(
          "Please add a comment before completing this workflow action."
        );

        return;
      }


      try {

        setSubmittingStatus(
          true
        );

        setMessage("");


        await api.updateRequestStatus(
          requestId,
          status,
          commentMessage.trim()
        );


        setSelectedStatus(
          ""
        );


        setCommentMessage(
          ""
        );


        await loadRequestData();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setSubmittingStatus(
          false
        );
      }
    };


  const handleCommentSubmit =
    async (event) => {

      event.preventDefault();


      if (
        !commentMessage.trim()
      ) {

        setMessage(
          "Please enter a comment."
        );

        return;
      }


      try {

        setSubmittingComment(
          true
        );

        setMessage("");


        await api.createComment(
          requestId,
          commentMessage.trim()
        );


        setCommentMessage(
          ""
        );


        const data =
          await api.getComments(
            requestId
          );


        setComments(
          data.comments || []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setSubmittingComment(
          false
        );
      }
    };


  const handleDocumentUpload =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      try {

        setUploading(true);

        setMessage("");


        await api.uploadDocument(
          requestId,
          file
        );


        const data =
          await api.getDocuments(
            requestId
          );


        setDocuments(
          data.documents || []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setUploading(false);

        event.target.value = "";
      }
    };


  const shell = (content) => (
    <div
      className="relative min-h-screen overflow-x-hidden px-3 pb-20 pt-8 sm:px-8 md:pt-12"
      style={{ backgroundColor: t.shellBg, color: t.shellText }}
    >
      <style>{makeStyles(t)}</style>

      {t.key === "USER" && <MagicalLibraryBackground />}
      {t.key === "REVIEWER" && <ObservatoryBackground />}
      {t.key === "ADMIN" && <ClassroomBackground />}

      <div className="relative z-10 mx-auto max-w-[960px]">
        {content}
      </div>
    </div>
  );


  const alertNote = message ? (
    <div
      role="alert"
      className="rd-sans rd-wrap"
      style={{
        marginTop: "1.6rem",
        padding: "0.7rem 0.9rem",
        borderLeft: "3px solid #9b2929",
        background: "#f3e2d0",
        color: "#6f2113",
        fontSize: "0.92rem",
      }}
    >
      {message}
    </div>
  ) : null;


  const ghostButton = {
    padding: "0.7rem 1.2rem",
    background: "transparent",
    color: t.ink,
    border: `1px solid ${t.ink}`,
    borderRadius: 2,
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    cursor: "pointer",
  };


  const pageGap =
    t.key === "ADMIN"
      ? "2.6rem"
      : "1.8rem";


  if (loading) {

    return shell(
      <div style={{ marginTop: t.key === "ADMIN" ? "1.6rem" : 0 }}>
        <Page t={t} reduced={reduced}>
          <div role="status" aria-live="polite" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Sigil t={t} size={34} />
            </div>
            <p className="rd-serif italic" style={{ fontSize: "1.6rem" }}>
              {L.loading}
            </p>
          </div>
        </Page>
      </div>
    );
  }


  if (!request) {

    return shell(
      <div style={{ marginTop: t.key === "ADMIN" ? "1.6rem" : 0 }}>
        <Page t={t} reduced={reduced}>
          <div style={{ padding: "3rem 2rem" }}>
            <h1 className="rd-display" style={{ fontSize: "2rem", lineHeight: 1.1 }}>
              {L.title}
            </h1>
            <p
              role="alert"
              className="rd-serif rd-wrap"
              style={{ fontSize: "1.4rem", color: t.danger, marginTop: 14 }}
            >
              {message || "Request could not be loaded."}
            </p>
            <button
              type="button"
              className="rd-btn rd-sans"
              onClick={() => navigate("/")}
              style={{ ...ghostButton, marginTop: 22 }}
            >
              BACK TO DASHBOARD
            </button>
          </div>
        </Page>
      </div>
    );
  }


  const intelligence =
    request.intelligence ||
    {};


  const allowedStatuses =
    getAllowedStatuses();


  const requiresComment =
    [
      "APPROVED",
      "REJECTED",
      "CHANGES_REQUESTED",
    ].includes(
      selectedStatus
    );


  const canTakeWorkflowAction =
    (
      isUser ||
      isReviewer ||
      isAdmin
    ) &&
    allowedStatuses.length > 0;


  /* ---- journey: built only from real request / audit data ---- */

  const logStatus = (log) =>
    log.newStatus ?? log.toStatus ?? log.to ?? null;

  const sortedLogs = [...auditLogs].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const stepDates = {};
  const reached = [];
  const addStep = (status, date) => {
    if (!status) return;
    if (!reached.includes(status)) reached.push(status);
    if (date && !stepDates[status]) stepDates[status] = date;
  };

  if (request.createdAt) addStep("DRAFT", request.createdAt);
  if (request.submittedAt) addStep("SUBMITTED", request.submittedAt);
  sortedLogs.forEach((log) => addStep(logStatus(log), log.createdAt));

  const journeyReached = reached.filter((status) => status !== request.status);
  journeyReached.push(request.status);
  if (!stepDates[request.status] && request.stageChangedAt) {
    stepDates[request.status] = request.stageChangedAt;
  }

  const journey = [
    ...journeyReached.map((status) => ({
      status,
      state: status === request.status ? "current" : "reached",
    })),
    ...allowedStatuses
      .filter((status) => !journeyReached.includes(status))
      .map((status) => ({ status, state: "next" })),
  ];

  const riskText = String(intelligence.riskLevel || "");
  const riskTone = /high|critical/i.test(riskText) ? t.danger : t.ink;
  const deadlineText = String(intelligence.deadlineStatus || "");
  const deadlineTone = /overdue|late/i.test(deadlineText)
    ? t.danger
    : /soon|approach|risk/i.test(deadlineText)
    ? t.hand
    : t.ink;
  const stageDuration =
    intelligence.stageDuration ??
    intelligence.stageDurationDays ??
    intelligence.daysInStage ??
    null;

  const subLine =
    t.key === "ADMIN"
      ? `Case ref. ${request.requestId} · ${request.type}`
      : `${request.requestId} · ${request.type}`;

  const primaryButton = (bg, busy) => ({
    padding: "0.85rem 1.5rem",
    background: bg,
    color: t.btnText,
    border: `1px solid ${t.key === "ADMIN" ? "#2b211d" : t.gold}`,
    borderRadius: 2,
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.8 : 1,
  });


  return shell(
    <>

      <header className="px-1">

        {t.key === "ADMIN" && (
          <p
            className="rd-stampin"
            style={{
              display: "inline-block",
              margin: "0 0 10px",
              padding: "2px 10px",
              font: "12px 'Courier New',monospace",
              letterSpacing: ".22em",
              color: "#f0b3ad",
              border: "1.5px solid #c24a4a",
            }}
          >
            CONFIDENTIAL
          </p>
        )}

        <h1
          className="rd-display"
          style={{
            fontSize: "clamp(2rem, 4.8vw, 3.6rem)",
            lineHeight: 1,
            textTransform: t.key === "ADMIN" ? "uppercase" : "none",
            letterSpacing: t.key === "ADMIN" ? "0.04em" : "0",
          }}
        >
          {L.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3" style={{ marginTop: 10 }}>

          <p
            className={`${t.key === "ADMIN" ? "rd-display" : "rd-serif italic"} rd-wrap`}
            style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: t.muted }}
          >
            {subLine}
          </p>

          <button
            type="button"
            className="rd-btn rd-sans"
            onClick={() => navigate("/")}
            style={{ ...ghostButton, color: t.shellText, border: `1px solid ${t.headBorder}` }}
          >
            BACK TO DASHBOARD
          </button>

        </div>

      </header>


      {alertNote}


      <div style={{ marginTop: pageGap }}>

        <Page t={t} reduced={reduced}>

          <div className="px-6 py-9 sm:px-12 sm:py-12">

            {/* SUMMARY */}

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div style={{ flex: "1 1 18rem", minWidth: 0 }}>

                <h2
                  className="rd-serif rd-wrap"
                  style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 700, lineHeight: 1.1, minWidth: 0 }}
                >
                  {request.title}
                </h2>

                {t.key === "ADMIN" && (
                  <>
                    <span className="rd-redline" aria-hidden="true" />
                    <p
                      className="rd-hand rd-note"
                      style={{ margin: "6px 0 0", fontSize: "1.35rem", color: t.danger, transform: "rotate(-1deg)", transformOrigin: "left" }}
                    >
                      Filed {formatDate(request.createdAt)}
                    </p>
                  </>
                )}

              </div>

              <Stamp t={t} status={request.status} label={formatStatus(request.status)} />

            </div>

            <p
              className="rd-sans rd-wrap"
              style={{ fontSize: "1rem", lineHeight: 1.7, marginTop: 18, whiteSpace: "pre-wrap" }}
            >
              {request.description}
            </p>

            <Section t={t} title={L.summary} reduced={reduced}>

              <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2" style={{ margin: 0 }}>

                <Fact t={t} label={t.key === "ADMIN" ? "Case number" : "Request ID"}>{request.requestId}</Fact>

                <Fact t={t} label="Workflow type">{request.type}</Fact>

                <Fact t={t} label={t.key === "ADMIN" ? "Urgency" : "Priority"}>{formatStatus(request.priority || "MEDIUM")}</Fact>

                <Fact t={t} label={t.key === "ADMIN" ? "Submitted by" : "Created by"}>{request.createdBy?.name || "—"}</Fact>

                <Fact t={t} label={t.key === "ADMIN" ? "Assigned observer" : "Reviewer"}>{request.assignedReviewer?.name || "Unassigned"}</Fact>

                <Fact t={t} label={t.key === "ADMIN" ? "Opened" : "Created"}>{formatDate(request.createdAt)}</Fact>

                <Fact t={t} label={t.key === "ADMIN" ? "Review date" : "Due date"}>{formatDate(request.dueDate)}</Fact>

                <Fact t={t} label="Submitted">{formatDateTime(request.submittedAt)}</Fact>

                <Fact t={t} label="Stage changed">{formatDateTime(request.stageChangedAt)}</Fact>

              </dl>

            </Section>


            {/* JOURNEY */}

            <Section t={t} title={L.journey} note={L.journeyNote} reduced={reduced}>

              <ol className="rd-journey" aria-label="Workflow progression">

                {journey.map((step, index) => (

                  <li
                    key={step.status}
                    className="rd-step"
                    aria-current={step.state === "current" ? "step" : undefined}
                  >

                    <motion.span
                      aria-hidden="true"
                      className="rd-seal"
                      initial={reduced ? false : { scale: 0.5, opacity: 0.3 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.14, duration: 0.45, ease: EASE }}
                      style={{
                        display: "block",
                        width: 18,
                        height: 18,
                        borderRadius: t.key === "ADMIN" ? 3 : "50%",
                        background:
                          step.state === "current"
                            ? t.accent
                            : step.state === "reached"
                            ? t.reached || t.gold
                            : "transparent",
                        border:
                          step.state === "next"
                            ? `1.5px dashed ${t.gold}`
                            : `1.5px solid ${step.state === "current" ? t.gold : t.goldDeep}`,
                        boxShadow:
                          step.state === "current"
                            ? `0 0 0 3px ${t.focus}, 0 0 14px ${t.glow}`
                            : "none",
                      }}
                    />

                    <div
                      className="rd-serif"
                      style={{
                        fontSize: t.key === "ADMIN" ? "1.1rem" : "1.25rem",
                        fontWeight: step.state === "current" ? 700 : 500,
                        lineHeight: 1.15,
                        opacity: step.state === "next" ? 0.6 : 1,
                        color: step.state === "current" ? t.accent : t.ink,
                      }}
                    >
                      {formatStatus(step.status)}
                    </div>

                    <div className="rd-sans" style={{ fontSize: "0.78rem", marginTop: 3, opacity: 0.75 }}>
                      {step.state === "current"
                        ? "Current stage"
                        : step.state === "next"
                        ? "Possible next stage"
                        : stepDates[step.status]
                        ? formatDate(stepDates[step.status])
                        : "Reached"}
                    </div>

                  </li>

                ))}

              </ol>

            </Section>


            {/* INDICATORS */}

            <Section t={t} title={L.omens} note={L.omensNote} reduced={reduced}>

              <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-3" style={{ margin: 0 }}>

                <div style={{ padding: "0.65rem 0", borderBottom: `1px solid ${t.rule}` }}>
                  <dt className="rd-sans" style={{ fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", opacity: 0.72 }}>{t.key === "ADMIN" ? "CONCERN LEVEL" : "RISK"}</dt>
                  <dd className="rd-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: riskTone, marginTop: 2 }}>
                    {formatStatus(intelligence.riskLevel)}
                  </dd>
                </div>

                <div style={{ padding: "0.65rem 0", borderBottom: `1px solid ${t.rule}` }}>
                  <dt className="rd-sans" style={{ fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", opacity: 0.72 }}>{t.key === "ADMIN" ? "CONCERN SCORE" : "RISK SCORE"}</dt>
                  <dd className="rd-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: riskTone, marginTop: 2 }}>
                    {intelligence.riskScore ?? 0}/100
                  </dd>
                </div>

                <div style={{ padding: "0.65rem 0", borderBottom: `1px solid ${t.rule}` }}>
                  <dt className="rd-sans" style={{ fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", opacity: 0.72 }}>{t.key === "ADMIN" ? "REVIEW DATE STATUS" : "DEADLINE"}</dt>
                  <dd className="rd-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: deadlineTone, marginTop: 2 }}>
                    {formatStatus(intelligence.deadlineStatus)}
                  </dd>
                </div>

              </dl>

              {stageDuration !== null && stageDuration !== undefined && (
                <p className="rd-sans" style={{ fontSize: "0.9rem", marginTop: 14 }}>
                  Time in this stage: <strong>{String(stageDuration)}</strong>
                </p>
              )}

              {intelligence.reasons?.length > 0 && (
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
                  {intelligence.reasons.map((reason, index) => (
                    <li
                      key={`${reason}-${index}`}
                      className="rd-hand rd-wrap"
                      style={{ fontSize: "1.35rem", lineHeight: 1.25, color: t.danger, marginBottom: 4 }}
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              )}

              {intelligence.recommendation && (
                <p className="rd-hand rd-wrap" style={{ fontSize: "1.4rem", lineHeight: 1.25, color: t.hand, marginTop: 12 }}>
                  Recommendation: {intelligence.recommendation}
                </p>
              )}

            </Section>


            {/* ACTIONS */}

            {canTakeWorkflowAction && (

              <Section
                t={t}
                title={L.actions}
                note="Available actions depend on the current workflow state and your role."
                reduced={reduced}
              >

                <p className="rd-sans" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Current state: <strong>{formatStatus(request.status)}</strong>
                  {" · "}
                  Available transitions:{" "}
                  <strong>{allowedStatuses.map(formatStatus).join(", ")}</strong>
                </p>

                <div style={{ marginTop: "1.2rem" }}>

                  <label htmlFor="workflow-status" className="rd-serif" style={{ display: "block", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>
                    Select Workflow Action
                  </label>

                  <select
                    id="workflow-status"
                    className="rd-input"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                  >

                    <option value="">
                      Select an action
                    </option>

                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}

                  </select>

                </div>


                {selectedStatus && (

                  <div style={{ marginTop: "1.2rem" }}>

                    <label htmlFor="workflow-comment" className="rd-serif" style={{ display: "block", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>
                      {requiresComment ? "Comment Required" : "Comment"}
                    </label>

                    <textarea
                      id="workflow-comment"
                      className="rd-input"
                      value={commentMessage}
                      onChange={(event) => setCommentMessage(event.target.value)}
                      placeholder={
                        requiresComment
                          ? "Explain the decision or requested changes..."
                          : "Add an optional workflow comment..."
                      }
                      rows="4"
                    />

                  </div>

                )}


                {selectedStatus && (

                  <div className="flex flex-col gap-3 sm:flex-row" style={{ marginTop: "1.2rem" }}>

                    <button
                      type="button"
                      className="rd-btn rd-sans"
                      disabled={submittingStatus}
                      onClick={() => handleStatusUpdate(selectedStatus)}
                      style={primaryButton(
                        selectedStatus === "REJECTED"
                          ? "#7a2417"
                          : selectedStatus === "CHANGES_REQUESTED"
                          ? "#7a5210"
                          : t.accent,
                        submittingStatus
                      )}
                    >
                      {submittingStatus
                        ? "UPDATING…"
                        : `CONFIRM ${formatStatus(selectedStatus).toUpperCase()}`}
                    </button>

                    <button
                      type="button"
                      className="rd-btn rd-sans"
                      disabled={submittingStatus}
                      onClick={() => {
                        setSelectedStatus("");
                        setCommentMessage("");
                      }}
                      style={{ ...ghostButton, opacity: submittingStatus ? 0.6 : 1 }}
                    >
                      CANCEL ACTION
                    </button>

                  </div>

                )}

              </Section>

            )}


            {!canTakeWorkflowAction && (

              <Section t={t} title="No Action Available" reduced={reduced}>

                <p className="rd-serif italic" style={{ fontSize: "1.25rem" }}>
                  This request has no workflow transition currently available to your role.
                </p>

              </Section>

            )}


            {/* DOCUMENTS */}

            <Section
              t={t}
              title={L.docs}
              reduced={reduced}
              action={

                <label
                  className="rd-upload rd-sans"
                  style={{
                    display: "inline-block",
                    padding: "0.55rem 1rem",
                    border: `1px solid ${t.accent}`,
                    color: t.accent,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    cursor: uploading ? "wait" : "pointer",
                    opacity: uploading ? 0.7 : 1,
                  }}
                >

                  {uploading ? "UPLOADING…" : "UPLOAD DOCUMENT"}

                  <input
                    type="file"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleDocumentUpload}
                  />

                </label>

              }
            >

              {documents.length === 0 ? (

                <p className="rd-serif italic" style={{ fontSize: "1.25rem" }}>
                  No documents have been uploaded for this request.
                </p>

              ) : (

                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>

                  {documents.map((document, index) => (

                    <li
                      key={document._id}
                      style={{
                        position: "relative",
                        background: t.card,
                        border: `1px solid ${t.rule}`,
                        padding: "0.9rem 2.2rem 0.9rem 1rem",
                        transform: `rotate(${index % 2 === 0 ? -0.4 : 0.4}deg)`,
                        boxShadow: "1px 2px 0 rgba(43,26,16,0.12)",
                      }}
                    >

                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          width: 16,
                          height: 16,
                          background: t.fold,
                          clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                        }}
                      />

                      <strong className="rd-serif rd-wrap" style={{ display: "block", fontSize: t.key === "ADMIN" ? "1.05rem" : "1.2rem", lineHeight: 1.2 }}>
                        {document.originalName}
                      </strong>

                      <span className="rd-sans rd-wrap" style={{ display: "block", fontSize: "0.78rem", marginTop: 4, opacity: 0.8 }}>
                        {document.mimeType}
                      </span>

                      <span className="rd-sans" style={{ display: "block", fontSize: "0.78rem", opacity: 0.8 }}>
                        {Math.round((document.size || 0) / 1024)} KB
                      </span>

                      <span className="rd-sans" style={{ display: "block", fontSize: "0.78rem", opacity: 0.8 }}>
                        Uploaded by {document.uploadedBy?.name || "User"}
                      </span>

                    </li>

                  ))}

                </ul>

              )}

            </Section>


            {/* NOTES */}

            <Section t={t} title={L.notes} note="Add context, questions, or additional information." reduced={reduced}>

              <form onSubmit={handleCommentSubmit}>

                <label htmlFor="general-comment" className="rd-serif" style={{ display: "block", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>
                  Add Comment
                </label>

                <textarea
                  id="general-comment"
                  className="rd-input"
                  value={commentMessage}
                  onChange={(event) => setCommentMessage(event.target.value)}
                  placeholder="Add context, questions, or additional information..."
                  rows="4"
                />

                <button
                  type="submit"
                  className="rd-btn rd-sans"
                  disabled={submittingComment}
                  style={{
                    ...primaryButton(t.accent, submittingComment),
                    marginTop: 14,
                    padding: "0.8rem 1.5rem",
                  }}
                >
                  {submittingComment ? "POSTING…" : "POST COMMENT"}
                </button>

              </form>


              {comments.length === 0 ? (

                <p className="rd-serif italic" style={{ fontSize: "1.25rem", marginTop: 20 }}>
                  No comments have been added yet.
                </p>

              ) : (

                <ul style={{ listStyle: "none", margin: "22px 0 0", padding: 0 }}>

                  {comments.map((comment) => (

                    <li
                      key={comment._id}
                      style={{ borderLeft: `2px solid ${t.key === "ADMIN" ? t.danger : t.gold}`, padding: "0.2rem 0 0.2rem 1rem", marginBottom: "1.2rem" }}
                    >

                      <p className="rd-hand rd-wrap" style={{ fontSize: "1.45rem", lineHeight: 1.3, color: t.hand, whiteSpace: "pre-wrap" }}>
                        {comment.message}
                      </p>

                      <p className="rd-sans" style={{ fontSize: "0.78rem", marginTop: 4, opacity: 0.8 }}>
                        <strong style={{ fontWeight: 600 }}>{comment.userId?.name || "User"}</strong>
                        {" · "}
                        {formatDateTime(comment.createdAt)}
                      </p>

                    </li>

                  ))}

                </ul>

              )}

            </Section>


            {/* HISTORY */}

            <Section t={t} title={L.history} reduced={reduced}>

              {auditLogs.length === 0 ? (

                <p className="rd-serif italic" style={{ fontSize: "1.25rem" }}>
                  No audit activity is available for this request.
                </p>

              ) : (

                <ol className="rd-timeline">

                  {auditLogs.map((log) => {

                    const from = log.previousStatus ?? log.fromStatus ?? log.from ?? null;
                    const to = logStatus(log);
                    const who =
                      log.userId?.name ||
                      log.performedBy?.name ||
                      log.user?.name ||
                      null;

                    return (

                      <li key={log._id}>

                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">

                          <strong className="rd-serif rd-wrap" style={{ fontSize: t.key === "ADMIN" ? "1.05rem" : "1.25rem", lineHeight: 1.2 }}>
                            {log.action}
                          </strong>

                          <span className="rd-sans" style={{ fontSize: "0.78rem", opacity: 0.8 }}>
                            {formatDateTime(log.createdAt)}
                          </span>

                        </div>

                        {(from || to) && (
                          <p className="rd-sans" style={{ fontSize: "0.82rem", marginTop: 3 }}>
                            {from ? formatStatus(from) : "—"} → {to ? formatStatus(to) : "—"}
                          </p>
                        )}

                        <p className="rd-sans rd-wrap" style={{ fontSize: "0.92rem", lineHeight: 1.55, marginTop: 4 }}>
                          {log.description}
                        </p>

                        {who && (
                          <p className="rd-sans" style={{ fontSize: "0.78rem", marginTop: 3, opacity: 0.75 }}>
                            By {who}
                          </p>
                        )}

                      </li>

                    );
                  })}

                </ol>

              )}

            </Section>

          </div>

        </Page>

      </div>

    </>
  );
}


export default RequestDetails;