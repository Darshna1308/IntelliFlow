function LoadingCard({
  message = "Loading..."
}) {
  return (
    <div className="page-container">

      <div className="loading-card">

        {message}

      </div>

    </div>
  );
}


export default LoadingCard;