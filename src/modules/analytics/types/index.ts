/**
 * Analytics Types
 */

import type { PlayerAnalyticsRecord } from '@domain/models';

export type { PlayerAnalyticsRecord };

export interface AnalyticsViewType {
  id:
    'overview' | 'form' | 'value' | 'differentials' | 'fixtures' | 'shortlist' | 'transfer_targets';
  label: string;
  icon?: string;
}

export interface PlayerFilterConfig {
  position?: string;
  team?: string;
  priceMin?: number;
  priceMax?: number;
  ownershipMin?: number;
  ownershipMax?: number;
  minutesMin?: number;
  search?: string;
  sortBy?: 'overall' | 'form' | 'value' | 'differential' | 'fixtures' | 'name';
  sortOrder?: 'asc' | 'desc';
}
