import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlertDialog, { ButtonType } from '@/components/CustomAlertDialog';

type AlertDialogOptions = {
  title: string;
  message: string;
  buttons?: ButtonType[];
};

type AlertDialogContextValue = {
  showAlert: (title: string, message: string, buttons?: ButtonType[]) => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined);

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [props, setProps] = useState<AlertDialogOptions>({ title: '', message: '', buttons: [] });

  const showAlert = (title: string, message: string, buttons?: ButtonType[]) => {
    setProps({ title, message, buttons: buttons || [{ text: 'OK' }] });
    setIsVisible(true);
  };

  const handleClose = () => setIsVisible(false);

  return (
    <AlertDialogContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlertDialog
        isVisible={isVisible}
        title={props.title}
        message={props.message}
        buttons={props.buttons || []}
        onClose={handleClose}
      />
    </AlertDialogContext.Provider>
  );
};

export const useAlertDialog = (): AlertDialogContextValue => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('useAlertDialog must be used within AlertDialogProvider');
  return ctx;
};
