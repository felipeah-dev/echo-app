// ==============================================
// ECHO - Success Animation Component
// ==============================================

import { CheckCircle2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessAnimationProps {
  synced: string[];
  timeSaved: number;
}

export function SuccessAnimation({ synced, timeSaved }: SuccessAnimationProps) {
  const icons: Record<string, string> = {
    slack: "💬",
    sheets: "📊",
    email: "📧",
    calendar: "📅",
  };

  return (
    <div className="space-y-4">
      {/* Main Success Card */}
      <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 p-6 animate-in zoom-in-50 duration-500">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full animate-in zoom-in-75 duration-700">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>

          {/* Success Message */}
          <div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              All Systems Synced! 🎉
            </h3>
            <p className="text-gray-600">
              Deal updated across {synced.length} platforms
            </p>
          </div>

          {/* Synced Platforms */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {synced.map((target, idx) => (
              <div
                key={target}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Badge className="bg-green-500 text-white hover:bg-green-600 text-base px-4 py-2">
                  <span className="mr-2">{icons[target] || "✓"}</span>
                  {target}
                </Badge>
              </div>
            ))}
          </div>

          {/* Time Saved */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white animate-in fade-in-50 duration-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-lg font-semibold">Time Saved</span>
            </div>
            <div className="text-4xl font-bold">
              {Math.floor(timeSaved / 60)} minutes
            </div>
            <p className="text-sm text-white/80 mt-1">
              vs. manual process (~{Math.floor((timeSaved + 210) / 60)} min)
            </p>
          </div>
        </div>
      </Card>

      {/* Impact Visualization */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center border-purple-500/20 animate-in slide-in-from-left duration-500">
          <div className="text-3xl font-bold text-purple-600">77%</div>
          <div className="text-sm text-gray-600">Faster</div>
        </Card>
        <Card className="p-4 text-center border-pink-500/20 animate-in slide-in-from-right duration-500">
          <div className="text-3xl font-bold text-pink-600">{synced.length}/4</div>
          <div className="text-sm text-gray-600">Platforms</div>
        </Card>
      </div>
    </div>
  );
}

// ==============================================
// Usage Example:
// ==============================================
/*
import { SuccessAnimation } from "@/components/custom/SuccessAnimation";

// In your component after successful sync:
{result?.success && (
  <SuccessAnimation 
    synced={result.synced} 
    timeSaved={result.timeSavedSec} 
  />
)}
*/