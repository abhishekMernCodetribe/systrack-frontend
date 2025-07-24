import React, { createContext, useState, useContext, useEffect } from 'react';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const [systems, setSystems] = useState([]);

    return (
        <SystemContext.Provider value={{ systems, setSystems }}>
            {children}
        </SystemContext.Provider>
    );
};
export const useSystems = () => useContext(SystemContext);