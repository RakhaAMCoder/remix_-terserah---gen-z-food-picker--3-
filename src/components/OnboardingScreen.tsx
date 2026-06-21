import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Dice5, Bot, Heart, ChevronRight, ArrowRight, PlayCircle } from 'lucide-react';
import { translations, Language } from '../translations';

interface OnboardingScreenProps {
  onFinish: () => void;
  language: Language;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const t = translations[language];
  const steps = t.onboarding;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles size={48} />;
      case 'Dice5': return <Dice5 size={48} />;
      case 'Bot': return <Bot size={48} />;
      case 'Heart': return <Heart size={48} />;
      case 'PlayCircle': return <PlayCircle size={48} />;
      default: return <Sparkles size={48} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-between p-8">
      <div className="w-full flex justify-end">
        <button 
          onClick={onFinish}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#1A9E5C] transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -40 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="w-32 h-32 bg-[#1A9E5C]/10 rounded-[40px] flex items-center justify-center text-[#1A9E5C] shadow-2xl shadow-[#1A9E5C]/10">
              {getIcon(steps[currentStep].icon)}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-[#1A1A2E] leading-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                {steps[currentStep].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 justify-center pt-4">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: i === currentStep ? 24 : 8,
                backgroundColor: i === currentStep ? '#1A9E5C' : (i < currentStep ? '#1A9E5C' : '#E2E8F0')
              }}
              className="h-2 rounded-full transition-all"
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm pb-12">
        <button
          onClick={handleNext}
          className="w-full py-5 bg-[#1A9E5C] text-white rounded-[32px] font-black text-lg shadow-2xl shadow-[#1A9E5C]/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {currentStep === steps.length - 1 ? (
            <>
              {t.onboardingStart}
              <CheckIcon />
            </>
          ) : (
            <>
              {t.onboardingNext}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
