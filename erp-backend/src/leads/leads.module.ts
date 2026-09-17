import { Module } from '@nestjs/common';

import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

import { LeadActivityController } from './lead-activity.controller';
import { LeadActivityService } from './lead-activity.service';

import { FollowUpController } from './follow-up.controller';
import { FollowUpService } from './follow-up.service';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [
    LeadsController,
    LeadActivityController,
    FollowUpController,
    ContactController,
  ],
  providers: [
    LeadsService,
    LeadActivityService,
    FollowUpService,
    ContactService,
  ],
})
export class LeadsModule {}