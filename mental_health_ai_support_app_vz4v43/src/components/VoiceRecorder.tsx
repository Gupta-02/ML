import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        await processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // For demo purposes, we'll simulate speech-to-text
      // In production, you'd use a service like OpenAI Whisper, Google Speech-to-Text, etc.
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, we'll use a placeholder transcript
      // You would replace this with actual speech-to-text API call
      const mockTranscripts = [
        "I'm feeling really anxious about my upcoming presentation at work.",
        "I had a wonderful day today, spent time with family and felt really grateful.",
        "I'm struggling with sleep lately and it's affecting my mood.",
        "I feel overwhelmed with all the tasks I need to complete.",
        "I'm proud of myself for completing my workout today.",
        "I'm having trouble concentrating and feel scattered.",
        "I feel lonely even when I'm around other people.",
        "I'm excited about the new project I'm starting.",
      ];
      
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      onTranscript(randomTranscript);
      
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Sorry, I couldn't process your voice message. Please try typing instead.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      className={`p-3 rounded-2xl transition-all duration-200 ${
        isRecording
          ? "bg-red-500 text-white animate-pulse"
          : isProcessing
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      title={
        isRecording
          ? "Click to stop recording"
          : isProcessing
          ? "Processing your voice..."
          : "Click to start voice recording"
      }
    >
      {isProcessing ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isRecording ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
