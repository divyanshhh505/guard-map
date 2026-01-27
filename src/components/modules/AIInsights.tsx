import { AIInsight } from '@/types/crime';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Brain,
  Shield
} from 'lucide-react';

const insightIcons = {
  HOTSPOT: MapPin,
  RESOURCE_GAP: AlertCircle,
  TREND: TrendingUp,
  ALERT: AlertTriangle,
};

const severityStyles = {
  LOW: 'border-success/30 bg-success/5',
  MEDIUM: 'border-warning/30 bg-warning/5',
  HIGH: 'border-warning/50 bg-warning/10',
  CRITICAL: 'border-destructive/50 bg-destructive/10 alert-glow',
};

const severityBadge = {
  LOW: 'bg-success/20 text-success',
  MEDIUM: 'bg-warning/20 text-warning',
  HIGH: 'bg-warning/30 text-warning',
  CRITICAL: 'bg-destructive/20 text-destructive',
};

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">AI Insight Engine</h2>
            <p className="text-muted-foreground">Tactical recommendations based on pattern analysis</p>
          </div>
        </div>

        {/* System Status */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Analysis Complete</p>
                  <p className="text-xs text-muted-foreground">{insights.length} actionable insights generated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success">System Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights List */}
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insightIcons[insight.type];
            
            return (
              <Card 
                key={insight.id} 
                className={cn(
                  "glass-card border transition-all duration-300 animate-fade-in",
                  severityStyles[insight.severity]
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          insight.severity === 'CRITICAL' ? 'bg-destructive/20' : 'bg-primary/10'
                        )}>
                          <Icon className={cn(
                            "w-5 h-5",
                            insight.severity === 'CRITICAL' ? 'text-destructive' : 'text-primary'
                          )} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{insight.title}</h3>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              severityBadge[insight.severity]
                            )}>
                              {insight.severity}
                            </span>
                          </div>
                          {insight.affectedArea && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {insight.affectedArea}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Recommendation */}
                    <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-primary font-medium mb-1">RECOMMENDATION</p>
                          <p className="text-sm text-foreground">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {insights.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No insights generated yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Upload crime data to begin analysis
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
