#!/bin/bash

# Anon Dealer Setup Script
# This script sets up and runs the Anon Dealer application

set -e  # Exit on any error

echo "🚀 Setting up Anon Dealer Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build CSS
print_status "Building CSS from SCSS..."
npm run build:css:prod

if [ $? -eq 0 ]; then
    print_success "CSS built successfully"
else
    print_warning "CSS build failed, but continuing..."
fi

# Check if signaling server should be started
print_status "Checking for signaling server setup..."

# Check if signaling server directory exists
if [ -d "../anon-dealer-signaling-server" ]; then
    print_status "Signaling server directory found"
    
    # Ask user if they want to start the signaling server
    echo -e "${YELLOW}Do you want to start the signaling server? (y/n):${NC}"
    read -r start_signaling
    
    if [[ $start_signaling =~ ^[Yy]$ ]]; then
        print_status "Starting signaling server..."
        cd ../anon-dealer-signaling-server
        
        # Install signaling server dependencies
        if [ ! -d "node_modules" ]; then
            print_status "Installing signaling server dependencies..."
            npm install
        fi
        
        # Start signaling server in background
        print_status "Starting signaling server on port 8080..."
        npm run dev &
        SIGNALING_PID=$!
        
        # Go back to main directory
        cd ../anon-dealer
        
        print_success "Signaling server started with PID: $SIGNALING_PID"
    else
        print_warning "Skipping signaling server startup"
    fi
else
    print_warning "Signaling server directory not found. P2P functionality will be limited."
fi

# Start the main application
print_status "Starting Anon Dealer application..."
print_status "The application will be available at: http://localhost:5173"
print_status "Press Ctrl+C to stop the application"

# Start the development server
npm run dev

# Cleanup function
cleanup() {
    print_status "Shutting down..."
    
    # Kill signaling server if it was started
    if [ ! -z "$SIGNALING_PID" ]; then
        print_status "Stopping signaling server..."
        kill $SIGNALING_PID 2>/dev/null || true
    fi
    
    print_success "Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM
