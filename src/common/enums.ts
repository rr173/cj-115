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
