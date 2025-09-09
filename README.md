# Anon Dealer
Anon Dealers introduces a cutting-edge profit manager PWA application,
securing all data through encryption on local indexedDB storage for heightened confidentiality.

There are a lot of things to be done, but the main goal is to create a simple decentralized application
that can be used by anyone to manage their profits.

The main idea:

Anonymity: You are a seller, but you don't want to share your sales data (inventory ? what you sell ? who you sell ? profits ? )
with anyone, even if your device is taken by force unlocked, your data will still be safe,
since everything will be stored encrypted on your device.

Business: You are a seller, you want to know how much you have sold,
how much you have earned and how much you have spent for a particular item.

Management: You are a seller, you want to track your sales, clients, inventories, profits, and expenses. Import/Export data.

Intelligence: You want to know which item is the most profitable, forecasting, reports, analytics, etc.

Communication: P2P communication with WebRTC for seller and buyer to communicate without sharing personal data.

Orders: P2P Decentralized orders, no middleman, no fees, no restrictions, no censorship.

Payments: Support for cryptocurrencies real-time purchase and sale.

## 🚀 Features

### Core Business Management
- **Inventory Management** - Track products, stock levels, and pricing
- **Order Processing** - Handle customer orders and payments
- **Customer Management** - Maintain customer database with soft delete protection
- **Financial Reports** - Generate detailed business analytics
- **Multi-language Support** - English and Greek localization

### Privacy & Security
- **Local Data Storage** - All data stored on your device using IndexedDB
- **End-to-End Encryption** - All data encrypted with your personal PIN
- **No External Servers** - Complete offline functionality
- **Anonymous Operation** - No user tracking or data collection

### P2P Network (Optional)
- **Peer-to-Peer Trading** - Connect with other dealers for item sharing
- **Decentralized Orders** - Process orders without central servers
- **WebRTC Communication** - Direct peer connections for maximum privacy

### User Experience
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface built with Vue.js and Element Plus
- **Real-time Updates** - Instant data synchronization

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **UI Framework**: Element Plus
- **Database**: IndexedDB with JsStore
- **Encryption**: jsstore-encrypt plugin
- **Styling**: SCSS with CSS Variables
- **Build Tool**: Vite
- **P2P**: WebRTC for peer connections

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/anon-dealer.git
cd anon-dealer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### SCSS Development
```bash
# Watch SCSS files for changes
npm run build:css

# Compile SCSS for production
npm run build:css:prod
```

## 🎨 SCSS Architecture

The project uses a modular SCSS architecture:

```
src/assets/scss/
├── main.scss                 # Main entry point
├── utilities/
│   ├── _variables.scss      # CSS variables & colors
│   ├── _mixins.scss         # Reusable mixins
│   └── _reset.scss          # CSS reset & base styles
├── layout/
│   ├── _header.scss
│   ├── _navigation.scss
│   └── _footer.scss
├── components/
│   ├── authentication/
│   ├── dashboard/
│   ├── inventory/
│   ├── item/
│   ├── nav/
│   └── p2p/
└── pages/
    ├── _login.scss
    ├── _registration.scss
    ├── _dashboard.scss
    └── p2p/
```

## 🔧 Configuration

### Initial Setup
1. Run the application
2. Complete the registration process
3. Set your encryption PIN
4. Configure your business settings

### P2P Network (Optional)
1. Navigate to P2P section
2. Create or join a peer network
3. Share items with other dealers
4. Process decentralized orders

## 🔒 Security

- **PIN-based Encryption**: All data encrypted with your personal PIN
- **Local Storage Only**: No data leaves your device
- **No Tracking**: No analytics or user tracking
- **Open Source**: Full source code available for audit

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Documentation**: Check the wiki for detailed documentation

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced P2P features
- [ ] Plugin system
- [ ] Advanced reporting
- [ ] Multi-currency support
- [ ] API for integrations

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Element Plus for the UI components
- JsStore for local database functionality
- All contributors and community members

---

**Built with ❤️ for privacy-conscious business owners**
