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
    CANCELLED_QUOTA = "CANCELLED_QUOTA",
    EXECUTED = "EXECUTED"
}
export declare const ApplicationStatusNames: Record<ApplicationStatus, string>;
export declare enum QuotaQuarter {
    Q1 = "Q1",
    Q2 = "Q2",
    Q3 = "Q3",
    Q4 = "Q4"
}
export declare const QuotaQuarterNames: Record<QuotaQuarter, string>;
