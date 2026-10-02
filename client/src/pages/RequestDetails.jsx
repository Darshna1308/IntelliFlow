import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

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


  const [
    request,
    setRequest,
  ] = useState(null);


  const [
    auditLogs,
    setAuditLogs,
  ] = useState([]);


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    comments,
    setComments,
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
    commentMessage,
    setCommentMessage,
  ] = useState("");


  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");


  const [
    submittingStatus,
    setSubmittingStatus,
  ] = useState(false);


  const [
    submittingComment,
    setSubmittingComment,
  ] = useState(false);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const loadRequestData =
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

    if (!requestId) {

      setMessage(
        "Invalid request."
      );

      setLoading(false);

      return;
    }


    loadRequestData();

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


  const getAllowedStatuses = () => {

    if (!request) {
      return [];
    }


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
      transitions[
        request.status
      ] || []
    );
  };


  const handleStatusUpdate =
    async (
      status
    ) => {

      if (!status) {
        return;
      }


      const requiresComment =
        [
          "APPROVED",
          "REJECTED",
          "CHANGES_REQUESTED",
        ].includes(
          status
        );


      if (
        requiresComment &&
        !commentMessage.trim()
      ) {

        setMessage(
          "Please add a comment before completing this workflow action."
        );

        return;
      }


      try {

        setSubmittingStatus(
          true
        );

        setMessage("");


        await api.updateRequestStatus(
          requestId,
          status,
          commentMessage.trim()
        );


        setSelectedStatus(
          ""
        );


        setCommentMessage(
          ""
        );


        await loadRequestData();

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setSubmittingStatus(
          false
        );
      }
    };


  const handleCommentSubmit =
    async (event) => {

      event.preventDefault();


      if (
        !commentMessage.trim()
      ) {

        setMessage(
          "Please enter a comment."
        );

        return;
      }


      try {

        setSubmittingComment(
          true
        );

        setMessage("");


        await api.createComment(
          requestId,
          commentMessage.trim()
        );


        setCommentMessage(
          ""
        );


        const data =
          await api.getComments(
            requestId
          );


        setComments(
          data.comments || []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setSubmittingComment(
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

        setUploading(true);

        setMessage("");


        await api.uploadDocument(
          requestId,
          file
        );


        const data =
          await api.getDocuments(
            requestId
          );


        setDocuments(
          data.documents || []
        );

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setUploading(false);

        event.target.value = "";
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
            "Request could not be loaded."
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
    getAllowedStatuses();


  const requiresComment =
    [
      "APPROVED",
      "REJECTED",
      "CHANGES_REQUESTED",
    ].includes(
      selectedStatus
    );


  const user =
    JSON.parse(
      localStorage.getItem(
        "intelliflow_user"
      ) || "null"
    );


  const isUser =
    user?.role === "USER";


  const isReviewer =
    user?.role === "REVIEWER";


  const isAdmin =
    user?.role === "ADMIN";


  const canTakeWorkflowAction =
    (
      isUser ||
      isReviewer ||
      isAdmin
    ) &&
    allowedStatuses.length > 0;


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="WORKFLOW REQUEST"
        title={
          request.title
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


      <section className="details-section">

        <SectionHeader
          eyebrow="REQUEST STATUS"
          title="Current Workflow State"
        />


        <div className="intelligence-grid">

          <div className="intelligence-card">

            <span className="intelligence-label">
              Status
            </span>

            <div
              style={{
                marginTop: "10px",
              }}
            >

              <StatusBadge
                status={
                  request.status
                }
              />

            </div>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Priority
            </span>

            <strong className="intelligence-value">
              {
                request.priority ||
                "MEDIUM"
              }
            </strong>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Risk
            </span>

            <div
              style={{
                marginTop: "10px",
              }}
            >

              <RiskBadge
                risk={
                  intelligence
                    .riskLevel
                }
              />

            </div>

          </div>


          <div className="intelligence-card">

            <span className="intelligence-label">
              Deadline
            </span>

            <div
              style={{
                marginTop: "10px",
              }}
            >

              <DeadlineBadge
                status={
                  intelligence
                    .deadlineStatus
                }
              />

            </div>

          </div>

        </div>

      </section>


      <section className="details-section">

        <SectionHeader
          eyebrow="INTELLIGENCE"
          title="Workflow Risk Analysis"
        />


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
            /100
          </strong>


          {intelligence
            .reasons
            ?.length > 0 && (

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

          )}


          {intelligence
            .recommendation && (

            <p>
              <b>
                Recommendation:
              </b>{" "}
              {
                intelligence
                  .recommendation
              }
            </p>

          )}

        </div>

      </section>


      <section className="details-section">

        <SectionHeader
          eyebrow="REQUEST INFORMATION"
          title="Workflow Details"
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
              Type
            </span>

            <strong>
              {
                request.type
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
              Reviewer
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
              Stage Changed
            </span>

            <strong>
              {
                formatDateTime(
                  request.stageChangedAt
                )
              }
            </strong>

          </div>


          <div>

            <span>
              Submitted
            </span>

            <strong>
              {
                formatDateTime(
                  request.submittedAt
                )
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


      {canTakeWorkflowAction && (

        <section className="details-section">

          <div className="workflow-actions">

            <div className="workflow-actions-header">

              <div>

                <p className="section-eyebrow">
                  WORKFLOW ACTIONS
                </p>

                <h3>
                  Move this request forward
                </h3>

                <p>
                  Available actions depend on
                  the current workflow state
                  and your role.
                </p>

              </div>

            </div>


            <div className="workflow-action-note">

              Current state:{" "}
              <strong>
                {
                  formatStatus(
                    request.status
                  )
                }
              </strong>
              {" · "}
              Available transitions:{" "}
              <strong>
                {
                  allowedStatuses
                    .map(
                      formatStatus
                    )
                    .join(
                      ", "
                    )
                }
              </strong>

            </div>


            <div className="form-group">

              <label htmlFor="workflow-status">
                Select Workflow Action
              </label>

              <select
                id="workflow-status"
                value={
                  selectedStatus
                }
                onChange={(
                  event
                ) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select an action
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


            {selectedStatus && (

              <div className="form-group">

                <label htmlFor="workflow-comment">

                  {requiresComment
                    ? "Comment Required"
                    : "Comment"}

                </label>

                <textarea
                  id="workflow-comment"
                  className="workflow-comment"
                  value={
                    commentMessage
                  }
                  onChange={(
                    event
                  ) =>
                    setCommentMessage(
                      event.target.value
                    )
                  }
                  placeholder={
                    requiresComment
                      ? "Explain the decision or requested changes..."
                      : "Add an optional workflow comment..."
                  }
                  rows="4"
                />

              </div>

            )}


            {selectedStatus && (

              <div className="workflow-action-grid">

                <button
                  type="button"
                  className={
                    `workflow-action ${
                      selectedStatus ===
                      "REJECTED"
                        ? "workflow-action-danger"
                        : selectedStatus ===
                            "CHANGES_REQUESTED"
                          ? "workflow-action-warning"
                          : "workflow-action-primary"
                    }`
                  }
                  disabled={
                    submittingStatus
                  }
                  onClick={() =>
                    handleStatusUpdate(
                      selectedStatus
                    )
                  }
                >
                  {submittingStatus
                    ? "Updating..."
                    : `Confirm ${formatStatus(
                        selectedStatus
                      )}`}
                </button>


                <button
                  type="button"
                  className="workflow-action"
                  disabled={
                    submittingStatus
                  }
                  onClick={() => {

                    setSelectedStatus(
                      ""
                    );

                    setCommentMessage(
                      ""
                    );

                  }}
                >
                  Cancel Action
                </button>

              </div>

            )}

          </div>

        </section>

      )}


      {!canTakeWorkflowAction && (

        <section className="details-section">

          <SectionHeader
            eyebrow="WORKFLOW ACTIONS"
            title="No Action Available"
          />

          <div className="workflow-action-note">

            This request has no workflow
            transition currently available
            to your role.

          </div>

        </section>

      )}


      <section className="details-section">

        <SectionHeader
          eyebrow="DOCUMENTS"
          title="Request Documents"
          action={

            <label className="file-upload-button">

              {
                uploading
                  ? "Uploading..."
                  : "Upload Document"
              }

              <input
                type="file"
                disabled={
                  uploading
                }
                onChange={
                  handleDocumentUpload
                }
              />

            </label>

          }
        />


        {documents.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No documents have been
              uploaded for this request.
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
                        document
                          .mimeType
                      }
                    </span>

                    <span>
                      {
                        Math.round(
                          (
                            document.size ||
                            0
                          ) /
                            1024
                        )
                      }{" "}
                      KB
                    </span>

                    <span>
                      Uploaded by{" "}
                      {
                        document
                          .uploadedBy
                          ?.name ||
                        "User"
                      }
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      <section className="details-section">

        <SectionHeader
          eyebrow="COMMENTS"
          title="Discussion"
        />


        <form
          className="workflow-actions"
          onSubmit={
            handleCommentSubmit
          }
        >

          <div className="form-group">

            <label htmlFor="general-comment">
              Add Comment
            </label>

            <textarea
              id="general-comment"
              className="workflow-comment"
              value={
                commentMessage
              }
              onChange={(
                event
              ) =>
                setCommentMessage(
                  event.target.value
                )
              }
              placeholder="Add context, questions, or additional information..."
              rows="4"
            />

          </div>


          <div className="workflow-action-grid">

            <button
              type="submit"
              className="workflow-action workflow-action-primary"
              disabled={
                submittingComment
              }
            >
              {submittingComment
                ? "Posting..."
                : "Post Comment"}
            </button>

          </div>

        </form>


        {comments.length ===
        0 ? (

          <div
            className="empty-state"
            style={{
              marginTop: "16px",
            }}
          >

            <p>
              No comments have been
              added yet.
            </p>

          </div>

        ) : (

          <div
            className="comment-list"
            style={{
              marginTop: "18px",
            }}
          >

            {comments.map(
              (comment) => (

                <div
                  className="comment-item"
                  key={
                    comment._id
                  }
                >

                  <div className="comment-item-header">

                    <strong>
                      {
                        comment.userId
                          ?.name ||
                        "User"
                      }
                    </strong>

                    <span>
                      {
                        formatDateTime(
                          comment.createdAt
                        )
                      }
                    </span>

                  </div>

                  <p>
                    {
                      comment.message
                    }
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </section>


      <section className="details-section">

        <SectionHeader
          eyebrow="AUDIT TRAIL"
          title="Workflow History"
        />


        {auditLogs.length ===
        0 ? (

          <div className="empty-state">

            <p>
              No audit activity is
              available for this request.
            </p>

          </div>

        ) : (

          <div className="audit-list">

            {auditLogs.map(
              (log) => (

                <div
                  className="audit-item"
                  key={
                    log._id
                  }
                >

                  <div className="audit-item-header">

                    <strong>
                      {
                        log.action
                      }
                    </strong>

                    <span>
                      {
                        formatDateTime(
                          log.createdAt
                        )
                      }
                    </span>

                  </div>

                  <p>
                    {
                      log.description
                    }
                  </p>

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