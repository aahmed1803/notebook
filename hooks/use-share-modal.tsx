import { create } from "zustand";

interface ShareModalStore {
  isOpen: boolean;
  documentId: string | null;
  existingCode: string | null;
  onOpen: (documentId: string, existingCode?: string | null) => void;
  onClose: () => void;
}

export const useShareModal = create<ShareModalStore>((set) => ({
  isOpen: false,
  documentId: null,
  existingCode: null,
  onOpen: (documentId: string, existingCode?: string | null) =>
    set({ isOpen: true, documentId, existingCode: existingCode || null }),
  onClose: () => set({ isOpen: false, documentId: null, existingCode: null }),
}));