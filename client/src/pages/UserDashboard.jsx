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


function UserDashboard() {

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
          await api.getMyRequests();

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
          "Loading your requests..."
        }
      />
    );
  }


  const totalRequests =
    requests.length;


  const pendingRequests =
    requests.filter(
      (request) =>
        ![
          "APPROVED",
          "REJECTED",
        ].includes(
          request.status
        )
    ).length;


  const approvedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "APPROVED"
    ).length;


  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "REJECTED"
    ).length;


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
        eyebrow="USER WORKSPACE"
        title="My Workflow Dashboard"
        subtitle="Track your requests, deadlines, workflow status, and intelligent risk signals."
        action={
          <button
            type="button"
            onClick={() =>
              navigate(
                "/create-request"
              )
            }
          >
            New Request
          </button>
        }
      />


      <MessageCard
        message={message}
      />


      {/* SNAPSHOT */}

      <section className="details-section">

        <SectionHeader
          eyebrow="OVERVIEW"
          title="Workflow Snapshot"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              Total Requests
            </span>

            <strong className="intelligence-value">
              {totalRequests}
            </strong>

          </div>


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
              Approved
            </span>

            <strong className="intelligence-value">
              {approvedRequests}
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Rejected
            </span>

            <strong className="intelligence-value">
              {rejectedRequests}
            </strong>

          </div>

        </div>

      </section>


      {/* ATTENTION */}

      <section className="details-section">

        <SectionHeader
          eyebrow="INTELLIGENCE"
          title="Requests Requiring Attention"
        />


        {attentionRequests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No requests currently
              require your attention.
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
                        Deadline:{" "}
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
                        View Request
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>


      {/* REQUEST LIST */}

      <section className="details-section">

        <SectionHeader
          eyebrow="MY REQUESTS"
          title="All Workflow Requests"
        />


        {requests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              You have not created
              any workflow requests yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/create-request"
                )
              }
            >
              Create Your First Request
            </button>

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


      {/* HIGH RISK SUMMARY */}

      {highRiskRequests.length >
        0 && (

        <section className="details-section">

          <SectionHeader
            eyebrow="RISK SIGNAL"
            title="High-Risk Requests"
          />


          <div className="request-info-grid">

            <div>

              <span>
                High / Critical
              </span>

              <strong>
                {
                  highRiskRequests.length
                }
              </strong>

            </div>

          </div>

        </section>

      )}

    </div>
  );
}


export default UserDashboard;