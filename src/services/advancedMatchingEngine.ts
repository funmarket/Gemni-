/**
 * Legacy Service Adapter: AdvancedMatchingEngine
 * Re-routes all matching algorithms directly to canonical Domain 17 (d17_matching).
 */

export * from '@/domains/d17_matching';
import { AdvancedMatchingEngine } from '@/domains/d17_matching';
export default AdvancedMatchingEngine;
