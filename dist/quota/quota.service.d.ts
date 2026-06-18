import { PrismaService } from '../prisma/prisma.service';
import { SetQuotaDto } from './dto';
export declare class QuotaService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(year?: number, quarter?: string): Promise<({
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
    getFarmerQuotaStatus(farmerId: string, year: number, quarter: string): Promise<{
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
    getFarmerAppliedAmount(farmerId: string, excludeAppId?: string): Promise<number>;
    getFarmerQuota(farmerId: string, year: number, quarter: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        farmerId: string;
        quarter: string;
        year: number;
        amount: number;
    }>;
}
