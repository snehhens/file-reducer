'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import FileReducer from './FileReducer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'image' | 'pdf' | 'background' | 'bulk';
  comingSoon?: boolean;
}

export default function ToolCard({ title, description, icon, type, comingSoon }: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !comingSoon && setIsOpen(true)}
        className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-colors
          ${comingSoon ? 'opacity-75 cursor-not-allowed' : 'hover:bg-white'}`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
        {comingSoon && (
          <span className="inline-block mt-4 text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
            Coming Soon
          </span>
        )}
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>{title}</DialogTitle>
          {(type === 'image' || type === 'pdf') && (
            <FileReducer type={type} onClose={() => setIsOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}