import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

import DeadlineBadge from "../components/DeadlineBadge";
import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import StatusBadge from "../components/StatusBadge";


function ReviewerDashboard() {

  const [
    requests,
    setRequests,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    message,
    setMessage,
  ] = useState("");


  const loadRequests =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const data =
          await api.getAssignedRequests();


        setRequests(
          data.requests ||
          []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setLoading(false);

      }
    };


  useEffect(() => {

    loadRequests();

  }, []);


  const getIntelligence =
    (request) =>
      request.intelligence ||
      {};


  const pendingRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "SUBMITTED",
              "RESUBMITTED",
              "UNDER_REVIEW",
            ].includes(
              request.status
            )
        ),
      [requests]
    );


  const completedRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "APPROVED",
              "REJECTED",
            ].includes(
              request.status
            )
        ),
      [requests]
    );


  const highRiskRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            [
              "HIGH",
              "CRITICAL",
            ].includes(
              getIntelligence(
                request
              ).riskLevel
            )
        ),
      [requests]
    );


  const dueSoonRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            getIntelligence(
              request
            ).deadlineStatus ===
            "DUE_SOON"
        ),
      [requests]
    );


  const overdueRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            getIntelligence(
              request
            ).deadlineStatus ===
            "OVERDUE"
        ),
      [requests]
    );


  const attentionRequests =
    useMemo(
      () =>
        requests.filter(
          (request) => {

            const intelligence =
              getIntelligence(
                request
              );


            return (
              [
                "HIGH",
                "CRITICAL",
              ].includes(
                intelligence.riskLevel
              ) ||
              [
                "DUE_SOON",
                "OVERDUE",
              ].includes(
                intelligence.deadlineStatus
              )
            );

          }
        ),
      [requests]
    );


  const averageRisk =
    useMemo(() => {

      if (
        requests.length ===
        0
      ) {
        return 0;
      }


      const total =
        requests.reduce(
          (
            sum,
            request
          ) =>
            sum +
            (
              getIntelligence(
                request
              ).riskScore ||
              0
            ),
          0
        );


      return Math.round(
        total /
        requests.length
      );

    }, [requests]);


  const formatDate =
    (value) => {

      if (!value) {
        return "—";
      }


      return new Date(
        value
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    };


  const formatStatus =
    (value) => {

      if (!value) {
        return "—";
      }


      return value
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

    };


  const openRequest =
    (requestId) => {

      window.location.href =
        `/request/${requestId}`;

    };


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading your review queue..."
        }
      />
    );

  }


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="REVIEW WORKSPACE"
        title="Reviewer Dashboard"
        subtitle="Review assigned workflows, track risk, and act on requests that need attention."
      />


      <MessageCard
        message={message}
      />


      <section className="dashboard-stats-grid">

        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Assigned
          </span>

          <strong className="dashboard-stat-value">
            {
              requests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Total workflows
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Pending Review
          </span>

          <strong className="dashboard-stat-value">
            {
              pendingRequests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Require reviewer action
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Completed
          </span>

          <strong className="dashboard-stat-value">
            {
              completedRequests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Approved or rejected
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Average Risk
          </span>

          <strong className="dashboard-stat-value">
            {
              averageRisk
            }
          </strong>

          <span className="dashboard-stat-meta">
            Out of 100
          </span>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              REVIEW SIGNALS
            </p>

            <h2>
              Attention Overview
            </h2>

          </div>

        </div>


        <div className="dashboard-overview-grid">

          <div className="dashboard-overview-card">

            <span>
              High / Critical Risk
            </span>

            <strong>
              {
                highRiskRequests.length
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Due Soon
            </span>

            <strong>
              {
                dueSoonRequests.length
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Overdue
            </span>

            <strong>
              {
                overdueRequests.length
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Needs Attention
            </span>

            <strong>
              {
                attentionRequests.length
              }
            </strong>

          </div>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              PRIORITY QUEUE
            </p>

            <h2>
              Requests Needing Attention
            </h2>

          </div>

          <span className="dashboard-count">
            {
              attentionRequests.length
            }{" "}
            request
            {
              attentionRequests.length ===
              1
                ? ""
                : "s"
            }
          </span>

        </div>


        {attentionRequests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No assigned requests currently
              require immediate attention.
            </p>

          </div>

        ) : (

          <div className="request-card-list">

            {attentionRequests.map(
              (request) => {

                const intelligence =
                  getIntelligence(
                    request
                  );


                return (
                  <button
                    type="button"
                    className="request-card"
                    key={
                      request._id
                    }
                    onClick={() =>
                      openRequest(
                        request._id
                      )
                    }
                  >

                    <div className="request-card-top">

                      <div>

                        <span className="request-card-id">
                          {
                            request.requestId
                          }
                        </span>

                        <h3>
                          {
                            request.title
                          }
                        </h3>

                      </div>

                      <StatusBadge
                        status={
                          request.status
                        }
                      />

                    </div>


                    <p className="request-card-description">
                      {
                        request.description
                      }
                    </p>


                    <div className="request-card-meta">

                      <span>
                        {
                          request.type
                        }
                      </span>

                      <span>
                        Due{" "}
                        {
                          formatDate(
                            request.dueDate
                          )
                        }
                      </span>

                      <RiskBadge
                        risk={
                          intelligence
                            .riskLevel
                        }
                      />

                      <DeadlineBadge
                        status={
                          intelligence
                            .deadlineStatus
                        }
                      />

                    </div>

                  </button>
                );

              }
            )}

          </div>

        )}

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              ASSIGNED WORKFLOWS
            </p>

            <h2>
              Review Queue
            </h2>

          </div>

          <span className="dashboard-count">
            {
              requests.length
            }{" "}
            total
          </span>

        </div>


        {requests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No workflows have been assigned
              to you yet.
            </p>

          </div>

        ) : (

          <div className="request-card-list">

            {requests.map(
              (request) => {

                const intelligence =
                  getIntelligence(
                    request
                  );


                return (
                  <button
                    type="button"
                    className="request-card"
                    key={
                      request._id
                    }
                    onClick={() =>
                      openRequest(
                        request._id
                      )
                    }
                  >

                    <div className="request-card-top">

                      <div>

                        <span className="request-card-id">
                          {
                            request.requestId
                          }
                        </span>

                        <h3>
                          {
                            request.title
                          }
                        </h3>

                      </div>

                      <StatusBadge
                        status={
                          request.status
                        }
                      />

                    </div>


                    <div className="request-card-meta">

                      <span>
                        {
                          request.type
                        }
                      </span>

                      <span>
                        Priority:{" "}
                        {
                          request.priority ||
                          "MEDIUM"
                        }
                      </span>

                      <span>
                        {
                          formatStatus(
                            request.status
                          )
                        }
                      </span>

                      <RiskBadge
                        risk={
                          intelligence
                            .riskLevel
                        }
                      />

                      <DeadlineBadge
                        status={
                          intelligence
                            .deadlineStatus
                        }
                      />

                    </div>

                  </button>
                );

              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default ReviewerDashboard;