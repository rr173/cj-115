import { QuotaService } from './quota.service';
import { SetQuotaDto, BatchSetQuotaDto } from './dto';
export declare class QuotaController {
    private readonly service;
    constructor(service: QuotaService);
    setQuota(dto: SetQuotaDto): Promise<{
        quota: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            farmerId: string;
            quarter: string;
            year: number;
            amount: number;
        };
        totalAvailable: number;
        cancelledApplications: any[];
    }>;
    batchSet(dto: BatchSetQuotaDto): Promise<any[]>;
    findAll(year?: string, quarter?: string): Promise<({
        farmer: {
            name: string;
            code: string;
            id: string;
            area: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        farmerId: string;
        quarter: string;
        year: number;
        amount: number;
    })[]>;
    getFarmerStatus(farmerId: string, year: string, quarter: string): Promise<{
        farmer: {
            id: string;
            code: string;
            name: string;
            area: number;
        };
        quota: {
            amount: number;
            quarter: string;
            year: number;
        };
        totalAvailable: number;
        appliedAmount: number;
        remainingAmount: number;
    }>;
}
