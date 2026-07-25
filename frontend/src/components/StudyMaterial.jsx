import React, { useState } from 'react';
import { 
  Video, FileText, Mic, Heart, MessageSquare, 
  Volume2, Scissors, Bookmark, MoreVertical, BookOpen 
} from 'lucide-react';
import CommentBox from './CommentBox';

const StudyMaterial = ({ material }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(material.likes);
  const [showComments, setShowComments] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(1); // 1 = normal, 1.2 = large

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(material.title + ". " + material.desc);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommentSubmit = (commentData) => {
    console.log("Comment submitted:", commentData);
    // In a real app, you'd add this to a comments list
  };

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={24} />;
      case 'pdf': return <FileText size={24} />;
      case 'audio': return <Mic size={24} />;
      case 'reading-friendly': return <BookOpen size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'video': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'pdf': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'audio': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'reading-friendly': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'video': return '🎥 Video Lesson';
      case 'pdf': return '📝 Assignment';
      case 'audio': return '🎧 Audio Lesson';
      case 'reading-friendly': return '📘 Reading Material';
      default: return '📄 Material';
    }
  };

  return (
    <article className={`bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] transition-all hover:shadow-md mb-6 overflow-hidden ${highContrast ? 'contrast-125' : ''}`}>
      
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-4">
            <div className={`p-3 rounded-full h-fit flex items-center justify-center ${getTypeStyle(material.type)}`}>
              {getIcon(material.type)}
            </div>
            <div>
              <h3 
                className="font-bold text-[var(--text-primary)] transition-all"
                style={{ fontSize: `${1.25 * fontSize}rem`, lineHeight: '1.4' }}
              >
                {material.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-block px-2 py-0.5 text-xs rounded border font-semibold uppercase tracking-wide ${getTypeStyle(material.type)} border-current opacity-80`}>
                  {getTypeLabel(material.type)}
                </span>
                {material.type === 'reading-friendly' && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded border font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-current opacity-80">
                    🧠 Reading-Friendly
                  </span>
                )}
                <span className="text-sm text-[var(--text-secondary)] ml-1">Posted {material.date}</span>
              </div>
            </div>
          </div>
          <button className="text-[var(--text-secondary)] p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
            <MoreVertical size={20}/>
          </button>
        </div>

        <p 
          className="text-[var(--text-primary)] mb-6 leading-relaxed transition-all"
          style={{ fontSize: `${1 * fontSize}rem` }}
        >
          {material.desc}
        </p>

        {/* Inline Accessibility Controls */}
        <div className="flex flex-col gap-3 mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Reading Comfort Tools</span>
          <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleReadAloud}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Volume2 size={16}/> Read Aloud
          </button>
          <button 
             onClick={() => setFontSize(prev => prev === 1 ? 1.2 : 1)}
             className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-green-400 hover:text-green-600 transition-colors"
          >
            <span className="text-xs">A</span><span className="text-lg">A</span> Text Size
          </button>
          <button 
             onClick={() => setHighContrast(!highContrast)}
             className={`flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm font-semibold hover:border-purple-400 hover:text-purple-600 transition-colors ${highContrast ? 'ring-2 ring-purple-400' : ''}`}
          >
             Contrast
          </button>
          </div>
        </div>
      </div>

      {/* Interaction System */}
      <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 font-bold text-sm transition-colors ${liked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} /> 
              {liked ? 'Liked' : 'Like'} ({likesCount})
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 font-bold text-sm transition-colors ${showComments ? 'text-blue-600' : 'text-[var(--text-secondary)] hover:text-blue-600'}`}
            >
              <MessageSquare size={18} /> Comment
            </button>
          </div>
        </div>

        {showComments && (
          <div className="p-4 border-t border-[var(--border-color)] animate-in slide-in-from-top-2 duration-200">
            <CommentBox onSubmit={handleCommentSubmit} />
          </div>
        )}
      </div>

    </article>
  );
};

export default StudyMaterial;
