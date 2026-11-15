import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Common disposable email domains
const COMMON_DISPOSABLE_DOMAINS = [
    'yopmail.com',
    'temp-mail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'tempmail.com',
    '10minutemail.com',
    'getnada.com',
    'maildrop.cc',
    'trashmail.com',
];

@Injectable()
export class EmailDomainValidator {
    private readonly blockedDomains: Set<string>;
    private readonly isPolicyEnabled: boolean;
    private readonly isProduction: boolean;

    constructor(private readonly configService: ConfigService) {
        const customDomains = this.configService.get<string>('BLOCKED_DOMAINS', '');
        const customDomainsArray = customDomains
            .split(',')
            .map((d) => d.trim().toLowerCase())
            .filter((d) => d.length > 0);

        this.blockedDomains = new Set([
            ...COMMON_DISPOSABLE_DOMAINS,
            ...customDomainsArray,
        ]);

        this.isPolicyEnabled = this.configService.get<boolean>(
            'EMAIL_DOMAIN_POLICY_ENABLED',
            true,
        );

        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
        this.isProduction = nodeEnv === 'production';
    }

    /**
     * Validate email domain based on environment
     * Production: Block disposable domains
     * Development: Allow all
     */
    validate(email: string): { valid: boolean; reason?: string } {
        if (!this.isPolicyEnabled) {
            return { valid: true };
        }

        // In development, allow all domains
        if (!this.isProduction) {
            return { valid: true };
        }

        // Extract domain from email
        const domain = email.split('@')[1]?.toLowerCase();

        if (!domain) {
            return { valid: false, reason: 'Invalid email format' };
        }

        // Check if domain is blocked
        if (this.blockedDomains.has(domain)) {
            return {
                valid: false,
                reason: 'Disposable email addresses are not allowed',
            };
        }

        return { valid: true };
    }

    /**
     * Check if domain is disposable
     */
    isDisposable(email: string): boolean {
        const domain = email.split('@')[1]?.toLowerCase();
        return this.blockedDomains.has(domain);
    }
}
