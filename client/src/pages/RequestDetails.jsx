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
import StatusBadge from "../components/StatusBadge";


function RequestDetails() {

  const requestId =
    window.location.pathname.split(
      "/request/"
    )[1];


  const [request, setRequest] =
    useState(null);

  const [auditLogs, setAuditLogs] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [comments, setComments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [comment, setComment] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");


  const loadRequest =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const [
          requestData,
          auditData,
          documentData,
          commentData,
        ] = await Promise.all([
          api.getRequestById(
            requestId
          ),
          api.getAuditLogs(
            requestId
          ),
          api.getDocuments(
            requestId
          ),
          api.getComments(
            requestId
          ),
        ]);


        setRequest(
          requestData.request
        );


        setAuditLogs(
          auditData.auditLogs ||
          []
        );


        setDocuments(
          documentData.documents ||
          []
        );


        setComments(
          commentData.comments ||
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

    if (requestId) {
      loadRequest();
    }

  }, [requestId]);


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


  const formatDateTime = (
    value
  ) => {

    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  const getAllowedStatuses = (
    status
  ) => {

    const transitions = {
      DRAFT: [
        "SUBMITTED",
      ],

      SUBMITTED: [
        "UNDER_REVIEW",
      ],

      UNDER_REVIEW: [
        "APPROVED",
        "REJECTED",
        "CHANGES_REQUESTED",
      ],

      CHANGES_REQUESTED: [
        "RESUBMITTED",
      ],

      RESUBMITTED: [
        "UNDER_REVIEW",
      ],

      APPROVED: [],

      REJECTED: [],
    };


    return (
      transitions[status] ||
      []
    );
  };


  const handleStatusUpdate =
    async () => {

      if (!selectedStatus) {

        setMessage(
          "Please select a workflow action."
        );

        return;
      }


      const reviewAction =
        [
          "APPROVED",
          "REJECTED",
          "CHANGES_REQUESTED",
        ].includes(
          selectedStatus
        );


      if (
        reviewAction &&
        !comment.trim()
      ) {

        setMessage(
          "A comment is required for this workflow action."
        );

        return;
      }


      try {

        setActionLoading(
          true
        );

        setMessage("");


        await api.updateRequestStatus(
          requestId,
          selectedStatus,
          comment.trim()
        );


        setComment("");

        setSelectedStatus("");


        await loadRequest();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setActionLoading(
          false
        );
      }
    };


  const handleCommentSubmit =
    async () => {

      if (!comment.trim()) {

        setMessage(
          "Please enter a comment."
        );

        return;
      }


      try {

        setActionLoading(
          true
        );

        setMessage("");


        await api.createComment(
          requestId,
          comment.trim(),
          "GENERAL"
        );


        setComment("");

        await loadRequest();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setActionLoading(
          false
        );
      }
    };


  const handleDocumentUpload =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      try {

        setActionLoading(
          true
        );

        setMessage("");


        await api.uploadDocument(
          requestId,
          file
        );


        event.target.value =
          "";


        await loadRequest();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setActionLoading(
          false
        );
      }
    };


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading request details..."
        }
      />
    );
  }


  if (!request) {

    return (
      <div className="page-container">

        <MessageCard
          message={
            message ||
            "Request could not be found."
          }
        />

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
        >
          Back to Dashboard
        </button>

      </div>
    );
  }


  const intelligence =
    request.intelligence ||
    {};


  const allowedStatuses =
    getAllowedStatuses(
      request.status
    );


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="WORKFLOW REQUEST"
        title={
          request.title ||
          request.requestId
        }
        subtitle={
          `${request.requestId} · ${request.type}`
        }
        action={
          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            Back to Dashboard
          </button>
        }
      />


      <MessageCard
        message={message}
      />


      {/* INTELLIGENCE */}

      <section className="details-section">

        <SectionHeader
          eyebrow="INTELLIGENCE"
          title="Workflow Intelligence"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              Risk Level
            </span>

            <RiskBadge
              risk={
                intelligence
                  .riskLevel
              }
            />

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Risk Score
            </span>

            <strong className="intelligence-value">
              {
                intelligence
                  .riskScore ??
                0
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Deadline
            </span>

            <DeadlineBadge
              status={
                intelligence
                  .deadlineStatus
              }
            />

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Days in Stage
            </span>

            <strong className="intelligence-value">
              {
                intelligence
                  .daysInCurrentStage ??
                0
              }
            </strong>

          </div>

        </div>


        {intelligence.reasons
          ?.length > 0 && (

          <div className="intelligence-card">

            <span className="intelligence-label">
              Risk Factors
            </span>

            <ul>
              {intelligence.reasons.map(
                (
                  reason,
                  index
                ) => (

                  <li
                    key={
                      `${reason}-${index}`
                    }
                  >
                    {reason}
                  </li>

                )
              )}
            </ul>

          </div>

        )}


        {intelligence.recommendation && (

          <div className="intelligence-card">

            <span className="intelligence-label">
              Recommendation
            </span>

            <strong>
              {
                intelligence
                  .recommendation
              }
            </strong>

          </div>

        )}

      </section>


      {/* REQUEST INFORMATION */}

      <section className="details-section">

        <SectionHeader
          eyebrow="REQUEST INFORMATION"
          title="Request Details"
        />


        <div className="request-info-grid">

          <div>
            <span>
              Request ID
            </span>

            <strong>
              {
                request.requestId
              }
            </strong>
          </div>


          <div>
            <span>
              Workflow Type
            </span>

            <strong>
              {
                request.type
              }
            </strong>
          </div>


          <div>
            <span>
              Status
            </span>

            <StatusBadge
              status={
                request.status
              }
            />
          </div>


          <div>
            <span>
              Priority
            </span>

            <strong>
              {
                request.priority ||
                "MEDIUM"
              }
            </strong>
          </div>


          <div>
            <span>
              Created
            </span>

            <strong>
              {
                formatDate(
                  request.createdAt
                )
              }
            </strong>
          </div>


          <div>
            <span>
              Due Date
            </span>

            <strong>
              {
                formatDate(
                  request.dueDate
                )
              }
            </strong>
          </div>


          <div>
            <span>
              Created By
            </span>

            <strong>
              {
                request.createdBy
                  ?.name ||
                "—"
              }
            </strong>
          </div>


          <div>
            <span>
              Assigned Reviewer
            </span>

            <strong>
              {
                request
                  .assignedReviewer
                  ?.name ||
                "Unassigned"
              }
            </strong>
          </div>

        </div>


        <div className="request-description">

          <span>
            Description
          </span>

          <p>
            {
              request.description
            }
          </p>

        </div>

      </section>


      {/* WORKFLOW ACTION */}

      {allowedStatuses.length >
        0 && (

        <section className="details-section">

          <SectionHeader
            eyebrow="WORKFLOW ACTION"
            title="Update Request Status"
          />


          <div className="request-form">

            <div className="form-group">

              <label htmlFor="workflowStatus">
                Next Status
              </label>

              <select
                id="workflowStatus"
                value={
                  selectedStatus
                }
                onChange={(
                  event
                ) =>
                  setSelectedStatus(
                    event
                      .target
                      .value
                  )
                }
              >

                <option value="">
                  Select workflow action
                </option>

                {allowedStatuses.map(
                  (status) => (

                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {
                        formatStatus(
                          status
                        )
                      }
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label htmlFor="workflowComment">
                Comment
              </label>

              <textarea
                id="workflowComment"
                value={
                  comment
                }
                onChange={(
                  event
                ) =>
                  setComment(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Add a comment or review note."
                rows="5"
              />

            </div>


            <div className="form-actions">

              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={
                  handleStatusUpdate
                }
              >
                {actionLoading
                  ? "Updating..."
                  : "Update Status"}
              </button>

            </div>

          </div>

        </section>

      )}


      {/* DOCUMENTS */}

      <section className="details-section">

        <SectionHeader
          eyebrow="DOCUMENTS"
          title="Request Documents"
          action={
            <label className="file-upload-button">

              Upload Document

              <input
                type="file"
                onChange={
                  handleDocumentUpload
                }
                disabled={
                  actionLoading
                }
                hidden
              />

            </label>
          }
        />


        {documents.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No documents have
              been uploaded yet.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {documents.map(
              (document) => (

                <div
                  className="document-item"
                  key={
                    document._id
                  }
                >

                  <div>

                    <strong>
                      {
                        document
                          .originalName
                      }
                    </strong>

                    <span>
                      {
                        document.mimeType
                      }
                    </span>

                    <span>
                      Uploaded:{" "}
                      {
                        formatDateTime(
                          document.createdAt
                        )
                      }
                    </span>

                  </div>


                  <div>

                    <span>
                      {
                        Math.round(
                          document.size /
                          1024
                        )
                      } KB
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* COMMENTS */}

      <section className="details-section">

        <SectionHeader
          eyebrow="COLLABORATION"
          title="Comments"
        />


        <div className="request-form">

          <div className="form-group">

            <label htmlFor="generalComment">
              Add Comment
            </label>

            <textarea
              id="generalComment"
              value={
                comment
              }
              onChange={(
                event
              ) =>
                setComment(
                  event
                    .target
                    .value
                )
              }
              placeholder="Write a comment for the workflow discussion."
              rows="4"
            />

          </div>


          <div className="form-actions">

            <button
              type="button"
              disabled={
                actionLoading
              }
              onClick={
                handleCommentSubmit
              }
            >
              {actionLoading
                ? "Adding..."
                : "Add Comment"}
            </button>

          </div>

        </div>


        {comments.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No comments have
              been added yet.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {comments.map(
              (item) => (

                <div
                  className="document-item"
                  key={
                    item._id
                  }
                >

                  <div>

                    <strong>
                      {
                        item.userId
                          ?.name ||
                        "User"
                      }
                    </strong>

                    <span>
                      {
                        item.type ||
                        "GENERAL"
                      }
                    </span>

                    <span>
                      {
                        formatDateTime(
                          item.createdAt
                        )
                      }
                    </span>

                  </div>


                  <div>

                    <p>
                      {
                        item.message
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* AUDIT TRAIL */}

      <section className="details-section">

        <SectionHeader
          eyebrow="AUDIT TRAIL"
          title="Workflow History"
        />


        {auditLogs.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No audit history is
              available yet.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {auditLogs.map(
              (log) => (

                <div
                  className="document-item"
                  key={
                    log._id
                  }
                >

                  <div>

                    <strong>
                      {
                        log.action
                      }
                    </strong>


                    <span>
                      {
                        log.userId
                          ?.name ||
                        "System User"
                      }
                    </span>


                    <span>
                      {
                        formatDateTime(
                          log.createdAt
                        )
                      }
                    </span>

                  </div>


                  <div>

                    {log.previousStatus && (

                      <span>
                        {
                          formatStatus(
                            log.previousStatus
                          )
                        }{" "}
                        →{" "}
                        {
                          formatStatus(
                            log.newStatus
                          )
                        }
                      </span>

                    )}


                    <p>
                      {
                        log.description
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default RequestDetails;