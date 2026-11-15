import {
    BadGatewayException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, Method } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BaseHttpClientService {
    protected readonly logger = new Logger(BaseHttpClientService.name);
    constructor(
        protected readonly httpService: HttpService,
        protected readonly configService: ConfigService,
    ) { }

    protected joinUrl(baseUrl: string, path: string): string {
        const base = String(baseUrl || '').replace(/\/+$/, '');
        let nextPath = String(path || '');
        if (!nextPath.startsWith('/')) nextPath = '/' + nextPath;

        const prefixMatch = base.match(/\/(api\/v\d+)$/i);
        if (prefixMatch) {
            const prefix = '/' + prefixMatch[1];
            if (nextPath.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
                nextPath = nextPath.slice(prefix.length);
            } else if (nextPath.toLowerCase() === prefix.toLowerCase()) {
                nextPath = '';
            }
        }

        return base + nextPath;
    }

    protected async request<T>(options: {
        baseUrl: string;
        path: string;
        method?: Method;
        data?: unknown;
        headers?: Record<string, string>;
        timeout?: number;
        source: string;
        allow404?: boolean;
    }): Promise<T | null> {
        const {
            baseUrl,
            path,
            method = 'GET',
            data,
            headers,
            timeout = 15000,
            source,
            allow404 = false,
        } = options;

        const url = this.joinUrl(baseUrl, path);

        try {
            const response = await firstValueFrom(
                this.httpService.request<T>({
                    url,
                    method,
                    data,
                    timeout,
                    headers,
                    validateStatus: () => true,
                }),
            );

            if (response.status >= 200 && response.status < 300) {
                return response.data;
            }

            if (allow404 && response.status === 404) {
                return null;
            }

            if (response.status === 404) {
                throw new NotFoundException(`${source} endpoint not found: ${path}`);
            }

            if (response.status >= 500) {
                throw new ServiceUnavailableException(
                    `${source} service error (${response.status})`,
                );
            }

            throw new BadGatewayException({
                message: `${source} request failed`,
                statusCode: response.status,
                response: response.data,
            });
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadGatewayException ||
                error instanceof ServiceUnavailableException
            ) {
                throw error;
            }

            const axiosError = error as AxiosError;
            this.logger.error(
                `[${source}] ${method} ${url} failed: ${axiosError.message}`,
            );

            throw new InternalServerErrorException({
                message: `${source} request error`,
                error: axiosError.message,
            });
        }
    }

    protected buildInternalHeaders(extra: Record<string, string> = {}) {
        const internalToken =
            this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

        return {
            Authorization: `Bearer ${internalToken}`,
            'x-internal-auth': internalToken,
            'content-type': 'application/json',
            ...extra,
        };
    }

    protected feeFromRate(amount: number, rate: number): number {
        return Number((amount * rate).toFixed(2));
    }
}