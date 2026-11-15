import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TemplateVariables, EmailTemplateResult, SmsTemplateResult, TemplateType } from '../types/template.types';

@Injectable()
export class HandlebarsTemplateRendererService {
  private readonly logger = new Logger(HandlebarsTemplateRendererService.name);
  private readonly templatesPath: string;
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private readonly configService: ConfigService) {
    this.templatesPath = path.join(process.cwd(), 'src', 'templates');
  }

  async renderEmailTemplate(
    templateName: string,
    variables: TemplateVariables,
  ): Promise<EmailTemplateResult> {
    const [namespace, name] = this.parseTemplateName(templateName);
    const templatePath = path.join(this.templatesPath, 'emails', namespace, `${name}.hbs`);

    this.logger.debug('Rendering email template', {
      template: templateName,
      variables: Object.keys(variables).reduce((acc, key) => {
        acc[key] = typeof variables[key] === 'string' ? variables[key] : typeof variables[key];
        return acc;
      }, {}),
    });

    try {
      const template = await this.getCompiledTemplate(templatePath);
      const enrichedVariables = this.enrichVariables(variables);
      const html = template(enrichedVariables);

      // Ensure proper HTML structure for email clients
      const finalHtml = this.wrapHtmlForEmail(html);

      return {
        subject: this.extractSubject(html, enrichedVariables),
        content: finalHtml,
        html: finalHtml,
      };
    } catch (error) {
      this.logger.error('Failed to render email template', {
        template: templateName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new NotFoundException(`Email template not found: ${templateName}`);
      }
      throw error;
    }
  }

  async renderSmsTemplate(
    templateName: string,
    variables: TemplateVariables,
  ): Promise<SmsTemplateResult> {
    const [namespace, name] = this.parseTemplateName(templateName);
    const templatePath = path.join(this.templatesPath, 'sms', namespace, `${name}.hbs`);

    try {
      const template = await this.getCompiledTemplate(templatePath);
      const enrichedVariables = this.enrichVariables(variables);
      const content = template(enrichedVariables);

      return {
        content: content.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to render SMS template', {
        template: templateName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new NotFoundException(`SMS template not found: ${templateName}`);
      }
      throw error;
    }
  }

  async validateTemplate(templateName: string, type: TemplateType): Promise<boolean> {
    const [namespace, name] = this.parseTemplateName(templateName);
    const extension = 'hbs';
    const templatePath = path.join(
      this.templatesPath,
      type === TemplateType.EMAIL ? 'emails' : 'sms',
      namespace,
      `${name}.${extension}`
    );

    try {
      await fs.access(templatePath);
      return true;
    } catch {
      return false;
    }
  }

  private parseTemplateName(templateName: string): [string, string] {
    const parts = templateName.split('.');
    if (parts.length !== 2) {
      throw new Error(`Invalid template name format: ${templateName}. Expected format: namespace.template-name`);
    }
    return [parts[0], parts[1]];
  }

  private async getCompiledTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    // Use template path as cache key
    const cacheKey = templatePath;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    this.logger.debug('Loading and compiling template', { templatePath });

    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateContent);
      
      // Cache the compiled template
      this.templateCache.set(cacheKey, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      throw error;
    }
  }

  private enrichVariables(variables: TemplateVariables): TemplateVariables {
    const enriched = { ...variables };

    // Add base URL if configured and not provided in variables
    const baseUrl = this.configService.get<string>('templates.baseUrl');
    if (baseUrl && !enriched.baseUrl) {
      enriched.baseUrl = baseUrl;
    }

    // Add current year for copyright notices
    enriched.currentYear = new Date().getFullYear();

    // Add default company/brand info
    enriched.companyName = enriched.companyName || 'Our Company';
    enriched.supportEmail = enriched.supportEmail || 'support@example.invalid';

    return enriched;
  }

  private wrapHtmlForEmail(html: string): string {
    // If already a complete HTML document, return as-is
    if (html.includes('<!DOCTYPE') && html.includes('<html')) {
      return html;
    }

    // Extract style content if present
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const styleContent = styleMatch ? styleMatch[1] : '';
    const bodyContent = styleMatch 
      ? html.replace(/<style>[\s\S]*?<\/style>/, '') 
      : html;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  ${styleContent ? `<style>${styleContent}</style>` : ''}
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  private extractSubject(html: string, variables: TemplateVariables): string {
    // Try to extract subject from HTML comments
    const commentMatch = html.match(/<!-- subject: (.*?) -->/i);
    if (commentMatch) {
      return this.processVariables(commentMatch[1], variables);
    }

    // Try to extract from title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      return this.processVariables(titleMatch[1], variables);
    }

    // Fallback
    return 'Notification';
  }

  private processVariables(template: string, variables: TemplateVariables): string {
    // Simple variable replacement for subject extraction
    return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const trimmedVarName = varName.trim();
      return variables[trimmedVarName] || match;
    });
  }
}