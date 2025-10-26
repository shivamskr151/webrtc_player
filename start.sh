#!/bin/bash

# OME + MediaMTX WebRTC Streaming Setup
# This script starts the complete streaming pipeline

echo "🚀 Starting OME + MediaMTX WebRTC Streaming Pipeline"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  No .env file found, using default values"
    echo "   Copy .env.example to .env and modify as needed"
fi

# Create necessary directories
echo "📁 Creating configuration directories..."
mkdir -p mtx_conf
mkdir -p ome_conf

# Generate configuration files from templates
echo "🔧 Generating configuration files..."
./generate-configs.sh

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📡 Stream Information:"
echo "   External RTMP Source: ${STREAM_SOURCE_URL:-rtmp://safetycaptain.arresto.in/camera_0051/0051}"
echo "   MediaMTX RTMP: rtmp://${DOMAIN:-localhost}:${MEDIAMTX_RTMP_PORT:-1935}/${STREAM_NAME:-camera_0051}"
if [ "$SSL_ENABLED" = "true" ]; then
    echo "   OME WebRTC: https://${DOMAIN:-localhost}:${OME_WEBRTC_WSS_PORT:-3334}/${APPLICATION_NAME:-app}/${STREAM_NAME:-camera_0051}"
else
    echo "   OME WebRTC: http://${DOMAIN:-localhost}:${OME_WEBRTC_WS_PORT:-3333}/${APPLICATION_NAME:-app}/${STREAM_NAME:-camera_0051}"
fi
echo ""
echo "🌐 Access Points:"
echo "   MediaMTX API: http://${DOMAIN:-localhost}:${MEDIAMTX_API_PORT:-8887}"
echo "   Frontend: http://${DOMAIN:-localhost}:${NGINX_HTTP_PORT:-80}"
if [ "$SSL_ENABLED" = "true" ]; then
    echo "   Frontend (HTTPS): https://${DOMAIN:-localhost}:${NGINX_HTTPS_PORT:-443}"
fi
echo ""
echo "🔧 To view logs:"
echo "   docker-compose logs -f mediamtx"
echo "   docker-compose logs -f ovenmediaengine"
echo "   docker-compose logs -f nginx"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
