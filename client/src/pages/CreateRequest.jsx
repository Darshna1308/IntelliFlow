import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import api from "../services/api";

import MagicalLibraryBackground from "../components/library/MagicalLibraryBackground";


const PAPER = "#eee1c2";
const INK = "#2b1a10";
const BURGUNDY = "#5a1620";
const GOLD = "#c9a24a";
const RULE = "rgba(43,26,16,0.22)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%235a1620' stroke-width='1.6'/%3E%3C/svg%3E\")";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IM+Fell+English+SC&family=Work+Sans:wght@400;500;600&display=swap');
.cr-display{font-family:'IM Fell English SC',Georgia,serif}
.cr-serif{font-family:'Cormorant Garamond',Georgia,serif;font-variant-numeric:lining-nums}
.cr-sans{font-family:'Work Sans',system-ui,sans-serif}
.cr-input{width:100%;background-color:rgba(255,250,232,0.55);border:1px solid rgba(43,26,16,0.28);border-bottom:2px solid rgba(110,38,56,0.55);color:${INK};padding:0.7rem 0.8rem;font:400 1rem 'Work Sans',system-ui,sans-serif;border-radius:2px;transition:box-shadow .2s,border-color .2s}
.cr-input::placeholder{color:rgba(43,26,16,0.5)}
.cr-input:focus{outline:none;border-color:${GOLD};border-bottom-color:#6e2638;box-shadow:0 0 0 3px rgba(201,162,74,0.38),0 0 16px rgba(201,162,74,0.25)}
.cr-input:disabled{opacity:0.6;cursor:not-allowed}
select.cr-input{appearance:none;-webkit-appearance:none;padding-right:2.4rem;background-image:${CHEVRON};background-repeat:no-repeat;background-position:right 0.85rem center;cursor:pointer}
select.cr-input option{color:${INK};background:${PAPER}}
textarea.cr-input{resize:vertical;min-height:11rem;line-height:1.75rem;padding:0.4rem 0.8rem;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.75rem - 1px),rgba(110,38,56,0.16) calc(1.75rem - 1px),rgba(110,38,56,0.16) 1.75rem);background-attachment:local}
.cr-btn:focus-visible{outline:2px solid #8a5a12;outline-offset:3px}
`;


function Sigil({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      stroke={GOLD}
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="19" />
      <circle cx="22" cy="22" r="5" />
      <path d="M22 3v38M3 22h38M8.6 8.6l26.8 26.8M35.4 8.6L8.6 35.4" />
    </svg>
  );
}


function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3" style={{ margin: "0.4rem 0 1.4rem" }}>
      <Sigil />
      <h2
        className="cr-serif"
        style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1, color: BURGUNDY }}
      >
        {children}
      </h2>
      <span
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}, rgba(201,162,74,0))` }}
      />
    </div>
  );
}


function Field({ htmlFor, label, hint, children }) {
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <label
        htmlFor={htmlFor}
        className="cr-serif"
        style={{ display: "block", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <small
          className="cr-sans"
          style={{ display: "block", marginTop: 6, fontSize: "0.8rem", opacity: 0.78 }}
        >
          {hint}
        </small>
      )}
    </div>
  );
}


