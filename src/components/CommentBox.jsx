import React, { useState } from 'react';
import { Send, Mic, Lock, Globe } from 'lucide-react';

const CommentBox = ({ onSubmit }) => {
  const [commentText, setCommentText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit({ text: commentText, isPrivate });
      setCommentText('');
    }
  };

  const toggleListening = () => {
    // Mock STT logic
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setCommentText((prev) => prev + " (Voice Input: This is a great resource!)");
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isPrivate ? "Message teacher privately..." : "Share your thoughts in your own way..."}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[80px]"
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
              isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
             title="Voice Input"
          >
            <Mic size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              isPrivate 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
            {isPrivate ? 'Private (Teacher)' : 'Public'}
          </button>

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;
