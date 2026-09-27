import {
  useEffect,
  useState,
} from "react";

import { api } from "../api";

import DeadlineBadge from "../components/DeadlineBadge";
import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import SectionHeader from "../components/SectionHeader";


function ReviewerDashboard() {

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  const loadRequests =
    async () => {

      try {

        setLoading(true);

        setMessage("");

        const data =
          await api.getAssignedRequests();

        setRequests(
          data.requests || []
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


  const navigate = (
    path
  ) => {

    window.location.href =
      path;
  };


  const formatStatus = (
    value
  ) => {

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


  const formatDate = (
    value
  ) => {

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


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading review queue..."
        }
      />
    );
  }


  const pendingRequests =
    requests.filter(
      (request) =>
        [
          "SUBMITTED",
          "UNDER_REVIEW",
          "RESUBMITTED",
        ].includes(
          request.status
        )
    );


  const completedRequests =
    requests.filter(
      (request) =>
        [
          "APPROVED",
          "REJECTED",
        ].includes(
          request.status
        )
    );


  const highRiskRequests =
    requests.filter(
      (request) =>
        [
          "HIGH",
          "CRITICAL",
        ].includes(
          request.intelligence
            ?.riskLevel
        )
    );


  const dueSoonRequests =
    requests.filter(
      (request) =>
        request.intelligence
          ?.deadlineStatus ===
        "DUE_SOON"
    );


  const overdueRequests =
    requests.filter(
      (request) =>
        request.intelligence
          ?.deadlineStatus ===
        "OVERDUE"
    );


  const riskValues =
    requests
      .map(
        (request) =>
          request
            .intelligence
            ?.riskScore
      )
      .filter(
        (value) =>
          typeof value ===
          "number"
      );


  const averageRisk =
    riskValues.length > 0
      ? Math.round(
          riskValues.reduce(
            (
              total,
              value
            ) =>
              total + value,
            0
          ) /
            riskValues.length
        )
      : 0;


  const attentionRequests =
    requests.filter(
      (request) =>
        [
          "HIGH",
          "CRITICAL",
        ].includes(
          request.intelligence
            ?.riskLevel
        ) ||
        [
          "OVERDUE",
          "DUE_SOON",
        ].includes(
          request.intelligence
            ?.deadlineStatus
        )
    );


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="REVIEW WORKSPACE"
        title="Reviewer Dashboard"
        subtitle="Monitor assigned workflows, identify risk signals, and process requests through the approval workflow."
      />


      <MessageCard
        message={message}
      />


      {/* REVIEW SNAPSHOT */}

      <section className="details-section">

        <SectionHeader
          eyebrow="OVERVIEW"
          title="Review Snapshot"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              Assigned
            </span>

            <strong className="intelligence-value">
              {requests.length}
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Pending Review
            </span>

            <strong className="intelligence-value">
              {
                pendingRequests.length
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Completed
            </span>

            <strong className="intelligence-value">
              {
                completedRequests.length
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Average Risk
            </span>

            <strong className="intelligence-value">
              {averageRisk}
            </strong>

          </div>

        </div>

      </section>


      {/* RISK SIGNALS */}

      <section className="details-section">

        <SectionHeader
          eyebrow="INTELLIGENCE"
          title="Risk & Deadline Signals"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              High / Critical Risk
            </span>

            <strong className="intelligence-value">
              {
                highRiskRequests.length
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Due Soon
            </span>

            <strong className="intelligence-value">
              {
                dueSoonRequests.length
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Overdue
            </span>

            <strong className="intelligence-value">
              {
                overdueRequests.length
              }
            </strong>

          </div>

        </div>

      </section>


      {/* ATTENTION QUEUE */}

      <section className="details-section">

        <SectionHeader
          eyebrow="PRIORITY QUEUE"
          title="Requests Requiring Attention"
        />


        {attentionRequests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No assigned requests
              currently require
              immediate attention.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {attentionRequests.map(
              (request) => {

                const intelligence =
                  request
                    .intelligence ||
                  {};


                return (
                  <div
                    className="document-item"
                    key={
                      request._id
                    }
                  >

                    <div>

                      <strong>
                        {
                          request
                            .requestId
                        }{" "}
                        —{" "}
                        {
                          request.title
                        }
                      </strong>


                      <span>
                        {formatStatus(
                          request.status
                        )}
                      </span>


                      <span>
                        Due:{" "}
                        {formatDate(
                          request.dueDate
                        )}
                      </span>

                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "flex-end",
                        gap: "8px",
                      }}
                    >

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


                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/request/${request._id}`
                          )
                        }
                      >
                        Review
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>


      {/* REVIEW QUEUE */}

      <section className="details-section">

        <SectionHeader
          eyebrow="ASSIGNED WORKFLOWS"
          title="Review Queue"
        />


        {requests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No requests are
              currently assigned
              to you.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {requests.map(
              (request) => {

                const intelligence =
                  request
                    .intelligence ||
                  {};


                return (
                  <div
                    className="document-item"
                    key={
                      request._id
                    }
                  >

                    <div>

                      <strong>
                        {
                          request
                            .requestId
                        }{" "}
                        —{" "}
                        {
                          request.title
                        }
                      </strong>


                      <span>
                        {request.type} ·{" "}
                        {formatStatus(
                          request.status
                        )}
                      </span>


                      <span>
                        Created:{" "}
                        {formatDate(
                          request.createdAt
                        )}
                      </span>


                      <span>
                        Due:{" "}
                        {formatDate(
                          request.dueDate
                        )}
                      </span>


                      <span>
                        Priority:{" "}
                        {
                          request.priority ||
                          "MEDIUM"
                        }
                      </span>

                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "flex-end",
                        gap: "8px",
                      }}
                    >

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


                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/request/${request._id}`
                          )
                        }
                      >
                        Open Request
                      </button>

                    </div>

                  </div>
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