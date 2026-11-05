/**
 * Optional Supabase RemoteStore Adapter for DEEPER (§4.10, §5 M10).
 * Safely queries remote survivor leaderboard if Supabase credentials exist.
 * Automatically and silently falls back to LocalRemoteStore if offline or unconfigured.
 * Zero external libraries (uses native fetch).
 */

import { RemoteStore, SurvivorRecord, LocalRemoteStore } from './RemoteStore';

export class SupabaseRemoteStore implements RemoteStore {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private fallbackStore: LocalRemoteStore;

  constructor(
    supabaseUrl = '',
    supabaseAnonKey = '',
    fallbackStore = new LocalRemoteStore()
  ) {
    this.supabaseUrl = (supabaseUrl || '').trim();
    this.supabaseAnonKey = (supabaseAnonKey || '').trim();
    this.fallbackStore = fallbackStore;
  }

  public isConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  }

  async fetchTopSurvivors(limit = 10): Promise<readonly SurvivorRecord[]> {
    if (!this.isConfigured()) {
      return this.fallbackStore.fetchTopSurvivors(limit);
    }

    try {
      const endpoint = `${this.supabaseUrl}/rest/v1/survivors?select=*&order=depthReached.desc,runsSurvived.desc&limit=${limit}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return this.fallbackStore.fetchTopSurvivors(limit);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data as SurvivorRecord[];
      }
      return this.fallbackStore.fetchTopSurvivors(limit);
    } catch {
      return this.fallbackStore.fetchTopSurvivors(limit);
    }
  }

  async submitSurvivor(record: SurvivorRecord): Promise<boolean> {
    // Always persist to local fallback
    await this.fallbackStore.submitSurvivor(record);

    if (!this.isConfigured()) {
      return true;
    }

    try {
      const endpoint = `${this.supabaseUrl}/rest/v1/survivors`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(record),
      });

      return response.ok;
    } catch {
      // Offline fallback already stored locally
      return true;
    }
  }
}
