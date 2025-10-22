// FILE: /Users/bscott252/Downloads/cs-25-2-team6-main/cs-25-2-team6/app/alerts/page.tsx
'use client';

import React from 'react';
import AlertsDashboard from '../../components/alerts/AlertsDashboard';

export default function AlertsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Alerts Dashboard
          </h1>
          <p style={{
            color: '#6b7280'
          }}>
            Monitor and manage attendance alerts and student interventions
          </p>
        </div>
        <AlertsDashboard />
      </div>
    </div>
  );
}