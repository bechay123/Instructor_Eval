import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface LoadingState {
  isLoading: boolean;
  message: string;
  submessage: string;
}

interface LoadingContextType {
  loadingState: LoadingState;
  showLoading: (message?: string, submessage?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string, submessage?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "Loading...",
    submessage: "Please wait",
  });

  const showLoading = useCallback(
    (message = "Loading...", submessage = "Please wait") => {
      setLoadingState({
        isLoading: true,
        message,
        submessage,
      });
    },
    []
  );

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const setLoadingMessage = useCallback(
    (message: string, submessage?: string) => {
      setLoadingState((prev) => ({
        ...prev,
        message,
        submessage: submessage || prev.submessage,
      }));
    },
    []
  );

  const value: LoadingContextType = {
    loadingState,
    showLoading,
    hideLoading,
    setLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export default LoadingContext;
