# Contributing to Wisk

Thank you for your interest in contributing to Wisk! As an open-source project focused on simplicity and performance, we welcome contributions of all kinds.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/wisk.git`
3. Create a new branch: `git checkout -b feature-name`
4. Make your changes
5. Test your changes locally using a simple HTTP server:
    ```bash
    python -m http.server 8788     # Visit http://localhost:8788
    ```

## Development Guidelines

### Code Style

- Use vanilla JavaScript (ES6+)
- Follow existing code formatting
- Keep files focused and modular
- Add comments for complex logic
- Use meaningful variable and function names

### Plugin Development

- Prefer plugins to work offline, but its not a requirement
- Follow the plugin API documentation
- Properly comment your code
- Test thoroughly in offline mode

### Submitting Changes

1. Commit your changes: `git commit -m "Brief description of changes"`
2. Push to your fork: `git push origin feature-name`
3. Open a Pull Request
4. Describe your changes and their purpose
5. Link any related issues

### What We Accept

- Bug fixes
- Performance improvements
- New plugins
- Theme contributions
- Documentation improvements
- Feature enhancements
- And anything really!

## Need Help?

- Check existing [issues](https://github.com/sohzm/wisk/issues)
- Join our community discussions on [Discord](https://discord.gg/D8tQCvgDhu)
- Email me at hello@soham.sh

## License

By contributing to Wisk, you agree that your contributions will be licensed under the Functional Source License (FSL), Version 1.1. See [LICENSE.md](LICENSE.md).
