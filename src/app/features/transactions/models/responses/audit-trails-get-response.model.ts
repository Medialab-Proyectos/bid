import { AuditTrailsContent, AuditTrailsHeader } from '../audit-trails.model';

export interface AuditTrailsGetResponse {
  header: AuditTrailsHeader;
  auditTrailsContent: AuditTrailsContent[];
}
