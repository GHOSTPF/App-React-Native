import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const [points, setPoints] = useState([]);

  return (
    <PointsContext.Provider value={{ points, setPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
