# OME + MediaMTX WebRTC Streaming Pipeline

A complete streaming solution that pulls RTMP streams from external sources via MediaMTX and delivers them as WebRTC streams through OvenMediaEngine (OME).

## Features

- 🚀 **Vite + TypeScript**: Fast development with modern tooling
- 🎥 **WebRTC Streaming**: Real-time video streaming with OME
- 📡 **MediaMTX Integration**: Pull external RTMP streams and forward to OME
- 🔄 **Auto-retry Logic**: Automatic reconnection with exponential backoff
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🐳 **Docker Ready**: Containerized for easy deployment
- 🔧 **Nginx Proxy**: Reverse proxy for production-ready setup
- 🎯 **Video-Only Stream**: Optimized for stability (audio bypassed)
- 🌐 **TURN Servers**: Multiple TURN servers for better connectivity

## Architecture

### Streaming Pipeline

```
External RTMP Source → MediaMTX → OME → WebRTC → Frontend
```

1. **External RTMP**: `rtmp://safetycaptain.arresto.in/camera_0051/0051`
2. **MediaMTX**: Pulls external stream and republishes locally
3. **OME**: Receives stream from MediaMTX and converts to WebRTC
4. **Frontend**: Displays WebRTC stream in browser

### Components

- **MediaMTX**: RTMP stream proxy and relay server
- **OvenMediaEngine**: WebRTC streaming server
- **React Frontend**: WebRTC player with modern UI
- **Nginx**: Reverse proxy and load balancer
- **Docker Compose**: Orchestrates all services

### Port Mappings

| Service | Internal Port | External Port | Environment Variable | Purpose |
|---------|---------------|---------------|---------------------|---------|
| Nginx HTTP | 80 | 80 | `NGINX_HTTP_PORT` | Frontend proxy |
| Nginx HTTPS | 443 | 443 | `NGINX_HTTPS_PORT` | Frontend proxy (secure) |
| Frontend | 3000 | 3000 | `FRONTEND_PORT` | React app (direct access) |
| MediaMTX API | 8888 | 8887 | `MEDIAMTX_API_PORT` | HTTP API |
| MediaMTX RTMP | 1935 | 1935 | `MEDIAMTX_RTMP_PORT` | RTMP input |
| MediaMTX RTSP | 8554 | 8554 | `MEDIAMTX_RTSP_PORT` | RTSP input |
| OME WebRTC | 3333 | 3333 | `OME_WEBRTC_WS_PORT` | WebRTC signaling |
| OME WebRTC TLS | 3334 | 3334 | `OME_WEBRTC_WSS_PORT` | WebRTC signaling (secure) |
| OME RTMP | 1938 | 1938 | `OME_RTMP_PORT` | RTMP input to OME |
| OME RTMP Pull | 1939 | 1939 | `OME_RTMP_PULL_PORT` | RTMP pull port |
| OME HTTPS | 8443 | 8443 | `OME_HTTPS_PORT` | HTTPS fallback |
| OME TURN | 3478 | 3478 | `OME_TURN_PORT` | TURN server |
| OME ICE | 40000-40010 | 40000-40010 | `OME_ICE_START_PORT`-`OME_ICE_END_PORT` | ICE candidates |
| OME ICE | 9000 | 9000 | `OME_ICE_ADDITIONAL_PORT` | Additional ICE candidate |

## Quick Start

### 1. Configure Your Environment

Choose your environment and copy the appropriate configuration:

```bash
# Copy the example file and modify as needed
cp .env.example .env
```

### 2. Customize Configuration

Edit the `.env` file with your specific values:

```bash
# Essential configuration
DOMAIN=your-domain.com
EMAIL=admin@your-domain.com
SSL_ENABLED=true

# Stream configuration
STREAM_SOURCE_URL=rtmp://your-stream-source.com/stream/path
STREAM_SOURCE_USERNAME=your_username
STREAM_SOURCE_PASSWORD=your_password
STREAM_NAME=your_stream_name

# TURN servers
TURN1_HOST=your-turn-server1.com
TURN1_USERNAME=your_turn1_username
TURN1_PASSWORD=your_turn1_password
```

### 3. Start the Complete Pipeline

