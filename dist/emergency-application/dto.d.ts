import { EmergencyApprovalStatus } from '../common/enums';
export declare class EmergencyApprovalDto {
    result: 'APPROVED' | 'REJECTED';
    rejectReason?: string;
    operator?: string;
}
export declare class ListEmergencyApplicationsDto {
    status?: EmergencyApprovalStatus;
    farmerId?: string;
    page?: number;
    pageSize?: number;
}
export declare class EmergencyStatisticsDto {
    year: number;
    month: number;
}
