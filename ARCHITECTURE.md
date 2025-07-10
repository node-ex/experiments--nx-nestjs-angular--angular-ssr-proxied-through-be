# Architecture Overview

This repository contains a multi-application architecture demonstrating how to proxy requests to an Angular SSR (Server-Side Rendering) application through a NestJS backend, while also serving static files for another Angular application.

## Applications

### 1. app-nest-1 (NestJS Backend - Port 3000)

**Role**: Main backend server that acts as a reverse proxy and static file server.

**Key Features**:
- **Reverse Proxy**: Proxies requests to `app-angular-1` SSR server
- **Static File Server**: Serves built static files for `app-angular-2`
- **API Gateway**: Provides API endpoints under `/api` prefix

**Configuration**:
- **Port**: 3000 (configurable via `PORT` environment variable)
- **Global Prefix**: `/api` for all NestJS endpoints
- **Proxy Target**: `http://localhost:4000` (app-angular-1 SSR server)
- **Static Files**: Serves `app-angular-2` from `/app-angular-2` path

**Proxy Logic** (`main.ts`):
```typescript
app.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:4000',
    changeOrigin: true,
    followRedirects: true,
    pathFilter: (pathname: string) => {
      const excludedPaths = ['/api', '/app-angular-2'];
      return !excludedPaths.some(path => pathname.startsWith(path));
    },
  }),
);
```

**Static File Serving** (`app.module.ts`):
```typescript
ServeStaticModule.forRoot({
  rootPath: path.join(process.cwd(), 'dist', 'apps', 'app-angular-2', 'browser'),
  serveRoot: '/app-angular-2',
  serveStaticOptions: {
    setHeaders: (res: Response, url) => {
      res.set({ 'X-Custom-Header': 'app-angular-2' });
    },
  },
})
```

### 2. app-angular-1 (Angular SSR Application - Port 4000)

**Role**: Server-side rendered Angular application running on Express.js.

**Key Features**:
- **Server-Side Rendering**: Uses Angular Universal for SSR
- **Express Server**: Standalone Express server with Angular SSR engine
- **Static Asset Serving**: Serves its own static assets (CSS, JS, images)

**Configuration**:
- **Port**: 4000 (configurable via `PORT` environment variable)
- **SSR Engine**: `AngularNodeAppEngine` from `@angular/ssr/node`
- **Build Output**: `dist/apps/app-angular-1/`
- **Server Entry**: `src/server.ts`

**Server Implementation** (`server.ts`):
```typescript
const app = express();
const angularApp = new AngularNodeAppEngine();

// Serve static files from /browser
app.use(express.static(browserDistFolder, { maxAge: '1y' }));

// Handle all requests with Angular SSR
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => 
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});
```

**Access Pattern**:
- Direct access: `http://localhost:4000`
- Proxied access: `http://localhost:3000` (all paths except `/api` and `/app-angular-2`)
- **Docker access**: Can be containerized and run independently

### 3. app-angular-2 (Angular SPA - Static Files Only)

**Role**: Standard Angular Single Page Application served as static files.

**Key Features**:
- **Client-Side Rendering**: Traditional Angular SPA
- **Static Build**: Pre-built static files served by NestJS
- **Base Href**: Configured with `/app-angular-2/` base href for proper routing

**Configuration**:
- **Build Output**: `dist/apps/app-angular-2/browser/`
- **Base Href**: `/app-angular-2/`
- **Served By**: `app-nest-1` via `ServeStaticModule`

**Access Pattern**:
- **URL**: `http://localhost:3000/app-angular-2`
- **Served By**: NestJS static file middleware

## Request Flow Architecture

### 1. Requests to app-angular-1 (SSR)

```
Client Request → app-nest-1:3000 → Proxy Middleware → app-angular-1:4000 → SSR Response
```

**Flow Details**:
1. Client makes request to `http://localhost:3000/some-page`
2. NestJS receives request and checks path filters
3. Path doesn't match excluded paths (`/api`, `/app-angular-2`)
4. Request is proxied to `app-angular-1` at `http://localhost:4000`
5. Express server in `app-angular-1` processes request with Angular SSR
6. Server-rendered HTML is returned to client via proxy

### 2. Requests to app-angular-2 (Static)

```
Client Request → app-nest-1:3000 → ServeStaticModule → Static Files
```

