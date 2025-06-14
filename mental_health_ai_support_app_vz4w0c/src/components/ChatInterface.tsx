import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { VoiceRecorder } from "./VoiceRecorder";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.conversations.getConversations, { sessionId }) || [];
  const sendMessage = useMutation(api.conversations.sendMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleSendMessage = async (messageText: string, audioTranscript?: string) => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    try {
      await sendMessage({
        message: messageText,
        sessionId,
        audioTranscript,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = (transcript: string) => {
    handleSendMessage(transcript, transcript);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hi there! I'm here to listen.
            </h3>
            <p className="text-gray-600 mb-6">
              You can type a message or use the voice recorder to share how you're feeling.
              Everything you share is private and secure.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
              <strong>💡 Tip:</strong> Try saying something like "I'm feeling anxious about work" 
              or "I had a great day today" to get started.
            </div>
          </div>
        ) : (
          conversations.slice().reverse().map((conv) => (
            <div key={conv._id} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-sm">{conv.message}</p>
                  </div>
                  {conv.audioTranscript && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      🎤 Voice message
                    </p>
                  )}
                  {conv.sentiment && (
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      Mood: {conv.sentiment.label} 
                      {conv.sentiment.label === "positive" && " 😊"}
                      {conv.sentiment.label === "negative" && " 😔"}
                      {conv.sentiment.label === "neutral" && " 😐"}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3">
                    <p className="text-sm">{conv.response}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    MindfulAI • {new Date(conv._creationTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <VoiceRecorder onTranscript={handleVoiceMessage} />
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
