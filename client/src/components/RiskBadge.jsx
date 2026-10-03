const OMENS = {
  LOW: {
    label: "Quiet Omen",
    seal: "#8a8466",
    ink: "#4a4636",
    paper: "#f1ecd6",
    border: "#c4bb96",
    mark: "·",
    weight: 400,
  },
  MEDIUM: {
    label: "Watchful Omen",
    seal: "#a8832f",
    ink: "#5a4210",
    paper: "#f6e8bf",
    border: "#c9a24f",
    mark: "◈",
    weight: 400,
  },
  HIGH: {
    label: "Rising Omen",
    seal: "#9a4a22",
    ink: "#5e2a10",
    paper: "#f3dcc0",
    border: "#c08558",
    mark: "▲",
    weight: 600,
  },
  CRITICAL: {
    label: "Grave Omen",
    seal: "#5b1d1d",
    ink: "#3d1212",
    paper: "#ecd2c6",
    border: "#a35f55",
    mark: "✠",
    weight: 700,
  },
};


function RiskBadge({
  risk,
}) {

  const normalizedRisk =
    risk || "LOW";


  const badgeClass =
    `risk-badge risk-${normalizedRisk.toLowerCase()}`;


  const omen =
    OMENS[normalizedRisk] ||
    {
      label: normalizedRisk,
      seal: "#8a7554",
      ink: "#4a3b2c",
      paper: "#f3e9d2",
      border: "#c2ac82",
      mark: "·",
      weight: 400,
    };


  const isCritical =
    normalizedRisk === "CRITICAL";


  return (
    <>
      <style>{`
        @keyframes rk-ink{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
        @keyframes rk-seal{from{opacity:0;transform:scale(1.5) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(0)}}
        .rk-omen{animation:rk-ink .6s ease-out both;transition:transform .25s ease}
        .rk-omen:hover{transform:translateY(1px) rotate(.5deg)}
        .rk-seal{animation:rk-seal .45s .25s ease-out both}
        @media (prefers-reduced-motion:reduce){.rk-omen,.rk-seal{animation:none;transition:none}}
      `}</style>

      <span
        className={`${badgeClass} rk-omen`}
        title={normalizedRisk}
        aria-label={`Risk: ${normalizedRisk}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          maxWidth: "100%",
          padding: "2px 3px 2px 9px",
          background: omen.paper,
          color: omen.ink,
          border: `1px solid ${omen.border}`,
          borderRight: `3px solid ${omen.seal}`,
          borderRadius: "8px 2px 2px 8px",
          boxShadow: isCritical
            ? `1px 2px 0 rgba(60,20,20,.28), 0 0 6px ${omen.seal}33`
            : "1px 2px 0 rgba(60,40,20,.18)",
          fontFamily:
            'Georgia, "Times New Roman", serif',
          fontSize: "12px",
          fontStyle: "italic",
          fontWeight: omen.weight,
          lineHeight: 1.4,
          letterSpacing: ".01em",
          verticalAlign: "middle",
        }}
      >
        <span
          style={{
            minWidth: 0,
            overflowWrap: "anywhere",
            paddingRight: "2px",
          }}
        >
          {omen.label}
        </span>

        <span
          className="rk-seal"
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: omen.seal,
            color: "#f6ecd4",
            fontSize: "9px",
            fontStyle: "normal",
            boxShadow:
              "inset 0 0 0 1px rgba(246,236,212,.35)",
          }}
        >
          {omen.mark}
        </span>
      </span>
    </>
  );
}


export default RiskBadge;