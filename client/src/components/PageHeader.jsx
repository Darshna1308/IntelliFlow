function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}) {

  return (
    <div className="page-header">

      <div>

        {eyebrow && (
          <p className="page-eyebrow">
            {eyebrow}
          </p>
        )}


        <h1>
          {title}
        </h1>


        {subtitle && (
          <p className="page-subtitle">
            {subtitle}
          </p>
        )}

      </div>


      {action && (
        <div className="page-header-action">
          {action}
        </div>
      )}

    </div>
  );
}


export default PageHeader;