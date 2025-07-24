import React, { createContext, useState, useContext, useEffect } from 'react';

const PartsContext = createContext();


export const PartsProvider = ({ children }) => {
    const [parts, setParts] = useState([]);
    return (
        <PartsContext.Provider value={{ parts, setParts }}>
            {children}
        </PartsContext.Provider>
    );
};

export const useParts = () => useContext(PartsContext);