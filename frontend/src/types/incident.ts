export interface Incident {
  id: string;
  category: string;
  impact_score: string;
  incident_id: string;
  incident_type: string;
  location: string;
  log: string;
  mitigation_steps: string;
  module: string;
  priority: string;
  reported_by: string;
  resolution_time: string;
  root_cause: string;
  severity: string;
  sla_breached: string;
  status: string;
  subcategory: string;
  summary: string;
  system: string;
  timestamp: string;
  title: string;
}

export interface PredictionResult {
  Category: string;
  Subcategory: string;
  Severity: string;
  Priority: string;
  Impact_score: string;
  Root_cause: string;
  Mitigation_steps: string;
  Incident_type: string;
  Summary: string;
}