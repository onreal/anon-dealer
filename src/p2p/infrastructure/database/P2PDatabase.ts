import { Connection } from 'jsstore';
import { getP2PDatabase } from './P2PDatabaseConfig';

export class P2PDatabase {
  private static instance: P2PDatabase;
  private connection: Connection;
  private isInitialized: boolean = false;

  private constructor() {
    this.connection = new Connection(new Worker("jsstore.worker.js"));
  }

  static getInstance(): P2PDatabase {
    if (!P2PDatabase.instance) {
      P2PDatabase.instance = new P2PDatabase();
    }
    return P2PDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Open P2P database connection
      await this.connection.openDb(getP2PDatabase());

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize P2P database:', error);
      throw error;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}
