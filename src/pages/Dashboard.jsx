import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Dashboard = () => {
    const { cardData, handleView } = useOutletContext();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">SysTrack Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {cardData.map((card) => (
                    <button
                        key={card.key}
                        onClick={() => handleView(card.key)}
                        className={`${card.color} text-white p-6 rounded-lg shadow-lg hover:opacity-90 transition`}
                    >
                        <h2 className="text-xl font-semibold">{card.label}</h2>
                        <p className="text-3xl font-bold">{card.value}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
