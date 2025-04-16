import React, { createContext, useContext, ReactNode } from 'react';
import Toast from 'react-native-toast-message';

interface ToastContextType {
  showToast: (message: string, type: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = (message: string, type: string) => {
    Toast.show({
      type,
      text1: message,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};


export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  
  return context;
};
