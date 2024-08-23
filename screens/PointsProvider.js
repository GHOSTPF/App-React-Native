import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const [points, setPoints] = useState([]);

  const addPoint = (newPoint) => {
    setPoints(prevPoints => [...prevPoints, newPoint]);
  };

  return (
    <PointsContext.Provider value={{ points, addPoint }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}
