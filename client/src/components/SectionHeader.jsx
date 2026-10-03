const css = `
@keyframes sh-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes sh-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.sh-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 16px;
  width:100%;max-width:100%;margin:0 0 16px;padding-bottom:10px;position:relative;
  font-family:Georgia,"Times New Roman",serif;color:#2b211a}
.sh-text{min-width:0;flex:1 1 220px;animation:sh-fade .55s ease-out both}
.sh-eyebrow{display:flex;align-items:center;gap:8px;margin:0 0 4px;
  font:11px "Courier New",monospace;letter-spacing:.2em;text-transform:uppercase;color:#7b2d2d;overflow-wrap:anywhere}
.sh-eyebrow::before{content:"§";color:#a8832f;font-size:13px;letter-spacing:0}
.sh-title{margin:0;font-size:clamp(20px,3.6vw,28px);line-height:1.2;font-weight:700;letter-spacing:.01em;
  color:#2b211a;overflow-wrap:anywhere}
.sh-action{flex:0 1 auto;max-width:100%;animation:sh-fade .55s .15s ease-out both}
.sh-rule{position:absolute;left:0;right:0;bottom:0;height:7px;pointer-events:none;
  border-top:1px solid #a8832f;border-bottom:1px solid rgba(168,131,47,.45);
  transform-origin:left;animation:sh-rule .8s .1s ease-out both}
.sh-rule::after{content:"❖";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  padding:0 8px;background:#f3e9d2;color:#a8832f;font-size:10px;line-height:1}
@media (prefers-reduced-motion:reduce){.sh-text,.sh-action,.sh-rule{animation:none}}
`;


function SectionHeader({
  eyebrow,
  title,
  action,
}) {
  return (
    <div className="section-header sh-head">
      <style>{css}</style>

      <div className="sh-text">

        {eyebrow && (
          <p className="section-eyebrow sh-eyebrow">
            {eyebrow}
          </p>
        )}

        <h2 className="sh-title">
          {title}
        </h2>

      </div>


      {action && (
        <div className="sh-action">
          {action}
        </div>
      )}

      <span
        className="sh-rule"
        aria-hidden="true"
      />

    </div>
  );
}


export default SectionHeader;