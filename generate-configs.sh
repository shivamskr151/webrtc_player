#!/bin/bash

# Configuration Generation Script
# This script processes template files with environment variables

set -e

echo "🔧 Generating configuration files from templates..."

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  No .env file found, using default values"
fi

# Function to process template files
process_template() {
    local template_file="$1"
    local output_file="$2"
    
    if [ -f "$template_file" ]; then
        echo "   Processing $template_file -> $output_file"
        envsubst < "$template_file" > "$output_file"
    else
        echo "   ⚠️  Template file $template_file not found"
    fi
}

# Process nginx configurations
echo "🌐 Processing nginx configurations..."
process_template "nginx/nginx-simple.conf.template" "nginx/nginx-simple.conf"

# Process OME configuration
echo "📺 Processing OME configuration..."
process_template "ome_conf/Server.xml.template" "ome_conf/Server.xml"

# Process MediaMTX configuration
echo "📡 Processing MediaMTX configuration..."
process_template "mtx_conf/mediamtx.yml.template" "mtx_conf/mediamtx.yml"

# Generate frontend environment file
echo "🎨 Processing frontend configuration..."
if [ -f "frontend/.env" ]; then
    echo "   Frontend .env already exists, skipping generation"
else
    echo "   Creating frontend .env from template"
    cp frontend/env.example frontend/.env
fi

# Generate VITE_SIGNALING_URL based on environment
if [ "$SSL_ENABLED" = "true" ]; then
    VITE_SIGNALING_URL="wss://${DOMAIN:-localhost}:${OME_WEBRTC_WSS_PORT:-3334}/${APPLICATION_NAME:-app}/${STREAM_NAME:-camera_0051}"
else
    VITE_SIGNALING_URL="ws://${DOMAIN:-localhost}:${OME_WEBRTC_WS_PORT:-3333}/${APPLICATION_NAME:-app}/${STREAM_NAME:-camera_0051}"
fi

# Update frontend .env with dynamic values
if [ -f "frontend/.env" ]; then
    # Update VITE_SIGNALING_URL
    if grep -q "VITE_SIGNALING_URL=" frontend/.env; then
        sed -i.bak "s|VITE_SIGNALING_URL=.*|VITE_SIGNALING_URL=$VITE_SIGNALING_URL|" frontend/.env
    else
        echo "VITE_SIGNALING_URL=$VITE_SIGNALING_URL" >> frontend/.env
    fi
    
    # Update other frontend environment variables
    [ -n "$STUN_HOST" ] && sed -i.bak "s|VITE_STUN_HOST=.*|VITE_STUN_HOST=$STUN_HOST|" frontend/.env
    [ -n "$STUN_PORT" ] && sed -i.bak "s|VITE_STUN_PORT=.*|VITE_STUN_PORT=$STUN_PORT|" frontend/.env
    [ -n "$TURN1_HOST" ] && sed -i.bak "s|VITE_TURN1_HOST=.*|VITE_TURN1_HOST=$TURN1_HOST|" frontend/.env
    [ -n "$TURN1_PORT" ] && sed -i.bak "s|VITE_TURN1_PORT=.*|VITE_TURN1_PORT=$TURN1_PORT|" frontend/.env
    [ -n "$TURN1_USERNAME" ] && sed -i.bak "s|VITE_TURN1_USERNAME=.*|VITE_TURN1_USERNAME=$TURN1_USERNAME|" frontend/.env
    [ -n "$TURN1_PASSWORD" ] && sed -i.bak "s|VITE_TURN1_PASSWORD=.*|VITE_TURN1_PASSWORD=$TURN1_PASSWORD|" frontend/.env
    [ -n "$TURN2_HOST" ] && sed -i.bak "s|VITE_TURN2_HOST=.*|VITE_TURN2_HOST=$TURN2_HOST|" frontend/.env
    [ -n "$TURN2_PORT" ] && sed -i.bak "s|VITE_TURN2_PORT=.*|VITE_TURN2_PORT=$TURN2_PORT|" frontend/.env
    [ -n "$TURN2_USERNAME" ] && sed -i.bak "s|VITE_TURN2_USERNAME=.*|VITE_TURN2_USERNAME=$TURN2_USERNAME|" frontend/.env
    [ -n "$TURN2_PASSWORD" ] && sed -i.bak "s|VITE_TURN2_PASSWORD=.*|VITE_TURN2_PASSWORD=$TURN2_PASSWORD|" frontend/.env
    [ -n "$KEEPALIVE_INTERVAL" ] && sed -i.bak "s|VITE_KEEPALIVE_INTERVAL=.*|VITE_KEEPALIVE_INTERVAL=$KEEPALIVE_INTERVAL|" frontend/.env
    [ -n "$HEALTH_CHECK_INTERVAL" ] && sed -i.bak "s|VITE_HEALTH_CHECK_INTERVAL=.*|VITE_HEALTH_CHECK_INTERVAL=$HEALTH_CHECK_INTERVAL|" frontend/.env
    [ -n "$MAX_RECONNECT_ATTEMPTS" ] && sed -i.bak "s|VITE_MAX_RECONNECT_ATTEMPTS=.*|VITE_MAX_RECONNECT_ATTEMPTS=$MAX_RECONNECT_ATTEMPTS|" frontend/.env
    [ -n "$RECONNECT_DELAY" ] && sed -i.bak "s|VITE_RECONNECT_DELAY=.*|VITE_RECONNECT_DELAY=$RECONNECT_DELAY|" frontend/.env
    [ -n "$TIMEOUT" ] && sed -i.bak "s|VITE_TIMEOUT=.*|VITE_TIMEOUT=$TIMEOUT|" frontend/.env
    
    # Clean up backup files
    rm -f frontend/.env.bak
fi

echo "✅ Configuration generation complete!"
echo ""
echo "📋 Generated configurations:"
echo "   - nginx/nginx-simple.conf"
echo "   - ome_conf/Server.xml"
echo "   - mtx_conf/mediamtx.yml"
echo "   - frontend/.env"
echo ""
echo "🚀 You can now run: docker-compose up -d"
