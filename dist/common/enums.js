"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IrrigationRoundStatusNames = exports.IrrigationRoundStatus = exports.PaymentMethodNames = exports.PaymentMethod = exports.WaterBillStatusNames = exports.WaterBillStatus = exports.MaintenanceOrderStatusNames = exports.MaintenanceOrderStatus = exports.ProblemLevelNames = exports.ProblemLevel = exports.InspectionChannelStatusNames = exports.InspectionChannelStatus = exports.QuotaQuarterNames = exports.QuotaQuarter = exports.NotificationTypeNames = exports.NotificationType = exports.ApplicationStatusNames = exports.ApplicationStatus = exports.ChannelLevelNames = exports.ChannelLevel = void 0;
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
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.NotificationTypeNames = {
    [NotificationType.POSTPONE]: '申请顺延通知',
    [NotificationType.FINAL_FAILURE]: '申请最终失败通知',
    [NotificationType.MAINTENANCE_CANCEL]: '维护取消通知',
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
//# sourceMappingURL=enums.js.map