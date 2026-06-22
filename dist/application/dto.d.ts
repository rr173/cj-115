import { EmergencyReason } from '../common/enums';
export declare class CreateApplicationDto {
    farmerId: string;
    expectedFlow: number;
    expectedHours: number;
    targetDate: string;
    isEmergency?: boolean;
    emergencyReason?: EmergencyReason;
}
export declare class ListApplicationsDto {
    farmerId?: string;
    targetDate?: string;
    status?: string;
}
