import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import logoSrc from './Logo/Terserah-LogoApp.png';

interface SplashScreenProps {
  onFinish: () => void;
  language: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, language }) => {
  const [show, setShow] = useState(true);
  const [logoErrored, setLogoErrored] = useState(false);
  const t = translations[language];


  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-gray-900"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 flex items-center justify-center mb-6 overflow-hidden rounded-3xl bg-white/10">
              {!logoErrored ? (
                <img
                  src={logoSrc}
                  alt=""
                  onError={() => setLogoErrored(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>
          </motion.div>

          <div className="absolute bottom-20 flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-gray-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
