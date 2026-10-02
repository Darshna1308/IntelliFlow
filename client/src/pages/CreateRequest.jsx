import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

import PageHeader from "../components/PageHeader";
import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";


function CreateRequest() {

  const [
    workflowTypes,
    setWorkflowTypes,
  ] = useState([]);


  const [
    selectedType,
    setSelectedType,
  ] = useState("");


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    priority,
    setPriority,
  ] = useState("MEDIUM");


  const [
    dueDate,
    setDueDate,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const loadWorkflowTypes =
      async () => {

        try {

          setLoading(true);
          setError("");


          const response =
            await api.getWorkflowTypes();


          const types =
            response?.workflowTypes ||
            response?.data?.workflowTypes ||
            response?.data ||
            [];


          setWorkflowTypes(
            Array.isArray(types)
              ? types
              : []
          );

        } catch (loadError) {

          console.error(
            "Workflow type loading error:",
            loadError
          );


          setError(
            loadError?.message ||
            "Unable to load workflow types."
          );

        } finally {

          setLoading(false);

        }
      };


    loadWorkflowTypes();

  }, []);


  const selectedWorkflow =
    useMemo(
      () =>
        workflowTypes.find(
          (workflow) =>
            workflow._id === selectedType ||
            workflow.id === selectedType ||
            workflow.name === selectedType
        ),
      [
        workflowTypes,
        selectedType,
      ]
    );


  const calculateDueDate = (
    days
  ) => {

    const date =
      new Date();


    date.setDate(
      date.getDate() +
      Number(days || 7)
    );


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");


    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    return `${year}-${month}-${day}`;
  };


  const handleTypeChange = (
    event
  ) => {

    const value =
      event.target.value;


    setSelectedType(value);


    const workflow =
      workflowTypes.find(
        (item) =>
          item._id === value ||
          item.id === value ||
          item.name === value
      );


    if (!workflow) {
      return;
    }


    setPriority(
      workflow.defaultPriority ||
      "MEDIUM"
    );


    setDueDate(
      calculateDueDate(
        workflow.defaultDueDays
      )
    );

  };


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    if (!selectedType) {

      setError(
        "Please select a workflow type."
      );

      return;
    }


    if (!title.trim()) {

      setError(
        "Please enter a request title."
      );

      return;
    }


    if (!description.trim()) {

      setError(
        "Please enter a request description."
      );

      return;
    }


    try {

      setSubmitting(true);


      const workflowType =
        selectedWorkflow?.name ||
        selectedType;


      const response =
        await api.createRequest({
          type: workflowType,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || null,
        });


      const request =
        response?.request ||
        response?.data?.request;


      const requestId =
        request?._id ||
        request?.id;


      if (!requestId) {

        throw new Error(
          "Request was created but its ID was not returned."
        );
      }


      window.location.href =
        `/request/${requestId}`;

    } catch (submitError) {

      console.error(
        "Create request error:",
        submitError
      );


      setError(
        submitError?.message ||
        "Unable to create the request."
      );

    } finally {

      setSubmitting(false);

    }
  };


  if (loading) {

    return (
      <main className="page-container">

        <PageHeader
          eyebrow="Workflow"
          title="Create Request"
          description="Start a new request and send it through the appropriate approval workflow."
        />

        <div className="create-request-loading">

          <LoadingCard />

        </div>

      </main>
    );
  }


  return (
    <main className="page-container">

      <PageHeader
        eyebrow="Workflow"
        title="Create Request"
        description="Start a new request and send it through the appropriate approval workflow."
      />


      <div className="create-request-layout">

        <section className="create-request-form-card">

          <div className="create-request-card-header">

            <div>

              <span className="section-eyebrow">
                Request details
              </span>

              <h2>
                Tell us what needs to move forward.
              </h2>

              <p>
                Choose a workflow type, provide the
                essential details, and IntelliFlow will
                prepare the request for review.
              </p>

            </div>

          </div>


          {error && (

            <div className="create-request-message">

              <MessageCard
                type="error"
                message={error}
              />

            </div>

          )}


          <form
            className="create-request-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label htmlFor="workflowType">
                Workflow type
              </label>

              <select
                id="workflowType"
                value={selectedType}
                onChange={handleTypeChange}
                disabled={submitting}
              >

                <option value="">
                  Select a workflow type
                </option>

                {workflowTypes.map(
                  (workflow) => {

                    const value =
                      workflow._id ||
                      workflow.id ||
                      workflow.name;


                    return (
                      <option
                        key={value}
                        value={value}
                      >
                        {workflow.name}
                      </option>
                    );
                  }
                )}

              </select>

              {selectedWorkflow?.description && (

                <small>
                  {selectedWorkflow.description}
                </small>

              )}

            </div>


            <div className="form-group">

              <label htmlFor="requestTitle">
                Request title
              </label>

              <input
                id="requestTitle"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Enter a clear, specific title"
                maxLength={150}
                disabled={submitting}
              />

              <small>
                {title.length}/150 characters
              </small>

            </div>


            <div className="form-group">

              <label htmlFor="requestDescription">
                Description
              </label>

              <textarea
                id="requestDescription"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what is needed, why it is needed, and any important context."
                rows={7}
                disabled={submitting}
              />

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                >

                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                </select>

                <small>
                  Default priority is based on the
                  selected workflow.
                </small>

              </div>


              <div className="form-group">

                <label htmlFor="dueDate">
                  Due date
                </label>

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                />

                <small>
                  Suggested from the workflow's
                  default turnaround time.
                </small>

              </div>

            </div>


            <div className="create-request-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  window.location.href = "/"
                }
                disabled={submitting}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting
                  ? "Creating request..."
                  : "Create request"}
              </button>

            </div>

          </form>

        </section>


        <aside className="create-request-sidebar">

          <div className="create-request-info-card">

            <span className="section-eyebrow">
              Workflow intelligence
            </span>

            <h3>
              What happens next?
            </h3>

            <div className="create-request-step-list">

              <div className="create-request-step">

                <span>
                  01
                </span>

                <div>

                  <strong>
                    Request created
                  </strong>

                  <p>
                    Your request starts in the
                    draft stage.
                  </p>

                </div>

              </div>


              <div className="create-request-step">

                <span>
                  02
                </span>

                <div>

                  <strong>
                    Review workflow
                  </strong>

                  <p>
                    The request can move through
                    the configured review stages.
                  </p>

                </div>

              </div>


              <div className="create-request-step">

                <span>
                  03
                </span>

                <div>

                  <strong>
                    Intelligent monitoring
                  </strong>

                  <p>
                    Deadline, priority, and workflow
                    signals are tracked automatically.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {selectedWorkflow && (

            <div className="create-request-summary-card">

              <span className="section-eyebrow">
                Selected workflow
              </span>

              <h3>
                {selectedWorkflow.name}
              </h3>

              <div className="create-request-summary-row">

                <span>
                  Default priority
                </span>

                <strong>
                  {selectedWorkflow.defaultPriority ||
                    "MEDIUM"}
                </strong>

              </div>


              <div className="create-request-summary-row">

                <span>
                  Default turnaround
                </span>

                <strong>
                  {selectedWorkflow.defaultDueDays ||
                    7}{" "}
                  days
                </strong>

              </div>

            </div>

          )}

        </aside>

      </div>

    </main>
  );
}


export default CreateRequest;