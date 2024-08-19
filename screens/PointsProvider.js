import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const [points, setPoints] = useState([]);

  return (
    <PointsContext.Provider value={{ points, setPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}
