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


  return (
    <span
      className={badgeClass}
    >
      {formattedStatus}
    </span>
  );
}


export default DeadlineBadge;