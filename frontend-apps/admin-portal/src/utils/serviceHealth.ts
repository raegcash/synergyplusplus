/**
 * Service Health Check Utility
 * Verifies that required backend services are running before the app starts
 */

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  requiredFor: string;
  port: number;
}

export interface HealthCheckResult {
  allHealthy: boolean;
  services: ServiceStatus[];
  missingServices: ServiceStatus[];
}

const REQUIRED_SERVICES = [
  {
    name: 'Marketplace API',
    url: 'http://localhost:8085/api/marketplace/health',
    requiredFor: 'Product & Partner Management',
    port: 8085,
  },
  {
    name: 'Admin Identity Service',
    url: 'http://localhost:8082/actuator/health',
    requiredFor: 'Admin Authentication',
    port: 8082,
  },
];

/**
 * Check if a single service is healthy
 */
async function checkService(service: Omit<ServiceStatus, 'status'>): Promise<ServiceStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(service.url, {
      method: 'GET',
      signal: controller.signal,
      // Don't send credentials for health checks
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

    return {
      ...service,
      status: response.ok ? 'online' : 'offline',
    };
  } catch (error) {
    return {
      ...service,
      status: 'offline',
    };
  }
}

/**
 * Check all required services
 */
export async function checkAllServices(): Promise<HealthCheckResult> {
  const results = await Promise.all(
    REQUIRED_SERVICES.map(service => checkService(service))
  );

  const missingServices = results.filter(s => s.status === 'offline');

  return {
    allHealthy: missingServices.length === 0,
    services: results,
    missingServices,
  };
}

/**
 * Generate helpful error message for missing services
 */
export function generateServiceErrorMessage(result: HealthCheckResult): string {
  if (result.allHealthy) {
    return '';
  }

  const servicesList = result.missingServices
    .map(s => `  • ${s.name} (port ${s.port}) - Required for: ${s.requiredFor}`)
    .join('\n');

  return `⚠️ Required services are not running:\n\n${servicesList}\n\nPlease start the backend services first:\n  ./START-COMPLETE.sh\n\nOr if using Docker:\n  ./START-FULLSTACK.sh`;
}

/**
 * Format service status for display
 */
export function formatServiceStatus(service: ServiceStatus): string {
  const icon = service.status === 'online' ? '✅' : '❌';
  return `${icon} ${service.name} (${service.url})`;
}

