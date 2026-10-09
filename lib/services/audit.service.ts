import { AuditActorType, AuditEvent, AuditEventType } from "@/lib/domain/types";
import { auditRepo } from "@/lib/repositories";

export class AuditService {
  /**
   * Logs an immutable audit event for a transaction.
   * Strips any private credential keys from metadata automatically.
   */
  async log(
    platformId: string,
    transactionId: string,
    actorType: AuditActorType,
    actorId: string,
    eventType: AuditEventType,
    metadata?: Record<string, unknown>
  ): Promise<AuditEvent> {
    // Sanitize metadata to guarantee zero secret leakage
    const cleanMeta: Record<string, unknown> = {};
    if (metadata) {
      for (const [key, val] of Object.entries(metadata)) {
        if (
          !key.toLowerCase().includes("secret") &&
          !key.toLowerCase().includes("key") &&
          !key.toLowerCase().includes("token") &&
          !key.toLowerCase().includes("password")
        ) {
          cleanMeta[key] = val;
        }
      }
    }

    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      platformId,
      transactionId,
      actorType,
      actorId,
      eventType,
      timestamp: new Date().toISOString(),
      metadata: Object.keys(cleanMeta).length > 0 ? cleanMeta : undefined,
    };

    return auditRepo.append(event);
  }

  async getTransactionAuditTrail(transactionId: string): Promise<AuditEvent[]> {
    return auditRepo.findByTransactionId(transactionId);
  }

  async getPlatformAuditTrail(platformId: string, limit?: number): Promise<AuditEvent[]> {
    return auditRepo.findByPlatformId(platformId, limit);
  }
}

export const auditService = new AuditService();
