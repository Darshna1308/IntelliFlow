import {
  logout,
} from "./utils/auth";


const API_BASE_URL =
  "http://localhost:5000/api";


const apiRequest = async (
  endpoint,
  options = {}
) => {

  const {
    method = "GET",
    body,
    headers = {},
  } = options;


  const token =
    localStorage.getItem(
      "intelliflow_token"
    );


  const requestHeaders = {
    ...headers,
  };


  if (
    !(body instanceof FormData)
  ) {

    requestHeaders[
      "Content-Type"
    ] =
      "application/json";
  }


  if (token) {

    requestHeaders.Authorization =
      `Bearer ${token}`;
  }


  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers:
          requestHeaders,
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(
                  body
                )
              : undefined,
      }
    );


  let data = {};

  try {

    data =
      await response.json();

  } catch (error) {

    data = {};
  }


  if (
    response.status ===
    401
  ) {

    logout();

    return;
  }


  if (
    !response.ok
  ) {

    throw new Error(
      data.message ||
      "Something went wrong. Please try again."
    );
  }


  return data;
};


export const api = {

  // -------------------------
  // AUTH
  // -------------------------

  register: (
    userData
  ) =>
    apiRequest(
      "/auth/register",
      {
        method: "POST",
        body: userData,
      }
    ),


  login: (
    credentials
  ) =>
    apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: credentials,
      }
    ),


  getMe: () =>
    apiRequest(
      "/auth/me"
    ),


  // -------------------------
  // WORKFLOW TYPES
  // -------------------------

  getWorkflowTypes: () =>
    apiRequest(
      "/workflow-types"
    ),


  createWorkflowType: (
    workflowType
  ) =>
    apiRequest(
      "/workflow-types",
      {
        method: "POST",
        body:
          workflowType,
      }
    ),


  // -------------------------
  // REQUESTS
  // -------------------------

  createRequest: (
    requestData
  ) =>
    apiRequest(
      "/requests",
      {
        method: "POST",
        body: requestData,
      }
    ),


  getMyRequests: () =>
    apiRequest(
      "/requests/my"
    ),


  getRequestById: (
    requestId
  ) =>
    apiRequest(
      `/requests/${requestId}`
    ),


  // -------------------------
  // WORKFLOW
  // -------------------------

  updateRequestStatus: (
    requestId,
    status,
    comment
  ) =>
    apiRequest(
      `/requests/${requestId}/status`,
      {
        method: "PATCH",
        body: {
          status,
          comment,
        },
      }
    ),


  // -------------------------
  // AUDIT LOGS
  // -------------------------

  getAuditLogs: (
    requestId
  ) =>
    apiRequest(
      `/requests/${requestId}/audit-logs`
    ),


  // -------------------------
  // DOCUMENTS
  // -------------------------

  getDocuments: (
    requestId
  ) =>
    apiRequest(
      `/requests/${requestId}/documents`
    ),


  uploadDocument: (
    requestId,
    file
  ) => {

    const formData =
      new FormData();

    formData.append(
      "document",
      file
    );


    return apiRequest(
      `/requests/${requestId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );
  },


  // -------------------------
  // COMMENTS
  // -------------------------

  getComments: (
    requestId
  ) =>
    apiRequest(
      `/requests/${requestId}/comments`
    ),


  createComment: (
    requestId,
    message,
    type = "GENERAL"
  ) =>
    apiRequest(
      `/requests/${requestId}/comments`,
      {
        method: "POST",
        body: {
          message,
          type,
        },
      }
    ),


  // -------------------------
  // REVIEWER
  // -------------------------

  getAssignedRequests: () =>
    apiRequest(
      "/requests/reviewer/assigned"
    ),


  // -------------------------
  // ADMIN
  // -------------------------

  getAllRequests: () =>
    apiRequest(
      "/requests/admin/all"
    ),


  getAvailableReviewers: () =>
    apiRequest(
      "/requests/admin/reviewers"
    ),


  assignReviewer: (
    requestId,
    reviewerId
  ) =>
    apiRequest(
      `/requests/${requestId}/assign-reviewer`,
      {
        method: "PATCH",
        body: {
          reviewerId,
        },
      }
    ),


  getAdminAnalytics: () =>
    apiRequest(
      "/requests/admin/analytics"
    ),
};


export default api;