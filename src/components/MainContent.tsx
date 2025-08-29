import React from 'react';

interface MainContentProps {
  title: string;
  children?: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ title, children }) => {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          {children || (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to {title}</h3>
              <p className="text-gray-600">Your content will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
