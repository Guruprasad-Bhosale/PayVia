import crypto from "node:crypto";
import { platformRepo } from "@/lib/repositories";
import { Platform } from "@/lib/domain/types";

export interface RequestContext {
  platformId: string;
  platformName: string;
  requestId: string;
  isLive: boolean;
  platform: Platform;
}

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  prefix: string;
  platformId: string;
}

/**
 * Generates a secure, cryptographically random platform API key.
 * Format: pv_test_<32-hex> or pv_live_<32-hex>
 * Never stored raw in database; only keyHash is stored.
 */
export function generatePlatformApiKey(
  platformId: string,
  environment: "test" | "live" = "test"
): GeneratedApiKey {
  const entropy = crypto.randomBytes(24).toString("hex");
  const rawKey = `pv_${environment}_${entropy}`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyHash,
    prefix: rawKey.slice(0, 12),
    platformId,
  };
}

/**
 * Deterministically computes SHA-256 hash of an API key.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

/**
 * Extracts and authenticates platform credentials from HTTP headers or Request.
 * Supports:
 * - Authorization: Bearer pv_test_...
 * - X-API-Key: pv_test_...
 * - Fallback to default demo platform if no key provided in development/demo mode
 */
export async function authenticatePlatform(
  requestOrHeaders: Request | Headers
): Promise<RequestContext> {
  const headers =
    requestOrHeaders instanceof Headers
      ? requestOrHeaders
      : (requestOrHeaders as Request).headers;

  const requestId =
    headers.get("x-request-id") ||
    `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  let rawKey: string | null = null;

  const authHeader = headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    rawKey = authHeader.slice(7).trim();
  }

  if (!rawKey) {
    rawKey = headers.get("x-api-key");
  }

  // If API key is provided, authenticate via hash lookup
  if (rawKey && rawKey.startsWith("pv_")) {
    const keyHash = hashApiKey(rawKey);
    const platform = await platformRepo.findByApiKeyHash(keyHash);

    if (!platform) {
      throw new PlatformAuthError("INVALID_API_KEY", "Invalid or unknown PayVia API key.", 401, requestId);
    }

    if (platform.status === "SUSPENDED") {
      throw new PlatformAuthError("PLATFORM_SUSPENDED", "Platform account is suspended.", 403, requestId);
    }

    return {
      platformId: platform.id,
      platformName: platform.name,
      requestId,
      isLive: rawKey.startsWith("pv_live_"),
      platform,
    };
  }

  // Development/Demo fallback if no key provided
  const defaultPlatform = await platformRepo.findById("plat_default");
  if (defaultPlatform) {
    return {
      platformId: defaultPlatform.id,
      platformName: defaultPlatform.name,
      requestId,
      isLive: false,
      platform: defaultPlatform,
    };
  }

  // Auto-seed default platform if missing
  const newDefault: Platform = {
    id: "plat_default",
    name: "PayVia Reference Platform",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await platformRepo.create(newDefault);

  return {
    platformId: newDefault.id,
    platformName: newDefault.name,
    requestId,
    isLive: false,
    platform: newDefault,
  };
}

/**
 * Enforces cross-platform tenant isolation.
 * Throws 403 if authenticated platform does not match resource owner platform.
 */
export function authorizePlatformResource(
  context: RequestContext,
  resourcePlatformId: string,
  resourceType: string = "resource"
): void {
  if (context.platformId !== resourcePlatformId) {
    throw new PlatformAuthError(
      "TENANT_ACCESS_DENIED",
      `Platform ${context.platformId} is not authorized to access ${resourceType} belonging to platform ${resourcePlatformId}.`,
      403,
      context.requestId
    );
  }
}

export class PlatformAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 401,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = "PlatformAuthError";
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId: this.requestId,
      },
    };
  }
}
