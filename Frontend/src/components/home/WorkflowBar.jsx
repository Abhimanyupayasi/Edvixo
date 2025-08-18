import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaCogs, FaClipboardCheck, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const steps = [
	{ key: 'Onboard', Icon: FaUsers, bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Onboard' },
	{ key: 'Configure', Icon: FaCogs, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Configure' },
	{ key: 'Publish', Icon: FaRocket, bg: 'bg-sky-100', text: 'text-sky-700', label: 'Publish' },
	{ key: 'Enroll', Icon: FaClipboardCheck, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Enroll' },
	{ key: 'Collect', Icon: FaMoneyBillWave, bg: 'bg-green-100', text: 'text-green-700', label: 'Collect' },
	{ key: 'Track', Icon: FaChartLine, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Track' },
];

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08, delayChildren: 0.1 },
	},
};

const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

export default function WorkflowBar(){
	return (
		<section className="bg-[#0B1220] border-t border-white/5 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<p className="text-center text-xs uppercase tracking-wider text-gray-400">Your workflow, simplified</p>
				<motion.div
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.3 }}
					className="mt-6 flex flex-col items-center"
				>
					<div className="flex -space-x-2">
						{steps.map(({ key, Icon, bg, text, label }) => (
							<motion.span
								key={key}
								variants={item}
								className="hover:scale-150 hover:z-10 transform ease-in-out transition duration-500"
								style={{ willChange: 'transform' }}
								aria-label={label}
								title={label}
							>
								<div className={`flex justify-center items-center text-2xl sm:text-5xl ${bg} ${text} h-10 w-10 sm:h-20 sm:w-20 rounded-full ring-2 ring-white/80`}>
									<Icon />
								</div>
							</motion.span>
						))}
					</div>
					<div className="mt-4 hidden sm:flex gap-6 text-xs text-gray-300">
						{steps.map((s) => (
							<span key={s.key} className="min-w-14 text-center">{s.label}</span>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}