function Page({ children, reduced }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 110, damping: 20 }}
      className="relative"
      style={{
        background: PAPER,
        color: INK,
        border: "1px solid rgba(43,26,16,0.3)",
        boxShadow:
          "0 3px 0 #dccfa9, 0 6px 0 #cfc096, 0 30px 50px -28px rgba(0,0,0,0.85)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN, mixBlendMode: "multiply", opacity: 0.16 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ inset: 8, border: "1px solid rgba(201,162,74,0.7)" }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}


function CreateRequest() {

  const reduced = useReducedMotion();


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


  const shell = (content) => (
    <div
      className="relative min-h-screen overflow-x-hidden px-3 pb-20 pt-8 sm:px-8 md:pt-12"
      style={{ backgroundColor: "#17100c", color: "#eadfc6" }}
    >
      <style>{STYLES}</style>

      <MagicalLibraryBackground />

      <div className="relative z-10 mx-auto max-w-[1040px]">

        <header className="px-1" style={{ marginBottom: "2rem" }}>
          <h1
            className="cr-display"
            style={{ fontSize: "clamp(2rem, 4.8vw, 3.6rem)", lineHeight: 1 }}
          >
            Write a New Chapter
          </h1>
          <p
            className="cr-serif italic"
            style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "#b8a780", marginTop: 6 }}
          >
            Create a request and begin its workflow journey.
          </p>
        </header>

        {content}

      </div>
    </div>
  );


  if (loading) {

    return shell(
      <Page reduced={reduced}>
        <div
          role="status"
          aria-live="polite"
          style={{ padding: "4rem 2rem", textAlign: "center" }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Sigil size={34} />
          </div>
          <p className="cr-serif italic" style={{ fontSize: "1.6rem" }}>
            Opening a fresh page…
          </p>
        </div>
      </Page>
    );
  }


  return shell(
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">

      <Page reduced={reduced}>

        <section className="px-6 py-9 sm:px-12 sm:py-12" aria-label="New request">

          {error && (

            <div
              role="alert"
              className="cr-sans"
              style={{
                marginBottom: "1.5rem",
                padding: "0.7rem 0.9rem",
                borderLeft: "3px solid #8c2f1f",
                background: "rgba(140,47,31,0.1)",
                color: "#6f2113",
                fontSize: "0.92rem",
              }}
            >
              {error}
            </div>

          )}


          <form
            onSubmit={handleSubmit}
            noValidate
          >

            <SectionTitle>
              Chapter Details
            </SectionTitle>


            <Field
              htmlFor="workflowType"
              label="Workflow type"
              hint={selectedWorkflow?.description}
            >

              <select
                id="workflowType"
                className="cr-input"
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

            </Field>


            <Field
              htmlFor="requestTitle"
              label="Request title"
              hint={`${title.length}/150 characters`}
            >

              <input
                id="requestTitle"
                className="cr-input"
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

            </Field>


            <Field
              htmlFor="requestDescription"
              label="Description"
            >

              <textarea
                id="requestDescription"
                className="cr-input"
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

            </Field>


            <div style={{ height: "1.2rem" }} />

            <SectionTitle>
              Workflow Intent
            </SectionTitle>


            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">

              <Field
                htmlFor="priority"
                label="Priority"
                hint="Default priority is based on the selected workflow."
              >

                <select
                  id="priority"
                  className="cr-input"
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

              </Field>


              <Field
                htmlFor="dueDate"
                label="Due date"
                hint="Suggested from the workflow's default turnaround time."
              >

                <input
                  id="dueDate"
                  className="cr-input"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                />

              </Field>

            </div>


            <div
              className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                marginTop: "1.6rem",
                paddingTop: "1.4rem",
                borderTop: `1px solid ${RULE}`,
              }}
            >

              <button
                type="button"
                className="cr-btn cr-sans"
                onClick={() =>
                  window.location.href = "/"
                }
                disabled={submitting}
                style={{
                  padding: "0.8rem 1.4rem",
                  background: "transparent",
                  color: INK,
                  border: `1px solid ${INK}`,
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                CANCEL
              </button>


              <button
                type="submit"
                className="cr-btn cr-sans"
                disabled={submitting}
                aria-busy={submitting}
                style={{
                  padding: "0.9rem 1.8rem",
                  background: BURGUNDY,
                  color: "#f3e7c9",
                  border: `1px solid ${GOLD}`,
                  borderRadius: 2,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.8 : 1,
                  boxShadow: "inset 0 0 0 3px rgba(90,22,32,1), inset 0 0 0 4px rgba(201,162,74,0.5)",
                }}
              >
                {submitting
                  ? "WRITING THE CHAPTER…"
                  : "BEGIN THIS CHAPTER"}
              </button>

            </div>

          </form>

        </section>

      </Page>


      <aside aria-label="Margin notes" className="flex flex-col gap-6">

        <Page reduced={reduced}>

          <div className="px-6 py-7">

            <h3
              className="cr-serif"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: BURGUNDY, lineHeight: 1.1 }}
            >
              What happens next?
            </h3>

            <span
              aria-hidden="true"
              style={{
                display: "block",
                height: 1,
                margin: "0.8rem 0 1rem",
                background: `linear-gradient(90deg, ${GOLD}, rgba(201,162,74,0))`,
              }}
            />

            <ol className="flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>

              <li className="flex gap-3">
                <span
                  className="cr-serif italic"
                  style={{ fontSize: "1.7rem", lineHeight: 1, color: BURGUNDY, width: "2rem", flexShrink: 0 }}
                >
                  01
                </span>
                <div className="cr-sans" style={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
                  <strong style={{ display: "block", fontWeight: 600 }}>
                    Request created
                  </strong>
                  Your request starts in the draft stage.
                </div>
              </li>

              <li className="flex gap-3">
                <span
                  className="cr-serif italic"
                  style={{ fontSize: "1.7rem", lineHeight: 1, color: BURGUNDY, width: "2rem", flexShrink: 0 }}
                >
                  02
                </span>
                <div className="cr-sans" style={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
                  <strong style={{ display: "block", fontWeight: 600 }}>
                    Review workflow
                  </strong>
                  The request can move through the configured review stages.
                </div>
              </li>

              <li className="flex gap-3">
                <span
                  className="cr-serif italic"
                  style={{ fontSize: "1.7rem", lineHeight: 1, color: BURGUNDY, width: "2rem", flexShrink: 0 }}
                >
                  03
                </span>
                <div className="cr-sans" style={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
                  <strong style={{ display: "block", fontWeight: 600 }}>
                    Intelligent monitoring
                  </strong>
                  Deadline, priority, and workflow signals are tracked automatically.
                </div>
              </li>

            </ol>

          </div>

        </Page>


        {selectedWorkflow && (

          <Page reduced={reduced}>

            <div className="px-6 py-7">

              <span
                className="cr-sans"
                style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", opacity: 0.75 }}
              >
                SELECTED WORKFLOW
              </span>

              <h3
                className="cr-serif"
                style={{ fontSize: "1.5rem", fontWeight: 700, color: BURGUNDY, lineHeight: 1.1, marginTop: 4 }}
              >
                {selectedWorkflow.name}
              </h3>

              <div
                className="cr-sans flex items-baseline justify-between"
                style={{ fontSize: "0.85rem", padding: "0.6rem 0", borderBottom: `1px solid ${RULE}`, marginTop: 10 }}
              >
                <span>
                  Default priority
                </span>
                <strong style={{ fontWeight: 600 }}>
                  {selectedWorkflow.defaultPriority ||
                    "MEDIUM"}
                </strong>
              </div>

              <div
                className="cr-sans flex items-baseline justify-between"
                style={{ fontSize: "0.85rem", padding: "0.6rem 0" }}
              >
                <span>
                  Default turnaround
                </span>
                <strong style={{ fontWeight: 600 }}>
                  {selectedWorkflow.defaultDueDays ||
                    7}{" "}
                  days
                </strong>
              </div>

            </div>

          </Page>

        )}

      </aside>

    </div>
  );
}


export default CreateRequest;
