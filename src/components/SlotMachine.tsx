import React, { useState, useEffect, useRef } from 'react';

interface SlotMachineProps {
  emojis: string[];
  onSelection: (emoji: string) => void;
  isSpinning: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ emojis, onSelection, isSpinning }) => {
  const [displayedEmojis, setDisplayedEmojis] = useState<string[]>([emojis[0], emojis[0], emojis[0]]);
  const [finalEmoji, setFinalEmoji] = useState<string>(emojis[0]);
  const spinIntervalRef = useRef<NodeJS.Timeout>();
  const spinCountRef = useRef<number>(0);

  useEffect(() => {
    if (isSpinning) {
      spinCountRef.current = 0;
      const spinDuration = 2000;
      const spinInterval = 100;
      const totalSpins = spinDuration / spinInterval;

      spinIntervalRef.current = setInterval(() => {
        spinCountRef.current += 1;

        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

        setDisplayedEmojis([slot1, slot2, slot3]);

        if (spinCountRef.current >= totalSpins) {
          if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
          }

          const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          setDisplayedEmojis([selectedEmoji, selectedEmoji, selectedEmoji]);
          setFinalEmoji(selectedEmoji);
          onSelection(selectedEmoji);
        }
      }, spinInterval);
    }

    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [isSpinning, emojis, onSelection]);

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-red-600 to-red-800 rounded-3xl p-8 shadow-2xl border-8 border-yellow-400">
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 mb-6">
          <div className="flex justify-center items-center space-x-4">
            {displayedEmojis.map((emoji, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-inner border-4 border-gray-300 ${
                  isSpinning ? 'animate-bounce' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  minWidth: '100px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className={`text-6xl transition-all duration-200 ${
                  isSpinning ? 'blur-sm scale-110' : 'blur-0 scale-100'
                }`}>
                  {emoji}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isSpinning && displayedEmojis[0] === displayedEmojis[1] && displayedEmojis[1] === displayedEmojis[2] && (
          <div className="text-center">
            <div className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-lg shadow-lg inline-block border-4 border-yellow-500 animate-pulse">
              Your Player: {finalEmoji}
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold border-2 border-yellow-500 shadow-md">
          SLOT MACHINE
        </div>

        <div className="absolute top-4 right-4 flex space-x-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-3 h-3 bg-red-500 rounded-full border-2 border-red-700 shadow-inner"></div>
          ))}
        </div>

        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-l-lg border-4 border-gray-800 shadow-xl"></div>
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-32 bg-gradient-to-r from-gray-600 to-gray-700 rounded-r-lg border-4 border-gray-800 shadow-xl"></div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-3xl border-4 border-gray-700 shadow-xl"></div>
    </div>
  );
};

export default SlotMachine;
