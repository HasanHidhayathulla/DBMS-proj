// Housekeeping Management Logic

/**
 * Creates a new cleaning task for a room
 * @param {number} roomId
 * @param {string} taskType - 'Departure Cleaning', 'Daily Cleaning', 'Deep Clean', 'Inspection'
 * @param {string} priority - 'Low', 'Medium', 'High', 'Urgent'
 * @param {string} notes
 */
function createCleaningTask(roomId, taskType = 'Departure Cleaning', priority = 'Medium', notes = '') {
  console.log(`[Housekeeping] Creating cleaning task for Room ID=${roomId}, type=${taskType}, priority=${priority}`);
  return {
    roomId,
    taskType,
    priority,
    status: 'Pending',
    notes,
    createdAt: new Date().toISOString()
  };
}

/**
 * Assigns a housekeeping task to a staff member
 * @param {number} taskId
 * @param {string} staffName
 */
function assignCleaningTask(taskId, staffName) {
  console.log(`[Housekeeping] Assigning Task ID=${taskId} to staff: ${staffName}`);
  return {
    taskId,
    assignedTo: staffName,
    status: 'In_Progress'
  };
}

/**
 * Completes a cleaning task and returns ready status
 * @param {number} roomId
 * @param {string} inspectorNotes
 */
function completeCleaning(roomId, inspectorNotes = '') {
  console.log(`[Housekeeping] Room ID=${roomId} cleaned and inspected. Setting status to Available.`);
  return {
    roomId,
    roomStatus: 'Available',
    completedAt: new Date().toISOString(),
    inspectorNotes
  };
}

module.exports = {
  createCleaningTask,
  assignCleaningTask,
  completeCleaning
};
