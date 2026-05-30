const AuthCard = ({ title, children }) => {
  return (
    <div
      className="
      w-full
      max-w-md
      bg-slate-900
      border
      border-slate-800
      rounded-3xl
      p-8
      shadow-2xl
      text-white
      "
    >
      <h2 className="text-4xl font-bold text-white mb-8">{title}</h2>

      {children}
    </div>
  );
};

export default AuthCard;
