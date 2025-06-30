import React, { useState, useEffect } from 'react';
import { Incident } from '../types/incident';
import { Activity, Zap, AlertTriangle, Clock, CheckCircle, TrendingUp, Cpu, Database, Network, Server } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface RealTimeMonitorProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  incidents,
  onIncidentClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Real-time metrics
  const realtimeMetrics = {
    activeIncidents: incidents.filter(i => i.status !== 'Closed').length,
    criticalAlerts: incidents.filter(i => i.severity === 'Critical' && i.status !== 'Closed').length,
    avgResponseTime: incidents
      .filter(i => i.resolution_time !== 'Pending')
      .reduce((acc, inc) => acc + parseFloat(inc.resolution_time || '0'), 0) / 
      incidents.filter(i => i.resolution_time !== 'Pending').length || 0,
    systemsAffected: new Set(incidents.filter(i => i.status !== 'Closed').map(i => i.system)).size
  };

  // System health status
  const systemHealth = [...new Set(incidents.map(i => i.system))].map(system => {
    const systemIncidents = incidents.filter(i => i.system === system);
    const activeIncidents = systemIncidents.filter(i => i.status !== 'Closed');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'Critical');
    
    let status = 'healthy';
    if (criticalIncidents.length > 0) status = 'critical';
    else if (activeIncidents.length > 2) status = 'warning';
    else if (activeIncidents.length > 0) status = 'degraded';

    return {
      system,
      status,
      activeIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length,
      lastIncident: systemIncidents[0],
      incidents: systemIncidents
    };
  });

  // Recent activity feed
  const recentActivity = incidents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const getSystemIcon = (system: string) => {
    if (system.toLowerCase().includes('database')) return Database;
    if (system.toLowerCase().includes('network')) return Network;
    if (system.toLowerCase().includes('server')) return Server;
    return Cpu;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'warning': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10';
      case 'High': return 'text-orange-400 bg-orange-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'text-green-400 bg-green-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Closed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
          Real-Time System Monitor
        </h2>
        <p className="text-slate-400">
          Live monitoring of system health and incident activity
        </p>
        <p className="text-sm text-green-400 mt-2">
          Last updated: {format(currentTime, 'HH:mm:ss')}
        </p>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{realtimeMetrics.activeIncidents}</div>
              <div className="text-xs text-red-300">Active</div>
            </div>
          </div>
          <h3 className="text-red-300 font-semibold">Open Incidents</h3>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-slate-400">Live monitoring</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-orange-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{realtimeMetrics.criticalAlerts}</div>
              <div className="text-xs text-orange-300">Critical</div>
            </div>
          </div>
          <h3 className="text-orange-300 font-semibold">Critical Alerts</h3>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-slate-400">Requires attention</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{realtimeMetrics.avgResponseTime.toFixed(1)}h</div>
              <div className="text-xs text-blue-300">Average</div>
            </div>
          </div>
          <h3 className="text-blue-300 font-semibold">Response Time</h3>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-3 h-3 text-blue-400 mr-2" />
            <span className="text-xs text-slate-400">Performance metric</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8 text-purple-400" />
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{realtimeMetrics.systemsAffected}</div>
              <div className="text-xs text-purple-300">Systems</div>
            </div>
          </div>
          <h3 className="text-purple-300 font-semibold">Affected Systems</h3>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-slate-400">Under monitoring</span>
          </div>
        </div>
      </div>

      {/* System Health Grid */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Server className="w-5 h-5 text-blue-400" />
          <span>System Health Overview</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {systemHealth.map((system) => {
            const Icon = getSystemIcon(system.system);
            return (
              <div
                key={system.system}
                className={clsx(
                  'border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105',
                  getStatusColor(system.status),
                  selectedSystem === system.system && 'ring-2 ring-blue-500/50'
                )}
                onClick={() => {
                  setSelectedSystem(selectedSystem === system.system ? null : system.system);
                  if (onIncidentClick && system.lastIncident) {
                    onIncidentClick(system.lastIncident);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6" />
                  <div className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(system.status)
                  )}>
                    {system.status}
                  </div>
                </div>
                
                <h4 className="font-semibold text-white mb-2 truncate">{system.system}</h4>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active:</span>
                    <span className="text-white font-medium">{system.activeIncidents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Critical:</span>
                    <span className="text-red-400 font-medium">{system.criticalIncidents}</span>
                  </div>
                </div>

                {system.lastIncident && (
                  <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <p className="text-xs text-slate-400">Last incident:</p>
                    <p className="text-xs text-white truncate">{system.lastIncident.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(system.lastIncident.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span>Live Activity Feed</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((incident, index) => (
              <div
                key={incident.id}
                className="flex items-start space-x-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => onIncidentClick?.(incident)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(incident.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {incident.title}
                    </h4>
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getSeverityColor(incident.severity)
                    )}>
                      {incident.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {incident.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{incident.system}</span>
                    <span className="text-slate-500">
                      {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Details Panel */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            {selectedSystem ? `${selectedSystem} Details` : 'System Details'}
          </h3>
          
          {selectedSystem ? (
            <div className="space-y-4">
              {systemHealth
                .find(s => s.system === selectedSystem)
                ?.incidents.slice(0, 10)
                .map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => onIncidentClick?.(incident)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{incident.incident_id}</span>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getSeverityColor(incident.severity)
                      )}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{incident.title}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{incident.status}</span>
                      <span>{format(new Date(incident.timestamp), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a system to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};