```bash
# Make the startup script executable and run it
chmod +x start.sh
./start.sh
```

This will:
- Load environment variables
- Generate configuration files from templates
- Create necessary directories
- Start MediaMTX and OME services
- Set up the streaming pipeline
- Display connection information

### 4. Access the Stream

- **Frontend (via nginx)**: http://localhost (port 80) or https://localhost (port 443)
- **Frontend (direct)**: http://localhost:3000 (configurable via `FRONTEND_PORT`)
- **MediaMTX API**: http://localhost:8887 (configurable via `MEDIAMTX_API_PORT`)
- **WebRTC Stream**: http://localhost:3333/app/camera_0051 (configurable via `OME_WEBRTC_WS_PORT`)

## Dynamic Configuration System

This project uses a completely dynamic configuration system where all hardcoded values have been replaced with environment variables. This allows you to easily configure the application for different environments without modifying source code.

### Key Features

- **Environment-based configuration** - Different configs for local, staging, and production
- **Template-based generation** - Configuration files are generated from templates
- **Automatic SSL setup** - Easy domain and SSL certificate configuration
- **Flexible stream sources** - Configure any RTMP stream source
- **Customizable TURN servers** - Use your own TURN servers for better connectivity
- **Port flexibility** - All ports are configurable via environment variables

### Port Configuration

All ports are configurable through environment variables in the `.env` file. This allows you to:

- **Avoid port conflicts** - Change ports if they're already in use
- **Customize for different environments** - Use different ports for dev/staging/production
- **Meet security requirements** - Use non-standard ports for enhanced security
- **Scale horizontally** - Run multiple instances on different ports

**Example port customization:**
```bash
# Change frontend port from default 3000 to 8080
FRONTEND_PORT=8080

# Change MediaMTX API port from default 8887 to 9999
MEDIAMTX_API_PORT=9999

# Change OME WebRTC port from default 3333 to 4444
OME_WEBRTC_WS_PORT=4444
```

### Configuration Files

- `.env` - Main environment configuration
- `.env.example` - Environment configuration template
- `CONFIGURATION.md` - Detailed configuration documentation

For detailed configuration options, see [CONFIGURATION.md](CONFIGURATION.md).

### MediaMTX Configuration

The MediaMTX configuration is dynamically generated from `mtx_conf/mediamtx.yml.template` and configured to:
- Pull RTMP stream from configurable external source with authentication
- Forward stream to OME on demand (video only, no audio)
- Auto-restart on connection failures
- Use FFmpeg for stream processing
- All settings configurable via environment variables

### OME Server Configuration

The OME configuration is dynamically generated from `ome_conf/Server.xml.template` and configured for:
- WebRTC signaling on configurable ports (WS and WSS)
- ICE candidates on configurable port ranges
- Configurable TURN servers
- Live streaming application with configurable name
- Configurable stream name
- Video-only output (audio bypassed for stability)
- All settings configurable via environment variables

## Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- FFmpeg (included in MediaMTX container)
- Modern web browser with WebRTC support

### Local Development

1. **Start the streaming pipeline**:
   ```bash
   ./start.sh
   ```

2. **For frontend development** (optional):
   ```bash
   cd frontend
   npm install
   npm run dev
   # Access at http://localhost:3000 (configurable via vite.config.ts)
   ```
   
   **Note**: The production setup uses Docker with nginx proxy at http://localhost

3. **View logs**:
   ```bash
   # MediaMTX logs
   docker-compose logs -f mediamtx
   
   # OME logs
   docker-compose logs -f ovenmediaengine
   ```

### Production Deployment

1. **Build and start all services**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - Frontend (via nginx): http://localhost (port 80) or https://localhost (port 443)
   - Frontend (direct): http://localhost:3000 (configurable via `FRONTEND_PORT`)
   - MediaMTX API: http://localhost:8887 (configurable via `MEDIAMTX_API_PORT`)
   - OME Server: http://localhost:3333 (configurable via `OME_WEBRTC_WS_PORT`)
   - WebRTC Stream: http://localhost:3333/app/camera_0051

## Technology Stack

### Frontend
- **React 19.2.0**: Modern React with hooks
- **TypeScript 5.9.3**: Type safety and better development experience
- **Vite 7.1.7**: Fast build tool and development server
- **Tailwind CSS 3.4.18**: Utility-first CSS framework
- **Custom WebRTC Hook**: Optimized WebRTC connection management

