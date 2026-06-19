export declare enum ChannelLevel {
    MAIN = "MAIN",
    BRANCH = "BRANCH",
    LATERAL = "LATERAL",
    FARM = "FARM"
}
export declare const ChannelLevelNames: Record<ChannelLevel, string>;
export declare enum ApplicationStatus {
    PENDING = "PENDING",
    SCHEDULED = "SCHEDULED",
    FAILED = "FAILED",
    POSTPONED = "POSTPONED",
    FAILED_FINAL = "FAILED_FINAL",
    CANCELLED_QUOTA = "CANCELLED_QUOTA",
    CANCELLED_MAINTENANCE = "CANCELLED_MAINTENANCE",
    EXECUTED = "EXECUTED"
}
export declare const ApplicationStatusNames: Record<ApplicationStatus, string>;
export declare enum NotificationType {
    POSTPONE = "POSTPONE",
    FINAL_FAILURE = "FINAL_FAILURE",
    MAINTENANCE_CANCEL = "MAINTENANCE_CANCEL"
}
export declare const NotificationTypeNames: Record<NotificationType, string>;
export declare enum QuotaQuarter {
    Q1 = "Q1",
    Q2 = "Q2",
    Q3 = "Q3",
    Q4 = "Q4"
}
export declare const QuotaQuarterNames: Record<QuotaQuarter, string>;
export declare enum InspectionChannelStatus {
    NORMAL = "NORMAL",
    PENDING_REPAIR = "PENDING_REPAIR",
    REPAIRING = "REPAIRING",
    COMPLETED = "COMPLETED"
}
export declare const InspectionChannelStatusNames: Record<InspectionChannelStatus, string>;
export declare enum ProblemLevel {
    MINOR = "MINOR",
    SEVERE = "SEVERE",
    URGENT = "URGENT"
}
export declare const ProblemLevelNames: Record<ProblemLevel, string>;
export declare enum MaintenanceOrderStatus {
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    IN_CONSTRUCTION = "IN_CONSTRUCTION",
    ACCEPTED = "ACCEPTED",
    CLOSED = "CLOSED"
}
export declare const MaintenanceOrderStatusNames: Record<MaintenanceOrderStatus, string>;
export declare enum WaterBillStatus {
    UNPAID = "UNPAID",
    PARTIAL = "PARTIAL",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare const WaterBillStatusNames: Record<WaterBillStatus, string>;
export declare enum PaymentMethod {
    FULL = "FULL",
    PARTIAL = "PARTIAL"
}
export declare const PaymentMethodNames: Record<PaymentMethod, string>;
