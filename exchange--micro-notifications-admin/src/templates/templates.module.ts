import { Module } from '@nestjs/common';
import { HandlebarsTemplateRendererService } from './services/handlebars-template-renderer.service';

@Module({
  providers: [HandlebarsTemplateRendererService],
  exports: [HandlebarsTemplateRendererService],
})
export class TemplatesModule {}