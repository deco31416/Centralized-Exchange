import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import {
  LimitEvaluationInput,
  LimitPrecheckInput,
  ReviewLimitPolicyRequestInput,
  UpdateLimitPolicyRuleInput,
} from './limits-policy.interfaces';
import { LimitsPolicyService } from './limits-policy.service';

@Controller('limits-policy')
@UseGuards(InternalAuthGuard)
export class LimitsPolicyController {
  constructor(private readonly service: LimitsPolicyService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('rules')
  listRules() {
    return this.service.listRules();
  }

  @Get('rules/:id')
  async getRule(@Param('id') id: string) {
    const rule = await this.service.getRule(id);
    if (!rule) {
      throw new NotFoundException(`Limit policy rule not found: ${id}`);
    }
    return rule;
  }

  @Get('changes')
  listChanges(@Query('limit') limit?: string) {
    return this.service.listChanges(Number(limit) || 20);
  }

  @Get('requests')
  listRequests(@Query('status') status?: string, @Query('limit') limit?: string) {
    return this.service.listRequests(status || 'PENDING', Number(limit) || 20);
  }

  @Post('rules/:id/requests')
  createRuleChangeRequest(
    @Param('id') id: string,
    @Body() body: UpdateLimitPolicyRuleInput,
    @Headers('x-admin-email') adminEmail?: string,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.service.createRuleChangeRequest(
      id,
      body,
      adminEmail || adminId || body.changedBy,
    );
  }

  @Patch('rules/:id')
  updateRule(
    @Param('id') id: string,
    @Body() body: UpdateLimitPolicyRuleInput,
    @Headers('x-admin-email') adminEmail?: string,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.service.updateRule(id, body, adminEmail || adminId || body.changedBy);
  }

  @Post('requests/:id/approve')
  approveRequest(
    @Param('id') id: string,
    @Body() body: ReviewLimitPolicyRequestInput,
    @Headers('x-admin-email') adminEmail?: string,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.service.approveRequest(
      id,
      body,
      adminEmail || adminId || body.reviewedBy,
    );
  }

  @Post('requests/:id/reject')
  rejectRequest(
    @Param('id') id: string,
    @Body() body: ReviewLimitPolicyRequestInput,
    @Headers('x-admin-email') adminEmail?: string,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.service.rejectRequest(
      id,
      body,
      adminEmail || adminId || body.reviewedBy,
    );
  }

  @Get('evaluate')
  evaluate(@Query() query: LimitEvaluationInput) {
    return this.service.evaluate(query);
  }

  @Post('precheck')
  precheck(@Body() body: LimitPrecheckInput) {
    return this.service.precheck(body);
  }
}
