import React, { useState } from 'react';
import { useSticky } from "../../context/StickyContext";
import { Pin, Trash2, Maximize2, Move, Palette, X, Mic, Image as ImageIcon } from 'lucide-react';

const StickyNote = ({ note }) => {
    const { updateNote, deleteNote, togglePin } = useSticky();
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (e.target.closest('.drag-handle')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - note.x,
                y: e.clientY - note.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            updateNote(note.id, {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const colors = {
        yellow: 'var(--note-yellow)',
        blue: 'var(--note-blue)',
        pink: 'var(--note-pink)',
        green: 'var(--note-green)',
        purple: 'var(--note-purple)'
    };

    return (
        <div
            className={`fixed z-[9999] shadow-xl rounded-lg border border-black/10 transition-shadow ${isDragging ? 'shadow-2xl ring-2 ring-blue-400' : ''}`}
            style={{
                left: note.x,
                top: note.y,
                width: note.width,
                height: note.height,
                backgroundColor: colors[note.color] || colors.yellow,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Toolbar */}
            <div
                className="drag-handle h-8 flex items-center justify-between px-2 bg-black/5 cursor-grab rounded-t-lg"
                onMouseDown={handleMouseDown}
            >
                <div className="flex gap-1">
                    <button
                        onClick={() => togglePin(note.id)}
                        className={`p-1 rounded hover:bg-black/10 transition-colors ${note.isPinned ? 'text-blue-600' : 'text-gray-400'}`}
                        title={note.isPinned ? "Unpin from this page" : "Pin to this page"}
                    >
                        <Pin size={14} fill={note.isPinned ? 'currentColor' : 'none'} />
                    </button>
                    <div className="flex gap-0.5 ml-1">
                        {Object.keys(colors).map(c => (
                            <button
                                key={c}
                                onClick={() => updateNote(note.id, { color: c })}
                                className={`w-3 h-3 rounded-full border border-black/10 ${note.color === c ? 'ring-1 ring-black/40' : ''}`}
                                style={{ backgroundColor: colors[c] }}
                            />
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 text-red-500 hover:bg-black/10 rounded"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-3 h-[calc(100%-2rem)] flex flex-col">
                <textarea
                    value={note.text}
                    onChange={(e) => updateNote(note.id, { text: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-[var(--text-primary)] w-full h-full placeholder:text-black/20"
                    placeholder="Type a note..."
                />

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                    <div className="flex gap-2">
                        <button className="text-black/40 hover:text-blue-600 transition-colors">
                            <Mic size={14} />
                        </button>
                        <button className="text-black/40 hover:text-blue-600 transition-colors">
                            <ImageIcon size={14} />
                        </button>
                    </div>
                    <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider">
                        Cognitive Assist
                    </div>
                </div>
            </div>

            {/* Resize Handle (Bottom-Right) */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-black/20"
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startW = note.width;
                    const startH = note.height;

                    const onMouseMove = (moveEvent) => {
                        updateNote(note.id, {
                            width: Math.max(150, startW + (moveEvent.clientX - startX)),
                            height: Math.max(100, startH + (moveEvent.clientY - startY))
                        });
                    };

                    const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                }}
            >
                <Maximize2 size={10} />
            </div>
        </div>
    );
};

export const StickyContainer = () => {
    const { notes, addNote } = useSticky();
    const currentPath = window.location.pathname;

    // Filter notes: global notes (not pinned) OR notes pinned to this specific path
    const visibleNotes = notes.filter(n => !n.isPinned || n.pinnedTo === currentPath);

    return (
        <>
            {/* Floating Action Button for Notes */}
            <button
                onClick={() => addNote({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 75 })}
                className="fixed bottom-24 right-8 z-[10000] w-12 h-12 bg-yellow-400 text-yellow-900 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-yellow-500 font-bold"
                title="Create a Sticky Note"
            >
                +🗒️
            </button>

            {visibleNotes.map(note => (
                <StickyNote key={note.id} note={note} />
            ))}
        </>
    );
};

export default StickyContainer;
