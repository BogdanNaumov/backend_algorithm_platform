import React from 'react';
import ReactDOM from 'react-dom';

const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === 'undefined') return null;
  const root = document.body;
  return ReactDOM.createPortal(<>{children}</>, root);
};

export default ModalPortal;
