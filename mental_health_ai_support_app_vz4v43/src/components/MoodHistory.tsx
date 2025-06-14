import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const moodEmojis: Record<string, string> = {
  "Happy": "😊",
  "Sad": "😔",
  "Anxious": "😰",
  "Calm": "😌",
  "Angry": "😤",
  "Tired": "😴",
  "Grateful": "🤗",
  "Confused": "😕",
};

export function MoodHistory() {
  const moodHistory = useQuery(api.mood.getMoodHistory) || [];
  const moodStats = useQuery(api.mood.getMoodStats);

  if (moodHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No mood entries yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start tracking your mood to see patterns and insights over time.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <strong>💡 Tip:</strong> Regular mood tracking can help you identify triggers 
          and patterns in your emotional well-being.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {moodStats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">
              {moodStats.avgIntensity}
            </div>
            <div className="text-sm text-blue-800">Average Intensity</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {moodEmojis[moodStats.mostCommonMood]} {moodStats.mostCommonMood}
            </div>
            <div className="text-sm text-green-800">Most Common Mood</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-600">
              {moodStats.totalEntries}
            </div>
            <div className="text-sm text-purple-800">Total Entries</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-600">
              {moodStats.recentTrend.toFixed(1)}
            </div>
            <div className="text-sm text-orange-800">Recent Trend</div>
          </div>
        </div>
      )}

      {/* Mood Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
        <div className="space-y-4">
          {moodHistory.map((entry) => (
            <div key={entry._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{moodEmojis[entry.mood]}</div>
                  <div>
                    <div className="font-medium text-gray-900">{entry.mood}</div>
                    <div className="text-sm text-gray-500">
                      Intensity: {entry.intensity}/10
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry._creationTime).toLocaleDateString()} at{" "}
                  {new Date(entry._creationTime).toLocaleTimeString()}
                </div>
              </div>

              {entry.triggers && entry.triggers.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-2">Triggers:</div>
                  <div className="flex flex-wrap gap-2">
                    {entry.triggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.notes && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">Notes:</div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                    {entry.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          💡 Insights & Patterns
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          {moodStats && (
            <>
              <p>
                • Your most common mood is <strong>{moodStats.mostCommonMood}</strong>, 
                which suggests a general trend in your emotional state.
              </p>
              <p>
                • Your average mood intensity is <strong>{moodStats.avgIntensity}/10</strong>, 
                indicating {moodStats.avgIntensity > 7 ? "high" : moodStats.avgIntensity > 4 ? "moderate" : "low"} emotional intensity.
              </p>
              <p>
                • You've logged <strong>{moodStats.totalEntries}</strong> mood entries, 
                showing great commitment to self-awareness.
              </p>
            </>
          )}
          <p className="mt-4 text-blue-700 bg-blue-100 rounded-lg p-3">
            <strong>Remember:</strong> Tracking your mood is a powerful tool for understanding 
            your emotional patterns. Consider discussing these insights with a mental health 
            professional for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
