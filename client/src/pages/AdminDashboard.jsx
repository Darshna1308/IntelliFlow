import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import DeadlineBadge from "../components/DeadlineBadge";
import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";
import RiskBadge from "../components/RiskBadge";
import StatusBadge from "../components/StatusBadge";

const css = `
.ca-room{position:relative;min-height:100vh;width:100%;overflow-x:hidden;box-sizing:border-box;
  padding:28px 16px 80px;color:#2b211a;font-family:Georgia,"Times New Roman",serif;
  background:
   radial-gradient(ellipse 60% 40% at 85% 0%,rgba(255,214,140,.38),transparent 70%),
   linear-gradient(180deg,rgba(40,26,16,.0) 0,rgba(40,26,16,.0) 100%),
   repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,transparent 2px 90px),
   linear-gradient(180deg,#6a4a30 0,#5a3d27 18%,#7a5a3c 18.4%,#6b4d33 100%);}
.ca-room *{box-sizing:border-box}
.ca-shelves{position:absolute;inset:0 0 auto 0;height:18%;pointer-events:none;opacity:.55;
  background:
   repeating-linear-gradient(90deg,#8a6a4a 0 14px,#6e5037 14px 22px,#9a7a58 22px 30px,#5d4330 30px 38px,#a8895f 38px 46px,#7a5a3c 46px 60px),
   #4a3322;
  -webkit-mask-image:linear-gradient(180deg,#000 55%,transparent);mask-image:linear-gradient(180deg,#000 55%,transparent)}
.ca-lamp{position:absolute;top:-80px;right:-60px;width:520px;height:520px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(255,205,120,.35),transparent 65%);animation:ca-lamp 9s ease-in-out infinite}
.ca-dust{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ca-dust i{position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(255,235,200,.55);animation:ca-drift 18s linear infinite}
.ca-wrap{position:relative;max-width:1100px;margin:0 auto}
.ca-header{padding:22px 20px;margin-bottom:22px;background:#efe3c8;border:1px solid #b9a37a;border-left:8px solid #7b2d2d;
  box-shadow:0 8px 18px rgba(0,0,0,.35);animation:ca-slide .7s ease-out both}
.ca-eyebrow{margin:0 0 6px;font:12px "Courier New",monospace;letter-spacing:.2em;color:#7b2d2d}
.ca-title{margin:0;font-size:clamp(26px,5vw,40px);letter-spacing:.04em;animation:ca-type 1.6s steps(24) both}
.ca-sub{margin:6px 0 0;font-style:italic;color:#5b4a3a}
.ca-sec{margin-top:26px;background:#f3e9d2;border:1px solid #c2ac82;padding:18px 16px 20px;
  box-shadow:0 6px 14px rgba(0,0,0,.3);position:relative;animation:ca-slide .7s ease-out both}
.ca-sec-head{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:flex-end;
  border-bottom:2px double #8a7554;padding-bottom:8px;margin-bottom:14px}
.ca-sec-head h2{margin:0;font-size:clamp(18px,3.5vw,24px);animation:ca-type 1.2s steps(20) both}
.ca-count{font:12px "Courier New",monospace;color:#7b2d2d;border:1.5px solid #7b2d2d;padding:2px 8px;transform:rotate(-2deg);
  animation:ca-stamp .5s .6s ease-out both}
.ca-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.ca-stat{background:#faf3e1;border:1px solid #cdb98f;padding:12px;box-shadow:2px 3px 0 rgba(90,60,30,.18)}
.ca-stat span{display:block;font:11px "Courier New",monospace;letter-spacing:.08em;text-transform:uppercase;color:#6b5a46}
.ca-stat strong{display:block;font-size:30px;margin:4px 0;color:#2b211a}
.ca-stat small{color:#7a6a55;font-style:italic}
.ca-register{background:#faf3e1;border:1px solid #cdb98f;padding:10px 14px;font:14px "Courier New",monospace;
  background-image:repeating-linear-gradient(180deg,transparent 0 27px,rgba(80,100,130,.18) 27px 28px)}
.ca-register h4{margin:0 0 6px;font-size:12px;letter-spacing:.15em;color:#7b2d2d}
.ca-row{display:flex;align-items:baseline;gap:6px;line-height:28px}
.ca-row i{flex:1;border-bottom:1px dotted #8a7554;transform:translateY(-4px)}
.ca-row b{color:#2b211a}
.ca-files{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:26px 16px;padding-top:12px}
.ca-folder{position:relative;display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;
  background:linear-gradient(180deg,#e2c993,#d8bb7e);border:1px solid #a68a56;border-radius:2px 6px 4px 4px;
  padding:16px 14px 14px;box-shadow:0 5px 0 #b99d66,0 10px 16px rgba(0,0,0,.3);animation:ca-slide .6s ease-out both;
  transition:transform .25s ease}
.ca-folder:hover{transform:translateY(-3px) rotate(-.4deg)}
.ca-folder::before{content:attr(data-no);position:absolute;top:-17px;left:14px;max-width:70%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
  background:#d8bb7e;border:1px solid #a68a56;border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;font:12px "Courier New",monospace;color:#5b2020}
.ca-paper{background:#fbf5e4;border:1px solid #d6c49c;padding:10px 12px;margin-top:2px}
.ca-folder h3{margin:0 0 6px;font-size:18px;line-height:1.25;word-break:break-word;color:#2b211a}
.ca-no{font:12px "Courier New",monospace;color:#7b2d2d}
.ca-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;font-size:13px;color:#4a3b2c}
.ca-note{font-family:"Brush Script MT","Segoe Script",cursive;font-size:16px;color:#2f4a6b}
.ca-assign{margin-top:12px;padding:10px 12px;background:#efe3c8;border:1px dashed #8a7554}
.ca-assign label{display:block;font:11px "Courier New",monospace;letter-spacing:.12em;text-transform:uppercase;color:#7b2d2d;margin-bottom:6px}
.ca-assign select{width:100%;max-width:100%;padding:8px;font:14px Georgia,serif;background:#fbf5e4;color:#2b211a;border:1px solid #8a7554}
.ca-empty{padding:16px;text-align:center;font-style:italic;color:#6b5a46;border:1px dashed #a68a56}
.ca-folder-wrap{position:relative;padding-top:4px}
@keyframes ca-slide{from{opacity:0;transform:translateY(14px) rotate(.6deg)}to{opacity:1;transform:none}}
@keyframes ca-type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes ca-stamp{from{opacity:0;transform:scale(1.6) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(-2deg)}}
@keyframes ca-lamp{0%,100%{opacity:.8}50%{opacity:1}}
@keyframes ca-drift{from{transform:translate(0,100vh)}to{transform:translate(40px,-10vh)}}
@media (prefers-reduced-motion:reduce){.ca-room *,.ca-room *::before{animation:none!important;transition:none!important}}
`;

