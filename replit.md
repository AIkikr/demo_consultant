# Overview

This is an AI consultant application called "InsightSmith" that provides interactive chat and voice-based consulting in three different modes: Guide (gentle support), Socrates (question-driven), and Hard (critical evaluation). The application features a modern React frontend with voice recording capabilities and an Express.js backend that integrates with OpenAI's GPT and Whisper APIs for chat responses and voice transcription.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Voice Features**: Custom hooks for voice recording (`useVoiceRecording`) and audio playback (`useAudioPlayback`) using Web APIs

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Setup**: Development server with Vite integration for hot module replacement
- **API Structure**: RESTful API with endpoints for chat sessions, voice processing, and health checks
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Storage**: In-memory storage implementation (`MemStorage`) for development, with interface designed for easy database migration

## Core Features
- **Multi-Mode Consulting**: Three distinct AI personality modes (Guide, Socrates, Hard) with different interaction styles
- **Voice Integration**: Voice recording, transcription via OpenAI Whisper, and text-to-speech responses
- **Session Management**: Persistent chat sessions with message history and mode switching
- **Real-time Audio**: Audio level visualization during recording and playback controls

## Data Schema
- **Users**: Basic user management with username/password authentication
- **Chat Sessions**: Session-based conversations with mode tracking and message history stored as JSON
- **Voice Interactions**: Audio transcription and language detection storage
- **Message Structure**: Structured chat messages with role-based content (user/assistant)

## External Dependencies

- **OpenAI Integration**: GPT-4o for chat responses and Whisper for voice transcription/speech generation
- **Database**: Drizzle ORM configured for PostgreSQL with Neon Database serverless adapter
- **Authentication**: Session-based authentication using connect-pg-simple for PostgreSQL session storage
- **UI Framework**: Comprehensive component library including forms, dialogs, tooltips, and data visualization components
- **Development Tools**: Replit-specific plugins for development environment integration and error handling