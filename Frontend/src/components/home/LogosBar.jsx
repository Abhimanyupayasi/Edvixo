import React from 'react';
import { motion } from 'framer-motion';
import { 
  SiTailwindcss, 
  SiReact, 
  SiNodedotjs, 
  SiMongodb, 
  SiVite 
} from 'react-icons/si';

const techBadges = [
  { key: 'Tailwind CSS', Icon: SiTailwindcss, bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { key: 'React', Icon: SiReact, bg: 'bg-sky-200', text: 'text-sky-700' },
  { key: 'Node.js', Icon: SiNodedotjs, bg: 'bg-green-200', text: 'text-green-600' },
  { key: 'MongoDB', Icon: SiMongodb, bg: 'bg-lime-100', text: 'text-lime-600' },
  { key: 'Vite', Icon: SiVite, bg: 'bg-purple-100', text: 'text-purple-600' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function LogosBar(){
  return (
    <div className="bg-[#0B1220] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-center text-xs uppercase tracking-wider text-gray-400">Powered by modern tech</p>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-6 flex justify-center"
        >
          <div className="flex -space-x-2">
            {techBadges.map(({ key, Icon, bg, text }, idx) => (
              <motion.span
                key={key}
                variants={item}
                className="hover:scale-150 hover:z-10 transform ease-in-out transition duration-500"
                style={{ willChange: 'transform' }}
                aria-label={key}
                title={key}
              >
                <div
                  className={`flex justify-center items-center text-2xl sm:text-5xl ${bg} ${text} h-10 w-10 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-white/80`}
                >
                  <Icon />
                </div>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
