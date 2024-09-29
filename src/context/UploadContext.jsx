import React, { createContext, useState, useContext } from 'react';

const UploadContext = createContext();

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider = ({ children }) => {
  const [uploadResponse, setUploadResponse] = useState(null);

  const updateUploadResponse = (data) => {
    setUploadResponse(data);
  };

  return (
    <UploadContext.Provider value={{ uploadResponse, updateUploadResponse }}>
      {children}
    </UploadContext.Provider>
  );
};