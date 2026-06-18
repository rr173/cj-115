"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaQuarterNames = exports.QuotaQuarter = exports.ApplicationStatusNames = exports.ApplicationStatus = exports.ChannelLevelNames = exports.ChannelLevel = void 0;
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
    ApplicationStatus["EXECUTED"] = "EXECUTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
exports.ApplicationStatusNames = {
    [ApplicationStatus.PENDING]: '待编排',
    [ApplicationStatus.SCHEDULED]: '已安排',
    [ApplicationStatus.FAILED]: '无法安排',
    [ApplicationStatus.CANCELLED_QUOTA]: '因定额调整取消',
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
//# sourceMappingURL=enums.js.map