"use client";

import { create } from "zustand";
import { type Document } from "@/lib/firestore";

interface DocumentStore {
  documents: Map<string, Document>;
  setDocument: (id: string, document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
}

export const useDocument = create<DocumentStore>((set, get) => ({
  documents: new Map(),
  
  setDocument: (id: string, document: Document) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      newDocuments.set(id, document);
      return { documents: newDocuments };
    });
  },
  
  updateDocument: (id: string, updates: Partial<Document>) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      const existing = newDocuments.get(id);
      if (existing) {
        newDocuments.set(id, { ...existing, ...updates });
      }
      return { documents: newDocuments };
    });
  },
  
  removeDocument: (id: string) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      newDocuments.delete(id);
      return { documents: newDocuments };
    });
  },
  
  getDocument: (id: string) => {
    return get().documents.get(id);
  },
}));