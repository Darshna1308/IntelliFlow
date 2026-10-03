const css = `
@keyframes ph-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes ph-ink{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes ph-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.ph-head{position:relative;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;
  gap:14px 20px;width:100%;max-width:100%;margin:0 0 24px;padding:4px 0 18px;
  font-family:Georgia,"Times New Roman",serif;color:#2b211a}
.ph-text{min-width:0;flex:1 1 280px}
.ph-eyebrow{display:flex;align-items:center;gap:8px;margin:0 0 8px;
  font:11px "Courier New",monospace;letter-spacing:.24em;text-transform:uppercase;color:#7b2d2d;
  overflow-wrap:anywhere;animation:ph-fade .5s ease-out both}
.ph-eyebrow::before{content:"";width:22px;height:1px;background:#a8832f;flex-shrink:0}
.ph-title{margin:0;font-size:clamp(28px,5.5vw,46px);line-height:1.1;font-weight:700;letter-spacing:.01em;
  color:#2b211a;overflow-wrap:anywhere;animation:ph-ink 1.1s .1s ease-out both}
.ph-subtitle{margin:10px 0 0;max-width:62ch;font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color:#5b4a3a;overflow-wrap:anywhere;animation:ph-fade .6s .35s ease-out both}
.ph-action{flex:0 1 auto;max-width:100%;animation:ph-fade .6s .45s ease-out both}
.ph-rule{position:absolute;left:0;right:0;bottom:0;height:7px;pointer-events:none;
  border-top:1px solid #a8832f;border-bottom:1px solid rgba(168,131,47,.45);
  transform-origin:left;animation:ph-rule .9s .3s ease-out both}
.ph-rule::after{content:"❖";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  padding:0 10px;background:#f3e9d2;color:#a8832f;font-size:11px;line-height:1}
@media (prefers-reduced-motion:reduce){.ph-eyebrow,.ph-title,.ph-subtitle,.ph-action,.ph-rule{animation:none}}
`;


function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}) {

  return (
    <div className="page-header ph-head">
      <style>{css}</style>

      <div className="ph-text">

        {eyebrow && (
          <p className="page-eyebrow ph-eyebrow">
            {eyebrow}
          </p>
        )}


        <h1 className="ph-title">
          {title}
        </h1>


        {subtitle && (
          <p className="page-subtitle ph-subtitle">
            {subtitle}
          </p>
        )}

      </div>


      {action && (
        <div className="page-header-action ph-action">
          {action}
        </div>
      )}

      <span
        className="ph-rule"
        aria-hidden="true"
      />

    </div>
  );
}


export default PageHeader;