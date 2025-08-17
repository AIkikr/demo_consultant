# InsightSmith - AI Consultant Bot 🧠 💡

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.4-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Overview

InsightSmith is an advanced AI consultant application that provides interactive chat and voice-based consulting in three distinct personality modes. Built with modern web technologies and integrated with OpenAI's GPT-4 and Whisper APIs, it offers a comprehensive consulting experience with voice recording, transcription, and intelligent responses.

## 🌟 Features

### Three AI Consultant Modes
- **Guide Mode**: Gentle, supportive guidance for personal and professional development
- **Socrates Mode**: Question-driven approach that helps you discover insights through inquiry
- **Hard Mode**: Critical evaluation and direct feedback for challenging situations

### Voice Integration
- **Voice Recording**: High-quality audio capture with real-time level visualization
- **Speech Recognition**: OpenAI Whisper integration for accurate voice transcription
- **Audio Playback**: Built-in audio controls for reviewing conversations
- **Windows Microphone Compatibility**: Enhanced diagnostics and troubleshooting

### Advanced Features
- **Session Management**: Persistent chat sessions with complete message history
- **Transcript History**: Comprehensive tracking of all interactions (voice and text)
- **Search & Filter**: Find specific conversations and topics quickly
- **Custom Background Design**: Immersive AI consultant cards visible through interface gaps
- **Real-time Audio Visualization**: Visual feedback during recording and playback
- **Responsive Design**: Optimized for desktop and mobile experiences

## 🏗️ Architecture

### Frontend
- **React + TypeScript** with Vite for fast development
- **Wouter** for lightweight client-side routing
- **Shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for responsive styling
- **TanStack Query** for server state management

### Backend
- **Express.js** with TypeScript
- **OpenAI API** integration (GPT-4 + Whisper)
- **In-memory storage** for development (database-ready architecture)
- **Session-based authentication**
- **RESTful API design**

### Development Tools
- **Drizzle ORM** for database management
- **Replit** development environment
- **Hot Module Replacement** for instant updates

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.4 or higher
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AIkikr/demo_consultant.git
   cd demo_consultant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## 🎯 Usage

### Getting Started
1. Choose your preferred AI consultant mode (Guide, Socrates, or Hard)
2. Start a conversation using text or voice input
3. Switch between modes at any time to get different perspectives
4. Review your conversation history in the transcript panel

### Voice Features
- Click the microphone button to start recording
- Speak clearly for best transcription results
- View real-time audio levels during recording
- Access playback controls for reviewing conversations

### Session Management
- All conversations are automatically saved
- Switch between different chat sessions
- Search through your conversation history
- Filter by mode, date, or content type

## 🔧 Configuration

### OpenAI Settings
The application uses:
- **GPT-4** for intelligent responses
- **Whisper-1** for voice transcription
- Configurable model parameters for each consultant mode

### Development Environment
- Hot reload enabled for rapid development
- TypeScript strict mode for code quality
- ESLint and Prettier for consistent code formatting

## 🛠️ Development

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utility libraries
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   └── routes.ts          # API route definitions
├── shared/                # Shared types and schemas
└── docs/                  # Documentation
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript compiler
- `npm run lint` - Run ESLint

### Adding New Features
1. Define data schemas in `shared/schema.ts`
2. Implement storage interface in `server/storage.ts`
3. Create API routes in `server/routes.ts`
4. Build frontend components in `client/src/components/`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT and Whisper APIs
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/AIkikr/demo_consultant/issues) page
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

---

Built with ❤️ using modern web technologies