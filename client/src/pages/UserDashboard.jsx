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


function UserDashboard() {

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
          await api.getMyRequests();


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
              "DRAFT",
              "SUBMITTED",
              "UNDER_REVIEW",
              "CHANGES_REQUESTED",
              "RESUBMITTED",
            ].includes(
              request.status
            )
        ),
      [requests]
    );


  const approvedRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "APPROVED"
        ),
      [requests]
    );


  const rejectedRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "REJECTED"
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


  const openRequest =
    (requestId) => {

      window.location.href =
        `/request/${requestId}`;

    };


  const createRequest =
    () => {

      window.location.href =
        "/create-request";

    };


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading your dashboard..."
        }
      />
    );

  }


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="MY WORKSPACE"
        title="User Dashboard"
        subtitle="Create, track, and manage your workflow requests from one place."
        action={
          <button
            type="button"
            onClick={
              createRequest
            }
          >
            New Request
          </button>
        }
      />


      <MessageCard
        message={message}
      />


      <section className="dashboard-stats-grid">

        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Total Requests
          </span>

          <strong className="dashboard-stat-value">
            {
              requests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            All your workflows
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Pending
          </span>

          <strong className="dashboard-stat-value">
            {
              pendingRequests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Active workflows
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Approved
          </span>

          <strong className="dashboard-stat-value">
            {
              approvedRequests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Completed successfully
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Rejected
          </span>

          <strong className="dashboard-stat-value">
            {
              rejectedRequests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            Closed workflows
          </span>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              INTELLIGENCE
            </p>

            <h2>
              Request Health
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

            <small>
              Requests with elevated risk
            </small>

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

            <small>
              Risk or deadline signal
            </small>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Average Risk
            </span>

            <strong>
              {
                averageRisk
              }
            </strong>

            <small>
              Score out of 100
            </small>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Active Workflows
            </span>

            <strong>
              {
                pendingRequests.length
              }
            </strong>

            <small>
              Currently in progress
            </small>

          </div>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              ATTENTION
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
              None of your current requests
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
              REQUEST HISTORY
            </p>

            <h2>
              My Requests
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
              You have not created any workflow
              requests yet.
            </p>

            <button
              type="button"
              onClick={
                createRequest
              }
            >
              Create Your First Request
            </button>

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
                        Created{" "}
                        {
                          formatDate(
                            request.createdAt
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


export default UserDashboard;