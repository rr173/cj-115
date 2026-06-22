import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyApprovalStatus } from '../common/enums';

export class EmergencyApprovalDto {
  @ApiProperty({ description: '审批结果 APPROVED-批准 REJECTED-驳回', enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  result: 'APPROVED' | 'REJECTED';

  @ApiProperty({ description: '驳回原因(驳回时必填)', required: false })
  @IsOptional()
  @IsString()
  rejectReason?: string;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;
}

export class ListEmergencyApplicationsDto {
  @ApiProperty({ description: '审批状态 PENDING_APPROVAL-待审批 APPROVED-已批准 REJECTED-已驳回 TO_BE_TRACED-待追溯', required: false, enum: EmergencyApprovalStatus })
  @IsOptional()
  @IsEnum(EmergencyApprovalStatus)
  status?: EmergencyApprovalStatus;

  @ApiProperty({ description: '用水户ID', required: false })
  @IsOptional()
  @IsString()
  farmerId?: string;

  @ApiProperty({ description: '页码(从1开始)', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页条数', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class EmergencyStatisticsDto {
  @ApiProperty({ description: '年份', required: true })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ description: '月份(1-12)', required: true })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
