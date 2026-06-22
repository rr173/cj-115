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
    MAINTENANCE_CANCEL = "MAINTENANCE_CANCEL",
    EMERGENCY_ALERT = "EMERGENCY_ALERT"
}
export declare const NotificationTypeNames: Record<NotificationType, string>;
export declare enum EmergencyReason {
    DROUGHT = "DROUGHT",
    FIRE_PREVENTION = "FIRE_PREVENTION",
    EQUIPMENT_FLUSH = "EQUIPMENT_FLUSH",
    OTHER = "OTHER"
}
export declare const EmergencyReasonNames: Record<EmergencyReason, string>;
export declare enum EmergencyApprovalStatus {
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    TO_BE_TRACED = "TO_BE_TRACED"
}
export declare const EmergencyApprovalStatusNames: Record<EmergencyApprovalStatus, string>;
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
export declare enum IrrigationRoundStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    ENDED = "ENDED"
}
export declare const IrrigationRoundStatusNames: Record<IrrigationRoundStatus, string>;
export declare enum SellOrderStatus {
    ACTIVE = "ACTIVE",
    PARTIAL = "PARTIAL",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare const SellOrderStatusNames: Record<SellOrderStatus, string>;
export declare enum GateControlMode {
    AUTO = "AUTO",
    MANUAL = "MANUAL"
}
export declare const GateControlModeNames: Record<GateControlMode, string>;
export declare enum MonitorStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
}
export declare const MonitorStatusNames: Record<MonitorStatus, string>;
export declare enum WaterLevelAlertType {
    OVERFLOW = "OVERFLOW",
    DRY = "DRY",
    DEVICE_OFFLINE = "DEVICE_OFFLINE",
    ALL_OFFLINE = "ALL_OFFLINE"
}
export declare const WaterLevelAlertTypeNames: Record<WaterLevelAlertType, string>;
export declare enum GateAdjustmentReason {
    AUTO_PLAN = "AUTO_PLAN",
    AUTO_OVERFLOW = "AUTO_OVERFLOW",
    AUTO_DRY = "AUTO_DRY",
    MANUAL = "MANUAL"
}
export declare const GateAdjustmentReasonNames: Record<GateAdjustmentReason, string>;
export declare enum CreditLevel {
    A = "A",
    B = "B",
    C = "C",
    D = "D"
}
export declare const CreditLevelNames: Record<CreditLevel, string>;
export declare const CreditQuotaMultiplier: Record<CreditLevel, number>;
export declare const CreditLevelSortOrder: Record<CreditLevel, number>;
export declare enum DroughtStatus {
    ABUNDANT = "ABUNDANT",
    NORMAL = "NORMAL",
    TENSE = "TENSE",
    SEVERE = "SEVERE"
}
export declare const DroughtStatusNames: Record<DroughtStatus, string>;
export declare enum EmergencyLevel {
    LEVEL_1 = "LEVEL_1",
    LEVEL_2 = "LEVEL_2"
}
export declare const EmergencyLevelNames: Record<EmergencyLevel, string>;
export declare enum AllocationDroughtStatus {
    NORMAL = "NORMAL",
    SUSPENDED = "SUSPENDED",
    REDUCED = "REDUCED"
}
export declare const AllocationDroughtStatusNames: Record<AllocationDroughtStatus, string>;
export declare enum ChannelTransferStatus {
    ACTIVE = "ACTIVE",
    RELEASED = "RELEASED"
}
export declare const ChannelTransferStatusNames: Record<ChannelTransferStatus, string>;
export declare enum CreditHistoryType {
    RECALC = "RECALC",
    MANUAL = "MANUAL"
}
export declare const CreditHistoryTypeNames: Record<CreditHistoryType, string>;
export declare enum DisputeType {
    ORDER_DISPUTE = "ORDER_DISPUTE",
    VOLUME_UNFAIR = "VOLUME_UNFAIR",
    CHANNEL_CONFLICT = "CHANNEL_CONFLICT",
    FEE_OBJECTION = "FEE_OBJECTION",
    OTHER = "OTHER"
}
export declare const DisputeTypeNames: Record<DisputeType, string>;
export declare enum DisputeStatus {
    PENDING_ACCEPT = "PENDING_ACCEPT",
    MEDIATING = "MEDIATING",
    CLOSED = "CLOSED",
    ARCHIVED = "ARCHIVED"
}
export declare const DisputeStatusNames: Record<DisputeStatus, string>;
export declare enum MediationResult {
    SUCCESS = "SUCCESS",
    FAIL_ESCALATE = "FAIL_ESCALATE",
    WITHDRAW = "WITHDRAW"
}
export declare const MediationResultNames: Record<MediationResult, string>;
