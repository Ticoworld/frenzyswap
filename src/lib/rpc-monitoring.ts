import { Connection } from '@solana/web3.js';

// RPC Performance Monitor with robust connection management
export interface RPCMetrics {
  responseTime: number;
  errorRate: number;
  dailyRequests: number;
  rateLimitHits: number;
}

export interface RPCEndpoint {
  url: string;
  name: string;
  priority: number;
  timeout: number;
}

// Multiple RPC endpoints for fallback
const RPC_ENDPOINTS: RPCEndpoint[] = [
  {
    url: process.env.NEXT_PUBLIC_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/ZUsmi84dADObItR4SLt0z',
    name: 'Alchemy',
    priority: 1,
    timeout: 8000
  },
  {
    url: 'https://api.mainnet-beta.solana.com',
    name: 'Solana Public',
    priority: 2,
    timeout: 10000
  },
  {
    url: 'https://solana-api.projectserum.com',
    name: 'Serum',
    priority: 3,
    timeout: 12000
  },
  {
    url: 'https://rpc.ankr.com/solana',
    name: 'Ankr',
    priority: 4,
    timeout: 15000
  }
];

class RobustRPCManager {
  private connections: Map<string, Connection> = new Map();
  private failedEndpoints: Set<string> = new Set();
  private lastFailureTime: Map<string, number> = new Map();
  private readonly FAILURE_COOLDOWN = 60000; // 1 minute cooldown

  constructor() {
    // Initialize connections
    this.initializeConnections();
  }

  private initializeConnections() {
    RPC_ENDPOINTS.forEach(endpoint => {
      try {
        const connection = new Connection(endpoint.url, {
          commitment: 'confirmed',
          httpHeaders: {
            'Content-Type': 'application/json',
          },
          fetch: (url, options) => {
            // Add timeout to fetch requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            
            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          }
        });
        
        this.connections.set(endpoint.url, connection);
      } catch (error) {
        console.warn(`Failed to initialize RPC connection for ${endpoint.name}:`, error);
      }
    });
  }

  private isEndpointAvailable(url: string): boolean {
    if (!this.failedEndpoints.has(url)) return true;
    
    const lastFailure = this.lastFailureTime.get(url) || 0;
    const cooldownExpired = Date.now() - lastFailure > this.FAILURE_COOLDOWN;
    
    if (cooldownExpired) {
      this.failedEndpoints.delete(url);
      this.lastFailureTime.delete(url);
      return true;
    }
    
    return false;
  }

  private markEndpointAsFailed(url: string) {
    this.failedEndpoints.add(url);
    this.lastFailureTime.set(url, Date.now());
  }

  async getConnection(): Promise<Connection> {
    // Sort endpoints by priority and availability
    const availableEndpoints = RPC_ENDPOINTS
      .filter(endpoint => this.isEndpointAvailable(endpoint.url))
      .sort((a, b) => a.priority - b.priority);

    if (availableEndpoints.length === 0) {
      // If all endpoints are down, clear failures and try again
      console.warn('All RPC endpoints failed, resetting failure state');
      this.failedEndpoints.clear();
      this.lastFailureTime.clear();
      return this.connections.get(RPC_ENDPOINTS[0].url)!;
    }

    // Try each available endpoint
    for (const endpoint of availableEndpoints) {
      const connection = this.connections.get(endpoint.url);
      if (connection) {
        try {
          // Quick health check
          await Promise.race([
            connection.getSlot(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 3000)
            )
          ]);
          
          console.log(`Using RPC endpoint: ${endpoint.name}`);
          return connection;
        } catch (error) {
          console.warn(`RPC endpoint ${endpoint.name} failed health check:`, error);
          this.markEndpointAsFailed(endpoint.url);
          continue;
        }
      }
    }

    // Fallback to first connection if all health checks fail
    const fallbackConnection = this.connections.get(RPC_ENDPOINTS[0].url);
    if (fallbackConnection) {
      console.warn('Using fallback RPC connection without health check');
      return fallbackConnection;
    }

    throw new Error('No RPC connections available');
  }

  async executeWithFallback<T>(
    operation: (connection: Connection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const connection = await this.getConnection();
        const result = await operation(connection);
        
        // Success - record metrics
        this.trackSuccess();
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`RPC operation attempt ${attempt} failed:`, error);
        
        // Mark current connection as failed for timeout/connection errors
        if (error instanceof Error && 
            (error.message.includes('timeout') || 
             error.message.includes('ECONNABORTED') ||
             error.message.includes('Failed to fetch'))) {
          // We don't know which specific endpoint failed, so we'll let the health check handle it
        }
        
        this.trackError(error as Error);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('RPC operation failed after all retries');
  }

  private trackSuccess() {
    // Log successful RPC call
    if (process.env.NODE_ENV === 'development') {
      console.log('RPC Success');
    }
  }

  private trackError(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`RPC Error: ${error.message}`);
    }
    
    // Alert if rate limited
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.warn('🚨 RPC Rate Limited - Consider upgrading!');
    }
  }
}

// Global RPC manager instance
const rpcManager = new RobustRPCManager();

export function trackRPCPerformance() {
  const startTime = performance.now();
  
  return {
    recordSuccess: () => {
      const responseTime = performance.now() - startTime;
      // Log to analytics: successful RPC call
      console.log(`RPC Success: ${responseTime}ms`);
    },
    recordError: (error: Error) => {
      const responseTime = performance.now() - startTime;
      // Log to analytics: RPC error
      console.log(`RPC Error: ${error.message} (${responseTime}ms)`);
      
      // Alert if rate limited
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.warn('🚨 RPC Rate Limited - Consider upgrading!');
      }
    }
  };
}

// Export the robust RPC manager
export { rpcManager };
