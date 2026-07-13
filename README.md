# DC5 Fantasy Hub

A production-ready frontend application built with React 19, Vite, and TypeScript with strict type checking.

## Tech Stack

- **React**: 19.x
- **Vite**: 5.x
- **TypeScript**: 5.5.x (Strict mode)
- **ESLint**: 9.x (Code quality)
- **Prettier**: 3.x (Code formatting)
- **npm**: Package manager

## Features

- ✅ React 19 with modern JSX transform
- ✅ Strict TypeScript configuration with strict mode enabled
- ✅ Production-optimized build process
- ✅ ESLint and Prettier for code quality and formatting
- ✅ Hot Module Replacement (HMR) for development
- ✅ Source maps for debugging
- ✅ Minified production builds with Terser
- ✅ Responsive design

## Quick Start

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

This runs TypeScript type checking and builds the optimized bundle to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on source files
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── App.tsx          # Main App component
├── App.css          # App styles
└── main.tsx         # React entry point

index.html          # HTML template
vite.config.ts      # Vite configuration
tsconfig.json       # TypeScript configuration
eslint.config.js    # ESLint configuration
.prettierrc          # Prettier configuration
package.json        # Dependencies and scripts
```

## TypeScript Configuration

This project uses **strict TypeScript** mode with all type checking options enabled:

- `strict: true` - Enables all strict type checking options
- `noImplicitAny: true` - Disallow implicit `any` types
- `strictNullChecks: true` - Enforce null/undefined checks
- `strictFunctionTypes: true` - Enforce strict function typing
- `noUnusedLocals: true` - Flag unused local variables
- `noUnusedParameters: true` - Flag unused function parameters
- `noImplicitReturns: true` - Require explicit returns in all code paths

## Development Standards

### Code Quality

- ESLint ensures consistent code style and catches common errors
- Prettier enforces consistent code formatting
- TypeScript provides static type safety

### Git Hooks (Optional)

Consider adding pre-commit hooks for linting and formatting:

```bash
npm install -D husky lint-staged
npx husky install
```

## Production Deployment

The build output is in the `dist/` directory. It contains:

- Optimized and minified JavaScript bundle
- Minified CSS
- Source maps for debugging

Deploy the `dist/` directory to your hosting platform.

### Example: Vercel

```bash
npm install -D vercel
vercel
```

### Example: Netlify

```bash
npm install -D netlify-cli
netlify deploy --prod --dir=dist
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Modern browsers supporting ES2023.

## Performance

- Code splitting via Vite
- Tree-shaking of unused code
- CSS minification
- JavaScript minification with Terser
- Source maps for debugging in production

## License

MIT

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   ```
4. Run type checking:
   ```bash
   npm run type-check
   ```
5. Build to ensure production build works:
   ```bash
   npm run build
   ```
6. Submit a pull request
