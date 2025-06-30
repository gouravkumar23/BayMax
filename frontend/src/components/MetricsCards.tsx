import React from 'react';
import { Incident } from '../types/incident';
import { AlertTriangle, Clock, CheckCircle, TrendingUp, Shield, AlertCircle, Zap, Target } from 'lucide-react';

interface MetricsCardsProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onIncidentSelect?: (incident: Incident) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  incidents, 
  selectedIncident,
  onIncidentSelect 
}) => {
  const openIncidents = incidents.filter(i => i.status === 'Open').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'Critical').length;
  const slaBreached = incidents.filter(i => i.sla_breached === 'Yes').length;
  const avgImpactScore = incidents.length > 0 
    ? (incidents.reduce((acc, inc) => acc + parseFloat(inc.impact_score || '0'), 0) / incidents.length).toFixed(2)
    : '0';

  const resolvedToday = incidents.filter(i => 
    i.status === 'Closed' && 
    new Date(i.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const p1Incidents = incidents.filter(i => i.priority === 'P1').length;

  // Additional advanced metrics
  const avgResolutionTime = incidents
    .filter(i => i.resolution_time !== 'Pending')
    .reduce((acc, inc) => acc + parseFloat(inc.resolution_time || '0'), 0) / 
    incidents.filter(i => i.resolution_time !== 'Pending').length || 0;

  const systemsAffected = new Set(incidents.filter(i => i.status !== 'Closed').map(i => i.system)).size;

  const metrics = [
    {
      title: 'Open Incidents',
      value: openIncidents,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      trend: '+12%',
      trendColor: 'text-red-300',
      incidents: incidents.filter(i => i.status === 'Open')
    },
    {
      title: 'Critical Severity',
      value: criticalIncidents,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      trend: '-5%',
      trendColor: 'text-green-300',
      incidents: incidents.filter(i => i.severity === 'Critical')
    },
    {
      title: 'SLA Breached',
      value: slaBreached,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      trend: '+8%',
      trendColor: 'text-yellow-300',
      incidents: incidents.filter(i => i.sla_breached === 'Yes')
    },
    {
      title: 'Avg Impact Score',
      value: avgImpactScore,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      trend: '-2.1%',
      trendColor: 'text-green-300',
      incidents: incidents
    },
    {
      title: 'Resolved Today',
      value: resolvedToday,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      trend: '+15%',
      trendColor: 'text-green-300',
      incidents: incidents.filter(i => 
        i.status === 'Closed' && 
        new Date(i.timestamp).toDateString() === new Date().toDateString()
      )
    },
    {
      title: 'P1 Incidents',
      value: p1Incidents,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      trend: '-3%',
      trendColor: 'text-green-300',
      incidents: incidents.filter(i => i.priority === 'P1')
    },
    {
      title: 'Avg Resolution',
      value: `${avgResolutionTime.toFixed(1)}h`,
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      trend: '-12%',
      trendColor: 'text-green-300',
      incidents: incidents.filter(i => i.resolution_time !== 'Pending')
    },
    {
      title: 'Systems Affected',
      value: systemsAffected,
      icon: Target,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      trend: '+2',
      trendColor: 'text-pink-300',
      incidents: incidents.filter(i => i.status !== 'Closed')
    }
  ];

  const handleMetricClick = (metric: any) => {
    if (onIncidentSelect && metric.incidents.length > 0) {
      // Select the most recent incident from this metric
      const sortedIncidents = metric.incidents.sort((a: Incident, b: Incident) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      onIncidentSelect(sortedIncidents[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isSelected = selectedIncident && metric.incidents.some((inc: Incident) => inc.id === selectedIncident.id);
        
        return (
          <div
            key={index}
            className={`group bg-slate-800/50 backdrop-blur-sm border ${metric.borderColor} rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              isSelected ? 'ring-2 ring-blue-500/50 bg-slate-700/50' : ''
            }`}
            onClick={() => handleMetricClick(metric)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-slate-400 text-sm font-medium mb-1">{metric.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <span className={`text-xs font-medium ${metric.trendColor}`}>
                    {metric.trend}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {metric.incidents.length} related incidents
                </p>
              </div>
              <div className={`${metric.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            
            {/* Mini progress bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${metric.bgColor.replace('/10', '/50')}`}
                style={{ 
                  width: `${Math.min((metric.incidents.length / incidents.length) * 100, 100)}%` 
                }}
              ></div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {((metric.incidents.length / incidents.length) * 100).toFixed(1)}% of total
              </span>
              <div className={`w-2 h-2 rounded-full ${
                metric.trendColor.includes('green') ? 'bg-green-500' : 
                metric.trendColor.includes('red') ? 'bg-red-500' : 'bg-yellow-500'
              } animate-pulse`}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};