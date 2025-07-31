import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext.jsx';
import { useSystems } from '../context/SystemContext.jsx';
import { useParts } from '../context/PartsContext.jsx';
import { HashLoader } from 'react-spinners';

const SuperAdminDashboard = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSystems: 0,
    allocatedSystems: 0,
    unallocatedSystems: 0,
    totalParts: 0,
    activeParts: 0,
    unusableParts: 0,
    totalEmployees: 0,
  });

  const navigate = useNavigate();

  const { setEmployees } = useEmployees();
  const { setSystems } = useSystems();
  const { setParts } = useParts()

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/system/stats`);
      setStats((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
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
      case 'activeParts':
        endpoint = '/api/part';
        setter = setParts;
        break;
      case 'unusableParts':
        endpoint = '/api/part';
        setter = setParts;
        break;
      case 'employees':
        endpoint = '/api/employee/allemployee';
        setter = setEmployees;
        break;
      case 'allocatedSystems':
        endpoint = '/api/system/allsys';
        setter = setSystems;
        break;
      case 'unallocatedSystems':
        endpoint = '/api/system/allsys';
        setter = setSystems;
        break;
      default:
        return;
    }

    try {
      const res = await axios.get(`${baseURL}${endpoint}`);
      if (type == 'employees') setEmployees(res.data[type]);
      else if (type == 'parts' || type === 'activeParts' || type === 'unusableParts') setParts(res.data[type]);
      else if (type == 'systems' || type == 'allocatedSystems') setSystems(res.data[type]);
      navigate(`${type}`);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const cardData = [
    { label: 'Total Systems', value: stats.totalSystems, key: 'systems', color: 'bg-blue-500' },
    { label: 'Total Parts', value: stats.totalParts, key: 'parts', color: 'bg-green-500' },
    { label: 'Total Employees', value: stats.totalEmployees, key: 'employees', color: 'bg-purple-500' },
    { label: 'Allocated Systems', value: stats.allocatedSystems, key: 'allocatedSystems', color: 'bg-blue-500' },
    { label: 'Unallocated Systems', value: stats.unallocatedSystems, key: 'unallocatedSystems', color: 'bg-blue-500' },
    { label: 'Active Parts', value: stats.activeParts, key: 'activeParts', color: 'bg-green-500' },
    { label: 'Unusable Parts', value: stats.unusableParts, key: 'unusableParts', color: 'bg-green-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <HashLoader color="#62ad61" />
      </div>
    );
  }

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
