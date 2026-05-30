import Sidebar from "../components/common/Sidebar";

const DashboardLayout = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-[#070B17]">

      <Sidebar />

      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;