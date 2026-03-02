import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Trophy, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

const badgeData = {
  starter_seller: {
    icon: Star,
    label: { sr: 'Početnik Prodavac', en: 'Starter Seller' },
    desc: { sr: 'Ostvario si 10+ porudžbina!', en: 'You achieved 10+ orders!' },
    color: 'from-zinc-400 to-zinc-600',
    bgGlow: 'shadow-zinc-500/50'
  },
  active_seller: {
    icon: Zap,
    label: { sr: 'Aktivan Prodavac', en: 'Active Seller' },
    desc: { sr: 'Ostvario si 50+ porudžbina!', en: 'You achieved 50+ orders!' },
    color: 'from-blue-400 to-cyan-500',
    bgGlow: 'shadow-blue-500/50'
  },
  power_seller: {
    icon: Trophy,
    label: { sr: 'Power Seller', en: 'Power Seller' },
    desc: { sr: 'Ostvario si 100+ porudžbina!', en: 'You achieved 100+ orders!' },
    color: 'from-purple-400 to-pink-500',
    bgGlow: 'shadow-purple-500/50'
  },
  super_seller: {
    icon: Crown,
    label: { sr: 'Super Prodavac', en: 'Super Seller' },
    desc: { sr: 'Ostvario si 500+ porudžbina!', en: 'You achieved 500+ orders!' },
    color: 'from-amber-400 to-orange-500',
    bgGlow: 'shadow-amber-500/50'
  }
};

export default function BadgeCelebration({ badge, language = 'sr', onClose }) {
  const [show, setShow] = useState(true);
  
  const data = badgeData[badge];
  const Icon = data?.icon || Award;

  useEffect(() => {
    if (show && data) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [show, data]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!data) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
          data-testid="badge-celebration-modal"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ 
              type: "spring", 
              duration: 0.8,
              bounce: 0.4
            }}
            className="relative max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${data.color} blur-3xl opacity-30 animate-pulse`} />
            
            {/* Card */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-3xl p-8 text-center overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              </div>

              {/* Stars animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{ 
                      x: Math.random() * 400, 
                      y: Math.random() * 400,
                      opacity: 0 
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Badge Icon */}
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${data.color} p-1 shadow-2xl ${data.bgGlow}`}>
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                      <Icon className="w-14 h-14 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm uppercase tracking-widest text-zinc-400 mb-2">
                    {language === 'sr' ? 'Novi bedž osvojen!' : 'New Badge Earned!'}
                  </p>
                  <h2 className={`text-3xl font-bold bg-gradient-to-r ${data.color} bg-clip-text text-transparent mb-4`}>
                    {data.label[language]}
                  </h2>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-300 mb-6"
                >
                  {data.desc[language]}
                </motion.p>

                {/* Congratulations message */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <p className="text-lg text-white font-medium">
                    {language === 'sr' ? 'Čestitamo!' : 'Congratulations!'}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {language === 'sr' ? 'od Narucify tima' : 'from Narucify team'}
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    onClick={handleClose}
                    className={`bg-gradient-to-r ${data.color} hover:opacity-90 text-white px-8 py-2`}
                    data-testid="badge-celebration-close-btn"
                  >
                    {language === 'sr' ? 'Nastavi' : 'Continue'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
