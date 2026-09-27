function RiskBadge({
  risk,
}) {

  const normalizedRisk =
    risk || "LOW";


  const badgeClass =
    `risk-badge risk-${normalizedRisk.toLowerCase()}`;


  return (
    <span
      className={badgeClass}
    >
      {normalizedRisk}
    </span>
  );
}


export default RiskBadge;