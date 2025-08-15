'use client';

import { AIResponse } from '../lib/store';
import { Ear, Lightbulb, Search, Target, ChevronRight } from 'lucide-react';

interface AIResponseDisplayProps {
  response: AIResponse;
  onActionSelect: (actionId: string) => void;
}

export function AIResponseDisplay({ response, onActionSelect }: AIResponseDisplayProps) {
  const { activeListening, knowledgeSteps, feedbackRequest, nextActions } = response;

  return (
    <div className=\"space-y-4\">
      {/* Active Listening Section */}
      <div className=\"step-section active-listening\">
        <div className=\"flex items-center space-x-2 mb-2\">
          <Ear className=\"w-4 h-4 text-indigo-600\" />
          <h4 className=\"font-semibold text-indigo-800\">理解の共有</h4>
        </div>
        <div className=\"text-sm space-y-2\">
          <div>
            <span className=\"font-medium\">意図:</span> {activeListening.intent}
          </div>
          <div>
            <span className=\"font-medium\">感情:</span> {activeListening.emotion}
          </div>
          {activeListening.constraints.length > 0 && (
            <div>
              <span className=\"font-medium\">制約:</span>
              <ul className=\"list-disc list-inside mt-1 ml-2\">
                {activeListening.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Steps */}
      <div className=\"space-y-3\">
        {/* Step A */}
        <div className=\"step-section step-a\">
          <div className=\"flex items-center space-x-2 mb-2\">
            <Lightbulb className=\"w-4 h-4 text-yellow-600\" />
            <h4 className=\"font-semibold text-yellow-800\">Step-A: 既存知識での考察</h4>
          </div>
          <div className=\"text-sm text-gray-700 whitespace-pre-line\">
            {knowledgeSteps.stepA}
          </div>
        </div>

        {/* Step B (if exists) */}
        {knowledgeSteps.stepB && (
          <div className=\"step-section step-b\">
            <div className=\"flex items-center space-x-2 mb-2\">
              <Search className=\"w-4 h-4 text-green-600\" />
              <h4 className=\"font-semibold text-green-800\">Step-B: 最新情報での補正</h4>
            </div>
            <div className=\"text-sm text-gray-700 whitespace-pre-line\">
              {knowledgeSteps.stepB}
            </div>
          </div>
        )}

        {/* Step C */}
        <div className=\"step-section step-c\">
          <div className=\"flex items-center space-x-2 mb-2\">
            <Target className=\"w-4 h-4 text-blue-600\" />
            <h4 className=\"font-semibold text-blue-800\">Step-C: 最終提案</h4>
          </div>
          <div className=\"text-sm text-gray-700 whitespace-pre-line\">
            {knowledgeSteps.stepC}
          </div>
        </div>
      </div>

      {/* Feedback Request */}
      <div className=\"step-section feedback-section\">
        <div className=\"flex items-center space-x-2 mb-2\">
          <ChevronRight className=\"w-4 h-4 text-orange-600\" />
          <h4 className=\"font-semibold text-orange-800\">次のアクション</h4>
        </div>
        <div className=\"text-sm text-gray-700 mb-3\">
          {feedbackRequest}
        </div>
        
        {/* Action Buttons */}
        <div className=\"flex flex-wrap gap-2\">
          {nextActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className=\"px-3 py-2 bg-orange-100 border border-orange-200 text-orange-800 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors\"
              title={action.description}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}