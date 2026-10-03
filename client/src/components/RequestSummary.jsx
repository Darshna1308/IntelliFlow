const css = `
@keyframes rs-slip{from{opacity:0;transform:translateY(8px) rotate(.5deg)}to{opacity:1;transform:none}}
@keyframes rs-stamp{from{opacity:0;transform:scale(1.4) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0)}}
.rs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:14px;width:100%;max-width:100%}
.rs-card{position:relative;min-width:0;padding:14px 14px 12px 18px;background:#f6ecd4;color:#2b211a;
  border:1px solid #c2ac82;border-left:6px solid #7b2d2d;border-radius:2px 6px 6px 2px;
  box-shadow:0 1px 0 #fbf5e4 inset,2px 3px 0 rgba(90,60,30,.18),0 6px 12px rgba(40,26,16,.18);
  font-family:Georgia,"Times New Roman",serif;animation:rs-slip .55s ease-out both;
  transition:transform .25s ease,box-shadow .25s ease}
.rs-card:hover{transform:translateY(-2px) rotate(-.3deg);box-shadow:0 1px 0 #fbf5e4 inset,3px 5px 0 rgba(90,60,30,.2),0 10px 16px rgba(40,26,16,.22)}
.rs-card::after{content:"";position:absolute;top:0;right:12px;width:10px;height:18px;background:#a8832f;
  clip-path:polygon(0 0,100% 0,100% 100%,50% 75%,0 100%);opacity:.85;transition:height .3s ease}
.rs-card:hover::after{height:24px}
.rs-label{display:block;padding-right:18px;font:11px "Courier New",monospace;letter-spacing:.14em;text-transform:uppercase;color:#7b2d2d;overflow-wrap:anywhere}
.rs-value{display:block;margin-top:6px;font-size:clamp(24px,4vw,32px);line-height:1.1;color:#2b211a;overflow-wrap:anywhere;animation:rs-stamp .5s .2s ease-out both}
.rs-value small{font-size:13px;font-style:italic;color:#6b5a46;margin-left:2px}
.rs-rule{margin-top:8px;border-top:1px dotted #8a7554}
@media (prefers-reduced-motion:reduce){.rs-card,.rs-value{animation:none}.rs-card,.rs-card::after{transition:none}}
`;


function Entry({ label, children, index }) {
  return (
    <div
      className="rs-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <span className="rs-label">{label}</span>
      <strong className="rs-value">{children}</strong>
      <div className="rs-rule" />
    </div>
  );
}


function RequestSummary({
  totalRequests,
  pendingRequests,
  completedRequests,
  averageRisk,
  reviewQueue = null,
}) {
  let i = 0;

  return (
    <div className="intelligence-grid rs-grid">
      <style>{css}</style>

      <Entry
        index={i++}
        label={
          reviewQueue !== null
            ? "Assigned Requests"
            : "Total Requests"
        }
      >
        {totalRequests}
      </Entry>

      {reviewQueue !== null && (
        <Entry index={i++} label="Review Queue">
          {reviewQueue}
        </Entry>
      )}

      <Entry index={i++} label="Pending">
        {pendingRequests}
      </Entry>

      <Entry index={i++} label="Completed">
        {completedRequests}
      </Entry>

      <Entry index={i++} label="Average Risk">
        {averageRisk}
        <small>/100</small>
      </Entry>
    </div>
  );
}


export default RequestSummary;