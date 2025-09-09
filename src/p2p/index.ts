// P2P System Entry Point
export { P2PService } from './application/services/P2PService';
export { P2PDatabase } from './infrastructure/database/P2PDatabase';
export { startSignalingServer } from './infrastructure/signaling/SignalingServer';

// Domain Models
export * from './domain/models/Peer';

// Repositories
export { PeerRepository } from './infrastructure/repositories/PeerRepository';
export { PeerConnectionRepository } from './infrastructure/repositories/PeerConnectionRepository';
export { PeerInvitationRepository } from './infrastructure/repositories/PeerInvitationRepository';
export { ItemVisibilityRepository } from './infrastructure/repositories/ItemVisibilityRepository';
export { P2POrderRepository } from './infrastructure/repositories/P2POrderRepository';

// Commands
export { PeerCommand } from './application/commands/PeerCommand';

// WebRTC Service
export { WebRTCService } from './infrastructure/communication/WebRTCService';

// UI Components
export { default as P2PDashboard } from './presentation/components/P2PDashboard.vue';
export { default as P2PItems } from './presentation/components/P2PItems.vue';
export { default as P2POrders } from './presentation/components/P2POrders.vue';

// Pages
export { default as P2PPage } from './presentation/pages/P2PPage.vue';
export { default as P2PItemsPage } from './presentation/pages/P2PItemsPage.vue';
export { default as P2POrdersPage } from './presentation/pages/P2POrdersPage.vue';