const dust = [8, 22, 37, 51, 66, 79, 90];

function Section({ eyebrow, title, count, delay = 0, children }) {
  return (
    <section className="ca-sec" style={{ animationDelay: `${delay}s` }}>
      <div className="ca-sec-head">
        <div>
          <p className="ca-eyebrow" style={{ margin: 0 }}>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {count !== undefined && <span className="ca-count">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, meta }) {
  return (
    <div className="ca-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {meta && <small>{meta}</small>}
    </div>
  );
}

function Register({ title, rows }) {
  return (
    <div className="ca-register">
      <h4>{title}</h4>
      {rows.map(([label, value]) => (
        <div className="ca-row" key={label}>
          <span>{label}</span>
          <i />
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [assigningRequest, setAssigningRequest] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [analyticsData, requestData, reviewerData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllRequests(),
        api.getAvailableReviewers(),
      ]);

      setAnalytics(analyticsData.analytics || analyticsData);
      setRequests(requestData.requests || []);
      setReviewers(reviewerData.reviewers || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getIntelligence = (request) => request.intelligence || {};

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openRequest = (requestId) => {
    window.location.href = `/request/${requestId}`;
  };

  const handleAssignReviewer = async (requestId, reviewerId) => {
    if (!reviewerId) return;

    try {
      setAssigningRequest(requestId);
      setMessage("");
      await api.assignReviewer(requestId, reviewerId);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAssigningRequest("");
    }
  };

  const attentionRequests = useMemo(
    () =>
      requests.filter((request) => {
        const intelligence = getIntelligence(request);
        return (
          ["HIGH", "CRITICAL"].includes(intelligence.riskLevel) ||
          ["DUE_SOON", "OVERDUE"].includes(intelligence.deadlineStatus)
        );
      }),
    [requests]
  );

  const highRiskCount = useMemo(
    () =>
      requests.filter((request) =>
        ["HIGH", "CRITICAL"].includes(getIntelligence(request).riskLevel)
      ).length,
    [requests]
  );

  const overdueCount = useMemo(
    () =>
      requests.filter(
        (request) => getIntelligence(request).deadlineStatus === "OVERDUE"
      ).length,
    [requests]
  );

  const unassignedCount = useMemo(
    () => requests.filter((request) => !request.assignedReviewer).length,
    [requests]
  );

  if (loading) {
    return <LoadingCard message={"Opening the case archive..."} />;
  }

  if (!analytics) {
    return (
      <div className="ca-room">
        <style>{css}</style>
        <div className="ca-wrap">
          <MessageCard
            message={message || "Admin analytics could not be loaded."}
          />
        </div>
      </div>
    );
  }

  const overview = analytics.overview || {};
  const priorityAnalysis = analytics.priorityAnalysis || {};
  const workflowPriority = analytics.workflowDefaultPriorityDistribution || [];
  const riskDistribution = analytics.riskDistribution || [];
  const reviewerWorkload = analytics.reviewerWorkload || [];

  const getDistributionValue = (distribution, key) => {
    if (Array.isArray(distribution)) {
      const item = distribution.find((entry) => entry._id === key);
      return item?.count || 0;
    }
    return distribution[key] || 0;
  };

  const renderFolder = (request, index, withAssign) => {
    const intelligence = getIntelligence(request);
    const creator =
      request.creator?.name || request.createdBy?.name || request.user?.name;

    const body = (
      <>
        <div className="ca-paper">
          <span className="ca-no">Case No. {request.requestId}</span>
          <h3>{request.title}</h3>
          <div className="ca-meta">
            <StatusBadge status={request.status} />
            <span>{request.type}</span>
            <span>Urgency: {request.priority || "MEDIUM"}</span>
          </div>
          <div className="ca-meta">
            <RiskBadge risk={intelligence.riskLevel} />
            <DeadlineBadge status={intelligence.deadlineStatus} />
          </div>
          <div className="ca-meta">
            {creator && <span>Submitted by: {creator}</span>}
            <span>Opened {formatDate(request.createdAt)}</span>
          </div>
          <div className="ca-note" style={{ marginTop: 6 }}>
            Observer: {request.assignedReviewer?.name || "not yet assigned"}
          </div>
        </div>
      </>
    );

    const style = { animationDelay: `${Math.min(index, 8) * 0.08}s` };

    if (!withAssign) {
      return (
        <div className="ca-folder-wrap" key={request._id}>
          <button
            type="button"
            className="ca-folder"
            data-no={request.requestId}
            style={style}
            onClick={() => openRequest(request._id)}
          >
            {body}
          </button>
        </div>
      );
    }

    return (
      <div className="ca-folder-wrap" key={request._id}>
        <div className="ca-folder" data-no={request.requestId} style={style}>
          <div
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onClick={() => openRequest(request._id)}
            onKeyDown={(event) => {
              if (event.key === "Enter") openRequest(request._id);
            }}
          >
            {body}
          </div>

          <div className="ca-assign">
            <label htmlFor={`reviewer-${request._id}`}>Case Assignment</label>
            <select
              id={`reviewer-${request._id}`}
              value={request.assignedReviewer?._id || ""}
              disabled={assigningRequest === request._id}
              onChange={(event) =>
                handleAssignReviewer(request._id, event.target.value)
              }
            >
              <option value="">Select reviewer</option>
              {reviewers.map((reviewer) => (
                <option key={reviewer._id} value={reviewer._id}>
                  {reviewer.name} — {reviewer.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ca-room">
      <style>{css}</style>
      <div className="ca-shelves" />
      <div className="ca-lamp" />
      <div className="ca-dust">
        {dust.map((left, i) => (
          <i key={left} style={{ left: `${left}%`, animationDelay: `${i * 2.4}s` }} />
        ))}
      </div>

      <div className="ca-wrap">
        <header className="ca-header">
          <p className="ca-eyebrow">INTELLIFLOW · RECORDS OFFICE</p>
          <h1 className="ca-title">The Case Archive</h1>
          <p className="ca-sub">Every record tells part of the story.</p>
        </header>

        <MessageCard message={message} />

        <Section eyebrow="ARCHIVE REGISTER" title="Archive Register" delay={0.1}>
          <div className="ca-grid">
            <Stat
              label="Total Case Files"
              value={overview.totalRequests ?? requests.length}
              meta="All records held"
            />
            <Stat
              label="High / Critical Concern"
              value={overview.highRiskRequests ?? highRiskCount}
              meta="Concern level requires attention"
            />
            <Stat
              label="Past Review Date"
              value={overview.overdueRequests ?? overdueCount}
              meta="Overdue cases"
            />
            <Stat
              label="Without Observer"
              value={overview.unassignedRequests ?? unassignedCount}
              meta="Awaiting assignment"
            />
          </div>
        </Section>

        <Section eyebrow="RECORD ANALYTICS" title="Record Sheets" delay={0.15}>
          <div className="ca-grid" style={{ marginBottom: 14 }}>
            <Stat
              label="Urgency Raised"
              value={priorityAnalysis.escalated ?? 0}
              meta="Actual above default"
            />
            <Stat
              label="Urgency Matched"
              value={priorityAnalysis.matched ?? 0}
              meta="Matches workflow default"
            />
            <Stat
              label="Urgency Lowered"
              value={priorityAnalysis.downgraded ?? 0}
              meta="Actual below default"
            />
            <Stat
              label="Average Concern"
              value={Math.round(analytics.averageRisk || 0)}
              meta="Score out of 100"
            />
          </div>

          <div className="ca-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
            <Register
              title="DEFAULT URGENCY REGISTER"
              rows={[
                ["Low", getDistributionValue(workflowPriority, "LOW")],
                ["Medium", getDistributionValue(workflowPriority, "MEDIUM")],
                ["High", getDistributionValue(workflowPriority, "HIGH")],
                ["Critical", getDistributionValue(workflowPriority, "CRITICAL")],
              ]}
            />
            <Register
              title="CONCERN LEVEL REGISTER"
              rows={[
                ["Low", getDistributionValue(riskDistribution, "LOW")],
                ["Medium", getDistributionValue(riskDistribution, "MEDIUM")],
                ["High", getDistributionValue(riskDistribution, "HIGH")],
                ["Critical", getDistributionValue(riskDistribution, "CRITICAL")],
              ]}
            />
          </div>
        </Section>

        <Section
          eyebrow="CASES REQUIRING ATTENTION"
          title="Cases Requiring Attention"
          count={`${attentionRequests.length} case${attentionRequests.length === 1 ? "" : "s"}`}
          delay={0.2}
        >
          {attentionRequests.length === 0 ? (
            <div className="ca-empty">
              No cases currently require immediate administrative attention.
            </div>
          ) : (
            <div className="ca-files">
              {attentionRequests.map((request, i) => renderFolder(request, i, false))}
            </div>
          )}
        </Section>

        <Section
          eyebrow="REVIEWER ASSIGNMENTS"
          title="Assigned Cases"
          count={`${reviewers.length} observer${reviewers.length === 1 ? "" : "s"}`}
          delay={0.25}
        >
          {reviewerWorkload.length === 0 ? (
            <div className="ca-empty">
              No reviewer workload data is currently available.
            </div>
          ) : (
            <div className="ca-grid">
              {reviewerWorkload.map((reviewer) => (
                <Stat
                  key={reviewer._id || reviewer.reviewerId}
                  label={reviewer.name || reviewer.reviewerName || "Reviewer"}
                  value={reviewer.total ?? reviewer.count ?? 0}
                  meta="Assigned cases"
                />
              ))}
            </div>
          )}
        </Section>

        <Section
          eyebrow="CASE FILE INDEX"
          title="Case File Index"
          count={`${requests.length} total`}
          delay={0.3}
        >
          {requests.length === 0 ? (
            <div className="ca-empty">No case files exist yet.</div>
          ) : (
            <div className="ca-files">
              {requests.map((request, i) => renderFolder(request, i, true))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

export default AdminDashboard;