const Request = require("../models/Request");

const {
  calculateIntelligence,
} = require("../services/intelligenceService");


const getAdminAnalytics = async (
  req,
  res
) => {
  try {

    const requests =
      await Request.find()
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "assignedReviewer",
          "name email role"
        );


    const enrichedRequests =
      requests.map(
        (request) => ({
          ...request.toObject(),

          intelligence:
            calculateIntelligence(
              request
            ),
        })
      );


    /*
     * OVERVIEW
     */

    const totalRequests =
      enrichedRequests.length;

    const completedRequests =
      enrichedRequests.filter(
        (request) =>
          request.status ===
            "APPROVED" ||
          request.status ===
            "REJECTED"
      ).length;

    const pendingRequests =
      enrichedRequests.filter(
        (request) =>
          ![
            "APPROVED",
            "REJECTED",
          ].includes(
            request.status
          )
      ).length;


    /*
     * STATUS DISTRIBUTION
     */

    const statusDistribution =
      {};

    enrichedRequests.forEach(
      (request) => {
        const status =
          request.status;

        statusDistribution[
          status
        ] =
          (statusDistribution[
            status
          ] || 0) + 1;
      }
    );


    /*
     * PRIORITY DISTRIBUTION
     */

    const priorityDistribution =
      {};

    enrichedRequests.forEach(
      (request) => {
        const priority =
          request.priority ||
          "MEDIUM";

        priorityDistribution[
          priority
        ] =
          (priorityDistribution[
            priority
          ] || 0) + 1;
      }
    );


    /*
     * WORKFLOW DEFAULT PRIORITY
     * DISTRIBUTION
     */

    const workflowDefaultPriorityDistribution =
      {};

    enrichedRequests.forEach(
      (request) => {
        const defaultPriority =
          request.workflowDefaultPriority ||
          "MEDIUM";

        workflowDefaultPriorityDistribution[
          defaultPriority
        ] =
          (
            workflowDefaultPriorityDistribution[
              defaultPriority
            ] || 0
          ) + 1;
      }
    );


    /*
     * PRIORITY ESCALATIONS
     *
     * Counts requests where the
     * selected priority is higher
     * than the workflow default.
     */

    const priorityOrder = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };


    let priorityEscalations = 0;

    let priorityDowngrades = 0;

    let priorityMatches =
      0;


    enrichedRequests.forEach(
      (request) => {

        const actualPriority =
          request.priority ||
          "MEDIUM";

        const defaultPriority =
          request.workflowDefaultPriority ||
          "MEDIUM";


        const actualScore =
          priorityOrder[
            actualPriority
          ] || 2;

        const defaultScore =
          priorityOrder[
            defaultPriority
          ] || 2;


        if (
          actualScore >
          defaultScore
        ) {
          priorityEscalations += 1;

        } else if (
          actualScore <
          defaultScore
        ) {
          priorityDowngrades += 1;

        } else {
          priorityMatches += 1;
        }
      }
    );


    /*
     * RISK DISTRIBUTION
     */

    const riskDistribution =
      {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      };


    enrichedRequests.forEach(
      (request) => {

        const riskLevel =
          request.intelligence
            ?.riskLevel ||
          "LOW";

        riskDistribution[
          riskLevel
        ] =
          (
            riskDistribution[
              riskLevel
            ] || 0
          ) + 1;
      }
    );


    /*
     * DEADLINE DISTRIBUTION
     */

    const deadlineDistribution =
      {
        ON_TRACK: 0,
        DUE_SOON: 0,
        OVERDUE: 0,
        COMPLETED: 0,
        NO_DEADLINE: 0,
      };


    enrichedRequests.forEach(
      (request) => {

        const deadlineStatus =
          request.intelligence
            ?.deadlineStatus ||
          "NO_DEADLINE";

        deadlineDistribution[
          deadlineStatus
        ] =
          (
            deadlineDistribution[
              deadlineStatus
            ] || 0
          ) + 1;
      }
    );


    /*
     * REVIEWER WORKLOAD
     */

    const reviewerWorkload =
      {};


    enrichedRequests.forEach(
      (request) => {

        if (
          !request.assignedReviewer
        ) {
          return;
        }


        const reviewerId =
          request
            .assignedReviewer
            ._id.toString();


        if (
          !reviewerWorkload[
            reviewerId
          ]
        ) {
          reviewerWorkload[
            reviewerId
          ] = {
            reviewerId,

            reviewerName:
              request
                .assignedReviewer
                .name,

            reviewerEmail:
              request
                .assignedReviewer
                .email,

            totalAssigned:
              0,

            pending:
              0,

            completed:
              0,

            highRisk:
              0,
          };
        }


        reviewerWorkload[
          reviewerId
        ].totalAssigned += 1;


        if (
          [
            "APPROVED",
            "REJECTED",
          ].includes(
            request.status
          )
        ) {
          reviewerWorkload[
            reviewerId
          ].completed += 1;
        } else {
          reviewerWorkload[
            reviewerId
          ].pending += 1;
        }


        if (
          [
            "HIGH",
            "CRITICAL",
          ].includes(
            request.intelligence
              ?.riskLevel
          )
        ) {
          reviewerWorkload[
            reviewerId
          ].highRisk += 1;
        }
      }
    );


    /*
     * ATTENTION REQUESTS
     */

    const attentionRequests =
      enrichedRequests
        .filter(
          (request) =>
            [
              "HIGH",
              "CRITICAL",
            ].includes(
              request.intelligence
                ?.riskLevel
            )
        )
        .sort(
          (
            a,
            b
          ) =>
            (
              b.intelligence
                ?.riskScore ||
              0
            ) -
            (
              a.intelligence
                ?.riskScore ||
              0
            )
        )
        .slice(
          0,
          10
        );


    /*
     * AVERAGE RISK SCORE
     */

    const totalRiskScore =
      enrichedRequests.reduce(
        (
          total,
          request
        ) =>
          total +
          (
            request
              .intelligence
              ?.riskScore ||
            0
          ),
        0
      );


    const averageRiskScore =
      totalRequests > 0
        ? Math.round(
            totalRiskScore /
              totalRequests
          )
        : 0;


    /*
     * RESPONSE
     */

    return res.status(200).json({
      success: true,

      analytics: {
        overview: {
          totalRequests,
          pendingRequests,
          completedRequests,
          averageRiskScore,
        },

        statusDistribution,

        priorityDistribution,

        workflowDefaultPriorityDistribution,

        priorityAnalysis: {
          escalated:
            priorityEscalations,

          downgraded:
            priorityDowngrades,

          matched:
            priorityMatches,
        },

        riskDistribution,

        deadlineDistribution,

        reviewerWorkload:
          Object.values(
            reviewerWorkload
          ),

        attentionRequests,
      },
    });

  } catch (error) {

    console.error(
      "Get admin analytics error:",
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching admin analytics",
    });
  }
};


module.exports = {
  getAdminAnalytics,
};