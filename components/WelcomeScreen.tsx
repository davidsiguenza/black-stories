
import React from 'react';
import Icon from './Icon';

interface WelcomeScreenProps {
  onStartGame: () => void;
  error?: string | null;
  onBack?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame, error, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-fade-in">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://picsum.photos/seed/blackstories/1920/1080')", filter: 'blur(4px)' }}
        ></div>
      <div className="relative z-10 bg-brand-bg/70 backdrop-blur-sm p-8 rounded-lg shadow-2xl max-w-2xl w-full">
        <h1 className="text-5xl font-bold font-serif text-brand-text mb-2">
          Historias Negras <span className="text-brand-primary">AI</span>
        </h1>
        <p className="text-lg text-brand-text-secondary mb-8">
          Resuelve misterios enigmáticos haciendo preguntas de sí o no. La IA conoce la verdad. ¿Podrás descubrirla?
        </p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-fade-in" role="alert">
                <strong className="font-bold">¡Oh no! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
            onClick={onStartGame}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-brand-bg font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-primary-dark transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/50"
            >
                Comenzar un nuevo misterio
            </button>
            {error && onBack && (
                <button
                onClick={onBack}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-surface text-brand-text font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-300"
                >
                    <Icon name="back" className="w-5 h-5"/>
                    Volver
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
