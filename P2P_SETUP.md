# P2P Network Setup Guide

This guide explains how to set up and configure the P2P (Peer-to-Peer) network functionality in Anon Dealer.

## Overview

The P2P network allows Anon Dealer users to connect directly with each other for secure, decentralized business transactions and communication. This is achieved through:

- **Signaling Server**: A separate server that helps peers discover and connect to each other
- **WebRTC**: Direct peer-to-peer connections for secure communication
- **Local Storage**: P2P data is stored locally and encrypted

## Quick Start

### 1. Start the Signaling Server

The signaling server is a separate application that needs to be running for P2P connections to work.

```bash
# Navigate to the signaling server directory
cd ../anon-dealer-signaling-server

# Install dependencies
npm install

# Start the server
npm run dev
```

The signaling server will start on `http://localhost:8080` by default.

### 2. Configure P2P in Anon Dealer

During registration or in settings, you can configure P2P:

1. **Enable P2P Network**: Toggle to enable/disable P2P functionality
2. **Signaling Server URL**: Leave empty to use default (`http://localhost:8080`)
3. **P2P Network Room**: Room name for connections (default: `anon-dealer-network`)

### 3. Environment Configuration

Create a `.env` file in the Anon Dealer root directory:

```env
# Default Signaling Server Configuration
VITE_DEFAULT_SIGNALING_SERVER_URL=http://localhost:8080
VITE_DEFAULT_SIGNALING_SERVER_WS_URL=ws://localhost:8080

# P2P Configuration
VITE_P2P_ENABLED=true
VITE_P2P_DEFAULT_ROOM=anon-dealer-network
```

## Configuration Options

### Registration Form

During initial setup, you can configure:

- **Enable P2P Network**: Yes/No toggle
- **Signaling Server URL**: Custom server URL (optional)
- **P2P Network Room**: Room name for connections

### Settings Page

After registration, you can modify P2P settings:

- Update signaling server URL
- Change network room
- Test connection to signaling server
- Enable/disable P2P functionality

## How It Works

### 1. Peer Discovery

When P2P is enabled, the app:
1. Connects to the signaling server
2. Registers the peer in the specified room
3. Discovers other peers in the same room

### 2. WebRTC Connection

Once peers are discovered:
1. WebRTC offers/answers are exchanged through the signaling server
2. Direct peer-to-peer connection is established
3. All communication happens directly between peers

### 3. Data Storage

P2P data is stored locally in a separate IndexedDB database:
- Peer information
- P2P orders
- Connection history
- Item visibility settings

## Troubleshooting

### Common Issues

1. **P2P Not Working**
   - Check if signaling server is running
   - Verify signaling server URL in settings
   - Check browser console for errors

2. **Connection Failed**
   - Test connection using the "Test Connection" button in settings
   - Ensure signaling server is accessible
   - Check firewall settings

3. **Peers Not Discovered**
   - Verify both peers are in the same room
   - Check if P2P is enabled on both devices
   - Ensure signaling server is running

### Debug Mode

Enable debug logging by opening browser console. P2P-related logs will show:
- Connection status
- Peer discovery
- WebRTC connection events
- Error messages

## Security

- All P2P communication is encrypted using WebRTC
- Data is stored locally and encrypted with your PIN
- No sensitive data is sent to the signaling server
- The signaling server only facilitates peer discovery

## Production Deployment

For production use:

1. Deploy the signaling server to a public server
2. Update the default signaling server URL in environment variables
3. Consider using a TURN server for better connectivity
4. Monitor signaling server performance and availability

## API Reference

### P2P Configuration

```typescript
interface P2PConfiguration {
  isP2PEnabled: boolean
  signalingServerUrl: string
  signalingServerWsUrl: string
  p2pDefaultRoom: string
}
```

### Environment Variables

- `VITE_DEFAULT_SIGNALING_SERVER_URL`: Default HTTP URL for signaling server
- `VITE_DEFAULT_SIGNALING_SERVER_WS_URL`: Default WebSocket URL for signaling server
- `VITE_P2P_ENABLED`: Enable P2P by default (true/false)
- `VITE_P2P_DEFAULT_ROOM`: Default room name for P2P connections

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify signaling server is running and accessible
3. Test with default configuration first
4. Check network connectivity and firewall settings
