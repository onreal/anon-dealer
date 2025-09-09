import { P2PDatabase } from '../../infrastructure/database/P2PDatabase';
import { P2PService } from './P2PService';
import { useP2PConfig } from '../../../composables/P2PConfig';

export class P2PInitializer {
  private static instance: P2PInitializer;
  private isInitialized: boolean = false;
  private p2pConfig = useP2PConfig();

  private constructor() {}

  static getInstance(): P2PInitializer {
    if (!P2PInitializer.instance) {
      P2PInitializer.instance = new P2PInitializer();
    }
    return P2PInitializer.instance;
  }

  async initialize(configuration?: any, settings?: any): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load P2P configuration
      if (configuration) {
        await this.p2pConfig.loadFromConfiguration(configuration);
      }
      if (settings) {
        await this.p2pConfig.loadFromSettings(settings);
      }

      // Check if P2P is enabled
      if (!this.p2pConfig.isP2PEnabled.value) {
        console.log('P2P is disabled, skipping initialization');
        return;
      }

      // Initialize P2P database
      const p2pDatabase = P2PDatabase.getInstance();
      await p2pDatabase.initialize();

      // Initialize P2P service
      const p2pService = P2PService.getInstance();
      await p2pService.initialize();

      this.isInitialized = true;
      console.log('P2P System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize P2P system:', error);
      // Don't throw error to prevent app from breaking
      console.warn('P2P system will be disabled due to initialization error');
    }
  }

  isP2PInitialized(): boolean {
    return this.isInitialized;
  }
}
