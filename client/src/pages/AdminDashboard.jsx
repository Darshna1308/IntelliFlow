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


function AdminDashboard() {

  const [analytics, setAnalytics] =
    useState(null);

  const [requests, setRequests] =
    useState([]);

  const [reviewers, setReviewers] =
    useState([]);

  const [selectedReviewers, setSelectedReviewers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [savingRequest, setSavingRequest] =
    useState("");


  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setMessage("");

        const [
          analyticsData,
          requestsData,
          reviewersData,
        ] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAllRequests(),
          api.getAvailableReviewers(),
        ]);


        setAnalytics(
          analyticsData.analytics ||
          analyticsData
        );


        const loadedRequests =
          requestsData.requests ||
          [];


        setRequests(
          loadedRequests
        );


        setReviewers(
          reviewersData.reviewers ||
          []
        );


        const assignments = {};


        loadedRequests.forEach(
          (request) => {

            assignments[
              request._id
            ] =
              request
                .assignedReviewer
                ?._id ||
              "";

          }
        );


        setSelectedReviewers(
          assignments
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


  const handleReviewerChange = (
    requestId,
    reviewerId
  ) => {

    setSelectedReviewers(
      (previous) => ({
        ...previous,
        [requestId]:
          reviewerId,
      })
    );

  };


  const handleAssignReviewer =
    async (
      requestId
    ) => {

      const reviewerId =
        selectedReviewers[
          requestId
        ];


      if (!reviewerId) {

        setMessage(
          "Please select a reviewer first."
        );

        return;
      }


      try {

        setSavingRequest(
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

        setSavingRequest(
          ""
        );
      }
    };


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading admin control center..."
        }
      />
    );
  }


  const overview =
    analytics?.overview ||
    {};


  const priorityDistribution =
    analytics
      ?.priorityDistribution ||
    {};


  const riskDistribution =
    analytics
      ?.riskDistribution ||
    {};


  const deadlineDistribution =
    analytics
      ?.deadlineDistribution ||
    {};


  const reviewerWorkload =
    analytics
      ?.reviewerWorkload ||
    [];


  const attentionRequests =
    analytics
      ?.attentionRequests ||
    [];


  const averageRisk =
    analytics
      ?.averageRisk ||
    0;


  const getDistributionValue = (
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
              key ||
            entry.name ===
              key
        );


      return (
        item?.count ||
        item?.total ||
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
        eyebrow="ADMIN CONTROL CENTER"
        title="Admin Dashboard"
        subtitle="Monitor workflow activity, risk signals, reviewer workload, and request assignments."
      />


      <MessageCard
        message={message}
      />


      {/* OVERVIEW */}

      <section className="details-section">

        <SectionHeader
          eyebrow="SYSTEM OVERVIEW"
          title="Workflow Snapshot"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              Total Requests
            </span>

            <strong className="intelligence-value">
              {
                overview.totalRequests ??
                requests.length
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Pending
            </span>

            <strong className="intelligence-value">
              {
                overview.pendingRequests ??
                0
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Approved
            </span>

            <strong className="intelligence-value">
              {
                overview.approvedRequests ??
                0
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


      {/* PRIORITY */}

      <section className="details-section">

        <SectionHeader
          eyebrow="PRIORITY ANALYSIS"
          title="Request Priority Distribution"
        />


        <div className="intelligence-grid">

          {[
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
          ].map(
            (priority) => (

              <div
                className="intelligence-card"
                key={
                  priority
                }
              >

                <span className="intelligence-label">
                  {priority}
                </span>

                <strong className="intelligence-value">
                  {
                    getDistributionValue(
                      priorityDistribution,
                      priority
                    )
                  }
                </strong>

              </div>

            )
          )}

        </div>

      </section>


      {/* RISK & DEADLINE */}

      <section className="details-section">

        <SectionHeader
          eyebrow="INTELLIGENCE"
          title="Risk & Deadline Distribution"
        />


        <div className="intelligence-grid">

          {[
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
          ].map(
            (risk) => (

              <div
                className="intelligence-card"
                key={
                  `risk-${risk}`
                }
              >

                <span className="intelligence-label">
                  {risk} Risk
                </span>

                <strong className="intelligence-value">
                  {
                    getDistributionValue(
                      riskDistribution,
                      risk
                    )
                  }
                </strong>

              </div>

            )
          )}

        </div>


        <div
          className="intelligence-grid"
          style={{
            marginTop:
              "16px",
          }}
        >

          {[
            "ON_TRACK",
            "DUE_SOON",
            "OVERDUE",
          ].map(
            (deadline) => (

              <div
                className="intelligence-card"
                key={
                  `deadline-${deadline}`
                }
              >

                <span className="intelligence-label">
                  {deadline
                    .replaceAll(
                      "_",
                      " "
                    )}
                </span>

                <strong className="intelligence-value">
                  {
                    getDistributionValue(
                      deadlineDistribution,
                      deadline
                    )
                  }
                </strong>

              </div>

            )
          )}

        </div>

      </section>


      {/* ATTENTION QUEUE */}

      <section className="details-section">

        <SectionHeader
          eyebrow="ATTENTION QUEUE"
          title="Requests Requiring Attention"
        />


        {attentionRequests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No requests currently
              require administrative
              attention.
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


      {/* REVIEWER WORKLOAD */}

      <section className="details-section">

        <SectionHeader
          eyebrow="TEAM CAPACITY"
          title="Reviewer Workload"
        />


        {reviewerWorkload.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No reviewer workload
              data is available.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {reviewerWorkload.map(
              (reviewer) => (

                <div
                  className="document-item"
                  key={
                    reviewer._id ||
                    reviewer.reviewerId ||
                    reviewer.email
                  }
                >

                  <div>

                    <strong>
                      {
                        reviewer.name ||
                        reviewer.reviewerName ||
                        "Reviewer"
                      }
                    </strong>


                    <span>
                      {
                        reviewer.email ||
                        ""
                      }
                    </span>

                  </div>


                  <div>

                    <strong>
                      {
                        reviewer.totalRequests ??
                        reviewer.total ??
                        0
                      }
                    </strong>

                    <span>
                      Assigned Requests
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ALL REQUESTS */}

      <section className="details-section">

        <SectionHeader
          eyebrow="WORKFLOW MANAGEMENT"
          title="All Requests"
        />


        {requests.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No workflow requests
              have been created yet.
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


                const selectedReviewer =
                  selectedReviewers[
                    request._id
                  ] ||
                  request
                    .assignedReviewer
                    ?._id ||
                  "";


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
                        Reviewer:{" "}
                        {
                          request
                            .assignedReviewer
                            ?.name ||
                          "Unassigned"
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


                      <select
                        value={
                          selectedReviewer
                        }
                        onChange={(
                          event
                        ) =>
                          handleReviewerChange(
                            request._id,
                            event
                              .target
                              .value
                          )
                        }
                        aria-label="Select reviewer"
                      >

                        <option value="">
                          Select Reviewer
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
                              }
                            </option>

                          )
                        )}

                      </select>


                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "8px",
                        }}
                      >

                        <button
                          type="button"
                          disabled={
                            savingRequest ===
                            request._id
                          }
                          onClick={() =>
                            handleAssignReviewer(
                              request._id
                            )
                          }
                        >
                          {savingRequest ===
                          request._id
                            ? "Saving..."
                            : "Assign Reviewer"}
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/request/${request._id}`
                            )
                          }
                        >
                          Open
                        </button>

                      </div>

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