import React from 'react';
import Navbar from '../components/Navbar';
import DocumentVault from '../components/DocumentVault';

const Reports: React.FC = () => {
  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-10 space-y-6 md:space-y-8 animate-fade-in">
        <section className="w-full">
          <DocumentVault />
        </section>
      </main>
    </div>
  );
};

export default Reports;
