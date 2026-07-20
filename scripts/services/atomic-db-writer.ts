/**
 * Atomic Database Writer
 * Safely writes db.json with atomic transactions
 * Preserves existing db.json if write fails
 */

import fs from 'fs';
import path from 'path';

export interface DatabaseSchema {
  meta: {
    schemaVersion: number;
    season: string;
    source: 'fpl';
    syncedAt: string;
    publicDataSynced: boolean;
    managerDataSynced: boolean;
    managerId: number | null;
    dataQualityStatus: 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN';
    // Gameweek state snapshot
    currentGameweekId: number | null;
    nextGameweekId: number | null;
    lastFinishedGameweekId: number | null;
    totalGameweeks: number;
  };
  teams: any[];
  players: any[];
  gameweeks: any[];
  elementTypes: any[];
  fixtures: any[];
  manager?: any;
  managerHistory?: any[];
  picks?: Record<number, any>;
  transfers?: any[];
  leagues?: any[];
}

export class AtomicDbWriter {
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Atomically write database
   * Writes to temporary file first, then replaces original
   */
  async write(db: DatabaseSchema): Promise<void> {
    const tempPath = `${this.dbPath}.tmp`;
    const backupPath = `${this.dbPath}.backup`;

    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to temporary file
      fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');

      // Verify the temp file can be read and is valid JSON
      const verification = fs.readFileSync(tempPath, 'utf-8');
      JSON.parse(verification);

      // Backup existing db if it exists
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, backupPath);
      }

      // Replace original with temp
      fs.renameSync(tempPath, this.dbPath);

      // Clean up backup (successful write)
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
    } catch (error) {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      // Restore from backup if it exists
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, this.dbPath);
        fs.unlinkSync(backupPath);
      }

      throw new Error(
        `Failed to write database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Read existing database
   */
  read(): DatabaseSchema | null {
    if (!fs.existsSync(this.dbPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if database exists
   */
  exists(): boolean {
    return fs.existsSync(this.dbPath);
  }
}
