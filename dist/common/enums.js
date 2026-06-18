"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceOrderStatusNames = exports.MaintenanceOrderStatus = exports.ProblemLevelNames = exports.ProblemLevel = exports.InspectionChannelStatusNames = exports.InspectionChannelStatus = exports.QuotaQuarterNames = exports.QuotaQuarter = exports.ApplicationStatusNames = exports.ApplicationStatus = exports.ChannelLevelNames = exports.ChannelLevel = void 0;
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
    ApplicationStatus["CANCELLED_QUOTA"] = "CANCELLED_QUOTA";
    ApplicationStatus["CANCELLED_MAINTENANCE"] = "CANCELLED_MAINTENANCE";
    ApplicationStatus["EXECUTED"] = "EXECUTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
exports.ApplicationStatusNames = {
    [ApplicationStatus.PENDING]: '待编排',
    [ApplicationStatus.SCHEDULED]: '已安排',
    [ApplicationStatus.FAILED]: '无法安排',
    [ApplicationStatus.CANCELLED_QUOTA]: '因定额调整取消',
    [ApplicationStatus.CANCELLED_MAINTENANCE]: '因维护取消',
    [ApplicationStatus.EXECUTED]: '已执行',
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
//# sourceMappingURL=enums.js.map