import React, { useState, useCallback } from 'react';
import { GameState, Story, ChatMessage } from './types';
import { generateInitialStoryAndImage, getAnswer, getHint } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [story, setStory] = useState<Story | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const questionCount = chatHistory.filter(msg => msg.author === 'user').length;

  const handleStartGame = useCallback(async () => {
    setIsLoading(true);
    setGameState(GameState.Loading);
    setError(null);
    setChatHistory([]);
    try {
      const newStory = await generateInitialStoryAndImage();
      setStory(newStory);
      setGameState(GameState.Playing);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar una nueva historia. Por favor, inténtalo de nuevo.');
      setGameState(GameState.Error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleRevealSolution = useCallback(() => {
    setGameState(GameState.Revealed);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!story || message.trim() === '') return;

    const userMessage: ChatMessage = { id: Date.now(), author: 'user', text: message };
    const updatedHistory = [...chatHistory, userMessage];
    
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const answer = await getAnswer(story.solucion, message, updatedHistory);
      
      const solvedMarker = '[SOLVED]';
      let aiText = answer;
      let gameWasSolved = false;

      if (answer.startsWith(solvedMarker)) {
        gameWasSolved = true;
        aiText = answer.substring(solvedMarker.length).trim();
        if (!aiText) {
          aiText = "¡Felicidades! Has resuelto el misterio.";
        }
      }

      const aiMessage: ChatMessage = { id: Date.now() + 1, author: 'ai', text: aiText };
      setChatHistory(prev => [...prev, aiMessage]);

      if (gameWasSolved) {
        setTimeout(() => {
          handleRevealSolution();
          setIsLoading(false);
        }, 2000);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = { id: Date.now() + 1, author: 'system', text: 'Error al obtener respuesta. Intenta de nuevo.' };
      setChatHistory(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  }, [story, chatHistory, handleRevealSolution]);

  const handleGetHint = useCallback(async () => {
    if (!story) return;

    setIsLoading(true);
    try {
      const hint = await getHint(story.solucion, chatHistory);
      const hintMessage: ChatMessage = { id: Date.now(), author: 'system', text: `PISTA: ${hint}` };
      setChatHistory(prev => [...prev, hintMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = { id: Date.now(), author: 'system', text: 'Error al obtener pista. Intenta de nuevo.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [story, chatHistory]);

  const handlePlayAgain = () => {
      setStory(null);
      setChatHistory([]);
      handleStartGame();
  }
  
  const handleBackToWelcome = () => {
      setGameState(GameState.Welcome);
      setStory(null);
      setChatHistory([]);
      setError(null);
  }

  const renderContent = () => {
    switch (gameState) {
      case GameState.Loading:
        return <div className="flex flex-col items-center justify-center h-screen">
          <LoadingSpinner />
          <p className="mt-4 text-brand-text-secondary animate-pulse">Creando un nuevo misterio...</p>
        </div>;
      case GameState.Playing:
      case GameState.Revealed:
        if (story) {
          return <GameScreen
            story={story}
            chatHistory={chatHistory}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onGetHint={handleGetHint}
            canGetHint={questionCount >= 10}
            isRevealed={gameState === GameState.Revealed}
            onPlayAgain={handlePlayAgain}
          />;
        }
        // Fallback if story is null, which shouldn't happen in these states
        return <WelcomeScreen onStartGame={handleStartGame} error={error} />;
      case GameState.Error:
          return <WelcomeScreen onStartGame={handleStartGame} error={error} onBack={handleBackToWelcome}/>;
      case GameState.Welcome:
      default:
        return <WelcomeScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg font-sans text-brand-text">
        {renderContent()}
    </main>
  );
};

export default App;