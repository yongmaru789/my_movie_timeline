export function Button({ className = "", ...props }) {
  return (
    <button
      className={`px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:scale-[0.99] transition ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}