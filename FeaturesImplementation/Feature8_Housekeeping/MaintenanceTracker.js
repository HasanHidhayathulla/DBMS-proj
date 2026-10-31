// Maintenance Tracker Logic

/**
 * Reports a new maintenance issue for a room
 * @param {number} roomId
 * @param {string} reportedBy
 * @param {string} issueCategory - 'Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Other'
 * @param {string} description
 * @param {string} priority - 'Low', 'Medium', 'High', 'Urgent'
 */
function reportMaintenanceIssue(roomId, reportedBy, issueCategory, description, priority = 'Medium') {
  console.log(`[Maintenance] Issue reported for Room ID=${roomId}: [${issueCategory}] ${description} (Priority: ${priority})`);
  return {
    roomId,
    reportedBy,
    issueCategory,
    description,
    priority,
    status: 'Reported',
    createdAt: new Date().toISOString()
  };
}

/**
 * Resolves a maintenance issue and returns room to Available status
 * @param {number} requestId
 * @param {string} resolutionNotes
 */
function resolveMaintenanceIssue(requestId, resolutionNotes = '') {
  console.log(`[Maintenance] Resolving Request ID=${requestId}: ${resolutionNotes}`);
  return {
    requestId,
    status: 'Resolved',
    resolutionNotes,
    resolvedAt: new Date().toISOString(),
    roomStatus: 'Available'
  };
}

module.exports = {
  reportMaintenanceIssue,
  resolveMaintenanceIssue
};
