# P2P Network System

This directory contains the Peer-to-Peer (P2P) network functionality for the Anon Dealer application. The P2P system allows dealers to connect directly with each other, share inventory privately, and place orders without going through a central server.

## 🏗️ Architecture

The P2P system follows Domain-Driven Design (DDD) principles and is completely separate from the existing application functionality.

### Directory Structure

```
src/p2p/
├── domain/                    # Domain layer
│   ├── models/               # Domain models
│   │   └── Peer.ts          # Core P2P entities
│   └── services/            # Domain services
│       └── PeerService.ts   # Core business logic
├── application/              # Application layer
│   ├── commands/            # Command handlers
│   │   └── PeerCommand.ts   # P2P operations
│   └── services/            # Application services
│       └── P2PService.ts    # Main P2P service
├── infrastructure/          # Infrastructure layer
│   ├── repositories/        # Data persistence
│   ├── communication/       # WebRTC communication
│   ├── signaling/          # Signaling server
│   └── database/           # Database setup
└── presentation/           # Presentation layer
    ├── components/         # Vue components
    └── pages/             # Vue pages
```

## 🚀 Features

### Core Functionality

1. **Peer Identity Management**
   - Create unique peer identities
   - Generate cryptographic key pairs
   - Manage peer status (online/offline)

2. **Invitation System**
   - Generate invitation codes for peer connections
   - Accept invitations to establish connections
   - Set access levels (view, order, manage)
   - Expiration-based invitations

3. **Selective Item Visibility**
   - Public items (visible to all peers)
   - Private items (visible to selected peers)
   - Customer-only items (visible to connected peers)
   - Granular access control

4. **P2P Ordering**
   - Create orders between connected peers
   - Order status management
   - Real-time order updates via WebRTC
   - Order history and tracking

5. **WebRTC Communication**
   - Direct peer-to-peer connections
   - Encrypted data channels
   - Real-time messaging
   - NAT traversal support

## 🔧 Technical Implementation

### Domain Models

- **Peer**: Represents a peer in the network
- **PeerConnection**: Manages connections between peers
- **PeerInvitation**: Handles invitation codes and access control
- **ItemVisibility**: Controls item sharing permissions
- **P2POrder**: Manages peer-to-peer orders

### Data Persistence

All P2P data is encrypted and stored in IndexedDB using the existing JsStore setup. The system uses separate tables to avoid conflicts with the main application.

### WebRTC Integration

- **Signaling Server**: WebSocket-based server for peer discovery
- **STUN/TURN Servers**: For NAT traversal
- **Data Channels**: Encrypted communication between peers
- **Connection Management**: Automatic reconnection and cleanup

## 🎯 Usage

### Basic Setup

```typescript
import { P2PService } from '@/p2p';

// Initialize P2P service
const p2pService = P2PService.getInstance();
await p2pService.initialize('ws://localhost:8080');

// Create peer identity
const peer = await p2pService.createPeer('My Dealer Name');
```

### Creating Invitations

```typescript
// Create invitation with view access
const invitationCode = await p2pService.createInvitation('view', 24);

// Share invitation code with another peer
console.log(`Invitation Code: ${invitationCode}`);
```

### Accepting Invitations

```typescript
// Accept invitation from another peer
const connection = await p2pService.acceptInvitation('AD-7X9K-2M4P');
console.log('Connected to peer:', connection);
```

### Managing Item Visibility

```typescript
// Make item public
await p2pService.setItemVisibility('item_123', 'public', [], 'view');

// Make item private to specific peers
await p2pService.setItemVisibility('item_456', 'private', ['peer_2', 'peer_3'], 'order');

// Share item with specific peer
await p2pService.shareItemWithPeer('item_789', 'peer_4');
```

### Creating P2P Orders

```typescript
// Create order with another peer
const order = await p2pService.createP2POrder(
  'peer_2',           // Target peer
  'item_123',         // Item ID
  5,                  // Quantity
  29.99,              // Price
  'Rush delivery'     // Notes
);
```

## 🔒 Security Features

### Encryption
- All data is encrypted using AES-ECB encryption
- Peer communications are encrypted end-to-end
- Invitation codes are cryptographically secure

### Access Control
- Granular permission system (view, order, manage)
- Peer-specific item visibility
- Connection-based access control

### Privacy
- No central server stores sensitive data
- Direct peer-to-peer communication
- Selective data sharing

## 🌐 Network Architecture

### Signaling Server
The signaling server facilitates peer discovery and initial connection setup:

```typescript
import { startSignalingServer } from '@/p2p';

// Start signaling server
const server = startSignalingServer(8080);
```

### WebRTC Configuration
```typescript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

## 📱 UI Components

### P2P Dashboard
- Overview of peer status and connections
- Quick actions for creating invitations
- Statistics and recent activity

### P2P Items
- Manage item visibility settings
- Share items with specific peers
- Control access levels

### P2P Orders
- Create and manage P2P orders
- Track order status
- View order history

## 🔄 Integration with Existing App

The P2P system is designed to be completely separate from the existing application:

1. **Separate Database Tables**: Uses dedicated P2P tables
2. **Independent UI**: Separate pages and components
3. **Isolated Business Logic**: No interference with existing functionality
4. **Optional Feature**: Can be enabled/disabled without affecting core app

## 🚀 Getting Started

1. **Start Signaling Server** (optional, for production):
   ```bash
   npm run start-signaling-server
   ```

2. **Access P2P Features**:
   - Navigate to `/p2p` for the main dashboard
   - Use `/p2p/items` to manage item visibility
   - Use `/p2p/orders` to handle P2P orders

3. **Create Peer Identity**:
   - Click "Create Peer Identity" on the P2P dashboard
   - Enter a unique name for your peer

4. **Connect with Other Peers**:
   - Create an invitation and share the code
   - Or accept an invitation from another peer

## 🛠️ Development

### Adding New Features
1. Create domain models in `domain/models/`
2. Add business logic in `application/commands/`
3. Create UI components in `presentation/components/`
4. Update routing in `router/index.ts`

### Testing
- Use the P2P dashboard to test peer creation
- Test invitation system with multiple browser tabs
- Verify WebRTC connections work correctly

## 📋 TODO

- [ ] Add peer discovery via signaling server
- [ ] Implement file sharing for inventory images
- [ ] Add peer reputation system
- [ ] Create P2P chat functionality
- [ ] Add order dispute resolution
- [ ] Implement peer backup/restore
- [ ] Add P2P analytics and reporting

## 🤝 Contributing

When adding new P2P features:
1. Follow DDD principles
2. Keep P2P system separate from main app
3. Add proper TypeScript types
4. Include error handling
5. Update this README

## 📄 License

This P2P system is part of the Anon Dealer project and follows the same license terms.
