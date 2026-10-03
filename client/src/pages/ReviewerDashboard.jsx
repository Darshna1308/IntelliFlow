import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import api from "../services/api";


const MIDNIGHT = "#0b1226";
const NAVY = "#14213d";
const CREAM = "#ece4cf";
const SILVER = "#aeb8cf";
const GOLD = "#c9b27a";
const PAGE = "#eeead9";
const INK = "#1b2338";
const RULE = "rgba(27,35,56,0.2)";
const EASE = [0.3, 0, 0.2, 1];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IM+Fell+English+SC&family=Work+Sans:wght@400;500;600&display=swap');
.rv-display{font-family:'IM Fell English SC',Georgia,serif}
.rv-serif{font-family:'Cormorant Garamond',Georgia,serif;font-variant-numeric:lining-nums}
.rv-sans{font-family:'Work Sans',system-ui,sans-serif}
.rv-hand{font-family:'Caveat','Segoe Script',cursive}
.rv-wrap{overflow-wrap:anywhere}
.rv-focus:focus-visible{outline:2px solid #c9b27a;outline-offset:3px}
.rv-page .rv-focus:focus-visible{outline-color:#2b4a8a}
.rv-node:focus{outline:none}
@keyframes rv-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes rv-twinkle{0%,100%{opacity:.25}50%{opacity:.95}}
@keyframes rv-float{0%{transform:translateY(0);opacity:.15}50%{opacity:.5}100%{transform:translateY(-34px);opacity:.15}}
.rv-spin{animation:rv-spin 600s linear infinite}
.rv-tw{animation:rv-twinkle 7s ease-in-out infinite}
.rv-dust{animation:rv-float 16s ease-in-out infinite alternate}
@media (prefers-reduced-motion:reduce){.rv-spin,.rv-tw,.rv-dust{animation:none!important}}
`;


/* ---------- the observatory's own night sky ---------- */

const STARS = (() => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 80 }, (_, index) => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.03 + rnd() * 0.06,
    twinkle: index % 4 === 0,
    delay: rnd() * 7,
  }));
})();

const CONSTELLATIONS = [
  [3, 11, 17, 24, 30],
  [40, 47, 52, 60, 66],
];

const DUST = [
  { left: "12%", top: "70%", d: 0 },
  { left: "27%", top: "38%", d: 3 },
  { left: "44%", top: "82%", d: 6 },
  { left: "58%", top: "26%", d: 2 },
  { left: "71%", top: "64%", d: 8 },
  { left: "86%", top: "44%", d: 5 },
  { left: "93%", top: "84%", d: 9 },
  { left: "6%", top: "28%", d: 7 },
];

function NightSky() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: MIDNIGHT }}
    >
      <div
        className="absolute"
        style={{
          right: "5%",
          top: "3%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,214,240,0.17), rgba(200,214,240,0) 65%)",
        }}
      />

      <div
        className="rv-spin absolute"
        style={{ left: "50%", top: "50%", width: "170vmax", height: "170vmax", transform: "translate(-50%, -50%)" }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none">
          {CONSTELLATIONS.map((line, index) => (
            <polyline
              key={index}
              points={line.map((i) => `${STARS[i].x},${STARS[i].y}`).join(" ")}
              fill="none"
              stroke="rgba(236,228,207,0.26)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {STARS.map((star, index) => (
            <circle
              key={index}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill={CREAM}
              className={star.twinkle ? "rv-tw" : undefined}
              style={star.twinkle ? { animationDelay: `${star.delay}s` } : { opacity: 0.6 }}
            />
          ))}
        </svg>
      </div>

      {DUST.map((mote, index) => (
        <span
          key={index}
          className="rv-dust absolute rounded-full"
          style={{
            left: mote.left,
            top: mote.top,
            width: 3,
            height: 3,
            background: "rgba(236,228,207,0.8)",
            animationDelay: `${mote.d}s`,
          }}
        />
      ))}
    </div>
  );
}


/* ---------- small pieces ---------- */

function StarGlyph({ size = 18, color = INK, glow = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0, filter: glow ? "drop-shadow(0 0 4px rgba(201,178,122,0.9))" : "none" }}
    >
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" fill={color} />
    </svg>
  );
}


function Section({ eyebrow, title, note, aside, reduced, children }) {
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ marginTop: "3rem" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          {eyebrow && (
            <p className="rv-sans" style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.14em", color: GOLD }}>
              {eyebrow}
            </p>
          )}
          <h2 className="rv-serif" style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)", fontWeight: 700, lineHeight: 1.1, color: CREAM }}>
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {note && (
        <p className="rv-serif italic" style={{ fontSize: "1.1rem", color: SILVER, marginTop: 4 }}>
          {note}
        </p>
      )}
      <div style={{ marginTop: "1.4rem" }}>{children}</div>
    </motion.section>
  );
}


function Manuscript({ children }) {
  return (
    <div
      className="rv-page relative"
      style={{
        background: PAGE,
        color: INK,
        border: "1px solid rgba(27,35,56,0.3)",
        boxShadow: "0 3px 0 #d8d3bf, 0 6px 0 #cbc5ad, 0 30px 50px -28px rgba(0,0,0,0.85)",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.14 }} />
      <div aria-hidden="true" className="pointer-events-none absolute" style={{ inset: 8, border: "1px solid rgba(201,178,122,0.65)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}


function Marker({ value, label, meta }) {
  return (
    <div className="relative" style={{ textAlign: "center" }}>
      <span
        style={{ display: "inline-block", background: MIDNIGHT, padding: "0 10px", position: "relative", zIndex: 1 }}
      >
        <StarGlyph size={22} color={GOLD} glow />
      </span>
      <div className="rv-serif" style={{ fontSize: "3rem", fontWeight: 500, lineHeight: 1, color: CREAM, marginTop: 6 }}>
        {value}
      </div>
      <div className="rv-sans" style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em", color: CREAM, marginTop: 6 }}>
        {label.toUpperCase()}
      </div>
      <div className="rv-sans" style={{ fontSize: "0.78rem", color: SILVER, marginTop: 2 }}>
        {meta}
      </div>
    </div>
  );
}


function ReviewerDashboard() {

  const reduced = useReducedMotion();

  const [
    requests,
    setRequests,
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
    activeId,
    setActiveId,
  ] = useState(null);


  const loadRequests =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const data =
          await api.getAssignedRequests();


        setRequests(
          data.requests ||
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

    loadRequests();

  }, []);


  const getIntelligence =
    (request) =>
      request.intelligence ||
      {};


  const pendingRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "SUBMITTED",
              "RESUBMITTED",
              "UNDER_REVIEW",
            ].includes(
              request.status
            )
        ),
      [requests]
    );


  const completedRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "APPROVED",
              "REJECTED",
            ].includes(
              request.status
            )
        ),
      [requests]
    );


  const changesRequestedRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "CHANGES_REQUESTED"
        ),
      [requests]
    );


  const highRiskRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "HIGH",
              "CRITICAL",
            ].includes(
              getIntelligence(
                request
              ).riskLevel
            )
        ),
      [requests]
    );


  const dueSoonRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            getIntelligence(
              request
            ).deadlineStatus ===
            "DUE_SOON"
        ),
      [requests]
    );


  const overdueRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            getIntelligence(
              request
            ).deadlineStatus ===
            "OVERDUE"
        ),
      [requests]
    );


  const attentionRequests =
    useMemo(
      () =>
        requests.filter(
          (request) => {

            const intelligence =
              getIntelligence(
                request
              );


            return (
              [
                "HIGH",
                "CRITICAL",
              ].includes(
                intelligence.riskLevel
              ) ||
              [
                "DUE_SOON",
                "OVERDUE",
              ].includes(
                intelligence.deadlineStatus
              )
            );

          }
        ),
      [requests]
    );


  const averageRisk =
    useMemo(() => {

      if (
        requests.length ===
        0
      ) {
        return 0;
      }


      const total =
        requests.reduce(
          (
            sum,
            request
          ) =>
            sum +
            (
              getIntelligence(
                request
              ).riskScore ||
              0
            ),
          0
        );


      return Math.round(
        total /
        requests.length
      );

    }, [requests]);


  const chartRequests =
    useMemo(
      () =>
        [...requests]
          .sort((a, b) => {
            const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return da - db;
          })
          .slice(0, 24),
      [requests]
    );


  const formatDate =
    (value) => {

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


  const formatStatus =
    (value) => {

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


  const openRequest =
    (requestId) => {

      window.location.href =
        `/request/${requestId}`;

    };


  const needsAttention = (request) => {
    const intelligence = getIntelligence(request);
    return (
      ["HIGH", "CRITICAL"].includes(intelligence.riskLevel) ||
      ["DUE_SOON", "OVERDUE"].includes(intelligence.deadlineStatus)
    );
  };

  const isCompleted = (request) =>
    ["APPROVED", "REJECTED"].includes(request.status);

  const starColor = (request) =>
    needsAttention(request) ? "#e6c97a" : isCompleted(request) ? "#7c8aa8" : CREAM;

  const starRadius = (request) =>
    request.priority === "CRITICAL" ? 1.7 : request.priority === "HIGH" ? 1.4 : request.priority === "LOW" ? 0.85 : 1.1;

  const statusInk = (status) =>
    status === "APPROVED"
      ? "#3d5a2a"
      : status === "REJECTED"
      ? "#8c2f1f"
      : status === "CHANGES_REQUESTED"
      ? "#8a5a12"
      : "#1b2d57";


  const shell = (content) => (
    <div
      className="relative min-h-screen overflow-x-hidden px-3 pb-24 pt-8 sm:px-8 md:pt-12"
      style={{ backgroundColor: MIDNIGHT, color: CREAM }}
    >
      <style>{STYLES}</style>

      <NightSky />

      <div className="relative z-10 mx-auto max-w-[1100px]">
        {content}
      </div>
    </div>
  );


  if (loading) {

    return shell(
      <div role="status" aria-live="polite" style={{ padding: "6rem 1rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <StarGlyph size={34} color={GOLD} glow />
        </div>
        <p className="rv-serif italic" style={{ fontSize: "1.7rem", color: CREAM }}>
          Loading your review queue…
        </p>
      </div>
    );

  }


  const entry = (request, withDescription) => {

    const intelligence = getIntelligence(request);
    const attention = needsAttention(request);
    const riskTone = ["HIGH", "CRITICAL"].includes(intelligence.riskLevel) ? "#8c3b2a" : INK;
    const deadlineTone =
      intelligence.deadlineStatus === "OVERDUE"
        ? "#8c3b2a"
        : intelligence.deadlineStatus === "DUE_SOON"
        ? "#2b4a8a"
        : INK;

    return (
      <li key={request._id}>
        <motion.button
          type="button"
          className="rv-focus relative block w-full text-left"
          onClick={() => openRequest(request._id)}
          whileHover={reduced ? undefined : { x: 4 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{
            padding: "1.2rem 0.5rem 1.2rem 0.4rem",
            borderBottom: `1px solid ${RULE}`,
            background: "transparent",
            color: INK,
            cursor: "pointer",
          }}
        >
          <div className="flex gap-4">

            <div style={{ paddingTop: 6 }}>
              <StarGlyph
                size={starRadius(request) * 14}
                color={attention ? "#b8892b" : isCompleted(request) ? "#7c8aa8" : "#1b2d57"}
                glow={attention}
              />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="rv-sans" style={{ fontSize: "0.78rem", fontWeight: 500, opacity: 0.75 }}>
                  {request.requestId}
                </span>
                <span
                  className="rv-display"
                  style={{
                    fontSize: "0.9rem",
                    letterSpacing: "0.04em",
                    color: statusInk(request.status),
                    border: `1px solid ${statusInk(request.status)}`,
                    padding: "1px 9px",
                    transform: "rotate(-1.5deg)",
                  }}
                >
                  {formatStatus(request.status)}
                </span>
              </div>

              <h3 className="rv-serif rv-wrap" style={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.15, marginTop: 6 }}>
                {request.title}
              </h3>

              {withDescription && request.description && (
                <p
                  className="rv-sans rv-wrap"
                  style={{
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                    marginTop: 4,
                    opacity: 0.85,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {request.description}
                </p>
              )}

              <div className="rv-sans flex flex-wrap gap-x-5 gap-y-1" style={{ fontSize: "0.82rem", marginTop: 8, opacity: 0.85 }}>
                <span>{request.type}</span>
                <span>Priority: {request.priority || "MEDIUM"}</span>
                <span>Due {formatDate(request.dueDate)}</span>
              </div>

              {(intelligence.riskLevel || intelligence.deadlineStatus) && (
                <div className="mt-1 flex flex-wrap gap-x-6">
                  {intelligence.riskLevel && (
                    <span className="rv-hand" style={{ fontSize: "1.3rem", color: riskTone }}>
                      Risk: {formatStatus(intelligence.riskLevel)}
                    </span>
                  )}
                  {intelligence.deadlineStatus && (
                    <span className="rv-hand" style={{ fontSize: "1.3rem", color: deadlineTone }}>
                      {formatStatus(intelligence.deadlineStatus)}
                    </span>
                  )}
                </div>
              )}

            </div>

          </div>
        </motion.button>
      </li>
    );
  };


  const activeRequest = chartRequests.find((request) => request._id === activeId) || null;

  const nodes = chartRequests.map((request, index) => {
    const angle = index * 2.39996;
    const radius = 5.2 * Math.sqrt(index + 0.5);
    return {
      request,
      x: 50 + radius * Math.cos(angle) * 1.6,
      y: 28 + radius * Math.sin(angle) * 0.9,
    };
  });


  return shell(
    <>

      <header className="px-1">

        <h1 className="rv-display" style={{ fontSize: "clamp(2rem, 4.8vw, 3.8rem)", lineHeight: 1 }}>
          The Reviewer's Observatory
        </h1>

        <p className="rv-serif italic" style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: SILVER, marginTop: 6 }}>
          Every request is a story. Every decision changes its course.
        </p>

      </header>


      {message && (
        <div
          role="alert"
          className="rv-sans rv-wrap"
          style={{
            marginTop: "1.6rem",
            padding: "0.7rem 0.9rem",
            borderLeft: "3px solid #d08a72",
            background: "rgba(208,138,114,0.12)",
            color: "#f0c9bb",
            fontSize: "0.92rem",
          }}
        >
          {message}
        </div>
      )}


      <Section
        eyebrow="REVIEW WORKSPACE"
        title="Constellation Overview"
        note="Your assigned workflows, read from the sky."
        reduced={reduced}
      >

        <div className="relative">

          <span
            aria-hidden="true"
            className="absolute hidden lg:block"
            style={{ left: "8%", right: "8%", top: 11, height: 1, background: "rgba(174,184,207,0.3)" }}
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">

            <Marker value={requests.length} label="Assigned" meta="Total workflows" />

            <Marker value={pendingRequests.length} label="Awaiting review" meta="Require reviewer action" />

            <Marker value={changesRequestedRequests.length} label="Changes requested" meta="Sent back to the author" />

            <Marker value={completedRequests.length} label="Completed" meta="Approved or rejected" />

            <Marker value={averageRisk} label="Average risk" meta="Out of 100" />

          </div>

        </div>

      </Section>


      <Section
        eyebrow="REVIEW SIGNALS"
        title="Attention Overview"
        reduced={reduced}
      >

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4" style={{ margin: 0 }}>

          {[
            ["High / Critical Risk", highRiskRequests.length],
            ["Due Soon", dueSoonRequests.length],
            ["Overdue", overdueRequests.length],
            ["Needs Attention", attentionRequests.length],
          ].map(([label, count]) => (

            <div key={label} style={{ borderTop: "1px solid rgba(174,184,207,0.3)", paddingTop: 10 }}>
              <dt className="rv-sans" style={{ fontSize: "0.8rem", color: SILVER }}>
                {label}
              </dt>
              <dd className="rv-hand" style={{ fontSize: "2.4rem", lineHeight: 1.1, color: count > 0 ? "#e6c97a" : CREAM }}>
                {count}
              </dd>
            </div>

          ))}

        </dl>

      </Section>


      {chartRequests.length > 0 && (

        <Section
          eyebrow="THE STAR CHART"
          title="Request Constellation"
          note={
            requests.length > chartRequests.length
              ? `The ${chartRequests.length} nearest deadlines, joined in order of due date.`
              : "Each star is a request, joined in order of due date."
          }
          reduced={reduced}
        >

          <div className="hidden gap-6 lg:grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 17rem" }}>

            <div style={{ border: "1px solid rgba(174,184,207,0.3)", background: "rgba(20,33,61,0.55)" }}>

              <svg viewBox="0 0 100 56" width="100%" role="group" aria-label="Constellation of assigned requests">

                <ellipse cx="50" cy="28" rx="26" ry="15" fill="none" stroke="rgba(174,184,207,0.12)" strokeWidth="0.15" />
                <ellipse cx="50" cy="28" rx="44" ry="25" fill="none" stroke="rgba(174,184,207,0.1)" strokeWidth="0.15" />

                <polyline
                  points={nodes.map((n) => `${n.x},${n.y}`).join(" ")}
                  fill="none"
                  stroke="rgba(236,228,207,0.3)"
                  strokeWidth="0.2"
                />

                {nodes.map(({ request, x, y }) => {
                  const r = starRadius(request);
                  const active = request._id === activeId;
                  const attention = needsAttention(request);
                  return (
                    <g
                      key={request._id}
                      className="rv-node"
                      role="button"
                      tabIndex={0}
                      aria-label={`${request.requestId}: ${request.title}. ${formatStatus(request.status)}. Open request.`}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setActiveId(request._id)}
                      onFocus={() => setActiveId(request._id)}
                      onClick={() => openRequest(request._id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openRequest(request._id);
                        }
                      }}
                    >
                      <circle cx={x} cy={y} r={3.2} fill="transparent" />
                      {attention && <circle cx={x} cy={y} r={r * 2.4} fill="rgba(230,201,122,0.2)" />}
                      {active && <circle cx={x} cy={y} r={r * 3} fill="none" stroke={CREAM} strokeWidth="0.25" />}
                      <circle cx={x} cy={y} r={r} fill={starColor(request)} />
                      {active && (
                        <text
                          x={x}
                          y={y - r * 3.4}
                          textAnchor="middle"
                          fill={CREAM}
                          fontSize="2"
                          style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}
                        >
                          {request.requestId}
                        </text>
                      )}
                    </g>
                  );
                })}

              </svg>

            </div>

            <div aria-live="polite" style={{ borderLeft: `2px solid ${GOLD}`, paddingLeft: 16, alignSelf: "start" }}>

              {activeRequest ? (
                <>
                  <p className="rv-sans" style={{ fontSize: "0.78rem", color: GOLD }}>
                    {activeRequest.requestId}
                  </p>
                  <p className="rv-serif rv-wrap" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.15, marginTop: 4 }}>
                    {activeRequest.title}
                  </p>
                  <p className="rv-sans" style={{ fontSize: "0.84rem", color: SILVER, marginTop: 8, lineHeight: 1.6 }}>
                    {activeRequest.type}
                    <br />
                    {formatStatus(activeRequest.status)} · Priority {activeRequest.priority || "MEDIUM"}
                    <br />
                    Due {formatDate(activeRequest.dueDate)}
                  </p>
                  {getIntelligence(activeRequest).riskLevel && (
                    <p className="rv-hand" style={{ fontSize: "1.3rem", color: "#e6c97a", marginTop: 6 }}>
                      Risk: {formatStatus(getIntelligence(activeRequest).riskLevel)}
                    </p>
                  )}
                  <p className="rv-sans" style={{ fontSize: "0.78rem", color: SILVER, marginTop: 10 }}>
                    Select the star to open this request.
                  </p>
                </>
              ) : (
                <p className="rv-serif italic" style={{ fontSize: "1.2rem", color: SILVER }}>
                  Hover over or focus a star to read its entry.
                </p>
              )}

            </div>

          </div>

          <p className="rv-sans lg:hidden" style={{ fontSize: "0.85rem", color: SILVER }}>
            The star chart opens on wider screens. Every request is listed below.
          </p>

        </Section>

      )}


      <Section
        eyebrow="PRIORITY QUEUE"
        title="Requests Needing Attention"
        reduced={reduced}
        aside={
          <span className="rv-sans" style={{ fontSize: "0.85rem", color: SILVER }}>
            {attentionRequests.length} request{attentionRequests.length === 1 ? "" : "s"}
          </span>
        }
      >

        <Manuscript>

          <div className="px-5 py-7 sm:px-10 sm:py-9">

            {attentionRequests.length === 0 ? (

              <p className="rv-serif italic" style={{ fontSize: "1.35rem" }}>
                No assigned requests currently require immediate attention.
              </p>

            ) : (

              <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${RULE}` }}>
                {attentionRequests.map((request) => entry(request, true))}
              </ul>

            )}

          </div>

        </Manuscript>

      </Section>


      <Section
        eyebrow="ASSIGNED WORKFLOWS"
        title="Review Queue"
        reduced={reduced}
        aside={
          <span className="rv-sans" style={{ fontSize: "0.85rem", color: SILVER }}>
            {requests.length} total
          </span>
        }
      >

        <Manuscript>

          <div className="px-5 py-7 sm:px-10 sm:py-9">

            {requests.length === 0 ? (

              <p className="rv-serif italic" style={{ fontSize: "1.35rem" }}>
                No workflows have been assigned to you yet.
              </p>

            ) : (

              <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${RULE}` }}>
                {requests.map((request) => entry(request, false))}
              </ul>

            )}

          </div>

        </Manuscript>

      </Section>

    </>
  );
}


export default ReviewerDashboard;
