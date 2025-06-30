import React from 'react';
import { Incident } from '../types/incident';
import { Filter, Calendar, MapPin, AlertTriangle, Clock, Tag } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface InteractiveFiltersProps {
  incidents: Incident[];
  selectedFilters: {
    severity?: string;
    category?: string;
    status?: string;
    priority?: string;
    location?: string;
    dateRange?: { start: Date; end: Date };
  };
  onFiltersChange: (filters: any) => void;
  selectedIncident?: Incident | null;
}

export const InteractiveFilters: React.FC<InteractiveFiltersProps> = ({
  incidents,
  selectedFilters,
  onFiltersChange,
  selectedIncident
}) => {
  const uniqueValues = {
    severities: [...new Set(incidents.map(i => i.severity))],
    categories: [...new Set(incidents.map(i => i.category))],
    statuses: [...new Set(incidents.map(i => i.status))],
    priorities: [...new Set(incidents.map(i => i.priority))],
    locations: [...new Set(incidents.map(i => i.location))]
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[key as keyof typeof newFilters] === value) {
      delete newFilters[key as keyof typeof newFilters];
    } else {
      (newFilters as any)[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const quickDateRanges = [
    { label: 'Last 24h', range: { start: subDays(new Date(), 1), end: new Date() } },
    { label: 'Last 7d', range: { start: subDays(new Date(), 7), end: new Date() } },
    { label: 'Last 30d', range: { start: subDays(new Date(), 30), end: new Date() } }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'P2': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'P3': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'P4': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Closed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (selectedIncident) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Contextual View</h3>
          </div>
          <span className="text-sm text-blue-300">Showing related incidents</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Selected Incident</p>
            <p className="text-white font-medium">{selectedIncident.title}</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Category</p>
            <p className="text-white font-medium">{selectedIncident.category}</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">System</p>
            <p className="text-white font-medium">{selectedIncident.system}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Filter className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Interactive Filters</h3>
        <span className="text-sm text-slate-400">
          ({incidents.length} total incidents)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Severity Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Severity</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueValues.severities.map(severity => (
              <button
                key={severity}
                onClick={() => handleFilterChange('severity', severity)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.severity === severity
                    ? getSeverityColor(severity) + ' ring-2 ring-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Priority</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueValues.priorities.map(priority => (
              <button
                key={priority}
                onClick={() => handleFilterChange('priority', priority)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.priority === priority
                    ? getPriorityColor(priority) + ' ring-2 ring-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Status</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueValues.statuses.map(status => (
              <button
                key={status}
                onClick={() => handleFilterChange('status', status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.status === status
                    ? getStatusColor(status) + ' ring-2 ring-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Category</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueValues.categories.slice(0, 4).map(category => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.category === category
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 ring-2 ring-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Location</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueValues.locations.slice(0, 4).map(location => (
              <button
                key={location}
                onClick={() => handleFilterChange('location', location)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.location === location
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 ring-2 ring-purple-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Date Ranges */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Time Range</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickDateRanges.map(({ label, range }) => (
              <button
                key={label}
                onClick={() => onFiltersChange({ ...selectedFilters, dateRange: range })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  selectedFilters.dateRange && 
                  selectedFilters.dateRange.start.getTime() === range.start.getTime()
                    ? 'bg-green-500/20 text-green-300 border-green-500/30 ring-2 ring-green-500/50'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};