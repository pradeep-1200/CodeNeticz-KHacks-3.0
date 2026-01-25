import React, { createContext, useContext, useState, useEffect } from 'react';

const StickyContext = createContext();

export const StickyProvider = ({ children }) => {
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('aclc_sticky_notes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('aclc_sticky_notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = (noteData) => {
        const newNote = {
            id: Date.now(),
            text: '',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            color: 'yellow',
            pinnedTo: window.location.pathname,
            isPinned: true,
            type: 'text', // text, voice, image
            ...noteData
        };
        setNotes([...notes, newNote]);
    };

    const updateNote = (id, updates) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const togglePin = (id) => {
        setNotes(notes.map(n =>
            n.id === id ? { ...n, isPinned: !n.isPinned, pinnedTo: window.location.pathname } : n
        ));
    };

    return (
        <StickyContext.Provider value={{ notes, addNote, updateNote, deleteNote, togglePin }}>
            {children}
        </StickyContext.Provider>
    );
};

export const useSticky = () => {
    const context = useContext(StickyContext);
    if (!context) {
        return {
            notes: [],
            addNote: () => { },
            updateNote: () => { },
            deleteNote: () => { },
            togglePin: () => { }
        };
    }
    return context;
};
