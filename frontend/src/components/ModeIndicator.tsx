'use client';

import { ConversationMode } from '../lib/store';
import { Heart, Brain, Zap } from 'lucide-react';

interface ModeIndicatorProps {
  mode: ConversationMode;
}

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  const getModeConfig = (mode: ConversationMode) => {
    switch (mode) {
      case 'guide':
        return {
          icon: Heart,
          label: 'Guide Mode',
          description: 'Gentle guidance and support',
          className: 'mode-guide',
        };
      case 'socrates':
        return {
          icon: Brain,
          label: 'Socrates Mode',
          description: 'Question-based thinking',
          className: 'mode-socrates',
        };
      case 'hard':
        return {
          icon: Zap,
          label: 'Hard Mode',
          description: 'Tough feedback and challenges',
          className: 'mode-hard',
        };
      default:
        return {
          icon: Heart,
          label: 'Guide Mode',
          description: 'Gentle guidance and support',
          className: 'mode-guide',
        };
    }
  };

  const config = getModeConfig(mode);
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.className}`}>
      <Icon className=\"w-4 h-4\" />
      <div className=\"text-sm\">
        <div className=\"font-semibold\">{config.label}</div>
        <div className=\"text-xs opacity-75\">{config.description}</div>
      </div>
    </div>
  );
}