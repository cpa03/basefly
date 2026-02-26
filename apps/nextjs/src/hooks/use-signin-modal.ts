import { create } from "zustand";

interface useSigninModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: (open?: boolean) => void;
}

export const useSigninModal = create<useSigninModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: (open?: boolean) => set({ isOpen: open ?? false }),
}));
