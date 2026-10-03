import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Book3D, { ROLES } from "./Book3D";

const EASE = [0.3, 0, 0.2, 1];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IM+Fell+English+SC&family=Work+Sans:wght@400;500;600&display=swap');
.lib-display{font-family:'IM Fell English SC',Georgia,serif}
.lib-serif{font-family:'Cormorant Garamond',Georgia,serif}
.lib-sans{font-family:'Work Sans',system-ui,sans-serif}
.lib-field:focus-visible,.lib-btn:focus-visible,.lib-link:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.lib-book:focus-visible{outline:2px solid #e6c97a;outline-offset:6px}
.lib-field::placeholder{color:inherit;opacity:.45}

/* ---------- title block ---------- */
.lib-comet{position:absolute;left:-2%;top:-40%;width:116%;height:auto;pointer-events:none;overflow:visible;filter:drop-shadow(0 0 6px rgba(255,210,130,.8))}
.lib-rule{display:flex;align-items:center;gap:8px;margin-top:16px;color:#e3c47c;font-size:.8rem}
.lib-rule span{display:block;width:34px;height:1px;background:linear-gradient(90deg,transparent,#c9a24a)}
.lib-rule span:last-child{background:linear-gradient(90deg,#c9a24a,transparent)}

/* ---------- desk, cloth, props ---------- */
.lib-desk{position:absolute;left:0;right:0;bottom:0;height:250px;overflow:hidden;pointer-events:none;
  background:
    radial-gradient(ellipse 60% 70% at 72% 0%,rgba(255,190,110,.40),transparent 70%),
    radial-gradient(ellipse 30% 40% at 12% 10%,rgba(255,170,80,.22),transparent 70%),
    repeating-linear-gradient(180deg,rgba(255,215,160,.05) 0 1px,transparent 1px 6px),
    linear-gradient(180deg,#3d2412 0%,#4b2c15 14%,#34200f 55%,#1a0f07 100%);
  box-shadow:inset 0 2px 0 rgba(255,205,140,.35),inset 0 18px 24px -18px rgba(0,0,0,.6)}
.lib-desk::after{content:"";position:absolute;top:0;bottom:0;left:-20%;width:140%;
  background:linear-gradient(100deg,transparent 35%,rgba(255,214,150,.10) 50%,transparent 65%)}
.lib-cloth{position:absolute;left:0;bottom:16px;width:100%;height:64px}
.lib-props{position:absolute;bottom:112px;width:clamp(200px,19vw,300px);height:auto;overflow:visible;pointer-events:none}
.lib-props-l{left:0}
.lib-props-r{right:0}
@media (max-width:899px){.lib-props{display:none}}
@media (max-width:767px){.lib-desk{height:150px}.lib-cloth{height:34px}}

/* ---------- ambient motes ---------- */
.lib-mote{position:absolute;border-radius:50%;opacity:.35;
  background:radial-gradient(circle,#ffe9b0,rgba(255,200,110,0));
  box-shadow:0 0 6px 1px rgba(255,205,120,.55)}

/* ---------- animation hooks (applied only when motion is allowed) ---------- */
.lib-flame{transform-box:fill-box;transform-origin:50% 100%}
.lib-sway{transform-box:fill-box;transform-origin:50% 0}
.lib-star{transform-box:fill-box;transform-origin:50% 50%}
.lib-rays svg{filter:blur(10px)}

@keyframes lib-flicker{0%,100%{opacity:.85}12%{opacity:.7}27%{opacity:1}41%{opacity:.78}58%{opacity:.95}73%{opacity:.72}88%{opacity:1}}
@keyframes lib-flame{0%,100%{transform:scale(1,1)}25%{transform:scale(.92,1.1) rotate(-2deg)}55%{transform:scale(1.05,.94) rotate(1.5deg)}80%{transform:scale(.95,1.08) rotate(-1deg)}}
@keyframes lib-breathe{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes lib-float{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.8}85%{opacity:.6}100%{transform:translate3d(var(--dx),var(--dy),0);opacity:0}}
@keyframes lib-sway{from{transform:rotate(-.7deg)}to{transform:rotate(.7deg)}}
@keyframes lib-sheen{from{transform:translateX(-12%)}to{transform:translateX(12%)}}
@keyframes lib-twinkle{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}

@media (prefers-reduced-motion:no-preference){
  .lib-flicker{animation:lib-flicker 3.6s ease-in-out infinite}
  .lib-flicker:nth-of-type(2n){animation-duration:4.4s;animation-delay:-1.3s}
  .lib-flame{animation:lib-flame 1.8s ease-in-out infinite}
  .lib-breathe{animation:lib-breathe 11s ease-in-out infinite}
  .lib-sway{animation:lib-sway 9s ease-in-out infinite alternate}
  .lib-star{animation:lib-twinkle 4.5s ease-in-out infinite}
  .lib-mote{animation:lib-float linear infinite}
  .lib-desk::after{animation:lib-sheen 16s ease-in-out infinite alternate}
}
`;

const STARS = [
  [8, 12], [14, 30], [22, 8], [31, 22], [44, 10], [57, 26], [66, 9], [74, 20],
  [83, 12], [91, 28], [12, 52], [27, 46], [52, 40], [69, 48], [88, 50],
];

const BASE = "#17100c";

/* Role tints laid over the shared library (selected book shifts the room's mood). */
const TINTS = {
  user: {
    background:
      "radial-gradient(ellipse at 20% 30%, rgba(226,150,64,0.22), transparent 60%), radial-gradient(ellipse at 90% 95%, rgba(120,20,30,0.28), transparent 55%)",
  },
  reviewer: { background: "linear-gradient(180deg, rgba(8,18,52,0.62), rgba(8,18,52,0.30))" },
  admin: {
    background:
      "linear-gradient(rgba(34,32,26,0.46), rgba(34,32,26,0.46)), repeating-linear-gradient(0deg, transparent 0 31px, rgba(230,220,195,0.05) 31px 32px), linear-gradient(90deg, transparent 9.6%, rgba(201,138,114,0.22) 9.6% 9.8%, transparent 9.8%)",
  },
};

/* Dust motes: [left %, top %, size px, duration s, delay s, drift x px, drift y px] */
const MOTES = [
  [6, 72, 2, 16, 0, 18, -60], [12, 40, 3, 20, 3, -14, -80], [19, 62, 2, 14, 6, 22, -50],
  [27, 30, 2, 22, 1, -18, -70], [34, 78, 3, 18, 8, 16, -90], [41, 50, 2, 15, 4, -12, -60],
  [48, 22, 2, 24, 9, 20, -50], [55, 66, 3, 17, 2, -22, -80], [61, 36, 2, 19, 7, 14, -60],
  [67, 82, 2, 16, 5, -16, -70], [72, 46, 3, 21, 10, 18, -90], [78, 28, 2, 15, 3, -20, -50],
  [83, 70, 2, 18, 11, 12, -80], [88, 52, 3, 23, 6, -14, -60], [93, 34, 2, 17, 0, 16, -70],
  [15, 86, 2, 19, 12, 10, -60], [38, 90, 2, 21, 4, -10, -70], [58, 88, 2, 16, 9, 12, -60],
  [76, 90, 3, 20, 1, -12, -80], [96, 80, 2, 18, 7, -10, -60], [24, 14, 2, 25, 5, 14, 50],
  [64, 12, 2, 22, 8, -16, 60],
];

/* Book spines for the shelf pattern: [width, height, colour] */
const SPINES = [
  [9, 70, "#4a2a1c"], [7, 86, "#2d3a4f"], [11, 64, "#6b2a2a"], [8, 92, "#3e4a2c"],
  [10, 76, "#5a3a1e"], [7, 88, "#7a5a2a"], [12, 68, "#2a2a3d"], [8, 94, "#5b1f2a"],
  [10, 72, "#3a3022"], [9, 84, "#27455a"], [11, 66, "#6a4a26"], [8, 90, "#42261a"],
  [10, 78, "#34402a"], [12, 70, "#5a2a24"],
];
const SPINE_TOTAL = SPINES.reduce((n, [w]) => n + w, 0);

/* Window geometry (scene units, 1600 x 900) */
const ARCHES = [[880, 1040], [1070, 1230], [1260, 1420]];
const archPath = ([a, b]) => {
  const c = (a + b) / 2;
  return `M${a} 640V250Q${a} 110 ${c} 30Q${b} 110 ${b} 250V640Z`;
};
const TOWERS = [
  [1150, 22, 120, 60], [1185, 30, 170, 80], [1230, 38, 230, 120],
  [1280, 28, 150, 70], [1315, 22, 110, 55], [1345, 18, 90, 40],
];
const VINE_LEAVES = [
  [822, 40, 40, 1], [806, 95, -30, 1.1], [832, 130, 60, 1], [812, 180, -50, 1.2],
  [828, 225, 30, 1], [806, 270, -20, 1], [820, 320, 50, 1.1], [826, 365, -40, 1],
  [1540, 40, 150, 1.2], [1512, 90, 200, 1.1], [1535, 140, 120, 1], [1500, 190, 170, 1.3],
  [1520, 240, 100, 1], [1490, 285, 190, 1.1], [1510, 330, 140, 1], [1475, 380, 210, 1.2],
  [1445, 50, 110, 1], [1425, 100, 170, 1], [1450, 150, 130, 1.1], [1430, 195, 190, 1],
  [1560, 70, 160, 2.2], [1585, 160, 130, 2], [1545, 200, 190, 2.4],
];
const LEAF_FILLS = ["#5b8a34", "#3f6a28", "#7aa040"];
const RAYS = [
  "900,100 1040,100 560,900 250,900",
  "1090,100 1230,100 900,900 600,900",
  "1280,100 1420,100 1250,900 950,900",
];

const VB_WIDE = "0 0 1600 900";
const VB_TALL = "500 0 800 900";

function useMedia(query) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const fn = () => setMatch(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, [query]);
  return match;
}

const useCompact = () => useMedia("(max-width: 767px)");
const usePortrait = () => useMedia("(max-aspect-ratio: 1/1)");

/* ---------------- environment: background layers ---------------- */

function SpinePattern({ id, height, flip }) {
  const list = flip ? [...SPINES].reverse() : SPINES;
  let x = 0;
  return (
    <pattern id={id} width={SPINE_TOTAL} height={height} patternUnits="userSpaceOnUse">
      <rect width={SPINE_TOTAL} height={height} fill="#120a06" />
      {list.map(([w, h, c], i) => {
        const x0 = x;
        x += w;
        const y = height - 10 - h;
        return (
          <g key={i}>
            <rect x={x0} y={y} width={w - 1} height={h} fill={c} />
            <rect x={x0} y={y + 8} width={w - 1} height="2" fill="rgba(230,190,110,0.35)" />
          </g>
        );
      })}
      <rect y={height - 10} width={SPINE_TOTAL} height="10" fill="#241409" />
    </pattern>
  );
}

function FarSvg({ vb }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lib-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f64a8" />
          <stop offset=".35" stopColor="#c58fb0" />
          <stop offset=".62" stopColor="#f3b97a" />
          <stop offset="1" stopColor="#ffe0a0" />
        </linearGradient>
        <radialGradient id="lib-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset=".35" stopColor="#ffd78c" stopOpacity=".7" />
          <stop offset="1" stopColor="#ffb866" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="800" y="0" width="700" height="760" fill="url(#lib-sky)" />
      <circle cx="1230" cy="400" r="320" fill="url(#lib-sun)" />
      <g fill="rgba(255,225,225,0.28)">
        <ellipse cx="1000" cy="170" rx="120" ry="16" />
        <ellipse cx="1180" cy="130" rx="150" ry="14" />
        <ellipse cx="1330" cy="220" rx="110" ry="12" />
        <ellipse cx="1080" cy="300" rx="140" ry="12" />
      </g>
      <path d="M900 600 Q1080 520 1230 560 T1500 540 V760 H900Z" fill="#7a6a9c" opacity=".7" />
      <g fill="#8d72b0" opacity=".88">
        <rect x="1140" y="520" width="230" height="50" />
        {TOWERS.map(([x, w, h, sp]) => {
          const y = 570 - h;
          return (
            <g key={x}>
              <rect x={x} y={y} width={w} height={h} />
              <polygon points={`${x - 3},${y} ${x + w / 2},${y - sp} ${x + w + 3},${y}`} />
            </g>
          );
        })}
      </g>
      <ellipse cx="1250" cy="585" rx="330" ry="40" fill="rgba(255,220,190,0.55)" />
      <path d="M880 650 Q1050 590 1200 640 T1500 620 V760 H880Z" fill="#4d5a3a" opacity=".85" />
    </svg>
  );
}

function Lamp({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="lib-flicker" r="150" fill="url(#lib-glow-w)" style={{ mixBlendMode: "screen" }} />
      <path d="M0 -40 V-20" stroke="#3a2512" strokeWidth="3" />
      <rect x="-12" y="-24" width="24" height="6" fill="#6b4a1a" />
      <rect x="-10" y="-18" width="20" height="32" rx="3" fill="#ffcf80" stroke="#6b4a1a" strokeWidth="2.5" />
      <rect x="-12" y="14" width="24" height="5" fill="#6b4a1a" />
    </g>
  );
}

function MidSvg({ vb }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lib-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140b06" />
          <stop offset="1" stopColor="#2b1a0d" />
        </linearGradient>
        <linearGradient id="lib-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#080402" stopOpacity=".92" />
          <stop offset=".5" stopColor="#080402" stopOpacity=".38" />
          <stop offset="1" stopColor="#080402" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="lib-shadex" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#080402" stopOpacity=".7" />
          <stop offset=".6" stopColor="#080402" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lib-glow-w">
          <stop offset="0" stopColor="#ffc46a" stopOpacity=".6" />
          <stop offset=".4" stopColor="#ff9a3c" stopOpacity=".18" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <SpinePattern id="lib-spines-a" height={118} />
        <SpinePattern id="lib-spines-b" height={152} flip />
      </defs>

      {/* back wall with arched openings (sky shows through) */}
      <path
        fillRule="evenodd"
        fill="url(#lib-wall)"
        d={`M0 0H1600V900H0Z ${ARCHES.map(archPath).join(" ")}`}
      />

      {/* bookcases */}
      <rect x="590" y="0" width="250" height="780" fill="url(#lib-spines-b)" opacity=".7" />
      <rect x="-10" y="0" width="600" height="780" fill="url(#lib-spines-a)" />
      <rect x="578" y="0" width="16" height="800" fill="#2a170b" />
      <rect x="-10" y="0" width="850" height="780" fill="url(#lib-shade)" />
      <rect x="-10" y="0" width="850" height="780" fill="url(#lib-shadex)" />

      {/* ladder */}
      <g stroke="#5b3719" strokeWidth="7" strokeLinecap="round" opacity=".85">
        <line x1="470" y1="180" x2="560" y2="740" />
        <line x1="520" y1="170" x2="610" y2="730" />
        {[0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.94].map((u) => (
          <line key={u} x1={470 + 90 * u} y1={180 + 560 * u} x2={520 + 90 * u} y2={170 + 560 * u} />
        ))}
      </g>

      <Lamp x={215} y={150} />
      <Lamp x={770} y={110} />

      {/* window tracery and sill */}
      <g fill="none" stroke="#2a1a0e" strokeWidth="5">
        {ARCHES.map(([a, b]) => {
          const c = (a + b) / 2;
          return (
            <g key={a}>
              <path d={archPath([a, b])} stroke="#5a3a20" />
              <path d={`M${c} 90V640M${a} 330H${b}`} />
              <circle cx={c} cy="190" r="22" />
            </g>
          );
        })}
      </g>
      <rect x="860" y="640" width="580" height="30" fill="#3a2514" />
      <rect x="860" y="640" width="580" height="3" fill="rgba(255,205,140,0.4)" />

      {/* hanging vines */}
      <g className="lib-sway">
        <path d="M820 -10 C800 80 840 150 815 250 S800 330 825 380" fill="none" stroke="#3f5a2a" strokeWidth="3" />
        {VINE_LEAVES.slice(0, 8).map(([x, y, r, k], i) => (
          <path
            key={i}
            d="M0 0 C8 -10 22 -10 28 0 C22 10 8 10 0 0Z"
            transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}
            fill={LEAF_FILLS[i % 3]}
          />
        ))}
      </g>
      <g className="lib-sway">
        <path d="M1560 -10 C1500 60 1560 140 1500 220 S1540 330 1470 400" fill="none" stroke="#3f5a2a" strokeWidth="3" />
        <path d="M1450 -10 C1420 70 1460 120 1430 200" fill="none" stroke="#3f5a2a" strokeWidth="3" />
        {VINE_LEAVES.slice(8).map(([x, y, r, k], i) => (
          <path
            key={i}
            d="M0 0 C8 -10 22 -10 28 0 C22 10 8 10 0 0Z"
            transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}
            fill={LEAF_FILLS[(i + 1) % 3]}
          />
        ))}
      </g>
    </svg>
  );
}

function RaysSvg({ vb }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lib-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd48a" stopOpacity=".55" />
          <stop offset=".6" stopColor="#ffbf6a" stopOpacity=".16" />
          <stop offset="1" stopColor="#ffbf6a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {RAYS.map((p) => (
        <polygon key={p} points={p} fill="url(#lib-ray)" />
      ))}
    </svg>
  );
}

function Scene({ role, reduced, compact, portrait }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 22, damping: 18, mass: 1.2 });
  const sy = useSpring(my, { stiffness: 22, damping: 18, mass: 1.2 });
  const farX = useTransform(sx, [-1, 1], [-6, 6]);
  const farY = useTransform(sy, [-1, 1], [-4, 4]);
  const midX = useTransform(sx, [-1, 1], [-14, 14]);
  const midY = useTransform(sy, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (reduced || compact) return undefined;
    const fn = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", fn, { passive: true });
    return () => window.removeEventListener("pointermove", fn);
  }, [reduced, compact, mx, my]);

  const vb = portrait ? VB_TALL : VB_WIDE;
  const layer = { position: "absolute", inset: "-2%" };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ ...layer, x: farX, y: farY }}>
        <FarSvg vb={vb} />
      </motion.div>

      <motion.div style={{ ...layer, x: midX, y: midY }}>
        <MidSvg vb={vb} />
        <div className="lib-rays lib-breathe absolute inset-0" style={{ mixBlendMode: "screen" }}>
          <RaysSvg vb={vb} />
        </div>
      </motion.div>

      {/* atmospheric haze around the windows */}
      <div
        className="lib-breathe absolute inset-0"
        style={{
          mixBlendMode: "screen",
          background:
            "radial-gradient(ellipse 55% 60% at 74% 40%, rgba(255,214,150,0.38), transparent 70%), linear-gradient(180deg, rgba(255,200,130,0) 60%, rgba(255,190,120,0.10) 100%)",
        }}
      />

      {/* the selected book shifts the room's mood */}
      <AnimatePresence initial={false}>
        {role && (
          <motion.div
            key={role.id}
            className="absolute inset-0"
            style={TINTS[role.id]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 1.1, ease: EASE }}
          >
            {role.id === "reviewer" &&
              STARS.map(([x, y]) => (
                <span
                  key={`${x}-${y}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: 2,
                    height: 2,
                    background: "#ece4cf",
                    opacity: 0.55,
                  }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- environment: desk, cloth and props ---------------- */

function Desk() {
  return (
    <div aria-hidden="true" className="lib-desk">
      <svg
        className="lib-cloth"
        viewBox="0 0 1600 64"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="lib-cloth-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2a58" />
            <stop offset="1" stopColor="#080d20" />
          </linearGradient>
        </defs>
        <path
          d="M0 26 C160 6 320 40 560 22 S980 8 1200 28 S1480 40 1600 16 V64 H0Z"
          fill="url(#lib-cloth-g)"
        />
        <path
          d="M0 26 C160 6 320 40 560 22 S980 8 1200 28 S1480 40 1600 16"
          fill="none"
          stroke="rgba(150,175,255,0.28)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 46 C160 30 320 58 560 42 S980 28 1200 48 S1480 58 1600 36"
          fill="none"
          stroke="#c9a24a"
          strokeOpacity=".4"
          strokeWidth="3"
          strokeDasharray="3 14"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function StackBook({ x, y, w, h, c }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={c} />
      <rect x={x + w - 16} y={y + 4} width="14" height={h - 8} fill="#d8c69a" />
      <rect x={x + 12} y={y} width="2.5" height={h} fill="#c9a24a" opacity=".55" />
      <rect x={x + 22} y={y} width="2.5" height={h} fill="#c9a24a" opacity=".4" />
      <rect x={x} y={y} width={w} height="2" fill="#ffd9a0" opacity=".28" />
      <rect x={x} y={y + h - 3} width={w} height="3" fill="#000" opacity=".35" />
    </g>
  );
}

function PropLantern({ x, y, glow }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="lib-flicker" cx="22" cy="64" r="80" fill={`url(#${glow})`} style={{ mixBlendMode: "screen" }} />
      <path d="M8 12 Q22 -8 36 12" fill="none" stroke="#9a7228" strokeWidth="3" />
      <path d="M4 20 L22 6 L40 20Z" fill="#6b4a1a" />
      <rect x="8" y="20" width="28" height="82" fill="rgba(255,190,90,0.28)" stroke="#9a7228" strokeWidth="3" />
      <rect x="4" y="102" width="36" height="12" rx="2" fill="#6b4a1a" />
      <rect x="18" y="72" width="8" height="30" fill="#f1e6c8" />
      <ellipse className="lib-flame" cx="22" cy="64" rx="5" ry="9" fill="#ffd27a" />
      <ellipse cx="22" cy="66" rx="2.4" ry="5" fill="#fff6d8" />
    </g>
  );
}

function GlowDef({ id }) {
  return (
    <radialGradient id={id}>
      <stop offset="0" stopColor="#ffc46a" stopOpacity=".55" />
      <stop offset=".4" stopColor="#ff9a3c" stopOpacity=".18" />
      <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
    </radialGradient>
  );
}

function LeftProps() {
  return (
    <svg className="lib-props lib-props-l" viewBox="0 0 300 320" aria-hidden="true" focusable="false">
      <defs>
        <GlowDef id="lib-glow-l" />
      </defs>
      <StackBook x={56} y={252} w={226} h={34} c="#4a2418" />
      <StackBook x={74} y={220} w={196} h={32} c="#1f2a4a" />
      <StackBook x={62} y={190} w={170} h={30} c="#5a3a1e" />
      {/* ink bottle and quill */}
      <rect x="150" y="158" width="40" height="32" rx="12" fill="#1a2140" />
      <rect x="162" y="148" width="16" height="12" fill="#11162e" />
      <rect x="160" y="144" width="20" height="5" fill="#3a2512" />
      <ellipse cx="160" cy="172" rx="3" ry="9" fill="rgba(160,180,255,0.35)" />
      <path
        d="M170 146 C150 112 104 62 66 38 C42 74 58 124 122 134 C142 138 160 144 170 146Z"
        fill="#f2e9d2"
        stroke="#cbbf9f"
      />
      <path d="M170 146 L66 38" stroke="#b8a97f" strokeWidth="1.5" />
      {/* parchment */}
      <polygon points="74,300 214,292 244,306 96,318" fill="#e6d6aa" stroke="#b9a574" />
      <path d="M100 304 L200 298 M104 309 L216 303" stroke="#6b5030" strokeOpacity=".5" />
      <PropLantern x={4} y={176} glow="lib-glow-l" />
    </svg>
  );
}

function RightProps() {
  return (
    <svg className="lib-props lib-props-r" viewBox="0 0 300 320" aria-hidden="true" focusable="false">
      <defs>
        <GlowDef id="lib-glow-r" />
      </defs>
      <StackBook x={30} y={252} w={214} h={34} c="#3a2a1c" />
      <StackBook x={48} y={220} w={184} h={32} c="#4a2418" />
      <StackBook x={40} y={190} w={160} h={30} c="#22305a" />
      {/* armillary sphere */}
      <circle cx="120" cy="126" r="70" fill="rgba(255,190,90,0.12)" />
      <ellipse cx="120" cy="190" rx="22" ry="4" fill="#8a6420" />
      <g transform="rotate(-22 120 126)" fill="none" stroke="#e0b04e">
        <circle cx="120" cy="126" r="56" strokeWidth="3" />
        <ellipse cx="120" cy="126" rx="56" ry="20" strokeWidth="2.5" />
        <ellipse cx="120" cy="126" rx="20" ry="56" strokeWidth="2.5" />
        <path d="M120 66 V186" strokeWidth="2" />
        <circle cx="120" cy="126" r="9" fill="#c98a2c" stroke="none" />
      </g>
      <PropLantern x={252} y={176} glow="lib-glow-r" />
    </svg>
  );
}

function Ambient({ role, compact }) {
  const list = compact ? MOTES.slice(0, 10) : MOTES;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* no magical particles in the Archive */}
      <div
        className="absolute inset-0"
        style={{ opacity: role && role.id === "admin" ? 0 : 1, transition: "opacity 1s" }}
      >
        {list.map(([x, y, size, dur, delay, dx, dy], i) => (
          <span
            key={i}
            className="lib-mote"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animationDuration: `${dur}s`,
              animationDelay: `-${delay}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 46%, transparent 48%, rgba(8,4,2,0.72) 100%)",
        }}
      />
    </div>
  );
}

function Comet() {
  return (
    <svg className="lib-comet" viewBox="0 0 520 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lib-comet-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <path
        d="M0 108 C130 14 310 -6 468 42"
        fill="none"
        stroke="url(#lib-comet-g)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        className="lib-star"
        d="M468 18 L473 37 L492 42 L473 47 L468 66 L463 47 L444 42 L463 37Z"
        fill="#fff3cf"
      />
    </svg>
  );
}

/* ---------------- login form (logic unchanged) ---------------- */

function Terminal({ role, form, reduced, onBack, onSignal }) {
  const emailRef = useRef(null);
  const [reveal, setReveal] = useState(false);
  const busy = form.status === "loading" || form.status === "success";

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus({ preventScroll: true });
  }, []);

  const field = {
    width: "100%",
    background: "rgba(0,0,0,0.05)",
    border: 0,
    borderBottom: `1.5px solid ${role.ink}`,
    color: role.ink,
    padding: "0.65rem 0.6rem",
    fontSize: "1rem",
    borderRadius: 0,
  };
  const label = { display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: 6 };

  return (
    <motion.section
      aria-labelledby="lib-terminal-title"
      className="lib-sans w-full max-w-[22rem] md:w-[22rem] md:max-w-none"
      initial={reduced ? { opacity: 0 } : { opacity: 1, clipPath: "inset(-10% 100% -10% 0%)" }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: "inset(-10% -10% -10% 0%)" }}
      transition={{ duration: reduced ? 0.15 : 0.8, ease: EASE }}
      style={{
        "--focus": role.focus,
        background: role.paper,
        color: role.ink,
        border: `1px solid ${role.rule}`,
        padding: "2rem 1.75rem 1.5rem",
        boxShadow: "0 22px 40px -22px rgba(0,0,0,0.7), 0 0 70px -20px rgba(255,190,110,0.28)",
      }}
    >
      <p className="lib-serif italic" style={{ fontSize: "1.05rem", opacity: 0.8 }}>
        {role.title}
      </p>
      <h2 id="lib-terminal-title" className="lib-display" style={{ fontSize: "1.9rem", lineHeight: 1.1, marginTop: 4 }}>
        Access the Library
      </h2>
      <p style={{ fontSize: "0.9rem", marginTop: 8, opacity: 0.8 }}>{role.welcome}</p>

      <form onSubmit={form.onSubmit} aria-busy={busy} style={{ marginTop: "1.5rem" }}>
        <div style={{ marginBottom: "1.1rem" }}>
          <label htmlFor="lib-email" style={label}>
            Email
          </label>
          <input
            ref={emailRef}
            id="lib-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
            value={form.email}
            onChange={(e) => form.setEmail(e.target.value)}
            onFocus={() => onSignal("email-focus", role.id)}
            aria-invalid={form.error ? "true" : undefined}
            aria-describedby={form.error ? "lib-error" : undefined}
            className="lib-field"
            style={field}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="lib-password" style={label}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="lib-password"
              name="password"
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={busy}
              value={form.password}
              onChange={(e) => form.setPassword(e.target.value)}
              onFocus={() => onSignal("password-focus", role.id)}
              aria-invalid={form.error ? "true" : undefined}
              aria-describedby={form.error ? "lib-error" : undefined}
              className="lib-field"
              style={{ ...field, paddingRight: "4.5rem" }}
            />
            <button
              type="button"
              className="lib-link"
              onClick={() => setReveal((v) => !v)}
              aria-pressed={reveal}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: 0,
                color: role.ink,
                fontSize: "0.8rem",
                fontWeight: 500,
                textDecoration: "underline",
                padding: "4px 6px",
                cursor: "pointer",
              }}
            >
              {reveal ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {form.error && (
          <p
            id="lib-error"
            role="alert"
            style={{
              fontSize: "0.88rem",
              marginBottom: "1rem",
              padding: "0.55rem 0.7rem",
              borderLeft: "3px solid #8c2f1f",
              background: "rgba(140,47,31,0.1)",
              color: "#6f2113",
            }}
          >
            {form.error}
          </p>
        )}

        <button
          type="submit"
          className="lib-btn"
          disabled={busy}
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            background: role.action,
            color: role.actionInk,
            border: 0,
            borderRadius: 2,
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.75 : 1,
          }}
        >
          {form.status === "loading"
            ? "Opening the door…"
            : form.status === "success"
            ? "Welcome in"
            : "Enter the Library"}
        </button>
      </form>

      <button
        type="button"
        className="lib-link"
        onClick={onBack}
        disabled={busy}
        style={{
          marginTop: "1.1rem",
          background: "none",
          border: 0,
          padding: "4px 0",
          color: role.ink,
          fontSize: "0.85rem",
          textDecoration: "underline",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.5 : 0.85,
        }}
      >
        Choose a different book
      </button>
    </motion.section>
  );
}

/* ---------------- entrance ---------------- */

export default function LibraryEntrance({ form, onSignal }) {
  const reduced = useReducedMotion();
  const compact = useCompact();
  const portrait = usePortrait();
  const [role, setRole] = useState(null);
  const [phase, setPhase] = useState("shelf");
  const timers = useRef([]);

  const size = compact ? { w: 104, h: 148, d: 20 } : { w: 200, h: 284, d: 38 };
  const open = phase === "opening" || phase === "terminal";

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);

  const select = useCallback(
    (r) => {
      if (phase !== "shelf") return;
      setRole(r);
      setPhase("selected");
      onSignal("book-select", r.id);
      timers.current.push(
        setTimeout(() => {
          setPhase("opening");
          onSignal("book-open", r.id);
        }, reduced ? 0 : 550),
        setTimeout(() => setPhase("terminal"), reduced ? 80 : 1900)
      );
    },
    [phase, reduced, onSignal]
  );

  const back = useCallback(() => {
    if (form.status === "loading" || form.status === "success") return;
    clear();
    setPhase("shelf");
    setRole(null);
    onSignal("book-back", null);
  }, [clear, form.status, onSignal]);

  useEffect(() => {
    if (!role) return undefined;
    const fn = (e) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [role, back]);

  const visible = ROLES.filter((r) => !role || r.id === role.id);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: BASE }}>
      <style>{STYLES}</style>
      <Scene role={role} reduced={reduced} compact={compact} portrait={portrait} />
      <Desk />
      <LeftProps />
      <RightProps />
      <Ambient role={role} compact={compact} />

      <header className="relative z-10 px-6 pt-8 md:px-14 md:pt-12">
        <div style={{ position: "relative", display: "inline-block" }}>
          <Comet />
          <h1
            className="lib-display"
            style={{
              fontSize: "clamp(2.2rem, 5.4vw, 4.4rem)",
              lineHeight: 1,
              letterSpacing: "0.02em",
              color: "transparent",
              backgroundImage: "linear-gradient(180deg, #fff3d6 10%, #e3c47c 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 18px rgba(255,200,120,0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
            }}
          >
            IntelliFlow
          </h1>
        </div>
        <p
          className="lib-serif italic"
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
            color: "#e1c98e",
            marginTop: 4,
            textShadow: "0 0 18px rgba(255,200,120,0.35), 0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          The Living Library
        </p>
        <div className="lib-rule" aria-hidden="true">
          <span />
          <i style={{ fontStyle: "normal" }}>✦</i>
          <span />
        </div>
        {phase === "shelf" && (
          <p
            className="lib-sans"
            style={{
              fontSize: "0.95rem",
              color: "#e3d3ab",
              marginTop: 18,
              maxWidth: "30ch",
              textShadow: "0 1px 8px rgba(0,0,0,0.85)",
            }}
          >
            Take down the book that matches your role.
          </p>
        )}
      </header>

      <div className="relative z-10 mt-auto px-6 md:px-14">
        <div
          className={`relative flex items-center justify-center gap-5 pb-8 pt-10 md:items-end md:gap-16 ${
            role ? "flex-col md:flex-row" : "flex-row"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: reduced ? 0 : 0.4 } }}
                transition={{ layout: { duration: reduced ? 0 : 0.8, ease: EASE }, duration: reduced ? 0 : 0.4 }}
                style={{ marginLeft: open ? size.w * 0.9 : 0 }}
              >
                <Book3D
                  role={r}
                  size={size}
                  open={open}
                  flat={compact}
                  reduced={reduced}
                  onSelect={select}
                  onHover={(on) => on && onSignal("book-hover", r.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {phase === "terminal" && (
            <Terminal role={role} form={form} reduced={reduced} onBack={back} onSignal={onSignal} />
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10"
        style={{
          height: 16,
          background: "linear-gradient(180deg, #4a2c16, #24150a)",
          borderTop: "1px solid #7a5230",
          opacity: role ? 0.45 : 1,
          transition: "opacity .8s",
        }}
      />

      {form.status === "success" && role && (
        <motion.div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: role.paper }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.1 : 0.9, ease: EASE }}
        >
          <p className="lib-serif italic" style={{ fontSize: "1.7rem", color: role.ink }}>
            The library is opening.
          </p>
        </motion.div>
      )}
    </main>
  );
}
