import React from 'react';
import { Incident } from '../types/incident';
import { AlertTriangle, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface RecentIncidentsProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  selectedIncident?: Incident | null;
}

export const RecentIncidents: React.FC<RecentIncidentsProps> = ({ 
  incidents, 
  onIncidentClick,
  selectedIncident 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Closed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500';
      case 'P2': return 'bg-orange-500';
      case 'P3': return 'bg-yellow-500';
      case 'P4': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-red-400';
      case 'In Progress': return 'text-yellow-400';
      case 'Closed': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
        <span className="text-sm text-slate-400">
          {incidents.length} incidents
        </span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {incidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          
          return (
            <div
              key={incident.id}
              className={clsx(
                'bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 transition-all duration-200 cursor-pointer',
                'hover:bg-slate-700/50 hover:border-slate-500/50 hover:scale-[1.02]',
                isSelected && 'ring-2 ring-blue-500/50 bg-slate-600/50 border-blue-500/30'
              )}
              onClick={() => onIncidentClick?.(incident)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(incident.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{incident.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{incident.incident_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(incident.priority)}`}></div>
                  <span className="text-xs text-slate-400">{incident.priority}</span>
                  {onIncidentClick && (
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className={clsx(
                  'px-2 py-1 rounded-full text-xs font-medium border',
                  getSeverityColor(incident.severity)
                )}>
                  {incident.severity}
                </div>
                <span className="text-xs text-slate-400">
                  {format(new Date(incident.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                {incident.summary}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Category:</span>
                  <span className="text-white ml-1 font-medium">{incident.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">System:</span>
                  <span className="text-white ml-1 font-medium">{incident.system}</span>
                </div>
                <div>
                  <span className="text-slate-500">Impact:</span>
                  <span className="text-white ml-1 font-medium">{incident.impact_score}</span>
                </div>
                <div>
                  <span className="text-slate-500">SLA:</span>
                  <span className={clsx(
                    'ml-1 font-medium',
                    incident.sla_breached === 'Yes' ? 'text-red-400' : 'text-green-400'
                  )}>
                    {incident.sla_breached === 'Yes' ? 'Breached' : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-3 pt-3 border-t border-slate-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      incident.status === 'Open' ? 'bg-red-500 animate-pulse' :
                      incident.status === 'In Progress' ? 'bg-yellow-500 animate-pulse' :
                      'bg-green-500'
                    }`}></div>
                    <span className={clsx('text-xs font-medium', getStatusColor(incident.status))}>
                      {incident.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {incident.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};