'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Image, Gauge, Save } from 'lucide-react'

interface ProcessingStepsProps {
  currentStep: number
}

export default function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const steps = [
    { icon: Image, label: 'Analyzing image...' },
    { icon: Gauge, label: 'Optimizing compression...' },
    { icon: Save, label: 'Finalizing...' },
  ]

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === index
        const isComplete = currentStep > index

        return (
          <motion.div
            key={index}
            className={`flex items-center gap-3 text-sm ${
              isActive ? 'text-purple-600' : isComplete ? 'text-green-600' : 'text-gray-400'
            }`}
            animate={{ opacity: isActive || isComplete ? 1 : 0.5 }}
          >
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Icon className="h-5 w-5" />
            )}
            <span>{step.label}</span>
            {isActive && (
              <motion.div
                className="h-1 w-1 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

