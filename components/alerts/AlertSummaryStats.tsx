'use client';

import React from 'react';
import { AttendanceAlert } from '../../src/services/hooks/useAlerts';

interface AlertSummaryStatsProps {
  alerts: AttendanceAlert[];
  loading: boolean;
}

export default function AlertSummaryStats({ alerts, loading }: AlertSummaryStatsProps) {
  const getStatistics = () => {
    if (loading || alerts.length === 0) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        activeStudents: 0,
        interventionsNeeded: 0
      };
    }

    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueStudents = new Set(alerts.map(alert => alert.studentId));
    const interventionsNeeded = alerts.filter(alert => 
      alert.status === 'active' && 
      (alert.severity === 'critical' || alert.severity === 'high')
    ).length;

    return {
      total: alerts.length,
      critical: severityCounts.critical || 0,
      high: severityCounts.high || 0,
      medium: severityCounts.medium || 0,
      low: severityCounts.low || 0,
      activeStudents: uniqueStudents.size,
      interventionsNeeded
    };
  };

  const stats = getStatistics();

  const statCards = [
    {
      title: 'Total Alerts',
      value: stats.total,
      icon: '🚨',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Critical Alerts',
      value: stats.critical,
      icon: '⚠️',
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
    {
      title: 'Students Affected',
      value: stats.activeStudents,
      icon: '👥',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      title: 'Interventions Needed',
      value: stats.interventionsNeeded,
      icon: '⏰',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            height: '120px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#111827',
        marginBottom: '16px' 
      }}>
        Alerts Overview
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {statCards.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${stat.color}20`
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#6b7280',
                margin: 0
              }}>
                {stat.title}
              </h3>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                {stat.icon}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: stat.color,
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: '#9ca3af' 
            }}>
              Active now
            </div>
          </div>
        ))}
      </div>      {/* Severity Breakdown */}
     
    </div>
  );
}