const css = `
@keyframes mc-settle{from{opacity:0;transform:translateY(-4px) rotate(0)}to{opacity:1;transform:translateY(0) rotate(-.6deg)}}
@keyframes mc-ink{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.mc-note{position:relative;display:flex;align-items:flex-start;gap:10px;box-sizing:border-box;
  width:100%;max-width:100%;margin:0 0 16px;padding:10px 14px 10px 12px;
  background:#f6ecd4;color:#3a2a1e;border:1px solid #c2ac82;border-left:4px solid #7b2d2d;
  border-radius:2px 6px 6px 2px;box-shadow:1px 2px 0 rgba(90,60,30,.2),0 5px 10px rgba(40,26,16,.15);
  font-family:Georgia,"Times New Roman",serif;transform:rotate(-.6deg);animation:mc-settle .5s ease-out both}
.mc-note::after{content:"";position:absolute;top:0;right:12px;width:9px;height:16px;background:#a8832f;opacity:.85;
  clip-path:polygon(0 0,100% 0,100% 100%,50% 75%,0 100%)}
.mc-seal{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-top:1px;
  border-radius:50%;background:#7b2d2d;color:#f6ecd4;font-size:10px;line-height:1;
  box-shadow:inset 0 0 0 1px rgba(246,236,212,.35)}
.mc-text{min-width:0;flex:1;padding-right:14px;font-size:14px;line-height:1.55;font-style:italic;
  overflow-wrap:anywhere;animation:mc-ink .8s .15s ease-out both}
@media (prefers-reduced-motion:reduce){.mc-note,.mc-text{animation:none}}
`;


function MessageCard({
  message,
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="message-card mc-note"
      role="status"
    >
      <style>{css}</style>

      <span
        className="mc-seal"
        aria-hidden="true"
      >
        ✎
      </span>

      <span className="mc-text">
        {message}
      </span>
    </div>
  );
}


export default MessageCard;