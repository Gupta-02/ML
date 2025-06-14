import { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { MoodTracker } from "./MoodTracker";
import { MoodHistory } from "./MoodHistory";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"chat" | "mood" | "history">("chat");

  const tabs = [
    { id: "chat" as const, label: "AI Support", icon: "💬" },
    { id: "mood" as const, label: "Mood Check", icon: "😊" },
    { id: "history" as const, label: "My Journey", icon: "📊" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Your Mental Wellness Space
        </h1>
        <p className="text-gray-600">
          I'm here to listen, support, and help you navigate your mental health journey.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "chat" && <ChatInterface />}
          {activeTab === "mood" && <MoodTracker />}
          {activeTab === "history" && <MoodHistory />}
        </div>
      </div>

      {/* Emergency Resources */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          🚨 Need Immediate Help?
        </h3>
        <p className="text-red-700 mb-4">
          If you're experiencing a mental health crisis, please reach out for immediate support:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-red-800">Crisis Text Line:</strong>
            <br />
            Text HOME to 741741
          </div>
          <div>
            <strong className="text-red-800">National Suicide Prevention Lifeline:</strong>
            <br />
            Call or text 988
          </div>
        </div>
      </div>
    </div>
  );
}
