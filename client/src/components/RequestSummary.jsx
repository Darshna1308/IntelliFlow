function RequestSummary({
  totalRequests,
  pendingRequests,
  completedRequests,
  averageRisk,
  reviewQueue = null,
}) {
  return (
    <div className="intelligence-grid">

      <div className="intelligence-card">

        <span className="intelligence-label">
          {reviewQueue !== null
            ? "Assigned Requests"
            : "Total Requests"}
        </span>

        <strong className="intelligence-value">
          {totalRequests}
        </strong>

      </div>


      {reviewQueue !== null && (
        <div className="intelligence-card">

          <span className="intelligence-label">
            Review Queue
          </span>

          <strong className="intelligence-value">
            {reviewQueue}
          </strong>

        </div>
      )}


      <div className="intelligence-card">

        <span className="intelligence-label">
          Pending
        </span>

        <strong className="intelligence-value">
          {pendingRequests}
        </strong>

      </div>


      <div className="intelligence-card">

        <span className="intelligence-label">
          Completed
        </span>

        <strong className="intelligence-value">
          {completedRequests}
        </strong>

      </div>


      <div className="intelligence-card">

        <span className="intelligence-label">
          Average Risk
        </span>

        <strong className="intelligence-value">
          {averageRisk}
          /100
        </strong>

      </div>

    </div>
  );
}


export default RequestSummary;