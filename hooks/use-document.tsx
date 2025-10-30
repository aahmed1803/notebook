"use client";

import { create } from "zustand";
import { type Document } from "@/lib/firestore";

interface DocumentStore {
  documents: Map<string, Document>;
  documentList: Document[]; // NEW: Track all documents in a list
  setDocument: (id: string, document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  addDocument: (document: Document) => void; // NEW: Add document
  setDocumentList: (documents: Document[]) => void; // NEW: Set entire list
  getDocument: (id: string) => Document | undefined;
}

export const useDocument = create<DocumentStore>((set, get) => ({
  documents: new Map(),
  documentList: [],
  
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
        const updated = { ...existing, ...updates };
        newDocuments.set(id, updated);
        
        // Also update in document list
        const newList = state.documentList.map(doc => 
          doc.id === id ? updated : doc
        );
        
        return { documents: newDocuments, documentList: newList };
      }
      return state;
    });
  },
  
  removeDocument: (id: string) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      newDocuments.delete(id);
      
      // Also remove from document list
      const newList = state.documentList.filter(doc => doc.id !== id);
      
      return { documents: newDocuments, documentList: newList };
    });
  },
  
  addDocument: (document: Document) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      newDocuments.set(document.id, document);
      
      // Add to document list if not already present
      const exists = state.documentList.some(doc => doc.id === document.id);
      const newList = exists 
        ? state.documentList 
        : [document, ...state.documentList];
      
      return { documents: newDocuments, documentList: newList };
    });
  },
  
  setDocumentList: (documents: Document[]) => {
    set((state) => {
      const newDocuments = new Map(state.documents);
      documents.forEach(doc => newDocuments.set(doc.id, doc));
      return { documents: newDocuments, documentList: documents };
    });
  },
  
  getDocument: (id: string) => {
    return get().documents.get(id);
  },
}));