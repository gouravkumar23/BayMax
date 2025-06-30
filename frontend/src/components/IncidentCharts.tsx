import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  ScatterChart, Scatter, RadialBarChart, RadialBar
} from 'recharts';
import { Incident } from '../types/incident';
import { format, subDays } from 'date-fns';

interface IncidentChartsProps {
  incidents: Incident[];
  detailed?: boolean;
  onDataPointClick?: (incident: Incident) => void;
  selectedIncident?: Incident | null;
  predictionContext?: any;
}

export const IncidentCharts: React.FC<IncidentChartsProps> = ({ 
  incidents, 
  detailed = false, 
  onDataPointClick,
  selectedIncident,
  predictionContext 
}) => {
  // Enhanced data processing
  const severityData = ['Critical', 'High', 'Medium', 'Low'].map(severity => ({
    name: severity,
    value: incidents.filter(i => i.severity === severity).length,
    incidents: incidents.filter(i => i.severity === severity)
  }));

  const categoryData = [...new Set(incidents.map(i => i.category))].map(category => ({
    name: category,
    value: incidents.filter(i => i.category === category).length,
    incidents: incidents.filter(i => i.category === category)
  }));

  const statusData = ['Open', 'In Progress', 'Closed'].map(status => ({
    name: status,
    value: incidents.filter(i => i.status === status).length,
    incidents: incidents.filter(i => i.status === status)
  }));

  // Enhanced timeline data for the last 14 days
  const timelineData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayIncidents = incidents.filter(incident => 
      new Date(incident.timestamp).toDateString() === date.toDateString()
    );
    return {
      date: format(date, 'MMM dd'),
      fullDate: date,
      incidents: dayIncidents.length,
      critical: dayIncidents.filter(i => i.severity === 'Critical').length,
      high: dayIncidents.filter(i => i.severity === 'High').length,
      medium: dayIncidents.filter(i => i.severity === 'Medium').length,
      low: dayIncidents.filter(i => i.severity === 'Low').length,
      open: dayIncidents.filter(i => i.status === 'Open').length,
      resolved: dayIncidents.filter(i => i.status === 'Closed').length,
      dayIncidents
    };
  });

  // Priority vs Impact correlation
  const priorityImpactData = incidents.map(incident => ({
    priority: incident.priority,
    impact: parseFloat(incident.impact_score || '0'),
    severity: incident.severity,
    incident
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const handleChartClick = (data: any, event?: any) => {
    if (data && onDataPointClick) {
      if (data.incident) {
        onDataPointClick(data.incident);
      } else if (data.incidents && data.incidents.length > 0) {
        // Select the most recent incident from the clicked data point
        const sortedIncidents = data.incidents.sort((a: Incident, b: Incident) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        onDataPointClick(sortedIncidents[0]);
      } else if (data.dayIncidents && data.dayIncidents.length > 0) {
        const sortedIncidents = data.dayIncidents.sort((a: Incident, b: Incident) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        onDataPointClick(sortedIncidents[0]);
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
          <p className="text-xs text-slate-400 mt-2">Click to explore</p>
        </div>
      );
    }
    return null;
  };

  const charts = [
    {
      title: 'Incident Timeline (14 Days)',
      subtitle: 'Click on any point to explore incidents',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="incidents" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
            <Area 
              type="monotone" 
              dataKey="critical" 
              stroke="#EF4444" 
              fill="#EF4444" 
              fillOpacity={0.4}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
            <Area 
              type="monotone" 
              dataKey="resolved" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Severity Distribution',
      subtitle: 'Interactive severity breakdown',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {severityData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={selectedIncident && entry.incidents.some(inc => inc.id === selectedIncident.id) ? '#3B82F6' : 'none'}
                  strokeWidth={selectedIncident && entry.incidents.some(inc => inc.id === selectedIncident.id) ? 3 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Category Performance',
      subtitle: 'Incidents by category with trends',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Priority vs Impact Analysis',
      subtitle: 'Correlation between priority and business impact',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart data={priorityImpactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="priority" stroke="#9CA3AF" />
            <YAxis dataKey="impact" stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              dataKey="impact" 
              fill="#8B5CF6"
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )
    }
  ];

  // Add prediction context visualization if available
  if (predictionContext) {
    charts.push({
      title: 'AI Prediction Context',
      subtitle: 'Related incidents based on AI analysis',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[
            {
              name: 'Similar Category',
              value: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.category.toLowerCase().includes(predictionContext.prediction.Category?.toLowerCase() || '')
              ).length,
              incidents: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.category.toLowerCase().includes(predictionContext.prediction.Category?.toLowerCase() || '')
              )
            },
            {
              name: 'Same Severity',
              value: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.severity === predictionContext.prediction.Severity
              ).length,
              incidents: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.severity === predictionContext.prediction.Severity
              )
            },
            {
              name: 'Same Priority',
              value: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.priority === predictionContext.prediction.Priority
              ).length,
              incidents: predictionContext.relatedIncidents.filter((i: Incident) => 
                i.priority === predictionContext.prediction.Priority
              )
            }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    });
  }

  if (detailed) {
    // Additional detailed charts for analytics view
    const locationData = [...new Set(incidents.map(i => i.location))].map(location => ({
      name: location,
      value: incidents.filter(i => i.location === location).length,
      incidents: incidents.filter(i => i.location === location)
    }));

    const priorityData = ['P1', 'P2', 'P3', 'P4'].map(priority => ({
      name: priority,
      value: incidents.filter(i => i.priority === priority).length,
      slaBreached: incidents.filter(i => i.priority === priority && i.sla_breached === 'Yes').length,
      incidents: incidents.filter(i => i.priority === priority)
    }));

    const moduleData = [...new Set(incidents.map(i => i.module))].map(module => ({
      name: module,
      value: incidents.filter(i => i.module === module).length,
      avgImpact: incidents.filter(i => i.module === module).reduce((acc, inc, _, arr) => 
        acc + parseFloat(inc.impact_score || '0') / arr.length, 0
      ).toFixed(2),
      incidents: incidents.filter(i => i.module === module)
    }));

    charts.push(
      {
        title: 'Geographic Distribution',
        subtitle: 'Incidents by location',
        component: (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={locationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#F59E0B" 
                radius={[0, 4, 4, 0]}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      },
      {
        title: 'Priority vs SLA Performance',
        subtitle: 'SLA breach analysis by priority',
        component: (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="slaBreached" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    );
  }

  return (
    <div className={`grid grid-cols-1 ${detailed ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
      {charts.map((chart, index) => (
        <div 
          key={index} 
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors duration-200"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{chart.title}</h3>
            <p className="text-sm text-slate-400">{chart.subtitle}</p>
          </div>
          {chart.component}
        </div>
      ))}
    </div>
  );
};