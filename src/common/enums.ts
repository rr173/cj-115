export enum ChannelLevel {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  LATERAL = 'LATERAL',
  FARM = 'FARM',
}

export const ChannelLevelNames: Record<ChannelLevel, string> = {
  [ChannelLevel.MAIN]: '干渠',
  [ChannelLevel.BRANCH]: '支渠',
  [ChannelLevel.LATERAL]: '斗渠',
  [ChannelLevel.FARM]: '农渠',
};

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  FAILED = 'FAILED',
  POSTPONED = 'POSTPONED',
  FAILED_FINAL = 'FAILED_FINAL',
  CANCELLED_QUOTA = 'CANCELLED_QUOTA',
  CANCELLED_MAINTENANCE = 'CANCELLED_MAINTENANCE',
  EXECUTED = 'EXECUTED',
}

export const ApplicationStatusNames: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '待编排',
  [ApplicationStatus.SCHEDULED]: '已安排',
  [ApplicationStatus.FAILED]: '无法安排',
  [ApplicationStatus.POSTPONED]: '已顺延',
  [ApplicationStatus.FAILED_FINAL]: '最终失败',
  [ApplicationStatus.CANCELLED_QUOTA]: '因定额调整取消',
  [ApplicationStatus.CANCELLED_MAINTENANCE]: '因维护取消',
  [ApplicationStatus.EXECUTED]: '已执行',
};

export enum NotificationType {
  POSTPONE = 'POSTPONE',
  FINAL_FAILURE = 'FINAL_FAILURE',
  MAINTENANCE_CANCEL = 'MAINTENANCE_CANCEL',
}

export const NotificationTypeNames: Record<NotificationType, string> = {
  [NotificationType.POSTPONE]: '申请顺延通知',
  [NotificationType.FINAL_FAILURE]: '申请最终失败通知',
  [NotificationType.MAINTENANCE_CANCEL]: '维护取消通知',
};

export enum QuotaQuarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export const QuotaQuarterNames: Record<QuotaQuarter, string> = {
  [QuotaQuarter.Q1]: '第一季度',
  [QuotaQuarter.Q2]: '第二季度',
  [QuotaQuarter.Q3]: '第三季度',
  [QuotaQuarter.Q4]: '第四季度',
};

export enum InspectionChannelStatus {
  NORMAL = 'NORMAL',
  PENDING_REPAIR = 'PENDING_REPAIR',
  REPAIRING = 'REPAIRING',
  COMPLETED = 'COMPLETED',
}

export const InspectionChannelStatusNames: Record<InspectionChannelStatus, string> = {
  [InspectionChannelStatus.NORMAL]: '正常',
  [InspectionChannelStatus.PENDING_REPAIR]: '待维修',
  [InspectionChannelStatus.REPAIRING]: '维修中',
  [InspectionChannelStatus.COMPLETED]: '已完工',
};

export enum ProblemLevel {
  MINOR = 'MINOR',
  SEVERE = 'SEVERE',
  URGENT = 'URGENT',
}

export const ProblemLevelNames: Record<ProblemLevel, string> = {
  [ProblemLevel.MINOR]: '一般',
  [ProblemLevel.SEVERE]: '严重',
  [ProblemLevel.URGENT]: '紧急',
};

export enum MaintenanceOrderStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_CONSTRUCTION = 'IN_CONSTRUCTION',
  ACCEPTED = 'ACCEPTED',
  CLOSED = 'CLOSED',
}

export const MaintenanceOrderStatusNames: Record<MaintenanceOrderStatus, string> = {
  [MaintenanceOrderStatus.PENDING_APPROVAL]: '待审批',
  [MaintenanceOrderStatus.APPROVED]: '已审批',
  [MaintenanceOrderStatus.IN_CONSTRUCTION]: '施工中',
  [MaintenanceOrderStatus.ACCEPTED]: '已验收',
  [MaintenanceOrderStatus.CLOSED]: '关闭',
};

export enum WaterBillStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export const WaterBillStatusNames: Record<WaterBillStatus, string> = {
  [WaterBillStatus.UNPAID]: '未缴费',
  [WaterBillStatus.PARTIAL]: '部分缴费',
  [WaterBillStatus.PAID]: '已缴清',
  [WaterBillStatus.OVERDUE]: '已欠费',
};

export enum PaymentMethod {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export const PaymentMethodNames: Record<PaymentMethod, string> = {
  [PaymentMethod.FULL]: '全额缴纳',
  [PaymentMethod.PARTIAL]: '部分缴纳',
};

export enum IrrigationRoundStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED',
}

export const IrrigationRoundStatusNames: Record<IrrigationRoundStatus, string> = {
  [IrrigationRoundStatus.NOT_STARTED]: '未开始',
  [IrrigationRoundStatus.IN_PROGRESS]: '进行中',
  [IrrigationRoundStatus.ENDED]: '已结束',
};

