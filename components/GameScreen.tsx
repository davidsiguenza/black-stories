import React, { useState, useRef, useEffect } from 'react';
import { Story, ChatMessage } from '../types';
import Icon from './Icon';
import ChatBubble from './ChatBubble';

interface GameScreenProps {
  story: Story;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onGetHint: () => void;
  canGetHint: boolean;
  isRevealed: boolean;
  onPlayAgain: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  story,
  chatHistory,
  isLoading,
  onSendMessage,
  onGetHint,
  canGetHint,
  isRevealed,
  onPlayAgain
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [hasConfirmedReveal, setHasConfirmedReveal] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isRevealed) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as any);
      }
  }
  
  const handleShowSolutionClick = () => {
    setIsSolutionModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsSolutionModalOpen(false);
    setTimeout(() => {
        setHasConfirmedReveal(false);
    }, 300);
  };

  const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; icon: 'hint' | 'reveal'; children: React.ReactNode; tooltip: string;}> = ({ onClick, disabled, icon, children, tooltip }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-surface px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            <Icon name={icon} className="w-5 h-5" />
            <span className="hidden sm:inline">{children}</span>
        </button>
        {disabled && (
            <div className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
            </div>
        )}
    </div>
  );

  const SolutionModal = () => (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${isSolutionModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-brand-surface p-6 rounded-lg shadow-2xl max-w-lg w-11/12 relative m-4 animate-slide-in-up">
            <button 
                onClick={handleCloseModal} 
                className="absolute top-3 right-3 text-brand-text-secondary hover:text-brand-text transition-colors"
                aria-label="Cerrar modal"
            >
                <Icon name="close" className="w-7 h-7" />
            </button>

            {!hasConfirmedReveal ? (
                <div className="text-center">
                    <Icon name="reveal" className="w-12 h-12 mx-auto text-brand-primary mb-4" />
                    <h2 className="text-2xl font-bold font-serif mb-2">¿Seguro que quieres rendirte?</h2>
                    <p className="text-brand-text-secondary mb-6">Ver la solución arruinará el misterio. ¡Aún estás a tiempo de resolverlo!</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleCloseModal} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                            Seguir Jugando
                        </button>
                        <button onClick={() => setHasConfirmedReveal(true)} className="px-6 py-2 rounded-lg bg-brand-primary text-brand-bg font-bold hover:bg-brand-primary-dark transition-colors">
                            Sí, revelar
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold font-serif mb-4 text-brand-primary">La Solución</h2>
                    <p className="text-lg text-brand-text-secondary whitespace-pre-wrap font-serif mb-6">{story.solucion}</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                        <button onClick={handleCloseModal} className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                            Cerrar
                        </button>
                        <button
                            onClick={() => {
                                handleCloseModal();
                                onPlayAgain();
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-brand-bg font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-primary-dark transition-all duration-300"
                        >
                            <Icon name="play-again" className="w-5 h-5"/>
                            Jugar de Nuevo
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto p-2 sm:p-4 animate-fade-in">
      <header className={`mb-2 sm:mb-4 p-4 bg-brand-surface rounded-lg shadow-lg transition-all duration-300 ${isChatMaximized ? 'hidden lg:block' : ''}`}>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-center text-brand-primary">{story.titulo}</h1>
      </header>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className={`lg:w-1/2 lg:flex lg:flex-col transition-all duration-300 ${isChatMaximized ? 'hidden lg:flex' : ''}`}>
            <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1 rounded-lg overflow-hidden shadow-2xl">
                <img src={`data:image/jpeg;base64,${story.imageBase64}`} alt="Misterio" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <p className="absolute bottom-0 left-0 p-4 lg:p-6 text-xl lg:text-2xl font-serif italic text-white">
                    "{story.intro}"
                </p>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden lg:w-1/2 bg-black/20 rounded-lg">
            <div className="lg:hidden flex-shrink-0 flex justify-center items-center bg-brand-surface/50 border-b border-brand-surface">
                <button 
                    onClick={() => setIsChatMaximized(!isChatMaximized)} 
                    className="p-1 text-gray-400 hover:text-white transition-colors w-full flex justify-center items-center"
                    aria-label={isChatMaximized ? "Minimizar chat" : "Maximizar chat"}
                >
                    <span className="sr-only">{isChatMaximized ? "Minimizar para ver imagen" : "Maximizar chat"}</span>
                    <Icon name={isChatMaximized ? 'chevron-down' : 'chevron-up'} className="w-6 h-6" />
                </button>
            </div>
            
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {!isRevealed ? (
                    <div className="flex flex-col">
                        {chatHistory.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                        {isLoading && chatHistory.length > 0 && (
                            <div className="flex justify-start w-full mb-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center mr-3 flex-shrink-0 border-2 border-brand-primary-dark">
                                    <span className="font-bold text-xl text-brand-primary">AI</span>
                                </div>
                                <div className="max-w-xs px-5 py-3 rounded-xl shadow-md bg-brand-surface rounded-bl-none">
                                    <div className="h-2 bg-gray-600 rounded w-16"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                ) : (
                    <div className="animate-fade-in p-6 bg-brand-surface rounded-lg h-full flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-bold text-brand-primary font-serif mb-4">La Solución</h2>
                        <p className="text-lg text-brand-text-secondary whitespace-pre-wrap font-serif">{story.solucion}</p>
                        <button
                            onClick={onPlayAgain}
                            className="mt-8 flex items-center justify-center gap-2 bg-brand-primary text-brand-bg font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-primary-dark transition-all duration-300 transform hover:scale-105"
                        >
                            <Icon name="play-again" className="w-5 h-5"/>
                            Jugar de Nuevo
                        </button>
                    </div>
                )}
            </main>

            {!isRevealed && (
                <footer className="bg-brand-surface p-3 shadow-t-xl">
                    <form onSubmit={handleSubmit} className="flex items-start gap-3">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isLoading ? "El Guardián está pensando..." : "Haz una pregunta de sí o no..."}
                            disabled={isLoading || isRevealed}
                            className="flex-grow bg-gray-800 text-brand-text placeholder-gray-500 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 resize-none overflow-y-hidden max-h-32"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="bg-brand-primary text-brand-bg p-2 rounded-full hover:bg-brand-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 transform hover:scale-110 flex-shrink-0"
                            aria-label="Enviar pregunta"
                        >
                            <Icon name="send" className="w-6 h-6" />
                        </button>
                    </form>
                    <div className="flex items-center justify-center sm:justify-end gap-3 mt-3">
                        <ActionButton 
                            onClick={onGetHint} 
                            disabled={isLoading || !canGetHint}
                            icon="hint"
                            tooltip={`Necesitas ${10 - chatHistory.filter(m => m.author === 'user').length} pregunta(s) más`}
                        >
                            Pista
                        </ActionButton>
                        <ActionButton 
                            onClick={handleShowSolutionClick} 
                            disabled={isLoading}
                            icon="reveal"
                            tooltip="Rendirse y ver la solución"
                        >
                            Resolver
                        </ActionButton>
                    </div>
                </footer>
            )}
        </div>
      </div>
      <SolutionModal />
    </div>
  );
};

export default GameScreen;