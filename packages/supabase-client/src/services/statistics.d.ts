/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  totalMasjids: number;
  registeredUsers: number;
}
/**
 * Generated masjid mapping verification response.
 */
export interface MappingVerificationResult {
  generatedMasjidCount: number;
  discoverableGeneratedMasjidCount: number;
  linkedDisplayCount: number;
  violationCount: number;
  excludedGeneratedMasjidIds: string[];
  deterministicZoneCount: number;
  completedAt: string;
}
/**
 * Statistics service for fetching dashboard metrics
 */
export declare class StatisticsService {
  /**
   * Get dashboard statistics for admin users
   * Includes total masjids and registered users
   */
  static getDashboardStatistics(): Promise<DashboardStatistics>;
  /**
   * Build a typed verification summary for generated masjid → display mapping.
   */
  static getMappingVerificationResult(): Promise<MappingVerificationResult>;
}
//# sourceMappingURL=statistics.d.ts.map
