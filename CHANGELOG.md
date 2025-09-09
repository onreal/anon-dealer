# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-09

### Added
- **Core Business Management**
  - Inventory management with stock tracking
  - Order processing and payment status tracking
  - Customer management with soft delete protection
  - Financial reports and analytics
  - Multi-language support (English, Greek)

- **Privacy & Security**
  - Local data storage using IndexedDB
  - End-to-end encryption with personal PIN
  - Complete offline functionality
  - No external server dependencies
  - Anonymous operation mode

- **P2P Network Features**
  - Peer-to-peer item sharing
  - Decentralized order processing
  - WebRTC-based communication
  - Network discovery and connection management

- **User Experience**
  - Dark/Light mode toggle
  - Responsive design for all devices
  - Modern UI with Element Plus components
  - Real-time data synchronization
  - Intuitive navigation and workflows

- **Technical Architecture**
  - Vue.js 3 with Composition API
  - SCSS modular architecture
  - TypeScript support
  - Vite build system
  - Component-based design

### Technical Details
- **Frontend**: Vue.js 3, Element Plus, Vue Router
- **Database**: IndexedDB with JsStore
- **Encryption**: jsstore-encrypt plugin
- **Styling**: SCSS with CSS variables and mixins
- **Build**: Vite with TypeScript support
- **P2P**: WebRTC for peer connections

### Security Features
- PIN-based data encryption
- Local-only data storage
- No user tracking or analytics
- Open source for transparency
- Privacy-first design principles

## [0.2.1] - 2024-01-08

### Fixed
- Login functionality restoration
- P2P navigation issues
- Dark theme implementation
- Logo display problems
- SCSS compilation setup

### Changed
- Migrated from inline CSS to SCSS architecture
- Improved component organization
- Enhanced error handling
- Updated build process

## [0.2.0] - 2024-01-07

### Added
- P2P network functionality
- Peer-to-peer item sharing
- Decentralized order processing
- WebRTC communication
- P2P dashboard and management

### Changed
- Updated architecture for P2P support
- Enhanced data models
- Improved UI components

## [0.1.0] - 2024-01-06

### Added
- Initial release
- Basic inventory management
- Customer management
- Order processing
- Financial reporting
- Multi-language support
- Dark/Light mode
- Local data storage
- Encryption system

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
