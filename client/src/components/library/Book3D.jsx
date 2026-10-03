import { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Work Sans', system-ui, sans-serif";
const EASE = [0.3, 0, 0.2, 1];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

export const ROLES = [
  {
    id: "user",
    label: "User",
    title: "The Operator's Chronicle",
    subtitle: "User Mission Archive",
    blurb: "For those who open requests and follow them to the end.",
    welcome: "Your missions are waiting on the shelf.",
    cover: "#5a1620",
    spine: "#3f0f17",
    edge: "#e6d9b8",
    paper: "#eee1c2",
    ink: "#2b1a10",
    accent: "#c9a24a",
    action: "#6b1c27",
    actionInk: "#f3e7c9",
    rule: "rgba(43,26,16,0.35)",
    focus: "#8a5a12",
  },
  {
    id: "reviewer",
    label: "Reviewer",
    title: "The Reviewer's Story",
    subtitle: "Stories Awaiting Review",
    blurb: "For those who read each request and decide what happens next.",
    welcome: "Every story here is waiting for your judgment.",
    cover: "#14213d",
    spine: "#0d1730",
    edge: "#ece6d6",
    paper: "#eeead9",
    ink: "#1b2338",
    accent: "#ece4cf",
    action: "#1b2d57",
    actionInk: "#f1ecde",
    rule: "rgba(27,35,56,0.35)",
    focus: "#3b5ba8",
  },
  {
    id: "admin",
    label: "Admin",
    title: "The Archive",
    subtitle: "Command & Case Records",
    blurb: "For those who keep the records and set the rules.",
    welcome: "The records are open to those who keep them.",
    cover: "#5b4a36",
    spine: "#3f3324",
    edge: "#e0d5ba",
    paper: "#e7ddc4",
    ink: "#2a261f",
    accent: "#e7ddc4",
    action: "#4d4f2a",
    actionInk: "#f0ead8",
    rule: "rgba(42,38,31,0.38)",
    focus: "#4d4f2a",
  },
];

function Title({ role, s, color, align, hot }) {
  return (
    <div
      style={{
        textAlign: align,
        opacity: hot ? 1 : 0.78,
        letterSpacing: hot ? "0.02em" : "0em",
        transition: "opacity .3s, letter-spacing .3s",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 22 * s,
          lineHeight: 1.08,
          color,
        }}
      >
        {role.title}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 12 * s,
          marginTop: 6 * s,
          color,
          opacity: 0.85,
        }}
      >
        {role.subtitle}
      </div>
    </div>
  );
}

