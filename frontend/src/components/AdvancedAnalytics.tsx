import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Incident } from '../types/incident';
import { format, subDays, parseISO, differenceInHours } from 'date-fns';
import { TrendingUp, Clock, AlertTriangle, MapPin, Cpu, Database } from 'lucide-react';

interface AdvancedAnalyticsProps {
  incidents: Incident[];
  onDataPointClick?: (incident: Incident) => void;
  selectedIncident?: Incident | null;
  predictionContext?: any;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  incidents,
  onDataPointClick,
  selectedIncident,
  predictionContext
}) => {
  const analyticsData = useMemo(() => {
    // Time series analysis
    const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayIncidents = incidents.filter(incident => 
        new Date(incident.timestamp).toDateString() === date.toDateString()
      );
      
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        total: dayIncidents.length,
        critical: dayIncidents.filter(i => i.severity === 'Critical').length,
        high: dayIncidents.filter(i => i.severity === 'High').length,
        medium: dayIncidents.filter(i => i.severity === 'Medium').length,
        low: dayIncidents.filter(i => i.severity === 'Low').length,
        resolved: dayIncidents.filter(i => i.status === 'Closed').length,
        slaBreached: dayIncidents.filter(i => i.sla_breached === 'Yes').length
      };
    });

    // Resolution time analysis
    const resolutionData = incidents
      .filter(i => i.status === 'Closed' && i.resolution_time !== 'Pending')
      .map(i => ({
        id: i.incident_id,
        category: i.category,
        severity: i.severity,
        priority: i.priority,
        resolutionHours: parseFloat(i.resolution_time) || 0,
        impactScore: parseFloat(i.impact_score) || 0,
        incident: i
      }));

    // System performance correlation
    const systemPerformance = [...new Set(incidents.map(i => i.system))].map(system => {
      const systemIncidents = incidents.filter(i => i.system === system);
      return {
        system,
        totalIncidents: systemIncidents.length,
        criticalIncidents: systemIncidents.filter(i => i.severity === 'Critical').length,
        avgImpact: systemIncidents.reduce((acc, inc) => acc + parseFloat(inc.impact_score || '0'), 0) / systemIncidents.length,
        slaBreachRate: (systemIncidents.filter(i => i.sla_breached === 'Yes').length / systemIncidents.length) * 100,
        incidents: systemIncidents
      };
    });

    // Category impact matrix
    const categoryMatrix = [...new Set(incidents.map(i => i.category))].map(category => {
      const categoryIncidents = incidents.filter(i => i.category === category);
      const subcategories = [...new Set(categoryIncidents.map(i => i.subcategory))];
      
      return {
        category,
        totalIncidents: categoryIncidents.length,
        avgImpact: categoryIncidents.reduce((acc, inc) => acc + parseFloat(inc.impact_score || '0'), 0) / categoryIncidents.length,
        subcategories: subcategories.map(sub => ({
          name: sub,
          value: categoryIncidents.filter(i => i.subcategory === sub).length
        })),
        incidents: categoryIncidents
      };
    });

    // Geographic distribution
    const geoData = [...new Set(incidents.map(i => i.location))].map(location => {
      const locationIncidents = incidents.filter(i => i.location === location);
      return {
        location,
        incidents: locationIncidents.length,
        critical: locationIncidents.filter(i => i.severity === 'Critical').length,
        avgResolution: locationIncidents
          .filter(i => i.resolution_time !== 'Pending')
          .reduce((acc, inc) => acc + parseFloat(inc.resolution_time || '0'), 0) / 
          locationIncidents.filter(i => i.resolution_time !== 'Pending').length || 0
      };
    });

    // Incident flow analysis (Sankey-like data)
    const flowData = {
      nodes: [
        ...['Critical', 'High', 'Medium', 'Low'].map(s => ({ name: s, category: 'severity' })),
        ...['Open', 'In Progress', 'Closed'].map(s => ({ name: s, category: 'status' })),
        ...['P1', 'P2', 'P3', 'P4'].map(p => ({ name: p, category: 'priority' }))
      ],
      links: []
    };

    return {
      timeSeriesData,
      resolutionData,
      systemPerformance,
      categoryMatrix,
      geoData,
      flowData
    };
  }, [incidents]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const handleChartClick = (data: any) => {
    if (data && data.incidents && onDataPointClick) {
      // Select the most recent incident from the clicked data point
      const sortedIncidents = data.incidents.sort((a: Incident, b: Incident) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      onDataPointClick(sortedIncidents[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
          Advanced Analytics Dashboard
        </h2>
        <p className="text-slate-400">
          Deep insights into incident patterns, trends, and system performance
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {((incidents.filter(i => i.status === 'Closed').length / incidents.length) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-blue-300 font-semibold">Resolution Rate</h3>
          <p className="text-slate-400 text-sm">Overall incident closure rate</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {(incidents
                .filter(i => i.resolution_time !== 'Pending')
                .reduce((acc, inc) => acc + parseFloat(inc.resolution_time || '0'), 0) / 
                incidents.filter(i => i.resolution_time !== 'Pending').length || 0
              ).toFixed(1)}h
            </span>
          </div>
          <h3 className="text-green-300 font-semibold">Avg Resolution</h3>
          <p className="text-slate-400 text-sm">Mean time to resolution</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-white">
              {((incidents.filter(i => i.sla_breached === 'Yes').length / incidents.length) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-red-300 font-semibold">SLA Breach Rate</h3>
          <p className="text-slate-400 text-sm">Service level violations</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">
              {(incidents.reduce((acc, inc) => acc + parseFloat(inc.impact_score || '0'), 0) / incidents.length).toFixed(2)}
            </span>
          </div>
          <h3 className="text-purple-300 font-semibold">Avg Impact Score</h3>
          <p className="text-slate-400 text-sm">Business impact rating</p>
        </div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Series Trend */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>30-Day Incident Trend Analysis</span>
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={analyticsData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="critical" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} />
              <Area type="monotone" dataKey="resolved" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time vs Impact Scatter */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resolution Time vs Impact</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={analyticsData.resolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="resolutionHours" stroke="#9CA3AF" name="Resolution Hours" />
              <YAxis dataKey="impactScore" stroke="#9CA3AF" name="Impact Score" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [value, name === 'resolutionHours' ? 'Hours' : 'Impact']}
              />
              <Scatter 
                dataKey="impactScore" 
                fill="#8B5CF6" 
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* System Performance Radar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Performance Matrix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.systemPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="system" type="category" stroke="#9CA3AF" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar 
                dataKey="totalIncidents" 
                fill="#3B82F6" 
                radius={[0, 4, 4, 0]}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="criticalIncidents" 
                fill="#EF4444" 
                radius={[0, 4, 4, 0]}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Treemap */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Category Impact Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analyticsData.categoryMatrix.map((category, index) => (
              <div 
                key={category.category}
                className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => handleChartClick(category)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{category.category}</h4>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{category.totalIncidents}</p>
                <p className="text-xs text-slate-400">
                  Impact: {category.avgImpact.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span>Geographic Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.geoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="location" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="incidents" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="critical" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution Funnel */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={['P1', 'P2', 'P3', 'P4'].map(priority => ({
                  name: priority,
                  value: incidents.filter(i => i.priority === priority).length,
                  incidents: incidents.filter(i => i.priority === priority)
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              >
                {['P1', 'P2', 'P3', 'P4'].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Context Visualization */}
      {predictionContext && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Summarisation Context</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-purple-300 mb-3">Related Incidents Analysis</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  {
                    name: 'Similar Category',
                    count: predictionContext.relatedIncidents.filter((i: Incident) => 
                      i.category.toLowerCase().includes(predictionContext.prediction.Category?.toLowerCase() || '')
                    ).length
                  },
                  {
                    name: 'Same Severity',
                    count: predictionContext.relatedIncidents.filter((i: Incident) => 
                      i.severity === predictionContext.prediction.Severity
                    ).length
                  },
                  {
                    name: 'Same Priority',
                    count: predictionContext.relatedIncidents.filter((i: Incident) => 
                      i.priority === predictionContext.prediction.Priority
                    ).length
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-300 mb-3">Prediction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Predicted Category:</span>
                  <span className="text-white font-medium">{predictionContext.prediction.Category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Predicted Severity:</span>
                  <span className="text-white font-medium">{predictionContext.prediction.Severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Impact Score:</span>
                  <span className="text-white font-medium">{predictionContext.prediction.Impact_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Related Incidents:</span>
                  <span className="text-white font-medium">{predictionContext.relatedIncidents.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};