const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-[#070B17]">
      <div
        className="
        hidden
        lg:flex
        w-1/2
        items-center
        justify-center
        bg-linear-to-br
        from-violet-900
        via-purple-700
        to-indigo-900
        "
      >
        <div className="max-w-lg px-10 text-white">
          <h1 className="text-6xl font-bold mb-6">CineVerse Empire</h1>

          <p className="text-xl text-slate-200">
            Build Movies. Create Legends. Rule The Entertainment Industry.
          </p>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
