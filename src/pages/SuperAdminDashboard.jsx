import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext.jsx';
import { useSystems } from '../context/SystemContext.jsx';
import { useParts } from '../context/PartsContext.jsx';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSystems: 0,
    totalParts: 0,
    totalEmployees: 0,
  });

  const navigate = useNavigate();

  const {setEmployees } = useEmployees();
  const {setSystems } = useSystems();
  const {setParts } = useParts()

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://systrack-backend-deployment.onrender.com/api/system/stats');
      setStats((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };


  useEffect(() => {
    fetchStats();
  }, []);

  const handleView = async (type) => {
    let endpoint = '';
    let setter = null;
    switch (type) {
      case 'systems':
        endpoint = '/api/system/allsys';
        setter = setSystems;
        break;
      case 'parts':
        endpoint = '/api/part';
        setter = setParts;
        break;
      case 'employees':
        endpoint = '/api/employee/allemployee';
        setter = setEmployees;
        break;
      default:
        return;
    }

    try {
      const res = await axios.get(`https://systrack-backend-deployment.onrender.com${endpoint}`);
      if (type == 'employees') setEmployees(res.data[type]);
      else if (type == 'parts') setParts(res.data[type]);
      else if (type == 'systems') setSystems(res.data[type]);
      navigate(`${type}`);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const cardData = [
    { label: 'Total Systems', value: stats.totalSystems, key: 'systems', color: 'bg-blue-500' },
    { label: 'Total Parts', value: stats.totalParts, key: 'parts', color: 'bg-green-500' },
    { label: 'Total Employees', value: stats.totalEmployees, key: 'employees', color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-10 text-center sm:text-left tracking-tight drop-shadow-md">
        SysTrack Dashboard
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cardData.map((card) => (
          <button
            key={card.key}
            onClick={() => handleView(card.key)}
            className={`${card.color} text-white flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:scale-[1.02] transition-transform duration-300 ease-in-out`}
          >
            <h2 className="text-lg sm:text-xl font-semibold">{card.label}</h2>
            <p className="text-3xl sm:text-4xl font-bold mt-2">{card.value}</p>
          </button>
        ))}
      </div>
    </div>

  );
};

export default SuperAdminDashboard;
