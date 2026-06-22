"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeTypeNames = exports.DisputeType = exports.CreditHistoryTypeNames = exports.CreditHistoryType = exports.ChannelTransferStatusNames = exports.ChannelTransferStatus = exports.AllocationDroughtStatusNames = exports.AllocationDroughtStatus = exports.EmergencyLevelNames = exports.EmergencyLevel = exports.DroughtStatusNames = exports.DroughtStatus = exports.CreditLevelSortOrder = exports.CreditQuotaMultiplier = exports.CreditLevelNames = exports.CreditLevel = exports.GateAdjustmentReasonNames = exports.GateAdjustmentReason = exports.WaterLevelAlertTypeNames = exports.WaterLevelAlertType = exports.MonitorStatusNames = exports.MonitorStatus = exports.GateControlModeNames = exports.GateControlMode = exports.SellOrderStatusNames = exports.SellOrderStatus = exports.IrrigationRoundStatusNames = exports.IrrigationRoundStatus = exports.PaymentMethodNames = exports.PaymentMethod = exports.WaterBillStatusNames = exports.WaterBillStatus = exports.MaintenanceOrderStatusNames = exports.MaintenanceOrderStatus = exports.ProblemLevelNames = exports.ProblemLevel = exports.InspectionChannelStatusNames = exports.InspectionChannelStatus = exports.QuotaQuarterNames = exports.QuotaQuarter = exports.EmergencyApprovalStatusNames = exports.EmergencyApprovalStatus = exports.EmergencyReasonNames = exports.EmergencyReason = exports.NotificationTypeNames = exports.NotificationType = exports.ApplicationStatusNames = exports.ApplicationStatus = exports.ChannelLevelNames = exports.ChannelLevel = void 0;
exports.ElectricityQuotaStatusNames = exports.ElectricityQuotaStatus = exports.MeterAbnormalTypeNames = exports.MeterAbnormalType = exports.MeterStatusNames = exports.MeterStatus = exports.DepthSourceNames = exports.DepthSource = exports.GroundwaterAlertLevelNames = exports.GroundwaterAlertLevel = exports.GroundwaterAlertTypeNames = exports.GroundwaterAlertType = exports.MediationResultNames = exports.MediationResult = exports.DisputeStatusNames = exports.DisputeStatus = void 0;
var ChannelLevel;
(function (ChannelLevel) {
    ChannelLevel["MAIN"] = "MAIN";
    ChannelLevel["BRANCH"] = "BRANCH";
    ChannelLevel["LATERAL"] = "LATERAL";
    ChannelLevel["FARM"] = "FARM";
})(ChannelLevel || (exports.ChannelLevel = ChannelLevel = {}));
exports.ChannelLevelNames = {
    [ChannelLevel.MAIN]: '干渠',
    [ChannelLevel.BRANCH]: '支渠',
    [ChannelLevel.LATERAL]: '斗渠',
    [ChannelLevel.FARM]: '农渠',
};
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["SCHEDULED"] = "SCHEDULED";
    ApplicationStatus["FAILED"] = "FAILED";
    ApplicationStatus["POSTPONED"] = "POSTPONED";
    ApplicationStatus["FAILED_FINAL"] = "FAILED_FINAL";
    ApplicationStatus["CANCELLED_QUOTA"] = "CANCELLED_QUOTA";
    ApplicationStatus["CANCELLED_MAINTENANCE"] = "CANCELLED_MAINTENANCE";
    ApplicationStatus["EXECUTED"] = "EXECUTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