export enum SellOrderStatus {
  ACTIVE = 'ACTIVE',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export const SellOrderStatusNames: Record<SellOrderStatus, string> = {
  [SellOrderStatus.ACTIVE]: '挂牌中',
  [SellOrderStatus.PARTIAL]: '部分成交',
  [SellOrderStatus.COMPLETED]: '全部成交',
  [SellOrderStatus.CANCELLED]: '已撤单',
  [SellOrderStatus.EXPIRED]: '已过期',
};

export enum GateControlMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export const GateControlModeNames: Record<GateControlMode, string> = {
  [GateControlMode.AUTO]: '自动',
  [GateControlMode.MANUAL]: '手动',
};

export enum MonitorStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export const MonitorStatusNames: Record<MonitorStatus, string> = {
  [MonitorStatus.ONLINE]: '在线',
  [MonitorStatus.OFFLINE]: '离线',
};

export enum WaterLevelAlertType {
  OVERFLOW = 'OVERFLOW',
  DRY = 'DRY',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  ALL_OFFLINE = 'ALL_OFFLINE',
}

export const WaterLevelAlertTypeNames: Record<WaterLevelAlertType, string> = {
  [WaterLevelAlertType.OVERFLOW]: '溢出告警',
  [WaterLevelAlertType.DRY]: '断流告警',
  [WaterLevelAlertType.DEVICE_OFFLINE]: '设备离线告警',
  [WaterLevelAlertType.ALL_OFFLINE]: '全量离线告警',
};

export enum GateAdjustmentReason {
  AUTO_PLAN = 'AUTO_PLAN',
  AUTO_OVERFLOW = 'AUTO_OVERFLOW',
  AUTO_DRY = 'AUTO_DRY',
  MANUAL = 'MANUAL',
}

export const GateAdjustmentReasonNames: Record<GateAdjustmentReason, string> = {
  [GateAdjustmentReason.AUTO_PLAN]: '配水计划自动调节',
  [GateAdjustmentReason.AUTO_OVERFLOW]: '溢出保护调节',
  [GateAdjustmentReason.AUTO_DRY]: '断流保护调节',
  [GateAdjustmentReason.MANUAL]: '手动调节',
};

export enum CreditLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export const CreditLevelNames: Record<CreditLevel, string> = {
  [CreditLevel.A]: 'A级(优秀)',
  [CreditLevel.B]: 'B级(良好)',
  [CreditLevel.C]: 'C级(一般)',
  [CreditLevel.D]: 'D级(较差)',
};

export const CreditQuotaMultiplier: Record<CreditLevel, number> = {
  [CreditLevel.A]: 1.1,
  [CreditLevel.B]: 1.0,
  [CreditLevel.C]: 0.95,
  [CreditLevel.D]: 0.85,
};

export const CreditLevelSortOrder: Record<CreditLevel, number> = {
  [CreditLevel.A]: 0,
  [CreditLevel.B]: 1,
  [CreditLevel.C]: 2,
  [CreditLevel.D]: 2,
};

export enum DroughtStatus {
  ABUNDANT = 'ABUNDANT',
  NORMAL = 'NORMAL',
  TENSE = 'TENSE',
  SEVERE = 'SEVERE',
}

export const DroughtStatusNames: Record<DroughtStatus, string> = {
  [DroughtStatus.ABUNDANT]: '充裕',
  [DroughtStatus.NORMAL]: '正常',
  [DroughtStatus.TENSE]: '紧张',
  [DroughtStatus.SEVERE]: '严重缺水',
};

export enum EmergencyLevel {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
}

export const EmergencyLevelNames: Record<EmergencyLevel, string> = {
  [EmergencyLevel.LEVEL_1]: '一级响应',
  [EmergencyLevel.LEVEL_2]: '二级响应',
};

export enum AllocationDroughtStatus {
  NORMAL = 'NORMAL',
  SUSPENDED = 'SUSPENDED',
  REDUCED = 'REDUCED',
}

export const AllocationDroughtStatusNames: Record<AllocationDroughtStatus, string> = {
  [AllocationDroughtStatus.NORMAL]: '正常',
  [AllocationDroughtStatus.SUSPENDED]: '因旱情暂停',
  [AllocationDroughtStatus.REDUCED]: '已削减',
};

export enum ChannelTransferStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
}

export const ChannelTransferStatusNames: Record<ChannelTransferStatus, string> = {
  [ChannelTransferStatus.ACTIVE]: '借调中',
  [ChannelTransferStatus.RELEASED]: '已解除',
};

export enum CreditHistoryType {
  RECALC = 'RECALC',
  MANUAL = 'MANUAL',
}

export const CreditHistoryTypeNames: Record<CreditHistoryType, string> = {
  [CreditHistoryType.RECALC]: '系统重算',
  [CreditHistoryType.MANUAL]: '手动调整',
};
