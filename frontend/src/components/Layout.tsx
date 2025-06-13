import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Your layout content */}
      {children}
    </div>
  );
};

export default Layout; // Proper export