exports.ApplicationStatusNames = {
    [ApplicationStatus.PENDING]: '待编排',
    [ApplicationStatus.SCHEDULED]: '已安排',
    [ApplicationStatus.FAILED]: '无法安排',
    [ApplicationStatus.POSTPONED]: '已顺延',
    [ApplicationStatus.FAILED_FINAL]: '最终失败',
    [ApplicationStatus.CANCELLED_QUOTA]: '因定额调整取消',
    [ApplicationStatus.CANCELLED_MAINTENANCE]: '因维护取消',
    [ApplicationStatus.EXECUTED]: '已执行',
};
var NotificationType;
(function (NotificationType) {
    NotificationType["POSTPONE"] = "POSTPONE";
    NotificationType["FINAL_FAILURE"] = "FINAL_FAILURE";
    NotificationType["MAINTENANCE_CANCEL"] = "MAINTENANCE_CANCEL";
    NotificationType["EMERGENCY_ALERT"] = "EMERGENCY_ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.NotificationTypeNames = {
    [NotificationType.POSTPONE]: '申请顺延通知',
    [NotificationType.FINAL_FAILURE]: '申请最终失败通知',
    [NotificationType.MAINTENANCE_CANCEL]: '维护取消通知',
    [NotificationType.EMERGENCY_ALERT]: '紧急申请告警',
};
var EmergencyReason;
(function (EmergencyReason) {
    EmergencyReason["DROUGHT"] = "DROUGHT";
    EmergencyReason["FIRE_PREVENTION"] = "FIRE_PREVENTION";
    EmergencyReason["EQUIPMENT_FLUSH"] = "EQUIPMENT_FLUSH";
    EmergencyReason["OTHER"] = "OTHER";
})(EmergencyReason || (exports.EmergencyReason = EmergencyReason = {}));
exports.EmergencyReasonNames = {
    [EmergencyReason.DROUGHT]: '作物旱情',
    [EmergencyReason.FIRE_PREVENTION]: '防火需要',
    [EmergencyReason.EQUIPMENT_FLUSH]: '设备冲洗',
    [EmergencyReason.OTHER]: '其他',
};
var EmergencyApprovalStatus;
(function (EmergencyApprovalStatus) {
    EmergencyApprovalStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    EmergencyApprovalStatus["APPROVED"] = "APPROVED";
    EmergencyApprovalStatus["REJECTED"] = "REJECTED";
    EmergencyApprovalStatus["TO_BE_TRACED"] = "TO_BE_TRACED";
})(EmergencyApprovalStatus || (exports.EmergencyApprovalStatus = EmergencyApprovalStatus = {}));
exports.EmergencyApprovalStatusNames = {
    [EmergencyApprovalStatus.PENDING_APPROVAL]: '待审批',
    [EmergencyApprovalStatus.APPROVED]: '已批准',
    [EmergencyApprovalStatus.REJECTED]: '已驳回',
    [EmergencyApprovalStatus.TO_BE_TRACED]: '待追溯',
};
var QuotaQuarter;
(function (QuotaQuarter) {
    QuotaQuarter["Q1"] = "Q1";
    QuotaQuarter["Q2"] = "Q2";
    QuotaQuarter["Q3"] = "Q3";
    QuotaQuarter["Q4"] = "Q4";
})(QuotaQuarter || (exports.QuotaQuarter = QuotaQuarter = {}));
exports.QuotaQuarterNames = {
    [QuotaQuarter.Q1]: '第一季度',
    [QuotaQuarter.Q2]: '第二季度',
    [QuotaQuarter.Q3]: '第三季度',
    [QuotaQuarter.Q4]: '第四季度',
};
var InspectionChannelStatus;
(function (InspectionChannelStatus) {
    InspectionChannelStatus["NORMAL"] = "NORMAL";
    InspectionChannelStatus["PENDING_REPAIR"] = "PENDING_REPAIR";
    InspectionChannelStatus["REPAIRING"] = "REPAIRING";
    InspectionChannelStatus["COMPLETED"] = "COMPLETED";
})(InspectionChannelStatus || (exports.InspectionChannelStatus = InspectionChannelStatus = {}));
exports.InspectionChannelStatusNames = {
    [InspectionChannelStatus.NORMAL]: '正常',
    [InspectionChannelStatus.PENDING_REPAIR]: '待维修',
    [InspectionChannelStatus.REPAIRING]: '维修中',
    [InspectionChannelStatus.COMPLETED]: '已完工',
};
var ProblemLevel;
(function (ProblemLevel) {
    ProblemLevel["MINOR"] = "MINOR";
    ProblemLevel["SEVERE"] = "SEVERE";
    ProblemLevel["URGENT"] = "URGENT";
})(ProblemLevel || (exports.ProblemLevel = ProblemLevel = {}));
exports.ProblemLevelNames = {
    [ProblemLevel.MINOR]: '一般',
    [ProblemLevel.SEVERE]: '严重',
    [ProblemLevel.URGENT]: '紧急',
};
var MaintenanceOrderStatus;
(function (MaintenanceOrderStatus) {
    MaintenanceOrderStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    MaintenanceOrderStatus["APPROVED"] = "APPROVED";
    MaintenanceOrderStatus["IN_CONSTRUCTION"] = "IN_CONSTRUCTION";
    MaintenanceOrderStatus["ACCEPTED"] = "ACCEPTED";
    MaintenanceOrderStatus["CLOSED"] = "CLOSED";
})(MaintenanceOrderStatus || (exports.MaintenanceOrderStatus = MaintenanceOrderStatus = {}));
exports.MaintenanceOrderStatusNames = {
    [MaintenanceOrderStatus.PENDING_APPROVAL]: '待审批',
    [MaintenanceOrderStatus.APPROVED]: '已审批',
    [MaintenanceOrderStatus.IN_CONSTRUCTION]: '施工中',
    [MaintenanceOrderStatus.ACCEPTED]: '已验收',
    [MaintenanceOrderStatus.CLOSED]: '关闭',
};
var WaterBillStatus;
(function (WaterBillStatus) {
    WaterBillStatus["UNPAID"] = "UNPAID";
    WaterBillStatus["PARTIAL"] = "PARTIAL";
    WaterBillStatus["PAID"] = "PAID";
    WaterBillStatus["OVERDUE"] = "OVERDUE";
})(WaterBillStatus || (exports.WaterBillStatus = WaterBillStatus = {}));
exports.WaterBillStatusNames = {
    [WaterBillStatus.UNPAID]: '未缴费',
    [WaterBillStatus.PARTIAL]: '部分缴费',
    [WaterBillStatus.PAID]: '已缴清',
    [WaterBillStatus.OVERDUE]: '已欠费',
};
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["FULL"] = "FULL";
    PaymentMethod["PARTIAL"] = "PARTIAL";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.PaymentMethodNames = {
    [PaymentMethod.FULL]: '全额缴纳',
    [PaymentMethod.PARTIAL]: '部分缴纳',
};
var IrrigationRoundStatus;
(function (IrrigationRoundStatus) {
    IrrigationRoundStatus["NOT_STARTED"] = "NOT_STARTED";
    IrrigationRoundStatus["IN_PROGRESS"] = "IN_PROGRESS";
    IrrigationRoundStatus["ENDED"] = "ENDED";
})(IrrigationRoundStatus || (exports.IrrigationRoundStatus = IrrigationRoundStatus = {}));
exports.IrrigationRoundStatusNames = {
    [IrrigationRoundStatus.NOT_STARTED]: '未开始',
    [IrrigationRoundStatus.IN_PROGRESS]: '进行中',
    [IrrigationRoundStatus.ENDED]: '已结束',
};
var SellOrderStatus;
(function (SellOrderStatus) {
    SellOrderStatus["ACTIVE"] = "ACTIVE";
    SellOrderStatus["PARTIAL"] = "PARTIAL";
    SellOrderStatus["COMPLETED"] = "COMPLETED";
    SellOrderStatus["CANCELLED"] = "CANCELLED";
    SellOrderStatus["EXPIRED"] = "EXPIRED";
})(SellOrderStatus || (exports.SellOrderStatus = SellOrderStatus = {}));
exports.SellOrderStatusNames = {
    [SellOrderStatus.ACTIVE]: '挂牌中',
    [SellOrderStatus.PARTIAL]: '部分成交',
    [SellOrderStatus.COMPLETED]: '全部成交',
    [SellOrderStatus.CANCELLED]: '已撤单',
    [SellOrderStatus.EXPIRED]: '已过期',
};
var GateControlMode;
(function (GateControlMode) {
    GateControlMode["AUTO"] = "AUTO";
    GateControlMode["MANUAL"] = "MANUAL";
})(GateControlMode || (exports.GateControlMode = GateControlMode = {}));
exports.GateControlModeNames = {
    [GateControlMode.AUTO]: '自动',
    [GateControlMode.MANUAL]: '手动',
};
var MonitorStatus;
(function (MonitorStatus) {
    MonitorStatus["ONLINE"] = "ONLINE";
    MonitorStatus["OFFLINE"] = "OFFLINE";
})(MonitorStatus || (exports.MonitorStatus = MonitorStatus = {}));
exports.MonitorStatusNames = {
    [MonitorStatus.ONLINE]: '在线',
    [MonitorStatus.OFFLINE]: '离线',
};
var WaterLevelAlertType;
(function (WaterLevelAlertType) {
    WaterLevelAlertType["OVERFLOW"] = "OVERFLOW";
    WaterLevelAlertType["DRY"] = "DRY";
    WaterLevelAlertType["DEVICE_OFFLINE"] = "DEVICE_OFFLINE";
    WaterLevelAlertType["ALL_OFFLINE"] = "ALL_OFFLINE";
})(WaterLevelAlertType || (exports.WaterLevelAlertType = WaterLevelAlertType = {}));
exports.WaterLevelAlertTypeNames = {
    [WaterLevelAlertType.OVERFLOW]: '溢出告警',
    [WaterLevelAlertType.DRY]: '断流告警',
    [WaterLevelAlertType.DEVICE_OFFLINE]: '设备离线告警',
    [WaterLevelAlertType.ALL_OFFLINE]: '全量离线告警',
};
var GateAdjustmentReason;
(function (GateAdjustmentReason) {
    GateAdjustmentReason["AUTO_PLAN"] = "AUTO_PLAN";
    GateAdjustmentReason["AUTO_OVERFLOW"] = "AUTO_OVERFLOW";
    GateAdjustmentReason["AUTO_DRY"] = "AUTO_DRY";
    GateAdjustmentReason["MANUAL"] = "MANUAL";
})(GateAdjustmentReason || (exports.GateAdjustmentReason = GateAdjustmentReason = {}));
exports.GateAdjustmentReasonNames = {
    [GateAdjustmentReason.AUTO_PLAN]: '配水计划自动调节',
    [GateAdjustmentReason.AUTO_OVERFLOW]: '溢出保护调节',
    [GateAdjustmentReason.AUTO_DRY]: '断流保护调节',
    [GateAdjustmentReason.MANUAL]: '手动调节',
};
var CreditLevel;
(function (CreditLevel) {
    CreditLevel["A"] = "A";
    CreditLevel["B"] = "B";
    CreditLevel["C"] = "C";
    CreditLevel["D"] = "D";
})(CreditLevel || (exports.CreditLevel = CreditLevel = {}));
exports.CreditLevelNames = {
    [CreditLevel.A]: 'A级(优秀)',
    [CreditLevel.B]: 'B级(良好)',
    [CreditLevel.C]: 'C级(一般)',
    [CreditLevel.D]: 'D级(较差)',
};
exports.CreditQuotaMultiplier = {
    [CreditLevel.A]: 1.1,
    [CreditLevel.B]: 1.0,
    [CreditLevel.C]: 0.95,
    [CreditLevel.D]: 0.85,
};
exports.CreditLevelSortOrder = {
    [CreditLevel.A]: 0,
    [CreditLevel.B]: 1,
    [CreditLevel.C]: 2,
    [CreditLevel.D]: 2,
};
var DroughtStatus;
(function (DroughtStatus) {
    DroughtStatus["ABUNDANT"] = "ABUNDANT";
    DroughtStatus["NORMAL"] = "NORMAL";
    DroughtStatus["TENSE"] = "TENSE";
    DroughtStatus["SEVERE"] = "SEVERE";
})(DroughtStatus || (exports.DroughtStatus = DroughtStatus = {}));
exports.DroughtStatusNames = {
    [DroughtStatus.ABUNDANT]: '充裕',
    [DroughtStatus.NORMAL]: '正常',
    [DroughtStatus.TENSE]: '紧张',
    [DroughtStatus.SEVERE]: '严重缺水',
};
var EmergencyLevel;
(function (EmergencyLevel) {
    EmergencyLevel["LEVEL_1"] = "LEVEL_1";
    EmergencyLevel["LEVEL_2"] = "LEVEL_2";
})(EmergencyLevel || (exports.EmergencyLevel = EmergencyLevel = {}));
exports.EmergencyLevelNames = {
    [EmergencyLevel.LEVEL_1]: '一级响应',
    [EmergencyLevel.LEVEL_2]: '二级响应',
};
var AllocationDroughtStatus;
(function (AllocationDroughtStatus) {
    AllocationDroughtStatus["NORMAL"] = "NORMAL";
    AllocationDroughtStatus["SUSPENDED"] = "SUSPENDED";
    AllocationDroughtStatus["REDUCED"] = "REDUCED";
})(AllocationDroughtStatus || (exports.AllocationDroughtStatus = AllocationDroughtStatus = {}));
exports.AllocationDroughtStatusNames = {
    [AllocationDroughtStatus.NORMAL]: '正常',
    [AllocationDroughtStatus.SUSPENDED]: '因旱情暂停',
    [AllocationDroughtStatus.REDUCED]: '已削减',
};
var ChannelTransferStatus;
(function (ChannelTransferStatus) {
    ChannelTransferStatus["ACTIVE"] = "ACTIVE";
    ChannelTransferStatus["RELEASED"] = "RELEASED";
})(ChannelTransferStatus || (exports.ChannelTransferStatus = ChannelTransferStatus = {}));
exports.ChannelTransferStatusNames = {
    [ChannelTransferStatus.ACTIVE]: '借调中',
    [ChannelTransferStatus.RELEASED]: '已解除',
};
var CreditHistoryType;
(function (CreditHistoryType) {
    CreditHistoryType["RECALC"] = "RECALC";
    CreditHistoryType["MANUAL"] = "MANUAL";
})(CreditHistoryType || (exports.CreditHistoryType = CreditHistoryType = {}));
exports.CreditHistoryTypeNames = {
    [CreditHistoryType.RECALC]: '系统重算',
    [CreditHistoryType.MANUAL]: '手动调整',
};
var DisputeType;
(function (DisputeType) {
    DisputeType["ORDER_DISPUTE"] = "ORDER_DISPUTE";
    DisputeType["VOLUME_UNFAIR"] = "VOLUME_UNFAIR";
    DisputeType["CHANNEL_CONFLICT"] = "CHANNEL_CONFLICT";
    DisputeType["FEE_OBJECTION"] = "FEE_OBJECTION";
    DisputeType["OTHER"] = "OTHER";
})(DisputeType || (exports.DisputeType = DisputeType = {}));
exports.DisputeTypeNames = {
    [DisputeType.ORDER_DISPUTE]: '配水顺序争议',
    [DisputeType.VOLUME_UNFAIR]: '水量分配不公',
    [DisputeType.CHANNEL_CONFLICT]: '渠道占用冲突',
    [DisputeType.FEE_OBJECTION]: '水费计算异议',
    [DisputeType.OTHER]: '其他',
};
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["PENDING_ACCEPT"] = "PENDING_ACCEPT";
    DisputeStatus["MEDIATING"] = "MEDIATING";
    DisputeStatus["CLOSED"] = "CLOSED";
    DisputeStatus["ARCHIVED"] = "ARCHIVED";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
exports.DisputeStatusNames = {
    [DisputeStatus.PENDING_ACCEPT]: '待受理',
    [DisputeStatus.MEDIATING]: '调解中',
    [DisputeStatus.CLOSED]: '已结案',
    [DisputeStatus.ARCHIVED]: '已归档',
};
var MediationResult;
(function (MediationResult) {
    MediationResult["SUCCESS"] = "SUCCESS";
    MediationResult["FAIL_ESCALATE"] = "FAIL_ESCALATE";
    MediationResult["WITHDRAW"] = "WITHDRAW";
})(MediationResult || (exports.MediationResult = MediationResult = {}));
exports.MediationResultNames = {
    [MediationResult.SUCCESS]: '调解成功',
    [MediationResult.FAIL_ESCALATE]: '调解失败转上级',
    [MediationResult.WITHDRAW]: '单方撤回',
};
var GroundwaterAlertType;
(function (GroundwaterAlertType) {
    GroundwaterAlertType["REDLINE_WARNING"] = "REDLINE_WARNING";
    GroundwaterAlertType["REDLINE_BLOCKED"] = "REDLINE_BLOCKED";
    GroundwaterAlertType["DEPTH_WARNING"] = "DEPTH_WARNING";
    GroundwaterAlertType["DEPTH_EXCEEDED"] = "DEPTH_EXCEEDED";
})(GroundwaterAlertType || (exports.GroundwaterAlertType = GroundwaterAlertType = {}));
exports.GroundwaterAlertTypeNames = {
    [GroundwaterAlertType.REDLINE_WARNING]: '开采红线预警(90%)',
    [GroundwaterAlertType.REDLINE_BLOCKED]: '开采红线拦截(100%)',
    [GroundwaterAlertType.DEPTH_WARNING]: '水位埋深接近警戒',
    [GroundwaterAlertType.DEPTH_EXCEEDED]: '水位埋深超警戒(超采)',
};
var GroundwaterAlertLevel;
(function (GroundwaterAlertLevel) {
    GroundwaterAlertLevel["WARNING"] = "WARNING";
    GroundwaterAlertLevel["CRITICAL"] = "CRITICAL";
})(GroundwaterAlertLevel || (exports.GroundwaterAlertLevel = GroundwaterAlertLevel = {}));
exports.GroundwaterAlertLevelNames = {
    [GroundwaterAlertLevel.WARNING]: '预警',
    [GroundwaterAlertLevel.CRITICAL]: '严重',
};
var DepthSource;
(function (DepthSource) {
    DepthSource["CALCULATED"] = "CALCULATED";
    DepthSource["MEASURED"] = "MEASURED";
    DepthSource["MANUAL"] = "MANUAL";
})(DepthSource || (exports.DepthSource = DepthSource = {}));
exports.DepthSourceNames = {
    [DepthSource.CALCULATED]: '系统计算',
    [DepthSource.MEASURED]: '实测录入',
    [DepthSource.MANUAL]: '手动调整',
};
var MeterStatus;
(function (MeterStatus) {
    MeterStatus["NORMAL"] = "NORMAL";
    MeterStatus["ABNORMAL"] = "ABNORMAL";
    MeterStatus["SUSPENDED"] = "SUSPENDED";
})(MeterStatus || (exports.MeterStatus = MeterStatus = {}));
exports.MeterStatusNames = {
    [MeterStatus.NORMAL]: '正常',
    [MeterStatus.ABNORMAL]: '异常待核定',
    [MeterStatus.SUSPENDED]: '停用',
};
var MeterAbnormalType;
(function (MeterAbnormalType) {
    MeterAbnormalType["READING_REVERSED"] = "READING_REVERSED";
    MeterAbnormalType["METER_REPLACED"] = "METER_REPLACED";
    MeterAbnormalType["DEVICE_FAULT"] = "DEVICE_FAULT";
})(MeterAbnormalType || (exports.MeterAbnormalType = MeterAbnormalType = {}));
exports.MeterAbnormalTypeNames = {
    [MeterAbnormalType.READING_REVERSED]: '读数倒转',
    [MeterAbnormalType.METER_REPLACED]: '换表',
    [MeterAbnormalType.DEVICE_FAULT]: '设备故障',
};
var ElectricityQuotaStatus;
(function (ElectricityQuotaStatus) {
    ElectricityQuotaStatus["NORMAL"] = "NORMAL";
    ElectricityQuotaStatus["WARNING"] = "WARNING";
    ElectricityQuotaStatus["EXHAUSTED"] = "EXHAUSTED";
})(ElectricityQuotaStatus || (exports.ElectricityQuotaStatus = ElectricityQuotaStatus = {}));
exports.ElectricityQuotaStatusNames = {
    [ElectricityQuotaStatus.NORMAL]: '正常',
    [ElectricityQuotaStatus.WARNING]: '预警(85%)',
    [ElectricityQuotaStatus.EXHAUSTED]: '已用尽(100%)',
};
//# sourceMappingURL=enums.js.map