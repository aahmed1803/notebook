import { create } from "zustand";

interface JoinModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useJoinModal = create<JoinModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));