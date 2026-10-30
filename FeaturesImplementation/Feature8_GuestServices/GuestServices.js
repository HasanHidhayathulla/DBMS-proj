// Feature 8: Guest Add-ons & Special Services Module

/**
 * Guest Services module handles special requests and add-on service orders for reservations
 */

function createServiceRequest(confirmationNumber, serviceType, details, cost = 0) {
  if (!confirmationNumber || !serviceType) {
    return { success: false, message: 'Confirmation number and service type are required' };
  }

  const validServiceTypes = ['Airport Transfer', 'Extra Bed', 'Late Check-Out', 'Breakfast Package', 'Special Request'];
  if (!validServiceTypes.includes(serviceType)) {
    return { success: false, message: `Invalid service type. Must be one of: ${validServiceTypes.join(', ')}` };
  }

  const serviceRequest = {
    id: 'SR_' + Date.now(),
    confirmationNumber,
    serviceType,
    details: details || '',
    cost: parseFloat(cost) || 0,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    message: 'Service request created successfully',
    serviceRequest
  };
}

function updateServiceRequestStatus(requestId, newStatus) {
  const validStatuses = ['Pending', 'Approved', 'Fulfilled', 'Rejected'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }

  return {
    success: true,
    message: `Service request status updated to ${newStatus}`,
    requestId,
    status: newStatus
  };
}

module.exports = {
  createServiceRequest,
  updateServiceRequestStatus
};
