import React, { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { MetricsCards } from './MetricsCards';
import { IncidentCharts } from './IncidentCharts';
import { RecentIncidents } from './RecentIncidents';
import { IncidentPredictor } from './IncidentPredictor';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { InteractiveFilters } from './InteractiveFilters';
import { RealTimeMonitor } from './RealTimeMonitor';
import { Activity, AlertTriangle, Clock, TrendingUp, BarChart3, Zap, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Incident } from '../types/incident';

export const Dashboard: React.FC = () => {
  const { incidents, loading, error } = useIncidents();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'predictor' | 'monitor'>('overview');
  const [selectedFilters, setSelectedFilters] = useState<{
    severity?: string;
    category?: string;
    status?: string;
    priority?: string;
    location?: string;
    dateRange?: { start: Date; end: Date };
  }>({});
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [predictionContext, setPredictionContext] = useState<any>(null);

  // Filter incidents based on selected filters
  const filteredIncidents = useMemo(() => {
    let filtered = incidents;

    if (selectedFilters.severity) {
      filtered = filtered.filter(i => i.severity === selectedFilters.severity);
    }
    if (selectedFilters.category) {
      filtered = filtered.filter(i => i.category === selectedFilters.category);
    }
    if (selectedFilters.status) {
      filtered = filtered.filter(i => i.status === selectedFilters.status);
    }
    if (selectedFilters.priority) {
      filtered = filtered.filter(i => i.priority === selectedFilters.priority);
    }
    if (selectedFilters.location) {
      filtered = filtered.filter(i => i.location === selectedFilters.location);
    }
    if (selectedFilters.dateRange) {
      filtered = filtered.filter(i => {
        const incidentDate = new Date(i.timestamp);
        return incidentDate >= selectedFilters.dateRange!.start && 
               incidentDate <= selectedFilters.dateRange!.end;
      });
    }

    return filtered;
  }, [incidents, selectedFilters]);

  // Get contextual data when an incident is selected
  const contextualData = useMemo(() => {
    if (!selectedIncident) return filteredIncidents;
    
    // Show related incidents based on category, system, or severity
    return incidents.filter(i => 
      i.category === selectedIncident.category ||
      i.system === selectedIncident.system ||
      i.severity === selectedIncident.severity
    );
  }, [incidents, selectedIncident, filteredIncidents]);

  const handleDataPointClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handlePredictionResult = (prediction: any, inputText: string) => {
    setPredictionContext({
      prediction,
      inputText,
      relatedIncidents: incidents.filter(i => 
        i.category.toLowerCase().includes(prediction.Category?.toLowerCase() || '') ||
        i.severity === prediction.Severity ||
        i.priority === prediction.Priority
      )
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500/20 border-r-purple-500 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Initializing Baymax AI</p>
            <p className="text-slate-400">Loading incident intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, description: 'Real-time incident overview' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Advanced data insights' },
    { id: 'predictor', label: 'AI Summarizer', icon: TrendingUp, description: 'Intelligent incident analysis' },
    { id: 'monitor', label: 'Live Monitor', icon: Zap, description: 'Real-time monitoring' }
  ];

  const displayData = selectedIncident ? contextualData : filteredIncidents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-slate-800"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Baymax AI
                </h1>
                <p className="text-sm text-slate-400 font-medium">Autonomous IT Incident Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {selectedIncident && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-400 font-medium">Focused View</p>
                  <p className="text-sm text-white truncate max-w-32">{selectedIncident.title}</p>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Last Sync</p>
                <p className="text-sm text-white font-semibold">
                  {format(new Date(), 'HH:mm:ss')}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2 bg-slate-800/30 p-2 rounded-xl backdrop-blur-sm border border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group flex items-center space-x-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-102'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clear Selection Button */}
          {(selectedIncident || Object.keys(selectedFilters).length > 0) && (
            <button
              onClick={() => {
                setSelectedIncident(null);
                setSelectedFilters({});
                setPredictionContext(null);
              }}
              className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-slate-600/50"
            >
              <Filter className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Interactive Filters */}
        <InteractiveFilters
          incidents={incidents}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
          selectedIncident={selectedIncident}
        />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <MetricsCards 
              incidents={displayData} 
              selectedIncident={selectedIncident}
              onIncidentSelect={handleDataPointClick}
            />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <IncidentCharts 
                  incidents={displayData} 
                  onDataPointClick={handleDataPointClick}
                  selectedIncident={selectedIncident}
                  predictionContext={predictionContext}
                />
              </div>
              <div>
                <RecentIncidents 
                  incidents={displayData.slice(0, 10)} 
                  onIncidentClick={handleDataPointClick}
                  selectedIncident={selectedIncident}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <AdvancedAnalytics 
              incidents={displayData}
              onDataPointClick={handleDataPointClick}
              selectedIncident={selectedIncident}
              predictionContext={predictionContext}
            />
          </div>
        )}

        {activeTab === 'predictor' && (
          <div>
            <IncidentPredictor 
              onPredictionResult={handlePredictionResult}
              relatedIncidents={predictionContext?.relatedIncidents || []}
            />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div>
            <RealTimeMonitor 
              incidents={displayData}
              onIncidentClick={handleDataPointClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};