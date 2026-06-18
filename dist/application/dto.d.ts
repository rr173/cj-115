export declare class CreateApplicationDto {
    farmerId: string;
    expectedFlow: number;
    expectedHours: number;
    targetDate: string;
}
export declare class ListApplicationsDto {
    farmerId?: string;
    targetDate?: string;
    status?: string;
}