### Backend Services
- **OvenMediaEngine**: WebRTC streaming server
- **MediaMTX**: RTMP stream proxy with FFmpeg integration
- **Nginx**: Reverse proxy and load balancer
- **Docker Compose**: Service orchestration

### Streaming Configuration
- **Input**: RTMP stream from external source
- **Processing**: FFmpeg for stream conversion (video-only)
- **Output**: WebRTC with multiple TURN servers
- **Protocols**: RTMP → WebRTC with ICE/TURN support

## API Reference

### useWebRTC Hook

```typescript
const { connectionState, videoRef, connect, disconnect, retry } = useWebRTC(config);
```

**Parameters:**
- `config`: WebRTCConfig object with signaling URL and ICE servers

**Returns:**
- `connectionState`: Current connection status and error information
- `videoRef`: React ref for the video element
- `connect`: Function to establish WebRTC connection
- `disconnect`: Function to close connection
- `retry`: Function to retry connection

### Connection States

- `disconnected`: No active connection
- `connecting`: Establishing connection
- `connected`: Successfully connected and streaming
- `error`: Connection failed with error details

## Performance Optimizations

### React Optimizations

- **useCallback**: Memoized functions to prevent unnecessary re-renders
- **useMemo**: Memoized configuration objects
- **useEffect**: Proper dependency arrays for effect management
- **Custom Hook**: Separated WebRTC logic for reusability

### WebRTC Optimizations

- **Multiple STUN Servers**: Fallback STUN servers for better connectivity
- **Connection State Monitoring**: Real-time connection state tracking
- **Automatic Retry**: Smart retry logic with exponential backoff
- **Resource Cleanup**: Proper cleanup of peer connections

### Build Optimizations

- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety and better IDE support
- **Tailwind CSS**: Utility-first CSS for smaller bundle size
- **Nginx**: Optimized production server with gzip and caching

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if OME server is running and accessible
2. **No Video**: Verify stream is being published to OME
3. **CORS Errors**: Ensure proper CORS configuration in OME
4. **ICE Connection Failed**: Check firewall and NAT configuration
5. **MediaMTX Stream Issues**: Check external RTMP source connectivity
6. **FFmpeg Errors**: Verify FFmpeg is available in MediaMTX container
7. **Port Conflicts**: Ensure required ports are available (configurable via environment variables)
8. **Authentication Issues**: Verify RTMP source credentials in MediaMTX config

### Debug Mode

Enable debug information by setting `NODE_ENV=development`. This shows:
- Signaling URL
- Connection status
- Error details
- Retry count

### Service Health Checks

```bash
# Check MediaMTX status (port configurable via MEDIAMTX_API_PORT)
curl http://localhost:8887/v3/config/global/get

# Check OME status (port configurable via OME_WEBRTC_WS_PORT)
curl http://localhost:3333/v1/stats/current

# Check MediaMTX API health
curl http://localhost:8887/v3/paths/list
```

### Log Analysis

```bash
# MediaMTX logs
docker-compose logs mediamtx | grep -i error

# OME logs
docker-compose logs ovenmediaengine | grep -i error

# FFmpeg logs (in MediaMTX)
docker-compose logs mediamtx | grep ffmpeg
```

## Project Structure

```
ome/
├── docker-compose.yml          # Main orchestration
├── start.sh                    # Startup script
├── README.md                   # This documentation
├── frontend/                   # React application
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks (useWebRTC)
│   │   ├── types/              # TypeScript definitions
│   │   └── App.tsx             # Main application
│   ├── dist/                   # Built assets
│   ├── Dockerfile              # Container build
│   ├── nginx.conf              # Frontend nginx config
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   └── env.example             # Environment template
├── nginx/                      # Nginx configurations
│   └── nginx-simple.conf       # Used by Docker Compose
├── mtx_conf/                   # MediaMTX configuration
│   └── mediamtx.yml            # Stream configuration
└── ome_conf/                   # OvenMediaEngine configuration
    └── Server.xml              # OME server config
```

## License

MIT License - see LICENSE file for details.
