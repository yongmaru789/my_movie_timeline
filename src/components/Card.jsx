export default function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}