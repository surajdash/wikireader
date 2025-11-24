# WikiReader

A privacy-first, Wikiwand-like reader for Wikipedia built as a Chrome extension.

## Overview

WikiReader is a Chrome extension that automatically transforms Wikipedia pages into a clean, distraction-free reading experience. It features a modern sidebar navigation, improved typography, and a dark mode option - all while respecting your privacy by processing everything locally.

## Features

- 🎨 **Clean Reading Interface** - Sidebar navigation with table of contents
- 🌓 **Dark Mode Support** - Easy on the eyes for night reading
- 🔒 **Privacy-First** - All processing happens locally, no data sent to external servers
- ⚡ **Fast & Lightweight** - Minimal overhead, instant page transformation
- 🎯 **Automatic Redirection** - Seamlessly redirects Wikipedia pages to reader view

## Installation

### From Source

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/wikireader.git
   cd wikireader
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the extension**

   ```bash
   pnpm build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` folder from the project directory

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint
```

### Development Workflow

The project uses a dual-build system:

1. **`vite.app.config.ts`** - Builds the React reader application (`reader.html`, `options.html`)
2. **`vite.ext.config.ts`** - Builds extension scripts (`background.js`, `contentScript.js`)

When running `pnpm dev`, the Vite dev server starts on `http://localhost:5175/`. Note that the extension's background script excludes localhost URLs from redirection to allow local development.

### Project Structure

```
wikireader/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main app component
│   │   ├── contexts/            # React contexts (Theme)
│   │   └── pages/
│   │       └── ReaderPage.tsx   # Main reader page component
│   └── main.tsx                 # React app entry point
├── background.ts                # Extension service worker
├── contentScript.ts             # Content script (banner injection)
├── manifest.json                # Chrome extension manifest
├── reader.html                  # Reader page HTML
├── options.html                 # Options page HTML
├── styles/
│   └── reader.css               # Reader page styles
├── assets/
│   └── icons/                   # Extension icons
├── vite.app.config.ts           # Vite config for React app
└── vite.ext.config.ts           # Vite config for extension scripts
```

## Architecture

### Extension Flow

1. **Background Script** (`background.ts`)
   - Listens for navigation to Wikipedia pages
   - Redirects to extension's reader view
   - Manages user preferences and blacklist

2. **Content Script** (`contentScript.ts`)
   - Injects a banner on Wikipedia pages
   - Provides option to open in WikiReader

3. **Reader Application** (`src/app/`)
   - React-based UI for displaying Wikipedia content
   - Fetches and sanitizes Wikipedia HTML
   - Generates table of contents from headings
   - Provides theme switching (light/dark)

### Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **DOMPurify** - HTML sanitization
- **Chrome Extension Manifest V3** - Extension platform

## Usage

Once installed, WikiReader automatically activates when you visit any Wikipedia page:

1. Navigate to any Wikipedia article (e.g., `https://en.wikipedia.org/wiki/JavaScript`)
2. The extension automatically redirects to the reader view
3. Use the sidebar to navigate between sections
4. Toggle dark mode using the theme switcher (if implemented)

### Manual Access

You can also manually open any Wikipedia page in reader view:

- Click the WikiReader icon in your browser toolbar
- Or use the banner that appears on Wikipedia pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Follow the existing code style
2. Run `pnpm lint` before committing
3. Test the extension thoroughly after changes
4. Update documentation as needed

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Wikiwand](https://www.wikiwand.com/)
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
