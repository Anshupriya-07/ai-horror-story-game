import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FogParticles from "./components/FogParticles";
import FloatingFogLayer from "./components/FloatingFogLayer";
import DustParticles from "./components/DustParticles";
import FlashlightCursor from "./components/FlashlightCursor";
import ShadowTendrilsOverlay from "./components/ShadowTendrilsOverlay";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const storyReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const choiceReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const choiceButtonReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.3,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const HEARTBEAT_TARGET_VOLUME = 0.18;
const HEARTBEAT_FADE_MS = 2000;
const HORROR_AMBIENT_VOLUME = 0.15;
const HORROR_AMBIENT_FADE_MS = 2000;

const getSanityBarColor = (value) => {
  if (value >= 70) return "#059669";
  if (value >= 40) return "#eab308";
  if (value >= 20) return "#ea580c";
  return "#dc2626";
};

function App() {
  const [story, setStory] = useState("");
  const [choices, setChoices] = useState([]);
  const [displayedStory, setDisplayedStory] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sanity, setSanity] = useState(100);
  const heartbeatRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const heartbeatStartedRef = useRef(false);
  const horrorAudioRef = useRef(null);
  const horrorFadeIntervalRef = useRef(null);
  const horrorStartedRef = useRef(false);
  const [lightFlicker, setLightFlicker] = useState(false);

  const startHeartbeat = () => {
    if (heartbeatStartedRef.current) return;
    heartbeatStartedRef.current = true;

    const audio = new Audio(
      `${process.env.PUBLIC_URL || ""}/sounds/heartbeat.mp3`
    );
    audio.loop = true;
    audio.volume = 0;
    heartbeatRef.current = audio;

    audio.play().catch(() => {});

    const startTime = Date.now();
    fadeIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / HEARTBEAT_FADE_MS, 1);
      audio.volume = progress * HEARTBEAT_TARGET_VOLUME;

      if (progress >= 1) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }, 50);
  };

  const startHorrorAmbient = () => {
    if (horrorStartedRef.current) return;
    horrorStartedRef.current = true;

    const audio = new Audio(
      `${process.env.PUBLIC_URL || ""}/sounds/horror.mp3`
    );
    audio.loop = true;
    audio.volume = 0;
    horrorAudioRef.current = audio;

    audio.addEventListener(
      "canplaythrough",
      () => {
        console.log("Audio Loaded");
      },
      { once: true }
    );

    audio
      .play()
      .then(() => {
        console.log("Audio Playing");
      })
      .catch(() => {});

    const startTime = Date.now();
    horrorFadeIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / HORROR_AMBIENT_FADE_MS, 1);
      audio.volume = progress * HORROR_AMBIENT_VOLUME;

      if (progress >= 1) {
        clearInterval(horrorFadeIntervalRef.current);
        horrorFadeIntervalRef.current = null;
      }
    }, 50);
  };

  const stopHorrorAmbient = () => {
    if (horrorFadeIntervalRef.current) {
      clearInterval(horrorFadeIntervalRef.current);
      horrorFadeIntervalRef.current = null;
    }
    if (horrorAudioRef.current) {
      horrorAudioRef.current.pause();
      horrorAudioRef.current.currentTime = 0;
      horrorAudioRef.current = null;
      console.log("Audio Stopped");
    }
    horrorStartedRef.current = false;
  };

  useEffect(() => {
    const pauseHeartbeat = () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      if (heartbeatRef.current) {
        heartbeatRef.current.pause();
        heartbeatRef.current.currentTime = 0;
        heartbeatRef.current = null;
      }
      heartbeatStartedRef.current = false;
    };

    const pauseAllAudio = () => {
      pauseHeartbeat();
      stopHorrorAmbient();
    };

    window.addEventListener("beforeunload", pauseAllAudio);

    return () => {
      window.removeEventListener("beforeunload", pauseAllAudio);
      pauseAllAudio();
    };
  }, []);

  const generateStory = async (selectedChoice = "", storyContext = story) => {
    setLoading(true);

    const response = await fetch("http://localhost:5000/generate-story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        story: storyContext,
        choice: selectedChoice,
      }),
    });

    const data = await response.json();

    setStory(data.story);
    setChoices(data.choices);
    setLoading(false);
  };
  useEffect(() => {
    if (!story) return;

    setDisplayedStory("");
    setIsTyping(true);

    let index = 0;

    const tick = () => {
      index += 1;
      setDisplayedStory(story.substring(0, index));

      if (index >= story.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    };

    tick();
    const interval = setInterval(tick, 18);

    return () => clearInterval(interval);
  }, [story]);

  useEffect(() => {
    let flickerTimeoutId;
    let flickerEndId;

    const scheduleFlicker = () => {
      const delay = 30000 + Math.random() * 30000;
      flickerTimeoutId = setTimeout(() => {
        setLightFlicker(true);
        const flickerDuration = 100 + Math.random() * 100;
        flickerEndId = setTimeout(() => setLightFlicker(false), flickerDuration);
        scheduleFlicker();
      }, delay);
    };

    scheduleFlicker();

    return () => {
      clearTimeout(flickerTimeoutId);
      clearTimeout(flickerEndId);
    };
  }, []);

  const hasStory = Boolean(story);
  const showChoices = choices.length > 0 && !loading && !isTyping;

  const handleChoice = (choice) => {
    const loss = Math.floor(Math.random() * 6) + 5;
    setSanity((prev) => Math.max(0, prev - loss));
    generateStory(choice);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden font-body">
      <FogParticles count={45} />
      <DustParticles count={32} />
      <FloatingFogLayer />
      <ShadowTendrilsOverlay />
      <FlashlightCursor />

      <div
        className={`pointer-events-none fixed inset-0 z-[3] bg-amber-50 transition-opacity ease-out ${
          lightFlicker ? "opacity-[0.028] duration-75" : "opacity-0 duration-150"
        }`}
        aria-hidden="true"
      />

      <div className="vignette fixed inset-0 z-[1]" aria-hidden="true" />

      <motion.div
        className={`fixed right-4 top-4 z-20 w-44 rounded-lg border border-white/10 p-3 backdrop-blur-xl sm:right-6 sm:top-6 sm:w-52 ${
          sanity < 20 ? "sanity-critical-pulse" : ""
        }`}
        style={{
          background: "rgba(12, 10, 16, 0.75)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-horror text-xs uppercase tracking-widest text-red-400/90">
          SANITY: {sanity}%
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{
              width: `${sanity}%`,
              backgroundColor: getSanityBarColor(sanity),
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.header
          className="mb-12 text-center sm:mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <motion.p
            className="mb-2 font-horror text-xs uppercase tracking-[0.4em] text-red-400/80"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Enter if you dare
          </motion.p>
          <h1 className="font-horror text-3xl font-bold leading-tight text-slate-100 sm:text-5xl lg:text-6xl animate-flicker">
            AI Horror Story
            <span className="block bg-gradient-to-r from-red-900 via-red-600 to-red-900 bg-clip-text text-transparent">
              Game
            </span>
          </h1>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
        </motion.header>

        <motion.div
          className="mb-10 flex justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.15}
        >
          <motion.button
            type="button"
            onClick={() => {
              startHeartbeat();
              startHorrorAmbient();
              setStory("");
              setChoices([]);
              setDisplayedStory("");
              generateStory("", "");
            }}
            disabled={loading}
            className="btn-crimson min-w-[200px] disabled:opacity-60"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Summoning…
              </span>
            ) : (
              "Start Game"
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {(hasStory || loading) && (
            <motion.section
              key={story.slice(0, 40) || "loading"}
              className="glass-card story-card-glow flex-1 p-8 sm:p-10 lg:p-12"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h2
                className="mb-6 font-horror text-lg uppercase tracking-widest text-red-400/90 sm:text-xl"
                variants={fadeUp}
                custom={0.1}
              >
                Story
              </motion.h2>

              <div className="min-h-[280px]">
                {loading && !story ? (
                  <motion.div
                    className="space-y-3 py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-4 animate-pulse rounded bg-white/5"
                        style={{ width: `${90 - i * 10}%` }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-lg leading-relaxed text-slate-300 sm:text-xl sm:leading-loose"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <>
                      {displayedStory}
                      {isTyping && (
                        <span className="animate-pulse text-red-500">|</span>
                      )}
                    </>
                  </motion.p>
                )}
              </div>

              <AnimatePresence>
                {showChoices && (
                  <motion.div className="mt-10 space-y-4 border-t border-white/10 pt-8">
                    <motion.p
                      className="mb-4 font-horror text-xs uppercase tracking-[0.3em] text-slate-500"
                      variants={choiceReveal}
                      initial="hidden"
                      animate="visible"
                    >
                      Choose your fate
                    </motion.p>
                    {choices.map((choice, index) => (
                      <motion.button
                        key={`${choice}-${index}`}
                        type="button"
                        onClick={() => handleChoice(choice)}
                        disabled={loading}
                        className="btn-choice"
                        custom={index}
                        variants={choiceButtonReveal}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {choice}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {!hasStory && !loading && (
          <motion.p
            className="mt-auto text-center text-sm italic text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Press Start Game to begin your nightmare…
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default App;
