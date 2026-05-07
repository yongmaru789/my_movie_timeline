export function Button({ className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-2xl border border-sky-100 bg-white hover:bg-sky-50 active:scale-[0.99] transition font-semibold text-sky-400 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 rounded-2xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sky-700 ${className}`}
      style={{background: "#F5FBFF"}}
      {...props}
    />
  );
}