"use client";

// ==============================================
// ECHO - Predictive Alert Component (Refined)
// ==============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface PredictiveAlertProps {
  pattern: string[];
  frequency: number;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export function PredictiveAlert({
  pattern,
  frequency,
  onAccept,
  onDismiss,
}: PredictiveAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    onAccept?.();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onDismiss?.();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed top-20 right-6 z-50 w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-purple-500/30 bg-card shadow-2xl">
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

            {/* Content */}
            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon and title */}
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">🔮</div>
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Pattern Detected
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Would you like to automate this workflow?
                  </p>
                </div>
              </div>

              {/* Pattern flow */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                  {pattern.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full">
                        {step}
                      </span>
                      {index < pattern.length - 1 && (
                        <span className="text-purple-500 font-medium">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Frequency bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence</span>
                    <Badge variant="secondary" className="text-xs">
                      {frequency}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${frequency}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  🤖 Automate Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}