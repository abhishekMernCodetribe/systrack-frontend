import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    role: null,
    id: null,
    name: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const id = localStorage.getItem("id");
    const name = localStorage.getItem("name");

    if (token && role && id) {
      setAuth({ token, role, id, name});
    }
    setLoading(false);
  }, []);

  const login = ({ token, role, id, name }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("id", id);
    localStorage.setItem("name", name);
    setAuth({ token, role, id, name });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, id: null , name: ""});
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
