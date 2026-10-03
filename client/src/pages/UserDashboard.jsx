import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import api from "../services/api";
import * as LibraryBackdrop from "../components/library/MagicalLibraryBackground";

const Backdrop = Object.values(LibraryBackdrop).find(
  (v) => typeof v === "function" || (v && typeof v === "object" && v.$$typeof)
);

const EASE = [0.3, 0, 0.2, 1];
const PAPER = "#eee1c2";
const INK = "#2b1a10";
const RULE = "rgba(43,26,16,0.22)";
const BURGUNDY = "#5a1620";
const GOLD = "#c9a24a";
const DAY = 86400000;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IM+Fell+English+SC&family=Work+Sans:wght@400;500;600&display=swap');
.cx-display{font-family:'IM Fell English SC',Georgia,serif}
.cx-serif{font-family:'Cormorant Garamond',Georgia,serif;font-variant-numeric:lining-nums}
.cx-sans{font-family:'Work Sans',system-ui,sans-serif}
.cx-hand{font-family:'Caveat','Segoe Script',cursive}
.cx-focus:focus-visible{outline:2px solid #8a5a12;outline-offset:3px}
.pg-l,.pg-r{position:relative;background:${PAPER}}
.pg-l{box-shadow:0 3px 0 #dccfa9,0 6px 0 #cfc096}
.pg-r{box-shadow:0 3px 0 #dccfa9,0 6px 0 #cfc096;border-top:1px solid ${RULE}}
.gut-l,.gut-r{display:none}
@media (min-width:1024px){
  .pg-l{box-shadow:-2px 3px 0 #dccfa9,-4px 6px 0 #cfc096}
  .pg-r{box-shadow:2px 3px 0 #dccfa9,4px 6px 0 #cfc096;border-top:0;border-left:1px solid rgba(70,40,15,0.3)}
  .gut-l{display:block;background:linear-gradient(270deg,rgba(70,40,15,0.26),rgba(70,40,15,0) 7%)}
  .gut-r{display:block;background:linear-gradient(90deg,rgba(70,40,15,0.26),rgba(70,40,15,0) 7%)}
}
`;

/* ---------- data helpers (shape-tolerant, nothing invented) ---------- */

function pick(o, keys) {
  for (const k of keys) {
    const v = o ? o[k] : undefined;
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function toNum(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pretty = (s) => String(s).replace(/[_-]+/g, " ").trim().toLowerCase();
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const pad = (n) => String(n).padStart(2, "0");

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  const cands = [
    res && res.requests,
    res && res.data && res.data.requests,
    res && res.data,
    res && res.items,
    res && res.results,
  ];
  for (const c of cands) if (Array.isArray(c)) return c;
  return [];
}

function normalize(r) {
  const risk = r && r.risk && typeof r.risk === "object" ? r.risk : null;
  const navId = pick(r, ["_id", "id", "requestId", "request_id"]);
  const displayId = String(pick(r, ["requestId", "request_id", "requestNumber", "id", "_id"]) ?? "");
  const status = String(pick(r, ["status", "state"]) ?? "");
  const s = status.toLowerCase();
  const approved = /approv/.test(s);
  const rejected = /reject|denied|declin/.test(s);
  const closed = approved || rejected || /complet|cancel|closed|withdraw/.test(s);
  const reasonRaw =
    pick(r, ["riskReason", "risk_reason", "riskReasons", "risk_reasons"]) ??
    (risk ? risk.reason ?? risk.reasons : undefined);
  const levelRaw =
    pick(r, ["riskLevel", "risk_level"]) ??
    (risk ? risk.level : undefined) ??
    (typeof r.risk === "string" ? r.risk : undefined);
  const scoreRaw =
    pick(r, ["riskScore", "risk_score", "riskPercentage"]) ??
    (risk ? risk.score ?? risk.value : undefined) ??
    (typeof r.risk === "number" ? r.risk : undefined);
  const num = /(\d+)\s*$/.exec(displayId);
  return {
    raw: r,
    navId,
    displayId,
    title: String(pick(r, ["title", "subject", "name"]) ?? "Untitled request"),
    description: String(pick(r, ["description", "details", "summary", "purpose"]) ?? ""),
    type: pick(r, ["type", "requestType", "request_type", "category"]),
    priority: pick(r, ["priority"]),
    status,
    approved,
    rejected,
    closed,
    isActive: !closed,
    deadline: parseDate(pick(r, ["deadline", "dueDate", "due_date", "dueAt"])),
    created: parseDate(pick(r, ["createdAt", "created_at", "created"])),
    score: toNum(scoreRaw),
    level: levelRaw ? String(levelRaw) : "",
    reason: Array.isArray(reasonRaw) ? reasonRaw.join("; ") : reasonRaw ? String(reasonRaw) : "",
    chapter: num ? parseInt(num[1], 10) : null,
  };
}

function prepare(list) {
  const items = list.map(normalize);
  const maxScore = items.reduce((m, i) => (i.score !== null && i.score > m ? i.score : m), 0);
  const scale = maxScore > 0 && maxScore <= 1 ? 100 : 1;
  items.forEach((m, i) => {
    if (m.score !== null) m.score = Math.round(m.score * scale);
    m.isRisky = /high|critical|severe/i.test(m.level) || (m.score !== null && m.score >= 70);
    m.needsAttention =
      m.isRisky || /attention|revision|clarif|returned|changes requested/i.test(m.status);
    m.key = String(m.navId ?? `row-${i}`);
    if (m.chapter === null) m.chapter = items.length - i;
  });
  if (items.every((m) => m.created)) items.sort((a, b) => b.created - a.created);
  else items.sort((a, b) => b.chapter - a.chapter);
  return items;
}

function dueNote(d, closed) {
  if (!d) return null;
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: sameYear ? undefined : "numeric",
  });
  if (closed) return { text: `Was due ${date}`, tone: "calm", date: "" };
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((a - b) / DAY);
  if (days < 0) return { text: `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`, tone: "late", date };
  if (days === 0) return { text: "Due today", tone: "soon", date };
  if (days === 1) return { text: "Due tomorrow", tone: "soon", date };
  return { text: `Due in ${days} days`, tone: days <= 3 ? "soon" : "calm", date };
}

const FILTERS = [
  { id: "all", label: "ALL", name: "All", test: () => true },
  { id: "active", label: "ACTIVE", name: "Active", test: (m) => m.isActive },
  { id: "approved", label: "APPROVED", name: "Approved", test: (m) => m.approved },
  { id: "attention", label: "ATTENTION", name: "Attention", test: (m) => m.needsAttention },
];

function readReader() {
  try {
    const u = JSON.parse(localStorage.getItem("intelliflow_user") || "null");
    return u ? u.name || u.fullName || u.username || u.email || "" : "";
  } catch (e) {
    return "";
  }
}

/* ---------- small pieces ---------- */

function Ink({ write, delay, children, className, style }) {
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block", ...style }}
      initial={write ? { clipPath: "inset(0% 100% 0% 0%)" } : false}
      animate={{ clipPath: "inset(0% -4% 0% 0%)" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

function PageGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.16 }}
    />
  );
}

function StatRow({ label, note, value }) {
  return (
    <li
      className="flex items-baseline justify-between"
      style={{ padding: "0.7rem 0.2rem", borderBottom: `1px solid ${RULE}` }}
    >
      <span className="min-w-0">
        <span className="cx-serif block" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.1 }}>
          {label}
        </span>
        <span className="cx-sans block" style={{ fontSize: "0.76rem", opacity: 0.75, marginTop: 2 }}>
          {note}
        </span>
      </span>
      <span className="cx-serif" style={{ fontSize: "2.2rem", lineHeight: 1, color: BURGUNDY, fontWeight: 500 }}>
        {value}
      </span>
    </li>
  );
}

function Entry({ m, active, leaving, write, index, reduced, onOpen }) {
  const [hot, setHot] = useState(false);
  const lit = hot || active;
  const statusInk = m.approved ? "#3d5a2a" : m.rejected ? "#8c2f1f" : "#5a3b22";
  const due = dueNote(m.deadline, m.closed);
  const dueInk = due && due.tone === "late" ? "#8c2f1f" : due && due.tone === "soon" ? "#1f2f6b" : "#4a3a22";
  const hasRisk = m.isRisky || m.score !== null || m.level;
  const delay = (write ? 1.1 : 0) + Math.min(index, 6) * 0.06 + 0.25;

  return (
    <motion.li
      initial={write && !reduced ? { clipPath: "inset(0% 0% 100% 0%)", opacity: 0 } : false}
      animate={{ clipPath: "inset(-5% -5% -10% -5%)", opacity: 1 }}
      transition={{ duration: 0.6, delay: write ? 0.8 + Math.min(index, 8) * 0.09 : 0, ease: EASE }}
    >
      <motion.button
        type="button"
        className="cx-focus relative block w-full text-left"
        disabled={leaving}
        onClick={() => onOpen(m)}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        aria-current={active ? "true" : undefined}
        animate={{ x: reduced ? 0 : active ? 10 : hot ? 5 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{
          padding: "1.15rem 3rem 1.15rem 1rem",
          borderBottom: `1px solid ${RULE}`,
          background: lit ? "rgba(255,249,228,0.6)" : "transparent",
          boxShadow: lit ? `inset 3px 0 0 ${active ? GOLD : BURGUNDY}` : "inset 3px 0 0 transparent",
          color: INK,
          cursor: leaving ? "default" : "pointer",
          transition: "background .25s, box-shadow .25s",
        }}
      >
        <motion.span
          aria-hidden="true"
          className="absolute"
          style={{
            top: 0,
            right: 16,
            width: 16,
            background: active ? GOLD : BURGUNDY,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
          }}
          animate={{ height: reduced ? 28 : active ? 46 : hot ? 38 : 26 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        />

        <div className="flex gap-4">
          <div
            className="cx-serif italic"
            style={{ width: "2.6rem", fontSize: "2.1rem", lineHeight: 1, color: BURGUNDY, flexShrink: 0 }}
            aria-label={`Chapter ${pad(m.chapter)}`}
          >
            {pad(m.chapter)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="cx-sans" style={{ fontSize: "0.78rem", fontWeight: 500, opacity: lit ? 1 : 0.7, transition: "opacity .25s" }}>
                {m.displayId}
              </span>
              <span
                className="cx-display"
                style={{
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  color: statusInk,
                  border: `1px solid ${statusInk}`,
                  padding: "1px 9px",
                  transform: "rotate(-1.5deg)",
                }}
              >
                {m.status ? cap(pretty(m.status)) : "Unfiled"}
              </span>
            </div>

            <div className="cx-serif" style={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.15, marginTop: 6 }}>
              {m.title}
            </div>

            {m.description && (
              <p
                className="cx-sans"
                style={{
                  fontSize: "0.86rem",
                  lineHeight: 1.45,
                  marginTop: 4,
                  opacity: lit ? 0.95 : 0.78,
                  transition: "opacity .25s",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {m.description}
              </p>
            )}

            <div
              className="cx-sans flex flex-wrap gap-x-5 gap-y-1"
              style={{ fontSize: "0.82rem", marginTop: 6, opacity: lit ? 1 : 0.75, transition: "opacity .25s" }}
            >
              {m.type && <span>{cap(pretty(m.type))}</span>}
              {m.priority && <span style={{ fontWeight: 500 }}>{cap(pretty(m.priority))} priority</span>}
            </div>

            {(due || hasRisk) && (
              <div className="mt-2 flex flex-col gap-0.5">
                {due && (
                  <Ink write={write && !reduced} delay={delay} className="cx-hand" style={{ fontSize: "1.3rem", lineHeight: 1.2, color: dueInk }}>
                    {due.text}
                    {due.date && (
                      <span className="cx-sans" style={{ fontSize: "0.78rem", marginLeft: 10, opacity: 0.8 }}>
                        {due.date}
                      </span>
                    )}
                  </Ink>
                )}
                {hasRisk && (
                  <Ink
                    write={write && !reduced}
                    delay={delay + 0.2}
                    className="cx-hand"
                    style={{ fontSize: "1.25rem", lineHeight: 1.2, color: m.isRisky ? "#8c2f1f" : "#4a3a22" }}
                  >
                    {m.isRisky ? "Attention required: " : "Risk note: "}
                    {m.score !== null ? `${m.score} of 100` : cap(pretty(m.level))}
                    {m.score !== null && m.level ? `, ${pretty(m.level)}` : ""}
                    {m.reason ? `. ${m.reason}` : ""}
                  </Ink>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.button>
    </motion.li>
  );
}

/* ---------- page ---------- */

export default function UserDashboard() {
  const reduced = useReducedMotion();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeKey, setActiveKey] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [cornerHot, setCornerHot] = useState(false);
  const timer = useRef(null);
  const inkOnce = useRef(true);
  const reader = useMemo(readReader, []);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 90, damping: 22 });
  const sy = useSpring(py, { stiffness: 90, damping: 22 });
  const rotY = useTransform(sx, [0, 1], [1.4, -1.4]);
  const rotX = useTransform(sy, [0, 1], [-0.9, 0.9]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMyRequests();
      setItems(prepare(normalizeList(res)));
    } catch (err) {
      const msg =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        (err && err.message) ||
        "The archive could not be opened.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading) inkOnce.current = false;
  }, [loading]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const stats = useMemo(() => {
    const scored = items.filter((m) => m.score !== null);
    return {
      total: items.length,
      active: items.filter((m) => m.isActive).length,
      approved: items.filter((m) => m.approved).length,
      attention: items.filter((m) => m.needsAttention).length,
      avgRisk: scored.length ? Math.round(scored.reduce((a, m) => a + m.score, 0) / scored.length) : null,
    };
  }, [items]);

  const counts = useMemo(() => {
    const out = {};
    FILTERS.forEach((f) => {
      out[f.id] = items.filter(f.test).length;
    });
    return out;
  }, [items]);

  const current = FILTERS.find((f) => f.id === filter) || FILTERS[0];
  const shown = useMemo(() => items.filter(current.test), [items, current]);

  const go = (target, key) => {
    if (leaving) return;
    setActiveKey(key);
    setLeaving(true);
    timer.current = setTimeout(() => {
      window.location.href = target;
    }, reduced ? 120 : 800);
  };
  const openRequest = (m) => go(`/request/${m.navId}`, m.key);
  const beginChapter = () => go("/create-request", "new");

  const onMove = (e) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden px-3 pb-20 pt-8 sm:px-8 md:pt-12" style={{ backgroundColor: "#17100c", color: "#eadfc6" }}>
      <style>{STYLES}</style>

      {Backdrop && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <Backdrop />
        </div>
      )}

      <header className="relative z-10 mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-x-8 gap-y-2 px-1">
        <div>
          <h1 className="cx-display" style={{ fontSize: "clamp(2rem, 4.8vw, 3.8rem)", lineHeight: 1 }}>
            The Operator's Chronicle
          </h1>
          <p className="cx-serif italic" style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "#b8a780", marginTop: 4 }}>
            Your workflow archive
          </p>
        </div>
        {reader && (
          <p className="cx-sans" style={{ fontSize: "0.85rem", color: "#b8a780" }}>
            Kept by {reader}
          </p>
        )}
      </header>

      <div className="relative z-10 mx-auto mt-8 max-w-[1180px]" style={{ perspective: 2400 }} onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              background: BURGUNDY,
              padding: "clamp(6px, 1.4vw, 14px)",
              borderRadius: 3,
              boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.55), 0 30px 50px -30px rgba(0,0,0,0.8)",
            }}
          >
            <div className="grid lg:grid-cols-2">
              {/* LEFT PAGE */}
              <section className="pg-l flex" aria-labelledby="cx-chapters" style={{ color: INK, perspective: 1800 }}>
                <PageGrain />
                <div aria-hidden="true" className="gut-l pointer-events-none absolute inset-0" />
                <motion.div
                  className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10"
                  style={{ transformOrigin: "right center", background: PAPER, backfaceVisibility: "hidden" }}
                  initial={reduced ? false : { rotateY: 82, filter: "brightness(0.7)" }}
                  animate={{ rotateY: 0, filter: "brightness(1)" }}
                  transition={{ delay: 0.15, duration: 0.9, ease: EASE }}
                >
                  <PageGrain />
                  <div aria-hidden="true" className="gut-l pointer-events-none absolute inset-0" />
                  <div className="relative flex flex-1 flex-col">
                    <h2 id="cx-chapters" className="cx-serif" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>
                      My Chapters
                    </h2>
                    <p className="cx-serif italic" style={{ fontSize: "1.1rem", marginTop: 6, opacity: 0.8 }}>
                      The record of your missions so far.
                    </p>

                    <ul className="mt-6" style={{ borderTop: `1px solid ${RULE}` }}>
                      <StatRow label="Total Requests" note="Chapters in your archive" value={stats.total} />
                      <StatRow label="Active" note="Missions in progress" value={stats.active} />
                      <StatRow label="Approved" note="Sealed and complete" value={stats.approved} />
                      <StatRow label="Needs Attention" note="Flagged for risk or review" value={stats.attention} />
                    </ul>

                    {stats.avgRisk !== null && (
                      <p className="cx-hand" style={{ fontSize: "1.3rem", marginTop: 18, color: "#1f2f6b", lineHeight: 1.2 }}>
                        In the margin: average risk across your chapters is {stats.avgRisk} of 100.
                      </p>
                    )}

                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        className="cx-focus relative block w-full text-left"
                        onClick={beginChapter}
                        disabled={leaving}
                        onPointerEnter={() => setCornerHot(true)}
                        onPointerLeave={() => setCornerHot(false)}
                        onFocus={() => setCornerHot(true)}
                        onBlur={() => setCornerHot(false)}
                        style={{
                          padding: "1.1rem 3rem 1.1rem 1.25rem",
                          background: "#f7eed4",
                          border: `1px solid ${RULE}`,
                          color: INK,
                          cursor: leaving ? "default" : "pointer",
                          transform: cornerHot && !reduced ? "translateY(-2px)" : "none",
                          transition: "transform .25s",
                        }}
                      >
                        <span className="cx-serif block" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.03em" }}>
                          BEGIN A NEW CHAPTER
                        </span>
                        <span className="cx-sans block" style={{ fontSize: "0.8rem", marginTop: 3, opacity: 0.75 }}>
                          Opens a blank page for a new request
                        </span>
                        <motion.span
                          aria-hidden="true"
                          className="absolute"
                          style={{
                            right: 0,
                            bottom: 0,
                            background: "#cdbb92",
                            clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                          }}
                          animate={{ width: cornerHot && !reduced ? 34 : 18, height: cornerHot && !reduced ? 34 : 18 }}
                          transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* RIGHT PAGE */}
              <section className="pg-r" aria-labelledby="cx-missions" style={{ color: INK, perspective: 1800 }}>
                <PageGrain />
                <div aria-hidden="true" className="gut-r pointer-events-none absolute inset-0" />
                <motion.div
                  className="relative"
                  style={{ transformOrigin: "left center", background: PAPER, backfaceVisibility: "hidden" }}
                  initial={reduced ? false : { rotateY: -82, filter: "brightness(0.7)" }}
                  animate={
                    leaving && !reduced
                      ? { rotateY: -96, filter: "brightness(0.82)" }
                      : { rotateY: 0, filter: "brightness(1)" }
                  }
                  transition={
                    leaving
                      ? { delay: 0.22, duration: 0.55, ease: [0.6, 0, 0.8, 0.4] }
                      : { delay: 0.45, duration: 0.9, ease: EASE }
                  }
                >
                  <PageGrain />
                  <div aria-hidden="true" className="gut-r pointer-events-none absolute inset-0" />
                  <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:max-h-[78vh] lg:overflow-y-auto">
                    <h2 id="cx-missions" className="cx-serif" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>
                      Current Missions
                    </h2>

                    <div role="group" aria-label="Filter missions" className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                      {FILTERS.map((f) => {
                        const on = filter === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            className="cx-focus cx-sans relative"
                            aria-pressed={on}
                            onClick={() => setFilter(f.id)}
                            style={{
                              padding: "0.35rem 0.1rem 0.5rem",
                              background: "none",
                              border: 0,
                              color: INK,
                              fontSize: "0.82rem",
                              fontWeight: on ? 600 : 500,
                              letterSpacing: "0.1em",
                              opacity: on ? 1 : 0.7,
                              cursor: "pointer",
                            }}
                          >
                            {f.label}
                            <span style={{ marginLeft: 6, color: BURGUNDY }}>{counts[f.id]}</span>
                            {on && (
                              <motion.span
                                layoutId="tab"
                                aria-hidden="true"
                                className="absolute"
                                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                style={{ left: 0, right: 0, bottom: 0, height: 3, background: BURGUNDY }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="cx-sans" style={{ fontSize: "0.85rem", marginTop: 10, opacity: 0.8 }} aria-live="polite">
                      {loading
                        ? "Turning to your first page…"
                        : error
                        ? "The page would not open."
                        : `${current.name}: ${shown.length} of ${items.length} ${items.length === 1 ? "chapter" : "chapters"}`}
                    </p>

                    <div className="mt-4">
                      {error && (
                        <div role="alert" style={{ padding: "1rem 0" }}>
                          <p className="cx-serif" style={{ fontSize: "1.3rem", color: "#8c2f1f" }}>
                            {error}
                          </p>
                          <button
                            type="button"
                            className="cx-focus cx-sans"
                            onClick={load}
                            style={{
                              marginTop: 12,
                              padding: "0.6rem 1.1rem",
                              background: BURGUNDY,
                              color: "#f3e7c9",
                              border: 0,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Read the page again
                          </button>
                        </div>
                      )}

                      {!loading && !error && items.length === 0 && (
                        <div style={{ padding: "1.5rem 0" }}>
                          <p className="cx-serif italic" style={{ fontSize: "1.5rem" }}>
                            The first page is still blank.
                          </p>
                          <p className="cx-sans" style={{ fontSize: "0.9rem", marginTop: 6, opacity: 0.8 }}>
                            Begin a new chapter to file your first request.
                          </p>
                        </div>
                      )}

                      {!loading && !error && items.length > 0 && shown.length === 0 && (
                        <p className="cx-serif italic" style={{ fontSize: "1.4rem", padding: "1.5rem 0" }}>
                          No chapters are filed under {current.name.toLowerCase()} yet.
                        </p>
                      )}

                      {!loading && !error && shown.length > 0 && (
                        <ul style={{ borderTop: `1px solid ${RULE}` }}>
                          {shown.map((m, i) => (
                            <Entry
                              key={m.key}
                              m={m}
                              index={i}
                              active={activeKey === m.key}
                              leaving={leaving}
                              write={inkOnce.current}
                              reduced={reduced}
                              onOpen={openRequest}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
