// Feature 8: Housekeeping & Maintenance Management Module

/**
 * HousekeepingManagement module tracks room cleaning schedules, maintenance requests, and room inspection status
 */

function createHousekeepingTask(roomId, taskType, priority = 'Normal', assignedTo = 'Unassigned', notes = '') {
  if (!roomId || !taskType) {
    return { success: false, message: 'Room ID and task type are required' };
  }

  const validTaskTypes = ['Cleaning', 'Deep Cleaning', 'Inspection', 'Maintenance', 'Restock'];
  if (!validTaskTypes.includes(taskType)) {
    return { success: false, message: `Invalid task type. Must be one of: ${validTaskTypes.join(', ')}` };
  }

  const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
  if (!validPriorities.includes(priority)) {
    priority = 'Normal';
  }

  const task = {
    id: 'HK_' + Date.now(),
    roomId,
    taskType,
    priority,
    status: 'Pending',
    assignedTo,
    notes,
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    message: 'Housekeeping task created successfully',
    task
  };
}

function updateTaskStatus(taskId, newStatus) {
  const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: `Invalid task status. Must be one of: ${validStatuses.join(', ')}` };
  }

  return {
    success: true,
    message: `Housekeeping task status updated to ${newStatus}`,
    taskId,
    status: newStatus
  };
}

module.exports = {
  createHousekeepingTask,
  updateTaskStatus
};
