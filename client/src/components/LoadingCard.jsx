// LoadingCard.jsx
// Role-aware loading card for IntelliFlow.
// Props/API unchanged: { message = "Loading..." }

const ROLES = ["USER", "REVIEWER", "ADMIN"];

// Reads the current role defensively from localStorage.
// Adjust ONLY this function if your app stores the role elsewhere.
function getRole() {
  if (typeof window === "undefined") return "USER";

  const read = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const candidates = [read("role"), read("userRole")];

  for (const key of ["user", "authUser", "auth", "currentUser"]) {
    const raw = read(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      candidates.push(parsed?.role, parsed?.user?.role);
    } catch {
      /* ignore malformed JSON */
    }
  }

  for (const c of candidates) {
    const value = String(c || "").replace(/"/g, "").trim().toUpperCase();
    if (ROLES.includes(value)) return value;
  }
  return "USER";
}

const EYEBROW = {
  USER: "The Operator's Chronicle",
  REVIEWER: "The Observatory",
  ADMIN: "Case Record"
};

/* ---------- Role artwork (decorative, aria-hidden) ---------- */

function UserArt() {
  return (
    <svg className="if-art" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="72" rx="46" ry="4" fill="rgba(60,40,15,.18)" />
      {/* open book */}
      <path d="M60 14 C46 8 28 8 10 14 L10 66 C28 60 46 60 60 68 Z" fill="#f6ebd0" stroke="#8a6a3b" strokeWidth="1.2" />
      <path d="M60 14 C74 8 92 8 110 14 L110 66 C92 60 74 60 60 68 Z" fill="#f6ebd0" stroke="#8a6a3b" strokeWidth="1.2" />
      <path d="M60 14 V68" stroke="#8a6a3b" strokeWidth="1.4" />
      {/* written lines, left page */}
      <g stroke="#5b3f26" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".55">
        <path d="M20 26 H50" />
        <path d="M20 34 H46" />
        <path d="M20 42 H50" />
        <path d="M20 50 H40" />
      </g>
      {/* lines being written, right page */}
      <g className="if-ink" stroke="#5b3f26" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path pathLength="1" d="M70 26 H100" />
        <path pathLength="1" d="M70 34 H96" />
        <path pathLength="1" d="M70 42 H100" />
        <path pathLength="1" d="M70 50 H88" />
      </g>
      {/* turning page */}
      <path className="if-leaf" d="M60 14 C74 8 92 8 110 14 L110 66 C92 60 74 60 60 68 Z" fill="#fbf3dc" stroke="#8a6a3b" strokeWidth="1.2" />
      {/* faint motes */}
      <circle className="if-mote" cx="40" cy="12" r="1.8" fill="#d9a441" />
      <circle className="if-mote" cx="60" cy="9" r="2.2" fill="#d9a441" />
      <circle className="if-mote" cx="82" cy="12" r="1.8" fill="#d9a441" />
    </svg>
  );
}

function ReviewerArt() {
  return (
    <svg className="if-art if-art-wide" viewBox="0 0 160 70" aria-hidden="true" focusable="false">
      <polyline
        className="if-trace"
        pathLength="1"
        points="14,48 44,22 78,40 112,14 146,34"
        fill="none"
        stroke="#8fa6d6"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#efe8d0">
        <circle className="if-star" cx="14" cy="48" r="2.2" />
        <circle className="if-star" cx="44" cy="22" r="2.6" />
        <circle className="if-star" cx="78" cy="40" r="2" />
        <circle className="if-star" cx="112" cy="14" r="2.8" />
        <circle className="if-star" cx="146" cy="34" r="2.2" />
        <circle className="if-star" cx="28" cy="10" r="1" />
        <circle className="if-star" cx="96" cy="58" r="1" />
        <circle className="if-star" cx="130" cy="58" r="1.2" />
      </g>
    </svg>
  );
}

function AdminArt() {
  return (
    <svg className="if-art" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      {/* folder back + tab */}
      <path d="M14 24 V18 a2 2 0 0 1 2-2 H44 l6 8 Z" fill="#cdb27a" stroke="#a68c55" strokeWidth="1" />
      <rect x="14" y="24" width="92" height="48" rx="3" fill="#cdb27a" stroke="#a68c55" strokeWidth="1" />
      {/* record sheet being drawn out */}
      <g className="if-sheet">
        <rect x="24" y="10" width="72" height="44" fill="#fbf8ee" stroke="#b9ad8f" strokeWidth="1" />
        <g stroke="#a9b8d0" strokeWidth=".8">
          <path d="M30 18 H90" />
          <path d="M30 24 H90" />
          <path d="M30 30 H90" />
        </g>
        <path className="if-red" pathLength="1" d="M32 27 q10 -4 22 0 t24 0" fill="none" stroke="#b3261e" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {/* folder front */}
      <rect x="14" y="34" width="92" height="38" rx="3" fill="#dcc48e" stroke="#a68c55" strokeWidth="1" />
      <rect x="22" y="44" width="30" height="5" rx="1" fill="rgba(90,70,30,.18)" />
    </svg>
  );
}

const ART = { USER: UserArt, REVIEWER: ReviewerArt, ADMIN: AdminArt };

/* ---------- Styles (self-contained, no other files touched) ---------- */

const STYLES = `
.if-loader{box-sizing:border-box;width:min(100%,420px);margin:0 auto;padding:26px 22px 22px;
  border-radius:6px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.if-art{display:block;width:min(150px,46vw);height:auto}
.if-art-wide{width:min(210px,62vw)}
.if-eyebrow{margin:0;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;opacity:.75}
.if-msg{margin:0;font-size:1rem;line-height:1.5;overflow-wrap:anywhere}

/* USER: parchment / library */
.if-user{background:linear-gradient(180deg,#f6ebd0,#ead9b0);border:1px solid #b8975a;color:#3b2a1a;
  font-family:Georgia,"Times New Roman",serif;box-shadow:inset 0 0 40px rgba(120,80,30,.18),0 8px 24px rgba(40,25,10,.22)}
.if-user .if-msg{font-style:italic}

/* REVIEWER: observatory / manuscript */
.if-reviewer{background:linear-gradient(160deg,#0b1730,#14264f);border:1px solid rgba(143,166,214,.28);
  color:#e8e4d0;font-family:Georgia,"Times New Roman",serif;box-shadow:0 8px 24px rgba(5,10,25,.45)}
.if-reviewer .if-msg{background:#efe8d6;color:#1b2747;padding:8px 16px;border-radius:2px;
  box-shadow:0 1px 0 rgba(255,255,255,.25) inset}

/* ADMIN: classroom case record, no magic */
.if-admin{background:repeating-linear-gradient(180deg,#f7f2e4 0,#f7f2e4 27px,#d5dcea 28px);
  border:1px solid #b9ad8f;border-left:4px solid #b3261e;color:#2b2a26;
  font-family:"Courier New",Courier,monospace;box-shadow:0 6px 18px rgba(50,40,20,.18)}
.if-admin .if-eyebrow{color:#b3261e;opacity:.9}

/* Static end-state (also the reduced-motion state) */
.if-ink path,.if-trace,.if-red{stroke-dasharray:1;stroke-dashoffset:0}
.if-leaf{opacity:0;transform-box:view-box;transform-origin:60px 40px}
.if-mote{opacity:.5}
.if-star{opacity:.9}

@keyframes if-draw{
  0%{stroke-dashoffset:1;opacity:.8}
  55%{stroke-dashoffset:0}
  88%{stroke-dashoffset:0;opacity:.8}
  100%{stroke-dashoffset:0;opacity:0}}
@keyframes if-turn{
  0%{transform:scaleX(1);opacity:0}
  8%{opacity:1}
  50%{transform:scaleX(-1);opacity:1}
  58%{transform:scaleX(-1);opacity:0}
  100%{transform:scaleX(1);opacity:0}}
@keyframes if-rise{
  0%{transform:translateY(4px);opacity:0}
  40%{opacity:.85}
  100%{transform:translateY(-8px);opacity:0}}
@keyframes if-twinkle{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes if-pull{0%,100%{transform:translateY(9px)}40%,75%{transform:translateY(0)}}

@media (prefers-reduced-motion:no-preference){
  .if-ink path{animation:if-draw 3.2s ease-in-out 1.6s infinite backwards}
  .if-ink path:nth-child(2){animation-delay:1.75s}
  .if-ink path:nth-child(3){animation-delay:1.9s}
  .if-ink path:nth-child(4){animation-delay:2.05s}
  .if-leaf{animation:if-turn 3.2s ease-in-out infinite}
  .if-mote{animation:if-rise 3.2s ease-out infinite}
  .if-mote:nth-of-type(2){animation-delay:.9s}
  .if-mote:nth-of-type(3){animation-delay:1.8s}
  .if-trace{animation:if-draw 6s ease-in-out infinite backwards}
  .if-star{animation:if-twinkle 3.6s ease-in-out infinite}
  .if-star:nth-child(2){animation-delay:.5s}
  .if-star:nth-child(3){animation-delay:1.1s}
  .if-star:nth-child(4){animation-delay:1.7s}
  .if-star:nth-child(5){animation-delay:2.3s}
  .if-star:nth-child(6){animation-delay:.8s}
  .if-star:nth-child(7){animation-delay:1.4s}
  .if-star:nth-child(8){animation-delay:2s}
  .if-sheet{animation:if-pull 4s ease-in-out infinite}
  .if-red{animation:if-draw 4s ease-in-out infinite backwards}
}
`;

function LoadingCard({
  message = "Loading..."
}) {
  const role = getRole();
  const Art = ART[role];

  return (
    <div className="page-container">
      <style>{STYLES}</style>

      <div
        className={`if-loader if-${role.toLowerCase()}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Art />
        <p className="if-eyebrow" aria-hidden="true">{EYEBROW[role]}</p>
        <p className="if-msg">{message}</p>
      </div>
    </div>
  );
}


export default LoadingCard;