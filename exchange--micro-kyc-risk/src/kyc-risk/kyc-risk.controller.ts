import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AssessUserRiskDto } from './dto/assess-user-risk.dto';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { CreateKycRiskCaseDto } from './dto/create-case.dto';
import { UpdateKycRiskCaseStatusDto } from './dto/update-case-status.dto';
import { KycRiskService } from './kyc-risk.service';

@Controller('kyc-risk')
@UseGuards(InternalAuthGuard)
export class KycRiskController {
  constructor(private readonly service: KycRiskService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('cases')
  listCases() {
    return this.service.listCases();
  }

  @Post('cases')
  createCase(@Body() dto: CreateKycRiskCaseDto) {
    return this.service.createCase(dto);
  }

  @Patch('cases/:caseId/status')
  updateStatus(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateKycRiskCaseStatusDto,
  ) {
    return this.service.updateStatus(caseId, dto);
  }

  @Get('rules')
  listRules() {
    return this.service.listRules();
  }

  @Get('risk-profiles')
  listRiskProfiles() {
    return this.service.listRiskProfiles();
  }

  @Get('risk-profiles/:userId')
  getRiskProfile(@Param('userId') userId: string) {
    return this.service.getRiskProfile(userId);
  }

  @Post('risk-profiles/assess')
  assessUserRisk(@Body() dto: AssessUserRiskDto) {
    return this.service.assessUserRisk(dto);
  }

  @Get('risk-matrix')
  riskMatrix() {
    return this.service.riskMatrix();
  }
}
