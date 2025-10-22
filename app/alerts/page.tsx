// FILE: /Users/bscott252/Downloads/cs-25-2-team6-main/cs-25-2-team6/app/alerts/page.tsx
'use client';

import React from 'react';
import AlertsDashboard from '../../components/alerts/AlertsDashboard';

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alerts Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage attendance alerts and student interventions
          </p>
        </div>
        <AlertsDashboard />
      </div>
    </div>
  );
}