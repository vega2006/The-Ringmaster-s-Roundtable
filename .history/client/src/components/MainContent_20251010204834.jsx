export default function MainContent({ children }) {
  return (
    <main className="p-8 min-h-screen overflow-y-auto 
      bg-gradient-to-br from-indigo-900 via-pink-900 to-green-900 
      text-white">
      
      <div className="bg-gradient-to-r from-pink-700 via-blue-700 to-green-700 
        p-6 rounded-2xl shadow-lg backdrop-blur-sm">
        {children}
      </div>
    </main>
  );
}
