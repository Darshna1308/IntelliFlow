import {
  useEffect,
  useState,
} from "react";

import { api } from "../api";

import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";
import PageHeader from "../components/PageHeader";


function CreateRequest() {

  const [workflowTypes, setWorkflowTypes] =
    useState([]);

  const [formData, setFormData] =
    useState({
      type: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const loadWorkflowTypes =
    async () => {

      try {

        setLoading(true);

        setMessage("");

        const data =
          await api.getWorkflowTypes();

        setWorkflowTypes(
          data.workflowTypes || []
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

    loadWorkflowTypes();

  }, []);


  const getDefaultDueDate = (
    days
  ) => {

    const date =
      new Date();

    date.setDate(
      date.getDate() + days
    );

    return date
      .toISOString()
      .split("T")[0];
  };


  const handleTypeChange = (
    event
  ) => {

    const selectedType =
      event.target.value;

    const workflowType =
      workflowTypes.find(
        (item) =>
          item.name ===
          selectedType
      );


    if (!workflowType) {

      setFormData(
        (previous) => ({
          ...previous,
          type: selectedType,
        })
      );

      return;
    }


    setFormData(
      (previous) => ({
        ...previous,
        type:
          workflowType.name,
        priority:
          workflowType.defaultPriority,
        dueDate:
          getDefaultDueDate(
            workflowType.defaultDueDays
          ),
      })
    );
  };


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  const selectedWorkflow =
    workflowTypes.find(
      (item) =>
        item.name ===
        formData.type
    );


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setMessage("");

      setSuccess("");


      if (
        !formData.type ||
        !formData.title ||
        !formData.description
      ) {

        setMessage(
          "Please fill in all required fields."
        );

        return;
      }


      try {

        setSubmitting(true);


        const data =
          await api.createRequest(
            formData
          );


        setSuccess(
          data.message ||
          "Request created successfully."
        );


        const createdRequest =
          data.request;


        setFormData({
          type: "",
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
        });


        if (
          createdRequest?._id
        ) {

          setTimeout(
            () => {

              window.location.href =
                `/request/${createdRequest._id}`;

            },
            800
          );

        }

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setSubmitting(false);
      }
    };


  if (loading) {

    return (
      <LoadingCard
        message={
          "Loading workflow types..."
        }
      />
    );
  }


  return (
    <div className="page-container">

      <PageHeader
        eyebrow="NEW WORKFLOW"
        title="Create Request"
        subtitle="Start a new workflow request and provide the information required for review."
      />


      <MessageCard
        message={message}
      />


      {success && (
        <div className="success-message">
          {success}
        </div>
      )}


      <section className="details-section">

        <div className="section-header">

          <div>

            <p className="section-eyebrow">
              REQUEST DETAILS
            </p>

            <h2>
              Workflow Information
            </h2>

          </div>

        </div>


        <form
          className="request-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label htmlFor="type">
              Workflow Type
            </label>

            <select
              id="type"
              name="type"
              value={
                formData.type
              }
              onChange={
                handleTypeChange
              }
              required
            >

              <option value="">
                Select workflow type
              </option>

              {workflowTypes.map(
                (workflowType) => (

                  <option
                    key={
                      workflowType._id
                    }
                    value={
                      workflowType.name
                    }
                  >
                    {
                      workflowType.name
                    }
                  </option>

                )
              )}

            </select>

          </div>


          {selectedWorkflow && (

            <div className="intelligence-card">

              <span className="intelligence-label">
                WORKFLOW GUIDANCE
              </span>

              <strong>
                {
                  selectedWorkflow
                    .description
                }
              </strong>

              <p>
                Suggested priority:{" "}
                <b>
                  {
                    selectedWorkflow
                      .defaultPriority
                  }
                </b>
              </p>

              <p>
                Default deadline:{" "}
                <b>
                  {
                    selectedWorkflow
                      .defaultDueDays
                  }{" "}
                  days
                </b>
              </p>

              {selectedWorkflow
                .requiredDocuments
                ?.length > 0 && (

                <p>
                  Recommended documents:{" "}
                  <b>
                    {
                      selectedWorkflow
                        .requiredDocuments
                        .join(", ")
                    }
                  </b>
                </p>

              )}

            </div>

          )}


          <div className="form-group">

            <label htmlFor="title">
              Request Title
            </label>

            <input
              id="title"
              type="text"
              name="title"
              value={
                formData.title
              }
              onChange={
                handleChange
              }
              placeholder="Enter a clear request title"
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the request, objective, requirements, and relevant context."
              rows="7"
              required
            />

          </div>


          <div className="form-row">

            <div className="form-group">

              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={
                  formData.priority
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="LOW">
                  LOW
                </option>

                <option value="MEDIUM">
                  MEDIUM
                </option>

                <option value="HIGH">
                  HIGH
                </option>

                <option value="CRITICAL">
                  CRITICAL
                </option>

              </select>

            </div>


            <div className="form-group">

              <label htmlFor="dueDate">
                Due Date
              </label>

              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={
                  formData.dueDate
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

          </div>


          <div className="form-actions">

            <button
              type="button"
              onClick={() =>
                window.location.href =
                  "/"
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                submitting
              }
            >
              {submitting
                ? "Creating..."
                : "Create Request"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}


export default CreateRequest;