function CoverArt({ role, s, hot }) {
  if (role.id === "user") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 10 * s,
          border: `1.2px solid ${role.accent}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16 * s,
          padding: `0 ${10 * s}px`,
        }}
      >
        <svg
          width={44 * s}
          height={44 * s}
          viewBox="0 0 44 44"
          fill="none"
          stroke={role.accent}
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <circle cx="22" cy="22" r="19" />
          <circle cx="22" cy="22" r="5" />
          <path d="M22 3v38M3 22h38M8.6 8.6l26.8 26.8M35.4 8.6L8.6 35.4" />
        </svg>
        <Title role={role} s={s} color={role.accent} align="center" hot={hot} />
      </div>
    );
  }
  if (role.id === "reviewer") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: 16 * s,
            right: 16 * s,
            top: 24 * s,
            background: role.accent,
            padding: `${12 * s}px`,
          }}
        >
          <Title role={role} s={s} color={role.ink} align="left" hot={hot} />
        </div>
        <svg
          viewBox="0 0 160 90"
          style={{
            position: "absolute",
            left: 16 * s,
            right: 16 * s,
            bottom: 22 * s,
            width: `calc(100% - ${32 * s}px)`,
          }}
          fill="none"
          stroke={role.accent}
          strokeWidth="0.6"
          aria-hidden="true"
        >
          <path d="M10 70L38 44L66 56L96 24L128 40L150 12" opacity="0.7" />
          {[
            [10, 70],
            [38, 44],
            [66, 56],
            [96, 24],
            [128, 40],
            [150, 12],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.8" fill={role.accent} stroke="none" />
          ))}
        </svg>
      </>
    );
  }
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 14 * s,
          right: 14 * s,
          top: 28 * s,
          background: role.paper,
          border: `1px solid ${role.ink}`,
          padding: `${12 * s}px`,
        }}
      >
        <Title role={role} s={s} color={role.ink} align="left" hot={hot} />
      </div>
      {s > 0.7 && (
        <div
          style={{
            position: "absolute",
            right: 20 * s,
            bottom: 34 * s,
            transform: "rotate(-9deg)",
            border: "1.5px solid #c98a72",
            color: "#c98a72",
            padding: `${2 * s}px ${8 * s}px`,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11 * s,
            letterSpacing: "0.14em",
          }}
        >
          FILED
        </div>
      )}
    </>
  );
}

export default function Book3D({ role, size, open, flat, reduced, onSelect, onHover }) {
  const { w, h, d } = size;
  const s = w / 200;
  const box = useRef(null);
  const [hot, setHot] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 140, damping: 20 });
  const sy = useSpring(py, { stiffness: 140, damping: 20 });
  const rotY = useTransform(sx, [0, 1], [-26, -4]);
  const rotX = useTransform(sy, [0, 1], [7, -7]);
  const lx = useTransform(sx, [0, 1], [15, 85]);
  const ly = useTransform(sy, [0, 1], [15, 85]);
  const light = useMotionTemplate`radial-gradient(circle at ${lx}% ${ly}%, rgba(255,240,205,0.30), rgba(255,240,205,0) 60%)`;

  const tilt = !flat && !reduced;
  const lift = hot && !open && !reduced;
  const dur = (n) => (reduced ? 0.01 : n);

  const move = (e) => {
    if (!tilt || open || e.pointerType !== "mouse" || !box.current) return;
    const r = box.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const enter = () => {
    setHot(true);
    if (onHover) onHover(true);
  };
  const leave = () => {
    setHot(false);
    px.set(0.5);
    py.set(0.5);
    if (onHover) onHover(false);
  };

  const face = { position: "absolute", left: 0, top: 0 };
  const fill = { position: "absolute", inset: 0 };
  const showCaption = !open;
  const glowing = hot && !open;
  const star = {
    color: "#e6c97a",
    opacity: 0.8,
    fontStyle: "normal",
    fontSize: "0.6em",
    margin: "0 0.7em",
    verticalAlign: "0.18em",
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: w, isolation: "isolate" }}
    >
      {/* Decorative lighting that seats the book in the room (behind the book) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: -1,
          left: "50%",
          top: h * 0.5,
          width: w * 1.9,
          height: h * 1.15,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(255,196,110,0.30), rgba(255,170,80,0.10) 45%, rgba(255,170,80,0) 70%)",
          opacity: glowing ? 1 : 0.3,
          transition: "opacity .5s",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: -1,
          left: "46%",
          top: h - 12 * s,
          width: w * 1.3,
          height: 28 * s,
          transform: "translateX(-50%)",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75), rgba(0,0,0,0) 70%)",
          filter: `blur(${3 * s}px)`,
          opacity: open ? 0.5 : 1,
          transition: "opacity .5s",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: -1,
          left: "50%",
          top: h,
          width: w * 0.92,
          height: 34 * s,
          transform: "translateX(-50%)",
          pointerEvents: "none",
          background: `linear-gradient(180deg, ${role.cover}aa, ${role.cover}00)`,
          filter: `blur(${2 * s}px) brightness(1.5)`,
          opacity: open ? 0.2 : 0.55,
          transition: "opacity .5s",
        }}
      />

      <button
        ref={box}
        type="button"
        className="lib-book"
        onClick={() => onSelect(role)}
        onPointerMove={move}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocus={enter}
        onBlur={leave}
        disabled={open}
        aria-label={`${role.title}. ${role.blurb}`}
        style={{
          display: "block",
          width: w,
          height: h,
          padding: 0,
          border: 0,
          background: "none",
          perspective: 1400,
          cursor: open ? "default" : "pointer",
        }}
      >
        <motion.div
          style={{ width: w, height: h, position: "relative", transformStyle: "preserve-3d" }}
          animate={{ rotateY: open ? 14 : 0, z: open ? 60 : lift ? 34 : 0, scale: open ? 1.04 : 1 }}
          transition={reduced ? { duration: 0.01 } : { type: "spring", stiffness: 170, damping: 22 }}
        >
          <motion.div
            style={{
              width: w,
              height: h,
              position: "relative",
              transformStyle: "preserve-3d",
              rotateX: rotX,
              rotateY: rotY,
            }}
          >
            {/* back board */}
            <div style={{ ...face, width: w, height: h, background: role.spine, transform: `translateZ(${-d / 2}px)` }} />
            {/* spine */}
            <div
              style={{
                ...face,
                left: -d / 2,
                width: d,
                height: h,
                background: role.spine,
                transform: "rotateY(-90deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {d >= 30 && (
                <span
                  style={{
                    writingMode: "vertical-rl",
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: d * 0.38,
                    color: role.accent,
                    opacity: 0.85,
                  }}
                >
                  {role.title}
                </span>
              )}
            </div>
            {/* page edge */}
            <div
              style={{
                ...face,
                left: w - d / 2,
                width: d,
                height: h - 4 * s,
                top: 2 * s,
                transform: "rotateY(90deg)",
                background: `repeating-linear-gradient(90deg, ${role.edge} 0 2px, rgba(0,0,0,0.16) 2px 3px)`,
                boxShadow: "inset 0 0 8px rgba(255,200,120,0.25)",
              }}
            />
            {/* top edge */}
            <div style={{ ...face, width: w, height: d, top: -d / 2, background: role.edge, transform: "rotateX(90deg)" }} />
            {/* first page */}
            <div
              style={{
                ...face,
                width: w - 4 * s,
                height: h - 6 * s,
                top: 3 * s,
                background: role.paper,
                transform: `translateZ(${d / 2 - 4}px)`,
              }}
            />
            {/* turning leaf */}
            <motion.div
              style={{
                ...face,
                width: w - 4 * s,
                height: h - 6 * s,
                top: 3 * s,
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                z: d / 2 - 3,
              }}
              animate={{ rotateY: open ? -160 : lift ? -5 : 0 }}
              transition={open ? { duration: dur(0.9), delay: reduced ? 0 : 0.35, ease: EASE } : { duration: dur(0.3) }}
            >
              <div style={{ ...fill, background: role.paper, backfaceVisibility: "hidden" }} />
              <div
                style={{
                  ...fill,
                  background: role.paper,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  boxShadow: `inset 0 0 0 ${10 * s}px ${role.paper}, inset 0 0 0 ${11 * s}px ${role.rule}`,
                }}
              />
            </motion.div>
            {/* front cover */}
            <motion.div
              style={{
                ...face,
                width: w,
                height: h,
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                z: d / 2,
              }}
              animate={{ rotateY: open ? -166 : lift ? -9 : 0 }}
              transition={
                open
                  ? { duration: dur(1.1), ease: EASE }
                  : { type: "spring", stiffness: 160, damping: 20 }
              }
            >
              <div
                style={{
                  ...fill,
                  background: role.cover,
                  backfaceVisibility: "hidden",
                  overflow: "hidden",
                  boxShadow:
                    "inset 0 0 0 1px rgba(0,0,0,0.35), inset -3px 0 8px -2px rgba(255,205,130,0.35), inset 0 2px 6px -2px rgba(255,225,170,0.30)",
                }}
              >
                <CoverArt role={role} s={s} hot={hot} />
                <div
                  aria-hidden="true"
                  style={{
                    ...fill,
                    pointerEvents: "none",
                    backgroundImage: GRAIN,
                    mixBlendMode: "multiply",
                    opacity: 0.22,
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    ...fill,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0.38), rgba(0,0,0,0) 9%, rgba(0,0,0,0) 94%, rgba(0,0,0,0.18))",
                  }}
                />
                {/* warm window light raking in from the upper right */}
                <div
                  aria-hidden="true"
                  style={{
                    ...fill,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(112deg, rgba(0,0,0,0) 45%, rgba(255,205,130,0.20) 100%)",
                    mixBlendMode: "screen",
                  }}
                />
                <motion.div
                  aria-hidden="true"
                  style={{
                    ...fill,
                    pointerEvents: "none",
                    background: light,
                    opacity: hot && !open ? 1 : 0,
                    transition: "opacity .3s",
                  }}
                />
              </div>
              <div
                style={{
                  ...fill,
                  background: role.edge,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  boxShadow: `inset 0 0 0 ${8 * s}px ${role.paper}, inset 0 0 0 ${9 * s}px ${role.rule}`,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </button>

      {showCaption && (
        <div
          aria-hidden="true"
          style={{
            width: w + 60,
            marginTop: 26 * s + 10,
            textAlign: "center",
            fontFamily: SANS,
            color: "#e0cfa6",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: flat ? 16 : 21,
              letterSpacing: "0.03em",
              color: hot ? "#fff0cc" : "#e6d3a6",
              textShadow: hot
                ? "0 0 14px rgba(255,200,120,0.65), 0 1px 3px rgba(0,0,0,0.8)"
                : "0 1px 3px rgba(0,0,0,0.85)",
              transition: "color .3s, text-shadow .3s",
            }}
          >
            <span style={star}>✦</span>
            {role.label}
            <span style={star}>✦</span>
          </div>
          {!flat && (
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.45,
                marginTop: 6,
                minHeight: 38,
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                opacity: hot ? 1 : 0,
                transition: "opacity .3s",
              }}
            >
              {role.blurb}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