**Flow Details**:
1. Client makes request to `http://localhost:3000/app-angular-2`
2. NestJS `ServeStaticModule` intercepts request
3. Static files served from `dist/apps/app-angular-2/browser/`
4. Client receives pre-built Angular SPA files

### 3. API Requests

```
Client Request → app-nest-1:3000/api → NestJS Controllers → API Response
```

**Flow Details**:
1. Client makes request to `http://localhost:3000/api/*`
2. NestJS routes request to appropriate controllers
3. API response returned directly (not proxied)

## Build and Deployment Process

### Build Commands

```bash
# Build app-angular-1 (SSR)
pnpm exec nx run app-angular-1:build

# Build app-angular-2 (Static with base href)
pnpm exec nx run app-angular-2:build --baseHref=/app-angular-2/

# Build app-nest-1
pnpm exec nx run app-nest-1:build
```

### Runtime Commands

```bash
# Start app-angular-1 SSR server
node ./dist/apps/app-angular-1/server/server.mjs

# Start app-nest-1 (proxy + static server)
pnpm exec nx run app-nest-1:serve
```

## Docker Containerization

### app-angular-1 SSR Container

The `app-angular-1` Angular SSR server can be containerized for production deployment.

**Container Features**:
- **Multi-stage build**: Optimized production image with minimal dependencies
- **Security**: Runs as non-root user (`angular:nodejs`)
- **Health checks**: Built-in health monitoring
- **Signal handling**: Proper Ctrl+C support with `--init` flag
- **No linting**: Build process excludes ESLint for faster builds

**Docker Configuration**:
- **Base Image**: `node:20-alpine`
- **Package Manager**: `pnpm`
- **Build Context**: Project root (for Nx workspace access)
- **Exposed Port**: 4000
- **Working Directory**: `/app`

**Build Scripts**:
```bash
# Build the Docker image
./scripts/docker/app-angular-1-ssr/build.sh

# Run the container interactively
./scripts/docker/app-angular-1-ssr/run.sh

# Stop and remove the container
./scripts/docker/app-angular-1-ssr/stop.sh
```

**Docker Commands**:
```bash
# Manual build
docker image build --tag app-angular-1-ssr:latest --file ./docker/app-angular-1-ssr/Dockerfile .

# Manual run (interactive)
docker container run --interactive --tty --rm --init --name app-angular-1-ssr-test --publish 4000:4000 app-angular-1-ssr:latest

# Manual run (detached)
docker container run --detach --name app-angular-1-ssr-test --publish 4000:4000 app-angular-1-ssr:latest
```

**Container Architecture**:
```
Multi-stage Build:
├── base: Dependencies + workspace setup
├── builder: Nx build process
└── production: Runtime with built assets
```

**Key Optimizations**:
- **Shared `nx.json`**: Uses original workspace configuration
- **No implicit dependencies**: Removed `app-nest-1` dependency for independent builds
- **Cached layers**: Docker layer caching for faster rebuilds
- **Production dependencies only**: Final image contains only runtime dependencies

## Key Technologies

- **NestJS**: Backend framework with dependency injection and modular architecture
- **Angular Universal**: Server-side rendering for Angular applications
- **Express.js**: Web server for Angular SSR application
- **http-proxy-middleware**: Reverse proxy middleware for NestJS
- **@nestjs/serve-static**: Static file serving module for NestJS
- **Nx**: Monorepo tooling and build system
- **Docker**: Containerization platform for app-angular-1 SSR server

## Benefits of This Architecture

1. **Unified Entry Point**: Single port (3000) for accessing all applications
2. **SEO Optimization**: SSR for `app-angular-1` improves search engine indexing
3. **Performance**: Static serving for `app-angular-2` provides fast loading
4. **Scalability**: Each application can be developed and deployed independently
5. **Development Experience**: Simplified local development with single entry point
6. **API Integration**: Centralized API layer through NestJS backend
7. **Containerization**: Docker support for app-angular-1 enables consistent deployment environments

## Development Workflow

### Traditional Development
1. **Development**: Each app can be developed independently on different ports
2. **Integration**: Use `app-nest-1` as the integration point for testing
3. **Production**: Deploy all three applications with `app-nest-1` as the main entry point

### Docker-Enhanced Development
1. **Development**: Develop apps locally using Nx serve commands
2. **Containerization**: Build and test `app-angular-1` in Docker container
3. **Integration**: Run containerized SSR server alongside local NestJS backend
4. **Production**: Deploy containerized `app-angular-1` with load balancing and scaling
