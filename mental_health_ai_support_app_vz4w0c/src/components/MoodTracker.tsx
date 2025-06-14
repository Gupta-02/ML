import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const moods = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-100 text-yellow-800" },
  { emoji: "😔", label: "Sad", color: "bg-blue-100 text-blue-800" },
  { emoji: "😰", label: "Anxious", color: "bg-red-100 text-red-800" },
  { emoji: "😌", label: "Calm", color: "bg-green-100 text-green-800" },
  { emoji: "😤", label: "Angry", color: "bg-red-100 text-red-800" },
  { emoji: "😴", label: "Tired", color: "bg-gray-100 text-gray-800" },
  { emoji: "🤗", label: "Grateful", color: "bg-purple-100 text-purple-800" },
  { emoji: "😕", label: "Confused", color: "bg-orange-100 text-orange-800" },
];

const commonTriggers = [
  "Work stress", "Relationship issues", "Health concerns", "Financial worries",
  "Family problems", "Social situations", "Sleep issues", "Weather",
  "News/Media", "Physical pain", "Loneliness", "Change/Uncertainty"
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logMood = useMutation(api.mood.logMood);

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsSubmitting(true);
    try {
      await logMood({
        mood: selectedMood,
        intensity,
        notes: notes.trim() || undefined,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
      });

      toast.success("Mood logged successfully!");
      
      // Reset form
      setSelectedMood("");
      setIntensity(5);
      setNotes("");
      setSelectedTriggers([]);
    } catch (error) {
      console.error("Failed to log mood:", error);
      toast.error("Failed to log mood. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling?</h2>
        <p className="text-gray-600">
          Take a moment to check in with yourself and track your emotional well-being.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select your current mood:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => setSelectedMood(mood.label)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === mood.label
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-medium text-gray-900">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Scale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            How intense is this feeling? ({intensity}/10)
          </label>
          <div className="px-4">
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Very Mild</span>
              <span>Moderate</span>
              <span>Very Intense</span>
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What might have triggered this feeling? (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {commonTriggers.map((trigger) => (
              <button
                key={trigger}
                type="button"
                onClick={() => handleTriggerToggle(trigger)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedTriggers.includes(trigger)
                    ? "bg-blue-100 border-blue-300 text-blue-800"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {trigger}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what happened or how you're feeling in more detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMood || isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Logging Mood..." : "Log My Mood"}
        </button>
      </form>
    </div>
  );
}
