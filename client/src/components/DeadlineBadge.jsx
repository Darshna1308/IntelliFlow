const MARKERS = {
  ON_TRACK: {
    label: "The Path Remains Clear",
    seal: "#4f6b45",
    ink: "#2f4a2b",
    paper: "#eef0d9",
    border: "#a9b583",
    mark: "✓",
  },
  DUE_SOON: {
    label: "The Hour Approaches",
    seal: "#a8832f",
    ink: "#5a4210",
    paper: "#f6e8bf",
    border: "#c9a24f",
    mark: "◔",
  },
  OVERDUE: {
    label: "The Deadline Has Passed",
    seal: "#7b2d2d",
    ink: "#5b1d1d",
    paper: "#f1dcd0",
    border: "#b8836f",
    mark: "✕",
  },
};


const FALLBACK = {
  seal: "#8a7554",
  ink: "#4a3b2c",
  paper: "#f3e9d2",
  border: "#c2ac82",
  mark: "·",
};


function DeadlineBadge({
  status,
}) {

  const normalizedStatus =
    status || "NO_DEADLINE";


  const formattedStatus =
    normalizedStatus
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


  const badgeClass =
    `deadline-badge deadline-${normalizedStatus
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      )}`;


  const marker =
    MARKERS[normalizedStatus] ||
    FALLBACK;


  return (
    <>
      <style>{`
        @keyframes dl-ink{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
        .dl-marker{animation:dl-ink .6s ease-out both;transition:transform .25s ease,opacity .25s ease}
        .dl-marker:hover{transform:translateY(1px) rotate(-.6deg)}
        @media (prefers-reduced-motion:reduce){.dl-marker{animation:none;transition:none}}
      `}</style>

      <span
        className={`${badgeClass} dl-marker`}
        title={formattedStatus}
        aria-label={`Deadline: ${formattedStatus}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          maxWidth: "100%",
          padding: "2px 9px 2px 3px",
          background: marker.paper,
          color: marker.ink,
          border: `1px solid ${marker.border}`,
          borderLeft: `3px solid ${marker.seal}`,
          borderRadius: "2px 8px 8px 2px",
          boxShadow: "1px 2px 0 rgba(60,40,20,.18)",
          fontFamily:
            'Georgia, "Times New Roman", serif',
          fontSize: "12px",
          fontStyle: "italic",
          lineHeight: 1.4,
          letterSpacing: ".01em",
          verticalAlign: "middle",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: marker.seal,
            color: "#f6ecd4",
            fontSize: "9px",
            fontStyle: "normal",
            boxShadow:
              "inset 0 0 0 1px rgba(246,236,212,.35)",
          }}
        >
          {marker.mark}
        </span>

        <span
          style={{
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {marker.label ||
            formattedStatus}
        </span>
      </span>
    </>
  );
}


export default DeadlineBadge;