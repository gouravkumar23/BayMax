import React, { useState } from 'react';
import { predictIncident } from '../services/api';
import { PredictionResult, Incident } from '../types/incident';
import { Brain, Send, AlertTriangle, CheckCircle, Clock, TrendingUp, Lightbulb, Target } from 'lucide-react';
import clsx from 'clsx';

interface IncidentPredictorProps {
  onPredictionResult?: (prediction: any, inputText: string) => void;
  relatedIncidents?: Incident[];
}

export const IncidentPredictor: React.FC<IncidentPredictorProps> = ({
  onPredictionResult,
  relatedIncidents = []
}) => {
  const [inputText, setInputText] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await predictIncident(inputText);
      
      // Parse the result if it's a string
      let parsedResult: PredictionResult;
      if (typeof result === 'string') {
        // Try to extract structured data from the response
        const lines = result.split('\n').filter(line => line.includes(':'));
        parsedResult = {} as PredictionResult;
        
        lines.forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            parsedResult[key as keyof PredictionResult] = value;
          }
        });
      } else {
        parsedResult = result;
      }
      
      setPrediction(parsedResult);
      
      // Notify parent component about the prediction
      if (onPredictionResult) {
        onPredictionResult(parsedResult, inputText);
      }
    } catch (err) {
      setError('Failed to get summarisation. Please try again.');
      console.error('Summarisation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'P2': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'P3': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'P4': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const sampleLogs = [
    "[ERROR] Database connection timeout - Unable to connect to primary database server",
    "[CRITICAL] Memory usage exceeded 95% on production server web-01",
    "[WARNING] High CPU utilization detected on application server",
    "[ALERT] Disk space running low on backup server - 89% full",
    "[FATAL] Application crashed due to out of memory exception",
    "[ERROR] SSL certificate expired for domain api.example.com",
    "[WARNING] Network latency spike detected between data centers",
    "[CRITICAL] Load balancer health check failing for backend services"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-2xl">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
          AI Incident Summariser
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Leverage advanced machine learning to analyze IT logs and get intelligent incident classification with actionable recommendations
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Incident Analysis Input</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Enter IT Log or Incident Description
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your IT log here or describe the incident in detail..."
              className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
              maxLength={1000}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handlePredict}
              disabled={loading || !inputText.trim()}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Analyze Incident</span>
                </>
              )}
            </button>
            
            <div className="text-right">
              <span className="text-sm text-slate-400">
                {inputText.length}/1000 characters
              </span>
              <div className="w-32 bg-slate-700 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${(inputText.length / 1000) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sample Logs */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h4 className="text-sm font-medium text-slate-300">Sample IT Logs (Click to use):</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleLogs.map((log, index) => (
              <button
                key={index}
                onClick={() => setInputText(log)}
                className="text-left p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 rounded-lg text-sm text-slate-300 transition-all duration-200 hover:scale-[1.02]"
              >
                <code className="text-xs">{log}</code>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Analysis Failed</h4>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Prediction Results */}
      {prediction && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">AI Analysis Complete</h3>
              <p className="text-slate-400">Intelligent incident classification and recommendations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Classification */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-400 mb-4 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Classification</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500">Category:</span>
                  <p className="text-white font-semibold text-lg">{prediction.Category}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Subcategory:</span>
                  <p className="text-white font-medium">{prediction.Subcategory}</p>
                </div>
              </div>
            </div>

            {/* Criticality */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-orange-400 mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Criticality Assessment</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-500">Severity Level:</span>
                  <div className={clsx(
                    'inline-block px-3 py-2 rounded-lg text-sm font-semibold mt-2 border',
                    getSeverityColor(prediction.Severity)
                  )}>
                    {prediction.Severity}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Priority:</span>
                  <div className={clsx(
                    'inline-block px-3 py-2 rounded-lg text-sm font-semibold mt-2 border',
                    getPriorityColor(prediction.Priority)
                  )}>
                    {prediction.Priority}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-purple-400 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Impact Analysis</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/20 rounded-full p-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Impact Score:</span>
                    <p className="text-white font-bold text-xl">{prediction.Impact_score}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Incident Type:</span>
                  <p className="text-white font-medium">{prediction.Incident_type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6 mb-6">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Executive Summary</span>
            </h4>
            <p className="text-white leading-relaxed">{prediction.Summary}</p>
          </div>

          {/* Root Cause & Mitigation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Root Cause Analysis</span>
              </h4>
              <p className="text-white leading-relaxed">{prediction.Root_cause}</p>
            </div>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Recommended Actions</span>
              </h4>
              <p className="text-white leading-relaxed">{prediction.Mitigation_steps}</p>
            </div>
          </div>
        </div>
      )}

      {/* Related Incidents */}
      {relatedIncidents.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Related Historical Incidents</span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
              {relatedIncidents.length} found
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedIncidents.slice(0, 6).map((incident) => (
              <div key={incident.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{incident.incident_id}</span>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getSeverityColor(incident.severity)
                  )}>
                    {incident.severity}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">{incident.title}</h4>
                <div className="text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Category: {incident.category}</span>
                    <span>Impact: {incident.impact_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};