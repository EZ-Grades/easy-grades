import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { LuxuryButton } from '../LuxuryButton';

interface MemoryCardGameProps {
  onComplete: () => void;
}

// 16 unique emojis → 16 pairs → 32 cards
const cardItems = [
  '🍎','🍌','🍇','🍓','🍒','🍍','🥝','🍉',
  '🥑','🍑','🍋','🥭','🍈','🍏','🍊','🍐'
];

interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

export function MemoryCardGame({ onComplete }: MemoryCardGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [pairsFound, setPairsFound] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const doubled = [...cardItems, ...cardItems]; // 32 cards
    const shuffled = doubled
      .map((value, index) => ({ value, id: index, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFirstCard(null);
    setSecondCard(null);
    setDisabled(false);
    setPairsFound(0);
  };

  const handleCardClick = (card: Card) => {
    if (disabled || card.flipped || card.matched) return;

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(updatedCards);

    if (!firstCard) {
      setFirstCard(card);
    } else if (!secondCard) {
      setSecondCard(card);
      setDisabled(true);

      const firstValue = firstCard.value;
      const secondValue = card.value;

      if (firstValue === secondValue) {
        const matchedCards = updatedCards.map(c =>
          c.value === firstValue ? { ...c, matched: true } : c
        );
        setCards(matchedCards);
        setPairsFound(prev => prev + 1);
        resetSelection();
      } else {
        setTimeout(() => {
          const resetFlipped = updatedCards.map(c =>
            c.id === firstCard.id || c.id === card.id ? { ...c, flipped: false } : c
          );
          setCards(resetFlipped);
          resetSelection();
        }, 1000);
      }
    }
  };

  const resetSelection = () => {
    setFirstCard(null);
    setSecondCard(null);
    setDisabled(false);
  };

  useEffect(() => {
    if (pairsFound === cardItems.length) {
      setTimeout(onComplete, 1500);
    }
  }, [pairsFound]);

  return (
    <GlassCard className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Memory Match Game</h2>
        <p className="text-muted-foreground mb-2">Find all matching pairs!</p>
        <p className="text-sm text-muted-foreground">Pairs found: {pairsFound}/{cardItems.length}</p>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className={`flex items-center justify-center text-3xl h-20 rounded-lg cursor-pointer border-2 transition-all duration-300 ${
              card.flipped || card.matched ? 'bg-gradient-to-tr from-pink-200 to-purple-300' : 'bg-muted'
            }`}
            onClick={() => handleCardClick(card)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {card.flipped || card.matched ? card.value : ''}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <LuxuryButton
          variant="outline"
          onClick={initializeGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          New Game
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}
