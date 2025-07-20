// RPC Performance Monitor
// Add this to your analytics to track when to upgrade

export interface RPCMetrics {
  responseTime: number;
  errorRate: number;
  dailyRequests: number;
  rateLimitHits: number;
}

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
