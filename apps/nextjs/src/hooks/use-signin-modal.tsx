"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface SigninModalContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const SigninModalContext = createContext<SigninModalContextType | undefined>(
  undefined,
);

export function SigninModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  return (
    <SigninModalContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </SigninModalContext.Provider>
  );
}

export function useSigninModal() {
  const context = useContext(SigninModalContext);
  if (!context) {
    // Default values for fallback (for SSR safety)
    return {
      isOpen: false,
      onOpen: () => {
        /* no-op for SSR fallback */
      },
      onClose: () => {
        /* no-op for SSR fallback */
      },
    };
  }
  return context;
}
