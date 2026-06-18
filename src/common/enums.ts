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
  CANCELLED_QUOTA = 'CANCELLED_QUOTA',
  EXECUTED = 'EXECUTED',
}

export const ApplicationStatusNames: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '待编排',
  [ApplicationStatus.SCHEDULED]: '已安排',
  [ApplicationStatus.FAILED]: '无法安排',
  [ApplicationStatus.CANCELLED_QUOTA]: '因定额调整取消',
  [ApplicationStatus.EXECUTED]: '已执行',
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
