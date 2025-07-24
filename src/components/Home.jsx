import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="mb-8 text-3xl font-semibold text-gray-700">
        Welcome
      </h1>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
        >
          Log&nbsp;In
        </button>
      </div>
    </div>
  );
};

export default Home;
