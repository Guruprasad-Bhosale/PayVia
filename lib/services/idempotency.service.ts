import crypto from "node:crypto";
import { idempotencyRepo } from "@/lib/repositories";
import { IdempotencyRecord } from "@/lib/domain/types";

export class IdempotencyService {
  /**
   * Generates a deterministic hash of the incoming request body
   */
  hashRequest(body: unknown): string {
    const serialized = typeof body === "string" ? body : JSON.stringify(body || {});
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Checks if an idempotent operation was already completed for this key and scope.
   */
  async getExistingRecord(key: string, scope: string): Promise<IdempotencyRecord | null> {
    if (!key) return null;
    return idempotencyRepo.get(key, scope);
  }

  /**
   * Persists an idempotent response with a default 24h TTL.
   */
  async saveRecord(
    key: string,
    scope: string,
    requestHash: string,
    statusCode: number,
    responseBody: unknown,
    ttlHours: number = 24
  ): Promise<void> {
    if (!key) return;
    const expiresAt = new Date(Date.now() + ttlHours * 3600000).toISOString();
    const record: IdempotencyRecord = {
      key,
      scope,
      requestHash,
      statusCode,
      responseBody: typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    await idempotencyRepo.save(record);
  }
}

export const idempotencyService = new IdempotencyService();
