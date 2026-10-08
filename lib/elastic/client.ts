import { Client } from "@elastic/elasticsearch";
import { env, isElasticConfigured } from "@/lib/config/env";

/**
 * Server-only singleton Elasticsearch Serverless client.
 * Strictly guarantees that API keys and endpoint credentials are never passed to the browser.
 */

let elasticClientInstance: Client | null = null;

export function getElasticClient(): Client | null {
  if (!isElasticConfigured()) {
    return null;
  }

  if (!elasticClientInstance) {
    try {
      elasticClientInstance = new Client({
        node: env.elasticsearchUrl,
        auth: {
          apiKey: env.elasticsearchApiKey,
        },
        maxRetries: 2,
        requestTimeout: 6000,
      });
    } catch {
      console.warn(
        "[Elasticsearch Client] Initialization error. Running in resilient memory fallback mode."
      );
      elasticClientInstance = null;
    }
  }

  return elasticClientInstance;
}

/**
 * Safe liveness check for Elasticsearch Serverless cluster.
 */
export async function isElasticAvailable(): Promise<boolean> {
  const client = getElasticClient();
  if (!client) {
    return false;
  }

  try {
    const health = await client.ping();
    return Boolean(health);
  } catch {
    return false;
  }
}

/**
 * Retrieves cluster diagnostic metadata safely without leaking secrets.
 */
export async function getElasticClusterInfo(): Promise<{
  connected: boolean;
  clusterName?: string;
  version?: string;
  error?: string;
}> {
  const client = getElasticClient();
  if (!client) {
    return {
      connected: false,
      error: "Elasticsearch credentials not configured in environment.",
    };
  }

  try {
    const info = await client.info();
    return {
      connected: true,
      clusterName: info.cluster_name || "payvia-serverless-cluster",
      version: info.version?.number || "Serverless Vector",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection error";
    return {
      connected: false,
      error: `Elasticsearch unreachable: ${message}`,
    };
  }
}

export { isElasticConfigured };
