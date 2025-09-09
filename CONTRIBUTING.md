# Contributing to Anon Dealer

Thank you for your interest in contributing to Anon Dealer! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Start SCSS compilation: `npm run build:css`

## 📝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include steps to reproduce
- Provide system information
- Include screenshots if applicable

### Suggesting Features
- Use the GitHub issue tracker
- Clearly describe the feature
- Explain the use case
- Consider implementation complexity

### Code Contributions
1. Create a feature branch from `main`
2. Make your changes
3. Follow the coding standards
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 🎨 Coding Standards

### SCSS Guidelines
- Use the existing SCSS architecture
- Follow BEM methodology for class names
- Use CSS variables from `_variables.scss`
- Include dark mode styles
- Add responsive design with mixins

### Vue.js Guidelines
- Use Composition API for new components
- Follow Vue.js style guide
- Use TypeScript for type safety
- Include proper error handling
- Add loading states where appropriate

### General Guidelines
- Write clear, self-documenting code
- Add comments for complex logic
- Follow existing naming conventions
- Keep functions small and focused
- Test your changes thoroughly

## 🧪 Testing

### Manual Testing
- Test all functionality in both light and dark modes
- Verify responsive design on different screen sizes
- Test with different browsers
- Verify P2P functionality if applicable

### Automated Testing
- Add unit tests for new functions
- Add integration tests for new features
- Ensure all tests pass before submitting

## 📚 Documentation

### Code Documentation
- Document complex functions
- Add JSDoc comments for public APIs
- Update README for new features
- Include usage examples

### SCSS Documentation
- Document new mixins and variables
- Add comments for complex styles
- Update style guide if needed

## 🔒 Security Considerations

- Never commit sensitive data
- Follow security best practices
- Consider privacy implications
- Test encryption functionality
- Verify no data leaks

## 🚫 What Not to Contribute

- Code that breaks existing functionality
- Changes that compromise privacy
- Features that require external servers
- Code without proper documentation
- Changes that break the build

## 📋 Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run `npm run build` to ensure no build errors
3. Run `npm run build:css:prod` to compile SCSS
4. Test your changes thoroughly
5. Update documentation if needed
6. Submit a pull request with a clear description

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Tested on mobile
- [ ] Tested P2P functionality (if applicable)

## Screenshots
Add screenshots if applicable

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No build errors
```

## 🏷️ Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release tag
4. Deploy to production

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Celebrate contributions

## 📞 Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community chat (if available)
- Contact maintainers for urgent issues

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to Anon Dealer! 🎉
