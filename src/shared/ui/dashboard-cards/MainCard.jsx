const MainCard = ({ children, className = "" }) => (
  <div className={`rounded-[12px] border border-[#e1e6ef] bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

export default MainCard;
