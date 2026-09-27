function SectionHeader({
  eyebrow,
  title,
  action,
}) {
  return (
    <div className="section-header">

      <div>

        {eyebrow && (
          <p className="section-eyebrow">
            {eyebrow}
          </p>
        )}

        <h2>
          {title}
        </h2>

      </div>


      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}


export default SectionHeader;