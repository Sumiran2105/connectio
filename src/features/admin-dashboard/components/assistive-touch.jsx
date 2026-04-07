import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Calendar, ClipboardCheck, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssistiveTouch() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // For mobile/click toggle
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Folder,
      label: 'Files',
      color: 'bg-emerald-500/20 text-emerald-600',
      path: '/admin/dashboard/files',
    },
    {
      icon: Calendar,
      label: 'Calendar',
      color: 'bg-blue-500/20 text-blue-600',
      path: '/admin/dashboard/calendar',
    },
    {
      icon: ClipboardCheck,
      label: 'Meetings',
      color: 'bg-purple-500/20 text-purple-600',
      path: '/admin/dashboard/meetings',
    },
  ];

  const toggleOpen = () => setIsOpen(!isOpen);

  // Use both hover for desktop and state for controlled interactions
  const active = isHovered || isOpen;

  return (
    <div 
      className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsOpen(false);
      }}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.05 }
                }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="group relative flex items-center gap-3"
              >
                <div className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-white/40 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-brand-ink opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg">
                  {item.label}
                </div>
                <div className={`flex size-12 items-center justify-center rounded-2xl ${item.color} backdrop-blur-xl border border-white/30 shadow-xl transition-all duration-300 group-hover:shadow-2xl`}>
                  <item.icon className="size-6" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex size-14 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-2xl shadow-2xl transition-colors duration-500 ${
          active ? 'bg-white/40' : 'hover:bg-white/30'
        }`}
      >
        <motion.div
          animate={{ rotate: active ? 45 : 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {active ? (
            <Plus className="size-6 text-brand-primary" />
          ) : (
            <div className="flex flex-col gap-1 items-center">
              <div className="size-1.5 rounded-full bg-brand-primary/60" />
              <div className="flex gap-1">
                 <div className="size-1.5 rounded-full bg-brand-primary/60" />
                 <div className="size-1.5 rounded-full bg-brand-primary/60" />
              </div>
              <div className="size-1.5 rounded-full bg-brand-primary/60" />
            </div>
          )}
        </motion.div>
        
        {!active && (
          <motion.div 
            className="absolute -inset-1 rounded-full bg-brand-primary/10 -z-10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.button>
    </div>
  );
}
