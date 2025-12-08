import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, Sparkles, Brain, Gamepad2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import redBootThinking from "@/assets/characters/red-boot-thinking.jpg";
import redBootPointing from "@/assets/characters/red-boot-pointing.jpg";
import redBootCelebrating from "@/assets/characters/red-boot-celebrating.jpg";

interface OnboardingCardsProps {
  onComplete: () => void;
}

interface CardData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: typeof Brain;
  accentColor: string;
  bgGradient: string;
}

const cards: CardData[] = [
  {
    id: 1,
    title: "The Science",
    subtitle: "Brain-Powered Learning",
    description: "Built on proven memory science. Spaced repetition and active recall help words stick in long-term memory, not just for Friday's test.",
    image: redBootThinking,
    icon: Brain,
    accentColor: "text-blue-600",
    bgGradient: "from-blue-50 to-sky-100",
  },
  {
    id: 2,
    title: "The Features",
    subtitle: "Adventure Awaits",
    description: "Snap a photo of your spelling list, play treasure hunting games, battle sea monsters, and collect rewards along the way.",
    image: redBootPointing,
    icon: Gamepad2,
    accentColor: "text-amber-600",
    bgGradient: "from-amber-50 to-orange-100",
  },
  {
    id: 3,
    title: "Watch Them Shine",
    subtitle: "Confidence That Lasts",
    description: "Your child will master spelling through play, build confidence, and develop study skills that last a lifetime.",
    image: redBootCelebrating,
    icon: Trophy,
    accentColor: "text-emerald-600",
    bgGradient: "from-emerald-50 to-green-100",
  },
];

export default function OnboardingCards({ onComplete }: OnboardingCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const x = useMotionValue(0);
  
  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setShowSwipeHint(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < cards.length - 1) {
      handleNext();
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      handlePrev();
    }
  };

  const handleGetStarted = () => {
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const imageY = useTransform(x, [-200, 0, 200], [20, 0, 20]);
  const imageScale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" data-testid="onboarding-cards">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="w-full max-w-md mx-auto cursor-grab active:cursor-grabbing"
          >
            <div className={`bg-gradient-to-br ${currentCard.bgGradient} rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100`}>
              <motion.div 
                className="flex justify-center mb-6"
                style={{ y: imageY, scale: imageScale }}
              >
                <div className="relative">
                  <motion.div
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl"
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <img 
                      src={currentCard.image} 
                      alt="Red Boot" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <currentCard.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${currentCard.accentColor}`} />
                  </motion.div>
                </div>
              </motion.div>

              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-2 mb-2"
                >
                  <Sparkles className={`w-4 h-4 ${currentCard.accentColor}`} />
                  <span className={`text-sm font-medium ${currentCard.accentColor} uppercase tracking-wider`}>
                    {currentCard.subtitle}
                  </span>
                  <Sparkles className={`w-4 h-4 ${currentCard.accentColor}`} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`text-3xl sm:text-4xl font-bold ${currentCard.accentColor} mb-4`}
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {currentCard.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-base sm:text-lg leading-relaxed"
                >
                  {currentCard.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {showSwipeHint && currentIndex === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 text-gray-400"
            >
              <span className="text-sm">Swipe to continue</span>
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="pb-8 px-4">
        <div className="flex justify-center items-center gap-3 mb-6">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className="relative"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              data-testid={`onboarding-dot-${index}`}
            >
              <motion.div
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gray-300'
                }`}
                animate={index === currentIndex ? {
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(99, 102, 241, 0.4)',
                    '0 0 0 8px rgba(99, 102, 241, 0)',
                    '0 0 0 0 rgba(99, 102, 241, 0)'
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: index === currentIndex ? Infinity : 0 }}
              />
              {index === currentIndex && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)' }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center">
          {isLastCard ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ fontFamily: "'Fredoka One', cursive" }}
                data-testid="button-get-started"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <Button
              onClick={handleNext}
              variant="ghost"
              size="lg"
              className="text-gray-500 hover:text-gray-700 font-medium text-lg"
              data-testid="button-next-card"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={onComplete}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            data-testid="button-skip-onboarding"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
