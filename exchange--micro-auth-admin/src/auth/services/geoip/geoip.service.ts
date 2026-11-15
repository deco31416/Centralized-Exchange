import { Injectable, Logger } from '@nestjs/common';

import geoip from 'geoip-lite';

@Injectable()
export class GeoIpService {
  private readonly logger = new Logger(GeoIpService.name);

  /**
   * Best-effort country detection from IP.
   * Returns ISO 3166-1 alpha-2 (e.g. "SV", "MX") or undefined.
   */
  lookupCountry(ipAddress: string | undefined): string | undefined {
    if (!ipAddress) return undefined;

    // Handle IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1)
    const ip = ipAddress.startsWith('::ffff:')
      ? ipAddress.slice('::ffff:'.length)
      : ipAddress;

    // Ignore localhost/private ranges (common in dev / proxies)
    if (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
    ) {
      return undefined;
    }

    try {
      const lookup = geoip.lookup(ip);
      const country = lookup?.country;
      return typeof country === 'string' && country.length === 2
        ? country.toUpperCase()
        : undefined;
    } catch (error) {
      this.logger.warn(`GeoIP lookup failed: ${String(error)}`);
      return undefined;
    }
  }
}
