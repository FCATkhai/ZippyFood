export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    ORDERING: 'ordering',
    COMPLETED: 'completed',
    REVIEWED: 'reviewed',
    CANCELLED: 'cancelled',
    RETURNED: 'returned'
} as const;

export const ORDER_STATUS_VALUES = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.ORDERING,
    ORDER_STATUSES.COMPLETED,
    ORDER_STATUSES.REVIEWED,
    ORDER_STATUSES.CANCELLED,
] as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];