const MARKERS = {
  DRAFT: {
    label: "Unwritten",
    seal: "#8a8466",
    ink: "#4a4636",
    paper: "#f1ecd6",
    border: "#c4bb96",
    mark: "✎",
  },
  SUBMITTED: {
    label: "Sent to the Archives",
    seal: "#a8832f",
    ink: "#5a4210",
    paper: "#f6e8bf",
    border: "#c9a24f",
    mark: "➤",
  },
  UNDER_REVIEW: {
    label: "Under Examination",
    seal: "#2f3a6b",
    ink: "#1f2850",
    paper: "#e3e4ee",
    border: "#8d94b8",
    mark: "◉",
  },
  CHANGES_REQUESTED: {
    label: "Revision Required",
    seal: "#b0762a",
    ink: "#613c0c",
    paper: "#f5e0b8",
    border: "#cf9a4e",
    mark: "✐",
  },
  RESUBMITTED: {
    label: "Returned for Examination",
    seal: "#5f5a8a",
    ink: "#3b3560",
    paper: "#eee6cc",
    border: "#b5a56f",
    mark: "↻",
  },
  APPROVED: {
    label: "Chapter Approved",
    seal: "#4f6b45",
    ink: "#2f4a2b",
    paper: "#eef0d9",
    border: "#b4a24f",
    mark: "✓",
  },
  REJECTED: {
    label: "Chapter Closed",
    seal: "#7b2d2d",
    ink: "#5b1d1d",
    paper: "#f1dcd0",
    border: "#b8836f",
    mark: "✕",
  },
};


function StatusBadge({
  status,
}) {

  if (!status) {
    return null;
  }


  const formattedStatus =
    status
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
    `status-badge status-${status
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      )}`;


  const marker =
    MARKERS[status] ||
    {
      label: formattedStatus,
      seal: "#8a7554",
      ink: "#4a3b2c",
      paper: "#f3e9d2",
      border: "#c2ac82",
      mark: "·",
    };


  return (
    <>
      <style>{`
        @keyframes sb-settle{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        @keyframes sb-seal{from{opacity:0;transform:scale(1.5) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(0)}}
        .sb-marker{animation:sb-settle .5s ease-out both}
        .sb-seal{animation:sb-seal .45s .2s ease-out both}
        @media (prefers-reduced-motion:reduce){.sb-marker,.sb-seal{animation:none}}
      `}</style>

      <span
        className={`${badgeClass} sb-marker`}
        title={formattedStatus}
        aria-label={`Status: ${formattedStatus}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          maxWidth: "100%",
          padding: "2px 9px 2px 3px",
          background: marker.paper,
          color: marker.ink,
          border: `1px solid ${marker.border}`,
          borderTop: `3px solid ${marker.seal}`,
          borderRadius: "0 0 8px 8px",
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
          className="sb-seal"
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
          {marker.label}
        </span>
      </span>
    </>
  );
}


export default StatusBadge;