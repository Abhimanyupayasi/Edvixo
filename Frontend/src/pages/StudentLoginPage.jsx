import React from 'react';
import { useOutletContext } from 'react-router-dom';
import StudentLogin from '../components/siteBuilder/StudentLogin.jsx';

export default function StudentLoginPage(){
  const { site } = useOutletContext() || { site: null };
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Student Login</h1>
        <StudentLogin site={site} />
      </div>
    </div>
  );
}
