"use client";

import { motion } from "framer-motion";

const orbs = [
  { color: "#a3e635", size: 400, x: "10%", y: "20%", duration: 20, delay: 0, moveX: [0, 60, -30, 0], moveY: [0, -50, 40, 0] },
  { color: "#7dd3fc", size: 300, x: "70%", y: "60%", duration: 25, delay: 2, moveX: [0, -40, 60, 0], moveY: [0, 50, -30, 0] },
  { color: "#a78bfa", size: 250, x: "50%", y: "10%", duration: 18, delay: 1, moveX: [0, 30, -50, 0], moveY: [0, -40, 30, 0] },
  { color: "#a3e635", size: 200, x: "80%", y: "80%", duration: 22, delay: 3, moveX: [0, -50, 20, 0], moveY: [0, 30, -40, 0] },
];

export function BgOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, ${orb.color}00 70%)`,
            opacity: 0.12,
            filter: "blur(80px)",
          }}
          animate={{
            translateX: orb.moveX,
            translateY: orb.moveY,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
