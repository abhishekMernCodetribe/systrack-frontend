import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx';
import { EmployeeProvider } from './context/EmployeeContext.jsx';
import { SystemProvider } from './context/SystemContext.jsx';
import { PartsProvider } from './context/PartsContext.jsx';


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <EmployeeProvider>
      <SystemProvider>
        <PartsProvider>
          <App />
        </PartsProvider>
      </SystemProvider>
    </EmployeeProvider>
  </AuthProvider>
)
