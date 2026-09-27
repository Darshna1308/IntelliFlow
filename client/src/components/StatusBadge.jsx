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


  return (
    <span
      className={
        badgeClass
      }
    >
      {formattedStatus}
    </span>
  );
}


export default StatusBadge;