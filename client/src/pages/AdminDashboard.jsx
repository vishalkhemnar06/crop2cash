export default function FarmerDashboard() {
  const fullName = localStorage.getItem("fullName") || "Farmer";

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center">
      
      <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Farmer Dashboard
        </h1>

        <p className="text-gray-600 mb-6">
          Welcome, {fullName} 👋
        </p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

    </div>
  );
}