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


function AdminDashboard() {

  const [
    analytics,
    setAnalytics,
  ] = useState(null);


  const [
    requests,
    setRequests,
  ] = useState([]);


  const [
    reviewers,
    setReviewers,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    assigningRequest,
    setAssigningRequest,
  ] = useState("");


  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const [
          analyticsData,
          requestData,
          reviewerData,
        ] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAllRequests(),
          api.getAvailableReviewers(),
        ]);


        setAnalytics(
          analyticsData.analytics ||
          analyticsData
        );


        setRequests(
          requestData.requests ||
          []
        );


        setReviewers(
          reviewerData.reviewers ||
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

    loadDashboard();

  }, []);


  const getIntelligence =
    (request) =>
      request.intelligence ||
      {};


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


  const handleAssignReviewer =
    async (
      requestId,
      reviewerId
    ) => {

      if (!reviewerId) {
        return;
      }


      try {

        setAssigningRequest(
          requestId
        );

        setMessage("");


        await api.assignReviewer(
          requestId,
          reviewerId
        );


        await loadDashboard();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setAssigningRequest(
          ""
        );

      }
    };


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


  const highRiskCount =
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
        ).length,
      [requests]
    );


  const overdueCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            getIntelligence(
              request
            ).deadlineStatus ===
            "OVERDUE"
        ).length,
      [requests]
    );


  const unassignedCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            !request.assignedReviewer
        ).length,
      [requests]
    );


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading control center..."
        }
      />
    );
  }


  if (!analytics) {

    return (
      <div className="page-container">

        <MessageCard
          message={
            message ||
            "Admin analytics could not be loaded."
          }
        />

      </div>
    );
  }


  const overview =
    analytics.overview ||
    {};


  const priorityAnalysis =
    analytics.priorityAnalysis ||
    {};


  const workflowPriority =
    analytics
      .workflowDefaultPriorityDistribution ||
    [];


  const riskDistribution =
    analytics.riskDistribution ||
    [];


  const deadlineDistribution =
    analytics.deadlineDistribution ||
    [];


  const reviewerWorkload =
    analytics.reviewerWorkload ||
    [];


  const getDistributionValue =
    (
      distribution,
      key
    ) => {

      if (
        Array.isArray(
          distribution
        )
      ) {

        const item =
          distribution.find(
            (entry) =>
              entry._id ===
              key
          );


        return (
          item?.count ||
          0
        );
      }


      return (
        distribution[key] ||
        0
      );
    };


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="CONTROL CENTER"
        title="Admin Dashboard"
        subtitle="Monitor workflows, reviewer capacity, risk signals, and system-wide activity."
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
              overview.totalRequests ??
              requests.length
            }
          </strong>

          <span className="dashboard-stat-meta">
            All workflows
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            High / Critical Risk
          </span>

          <strong className="dashboard-stat-value">
            {
              overview.highRiskRequests ??
              highRiskCount
            }
          </strong>

          <span className="dashboard-stat-meta">
            Risk requires attention
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Overdue
          </span>

          <strong className="dashboard-stat-value">
            {
              overview.overdueRequests ??
              overdueCount
            }
          </strong>

          <span className="dashboard-stat-meta">
            Past their deadline
          </span>

        </div>


        <div className="dashboard-stat-card">

          <span className="dashboard-stat-label">
            Unassigned
          </span>

          <strong className="dashboard-stat-value">
            {
              overview.unassignedRequests ??
              unassignedCount
            }
          </strong>

          <span className="dashboard-stat-meta">
            Need reviewer assignment
          </span>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              PRIORITY INTELLIGENCE
            </p>

            <h2>
              Workflow vs Actual Priority
            </h2>

          </div>

        </div>


        <div className="dashboard-overview-grid">

          <div className="dashboard-overview-card">

            <span>
              Escalated
            </span>

            <strong>
              {
                priorityAnalysis
                  .escalated ??
                0
              }
            </strong>

            <small>
              Actual priority above default
            </small>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Matched
            </span>

            <strong>
              {
                priorityAnalysis
                  .matched ??
                0
              }
            </strong>

            <small>
              Priority matches workflow default
            </small>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Downgraded
            </span>

            <strong>
              {
                priorityAnalysis
                  .downgraded ??
                0
              }
            </strong>

            <small>
              Actual priority below default
            </small>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Average Risk
            </span>

            <strong>
              {
                Math.round(
                  analytics.averageRisk ||
                  0
                )
              }
            </strong>

            <small>
              Risk score out of 100
            </small>

          </div>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              SYSTEM DISTRIBUTION
            </p>

            <h2>
              Workflow Signals
            </h2>

          </div>

        </div>


        <div className="dashboard-overview-grid">

          <div className="dashboard-overview-card">

            <span>
              Default Low Priority
            </span>

            <strong>
              {
                getDistributionValue(
                  workflowPriority,
                  "LOW"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Default Medium
            </span>

            <strong>
              {
                getDistributionValue(
                  workflowPriority,
                  "MEDIUM"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Default High
            </span>

            <strong>
              {
                getDistributionValue(
                  workflowPriority,
                  "HIGH"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Default Critical
            </span>

            <strong>
              {
                getDistributionValue(
                  workflowPriority,
                  "CRITICAL"
                )
              }
            </strong>

          </div>

        </div>


        <div
          className="dashboard-overview-grid"
          style={{
            marginTop: "16px",
          }}
        >

          <div className="dashboard-overview-card">

            <span>
              Low Risk
            </span>

            <strong>
              {
                getDistributionValue(
                  riskDistribution,
                  "LOW"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Medium Risk
            </span>

            <strong>
              {
                getDistributionValue(
                  riskDistribution,
                  "MEDIUM"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              High Risk
            </span>

            <strong>
              {
                getDistributionValue(
                  riskDistribution,
                  "HIGH"
                )
              }
            </strong>

          </div>


          <div className="dashboard-overview-card">

            <span>
              Critical Risk
            </span>

            <strong>
              {
                getDistributionValue(
                  riskDistribution,
                  "CRITICAL"
                )
              }
            </strong>

          </div>

        </div>

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              ATTENTION QUEUE
            </p>

            <h2>
              Requests Requiring Attention
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
              No requests currently require
              immediate administrative attention.
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
              REVIEWER CAPACITY
            </p>

            <h2>
              Reviewer Workload
            </h2>

          </div>

          <span className="dashboard-count">
            {
              reviewers.length
            }{" "}
            reviewer
            {
              reviewers.length ===
              1
                ? ""
                : "s"
            }
          </span>

        </div>


        {reviewerWorkload.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No reviewer workload data is
              currently available.
            </p>

          </div>

        ) : (

          <div className="dashboard-overview-grid">

            {reviewerWorkload.map(
              (reviewer) => (

                <div
                  className="dashboard-overview-card"
                  key={
                    reviewer._id ||
                    reviewer.reviewerId
                  }
                >

                  <span>
                    {
                      reviewer.name ||
                      reviewer.reviewerName ||
                      "Reviewer"
                    }
                  </span>

                  <strong>
                    {
                      reviewer.total ??
                      reviewer.count ??
                      0
                    }
                  </strong>

                  <small>
                    Assigned workflows
                  </small>

                </div>

              )
            )}

          </div>

        )}

      </section>


      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <p className="section-eyebrow">
              REQUEST MANAGEMENT
            </p>

            <h2>
              All Workflows
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
              No workflow requests exist yet.
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
                  <div
                    className="request-card"
                    key={
                      request._id
                    }
                  >

                    <div className="request-card-top">

                      <button
                        type="button"
                        className="request-card-main"
                        onClick={() =>
                          openRequest(
                            request._id
                          )
                        }
                      >

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

                      </button>


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


                    <div
                      className="form-group"
                      style={{
                        marginTop: "16px",
                      }}
                    >

                      <label
                        htmlFor={
                          `reviewer-${request._id}`
                        }
                      >
                        Assign Reviewer
                      </label>

                      <select
                        id={
                          `reviewer-${request._id}`
                        }
                        value={
                          request
                            .assignedReviewer
                            ?._id ||
                          ""
                        }
                        disabled={
                          assigningRequest ===
                          request._id
                        }
                        onChange={(
                          event
                        ) =>
                          handleAssignReviewer(
                            request._id,
                            event.target.value
                          )
                        }
                      >

                        <option value="">
                          Select reviewer
                        </option>

                        {reviewers.map(
                          (reviewer) => (

                            <option
                              key={
                                reviewer._id
                              }
                              value={
                                reviewer._id
                              }
                            >
                              {
                                reviewer.name
                              }{" "}
                              —{" "}
                              {
                                reviewer.email
                              }
                            </option>

                          )
                        )}

                      </select>

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


export default AdminDashboard;