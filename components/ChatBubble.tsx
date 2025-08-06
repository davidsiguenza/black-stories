
import React from 'react';
import { ChatMessage } from '../types';
import Icon from './Icon';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.author === 'user';
  const isAI = message.author === 'ai';
  const isSystem = message.author === 'system';

  const bubbleClasses = {
    base: 'max-w-xl lg:max-w-2xl px-5 py-3 rounded-xl shadow-md animate-slide-in-up font-serif',
    user: 'bg-brand-primary text-brand-bg self-end rounded-br-none',
    ai: 'bg-brand-surface text-brand-text self-start rounded-bl-none',
    system: 'bg-transparent border border-amber-600/50 text-amber-300 self-center text-center italic text-sm',
  };

  const wrapperClasses = `flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;

  const AiAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center mr-3 flex-shrink-0 border-2 border-brand-primary-dark">
      <span className="font-bold text-xl text-brand-primary">AI</span>
    </div>
  );

  if (isSystem) {
    return (
        <div className="flex justify-center w-full my-4">
            <div className={`${bubbleClasses.base} ${bubbleClasses.system}`}>
                {message.text}
            </div>
        </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      {isAI && <AiAvatar />}
      <div className={`${bubbleClasses.base} ${isUser ? bubbleClasses.user : bubbleClasses.ai}`}>
        <p className="text-lg">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
