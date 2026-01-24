import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { 
  FileText, Video, Mic, Heart, MessageSquare, Send, 
  MoreVertical, Lock, Globe, Share2, Download 
} from 'lucide-react';

const Classroom = () => {
  const [activeTab, setActiveTab] = useState('stream');
  const [privateComment, setPrivateComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const materials = [
    { id: 1, title: 'Introduction to Photosynthesis', type: 'video', date: 'Oct 24', likes: 12 },
    { id: 2, title: 'Chapter 4: Cell Structure.pdf', type: 'pdf', date: 'Oct 23', likes: 5 },
    { id: 3, title: 'Audio Summary: Week 3', type: 'audio', date: 'Oct 22', likes: 8 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <Navbar />

      {/* Classroom Header */}
      <div className="bg-[var(--accent-primary)] text-white pt-12 pb-6 px-6 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl font-bold mb-2">Biology 101: Life Sciences</h1>
          <p className="text-xl opacity-90">Mr. Anderson • Room 302</p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-white opacity-10 rounded-full mb-[-40px] pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 grid md:grid-cols-4 gap-6">
        
        {/* Sidebar Info */}
        <div className="hidden md:block col-span-1 space-y-6">
           <div className="bg-[var(--bg-primary)] p-4 rounded-xl shadow border border-[var(--border-color)]">
              <h3 className="font-bold mb-4">Upcoming Due</h3>
              <p className="text-sm text-[var(--text-secondary)] italic">No work due soon!</p>
              <button className="mt-4 text-[var(--accent-primary)] text-sm font-bold hover:underline">View all</button>
           </div>
        </div>

        {/* Main Stream */}
        <div className="col-span-3 space-y-6">
           
           {/* Mock Invite Acceptance */}
           <div className="bg-[var(--bg-primary)] p-6 rounded-xl shadow border border-[var(--border-color)] flex items-center justify-between">
              <div>
                 <h3 className="font-bold text-lg">Class Invitation</h3>
                 <p className="text-[var(--text-secondary)]">Ms. Roberts invited you to 'Mathematics 101'</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-bold hover:opacity-90">Join</button>
                 <button className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg font-bold hover:bg-gray-300">Decline</button>
              </div>
           </div>

           {/* Materials List */}
           {materials.map((item) => (
             <div key={item.id} className="bg-[var(--bg-primary)] rounded-xl shadow border border-[var(--border-color)] overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Header */}
                <div className="p-4 flex items-start gap-4 border-b border-[var(--border-color)]">
                   <div className={`p-3 rounded-full ${
                      item.type === 'video' ? 'bg-red-100 text-red-500' : 
                      item.type === 'pdf' ? 'bg-blue-100 text-blue-500' : 'bg-purple-100 text-purple-500'
                   } dark:bg-slate-800`}>
                      {item.type === 'video' ? <Video size={24}/> : item.type === 'pdf' ? <FileText size={24}/> : <Mic size={24}/>}
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Posted on {item.date}</p>
                   </div>
                   <button className="text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full">
                      <MoreVertical size={20}/>
                   </button>
                </div>

                {/* Content Placeholder */}
                <div className="p-4 bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
                   Click to view {item.type} material...
                </div>

                {/* Actions */}
                <div className="p-3 flex items-center justify-between bg-[var(--bg-primary)]">
                   <div className="flex gap-4">
                      <button className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                         <Heart size={18}/> <span className="text-sm font-medium">{item.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                         <MessageSquare size={18}/> <span className="text-sm font-medium">Comment</span>
                      </button>
                   </div>
                    <div className="flex gap-2">
                       <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Share2 size={18}/></button>
                       <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Download size={18}/></button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-[var(--bg-secondary)] p-4 border-t border-[var(--border-color)]">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 relative">
                         <input 
                            type="text" 
                            placeholder={privateComment ? "Add a private comment to teacher..." : "Add a class comment..."}
                            className="w-full pl-4 pr-10 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                         />
                         <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]">
                            <Send size={18} />
                         </button>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPrivateComment(!privateComment)}>
                      <div className={`w-8 h-5 rounded-full relative transition-colors ${privateComment ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-slate-600'}`}>
                         <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${privateComment ? 'left-4' : 'left-1'}`}></div>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                         {privateComment ? <Lock size={12}/> : <Globe size={12}/>}
                         {privateComment ? 'Private (Teacher Only)' : 'Public (Class)'}
                      </span>
                   </div>
                </div>

             </div>
           ))}

        </div>
      </div>
    </div>
  );
};

export default Classroom;
