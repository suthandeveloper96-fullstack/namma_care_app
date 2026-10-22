export const ORDER_STATUS = {
  submitted: { label: 'Order Submitted', tone: 'info', description: 'Your demo order was recorded in this browser.' },
  prescription_review: { label: 'Prescription Review', tone: 'info', description: 'Prescription checked in a simulated pharmacist review.' },
  awaiting_review: { label: 'Awaiting Pharmacy Review', tone: 'warning', description: 'Waiting for the demo pharmacy to accept the order.' },
  accepted: { label: 'Accepted', tone: 'info', description: 'The demo pharmacy accepted the order.' },
  preparing: { label: 'Preparing', tone: 'info', description: 'Items are being packed (simulated).' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'info', description: 'On the way (simulated — no real courier).' },
  delivered: { label: 'Delivered', tone: 'success', description: 'Marked delivered in the demo.' },
  rejected: { label: 'Rejected', tone: 'danger', description: 'The demo pharmacy could not fulfil this order.' },
  cancelled: { label: 'Cancelled', tone: 'neutral', description: 'This order was cancelled.' },
};

// Allowed forward transitions. Anything else is rejected by the reducer.
const TRANSITIONS = {
  awaiting_review: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'rejected', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

export const TERMINAL_STATUSES = ['delivered', 'rejected', 'cancelled'];
export const PATIENT_CANCELLABLE = ['awaiting_review', 'accepted'];
/** Statuses that release reserved stock back to inventory. */
export const RELEASES_STOCK = ['rejected', 'cancelled'];

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}

export function nextStatusesFor(status) {
  return TRANSITIONS[status] ?? [];
}

export const isActiveOrder = (order) => !TERMINAL_STATUSES.includes(order.status);

const FULFILMENT_FLOW = ['submitted', 'awaiting_review', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];

/** Builds display steps for the tracking timeline from an order's history. */
export function buildTimeline(order) {
  const flow = order.requiresPrescription
    ? ['submitted', 'prescription_review', ...FULFILMENT_FLOW.slice(1)]
    : FULFILMENT_FLOW;
  const historyByStatus = new Map(order.history.map((entry) => [entry.status, entry]));
  const terminalFailure = ['rejected', 'cancelled'].includes(order.status) ? order.status : null;

  const steps = [];
  for (const status of flow) {
    const entry = historyByStatus.get(status);
    if (terminalFailure && !entry) break;
    steps.push({
      status,
      label: ORDER_STATUS[status].label,
      entry,
      state: entry ? (status === order.status ? 'current' : 'done') : 'upcoming',
    });
  }
  if (terminalFailure) {
    steps.push({
      status: terminalFailure,
      label: ORDER_STATUS[terminalFailure].label,
      entry: historyByStatus.get(terminalFailure),
      state: 'failed',
    });
  }
  return steps;
}
