import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Wand2,
} from "lucide-react";

const COLORS = {
  gold: "#C9A24A",
};

function Veil({ side, delay, duration }) {
  return (
    <motion.div
      className={`pointer-events-none absolute top-[-12%] h-[125%] w-[30%] ${
        side === "left" ? "left-[-8%]" : "right-[-8%]"
      }`}
      style={{
        background:
          side === "left"
            ? "linear-gradient(90deg, rgba(20,10,8,.9), rgba(122,44,58,.62), rgba(20,10,8,.08))"
            : "linear-gradient(270deg, rgba(20,10,8,.9), rgba(122,44,58,.62), rgba(20,10,8,.08))",
        filter: "blur(6px)",
        transformOrigin:
          side === "left"
            ? "left center"
            : "right center",
        opacity: 0.75,
      }}
      animate={{
        x:
          side === "left"
            ? ["0%", "12%", "-4%", "8%", "0%"]
            : ["0%", "-12%", "4%", "-8%", "0%"],
        skewX:
          side === "left"
            ? [-2, 4, -5, 3, -2]
            : [2, -4, 5, -3, 2],
        opacity: [0.62, 0.82, 0.68, 0.86, 0.62],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function MagicalDust() {
  const particles = Array.from(
    { length: 24 },
    (_, index) => {
      const acrossScreen = index % 3 === 0;
      const left = acrossScreen
        ? 8 + ((index * 37) % 84)
        : index % 2 === 0
        ? 2 + ((index * 13) % 16)
        : 82 + ((index * 11) % 16);

      return {
        id: index,
        left: `${left}%`,
        top: `${10 + ((index * 53) % 78)}%`,
        delay: (index % 7) * 0.8,
        duration: 4 + (index % 5),
        size: 3 + (index % 3),
      };
    }
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background:
              "rgba(244,224,166,.95)",
            boxShadow:
              "0 0 11px rgba(201,162,74,.9)",
          }}
          animate={{
            y: [0, -35, -8, -48, 0],
            x: [0, 8, -6, 5, 0],
            opacity: [0, 0.9, 0.55, 1, 0],
            scale: [0.6, 1, 0.8, 1.15, 0.6],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function WizardSilhouette() {
  return (
    <div
      className="pointer-events-none absolute left-[9%] top-[50%] z-[1]"
      style={{
        width: 190,
        height: 330,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          filter:
            "drop-shadow(0 0 8px rgba(201,162,74,.4))",
        }}
        animate={{
          x: [-8, 7, -4, 9, -8],
          opacity: [0.5, 0.66, 0.56, 0.7, 0.5],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Warm light behind the figure so the silhouette reads */}
        <div
          className="absolute left-1/2 top-1/2 h-[440px] w-[320px]"
          style={{
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse, rgba(201,162,74,.26), rgba(110,38,56,.12) 45%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Head */}
        <div
          className="absolute left-1/2 top-3 h-14 w-14 rounded-full"
          style={{
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle at 42% 35%, rgba(70,48,43,.9), rgba(8,5,4,.98) 70%)",
            boxShadow:
              "0 0 35px rgba(201,162,74,.12)",
          }}
        />

        {/* Hair / hood */}
        <div
          className="absolute left-1/2 top-[-8px] h-20 w-20"
          style={{
            transform: "translateX(-50%)",
            borderRadius:
              "50% 50% 45% 45%",
            background:
              "rgba(8,5,4,.96)",
            clipPath:
              "polygon(50% 0%, 100% 42%, 82% 100%, 18% 100%, 0% 42%)",
          }}
        />

        {/* Robe */}
        <div
          className="absolute left-1/2 top-16 h-64 w-36"
          style={{
            transform: "translateX(-50%)",
            background:
              "linear-gradient(180deg, rgba(12,7,6,.98), rgba(5,3,3,.98))",
            clipPath:
              "polygon(35% 0%, 65% 0%, 82% 25%, 100% 100%, 0% 100%, 18% 25%)",
          }}
        />

        {/* Shoulder glow */}
        <div
          className="absolute left-1/2 top-20 h-3 w-28"
          style={{
            transform: "translateX(-50%)",
            background:
              "rgba(201,162,74,.5)",
            filter: "blur(8px)",
          }}
        />

        {/* Wand */}
        <motion.div
          className="absolute"
          style={{
            left: "78%",
            top: "36%",
            width: 3,
            height: 105,
            background:
              "linear-gradient(180deg, #E8D39A, #8B6330)",
            transformOrigin: "top center",
            transform: "rotate(-28deg)",
            boxShadow:
              "0 0 10px rgba(232,211,154,.7)",
          }}
          animate={{
            rotate: [-28, -20, -32, -24, -28],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wand magic */}
        <motion.div
          className="absolute"
          style={{
            left: "90%",
            top: "22%",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background:
              "rgba(232,211,154,.95)",
            boxShadow:
              "0 0 18px 7px rgba(201,162,74,.5)",
          }}
          animate={{
            scale: [0.5, 1.15, 0.65, 1, 0.5],
            opacity: [0.3, 1, 0.5, 0.9, 0.3],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}

function CandleGlow() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute bottom-[10%] left-[4%] z-[2]"
        animate={{
          opacity: [0.7, 0.95, 0.76, 1, 0.7],
          scale: [1, 1.08, 0.96, 1.05, 1],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute -inset-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,74,.5), transparent 68%)",
            filter: "blur(7px)",
          }}
        />

        <div
          className="relative h-9 w-3 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #6B3E20, #D8AE58, #6B3E20)",
          }}
        />

        <div
          className="absolute left-1/2 top-[-17px] h-7 w-3"
          style={{
            transform: "translateX(-50%)",
            background:
              "radial-gradient(ellipse, #FFF1B2 0%, #D38C36 48%, transparent 72%)",
            filter: "blur(1px)",
          }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-[14%] right-[4%] z-[2]"
        animate={{
          opacity: [0.62, 0.9, 0.7, 0.95, 0.62],
          scale: [1, 1.06, 0.97, 1.04, 1],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute -inset-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,74,.46), transparent 68%)",
            filter: "blur(8px)",
          }}
        />

        <div
          className="relative h-8 w-3 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #6B3E20, #D8AE58, #6B3E20)",
          }}
        />

        <div
          className="absolute left-1/2 top-[-16px] h-7 w-3"
          style={{
            transform: "translateX(-50%)",
            background:
              "radial-gradient(ellipse, #FFF1B2 0%, #D38C36 48%, transparent 72%)",
          }}
        />
      </motion.div>
    </>
  );
}

export default function MagicalLibraryBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep library atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(110,38,56,.24), transparent 30%), radial-gradient(circle at 50% 60%, rgba(201,162,74,.14), transparent 38%)",
        }}
      />

      {/* Distant library windows */}
      <div className="absolute inset-x-0 top-0 flex justify-center gap-5 opacity-[0.2]">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-[340px] w-[92px] border-x"
            style={{
              borderColor:
                "rgba(201,162,74,.4)",
              background:
                "linear-gradient(180deg, rgba(201,162,74,.12), transparent)",
            }}
          />
        ))}
      </div>

      {/* Bottom atmospheric darkness (sits under the effects so candles stay visible) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "linear-gradient(transparent, rgba(13,7,5,.5))",
        }}
      />

      {/* Subtle vignette (sits under the effects) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, transparent 40%, rgba(5,2,2,.34) 100%)",
        }}
      />

      {/* Moving velvet / enchanted veils */}
      <Veil
        side="left"
        delay={0}
        duration={18}
      />

      <Veil
        side="left"
        delay={3}
        duration={23}
      />

      <Veil
        side="right"
        delay={1}
        duration={20}
      />

      <Veil
        side="right"
        delay={5}
        duration={25}
      />

      {/* Distant wizard-like silhouette */}
      <WizardSilhouette />

      {/* Floating magical dust */}
      <MagicalDust />

      {/* Candlelight */}
      <CandleGlow />

      {/* Floating book */}
      <motion.div
        className="absolute right-[5%] top-[24%] z-[2] hidden md:block"
        animate={{
          y: [-5, 7, -3, 6, -5],
          rotate: [-2, 2, -1, 2, -2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          opacity: 0.6,
        }}
      >
        <div
          className="relative h-16 w-24 border"
          style={{
            transform:
              "perspective(300px) rotateX(18deg) rotateZ(-7deg)",
            borderColor:
              "rgba(201,162,74,.7)",
            background:
              "linear-gradient(135deg, #6E2638, #2A1512)",
            boxShadow:
              "0 0 28px rgba(201,162,74,.35)",
          }}
        >
          <BookOpen
            size={28}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              color: COLORS.gold,
            }}
          />
        </div>
      </motion.div>

      {/* Small magical symbols */}
      <motion.div
        className="absolute left-[3%] top-[22%] z-[2]"
        animate={{
          opacity: [0.35, 0.85, 0.35],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      >
        <Sparkles
          size={30}
          style={{
            color: "#C9A24A",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute right-[4%] top-[52%] z-[2]"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
        }}
      >
        <Wand2
          size={28}
          style={{
            color: "#C9A24A",
          }}
        />
      </motion.div>
    </div>
  );
}
