import { useState, useEffect } from 'react';

export interface AdvisorNote {
  note: string;
  isRead: boolean;
  updatedAt: string;
  readAt?: string;
}

const STORAGE_KEY = 'nexus_advisor_notes';

export const useAdvisorNotes = () => {
  const [notes, setNotes] = useState<Record<string, AdvisorNote>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing advisor notes", e);
      }
    }
  }, []);

  const getNote = (clientId: string): AdvisorNote | null => {
    return notes[clientId] || null;
  };

  const updateNote = (clientId: string, noteContent: string) => {
    const newNotes = {
      ...notes,
      [clientId]: {
        note: noteContent,
        isRead: false,
        updatedAt: new Date().toISOString()
      }
    };
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  const markAsRead = (clientId: string) => {
    if (!notes[clientId]) return;
    const newNotes = {
      ...notes,
      [clientId]: {
        ...notes[clientId],
        isRead: true,
        readAt: new Date().toISOString()
      }
    };
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  return { notes, getNote, updateNote, markAsRead };
};
