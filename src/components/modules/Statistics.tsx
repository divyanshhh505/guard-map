import { CrimeStats, CrimeType } from '@/types/crime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, PieChart as PieIcon, Activity } from 'lucide-react';

const CRIME_COLORS: Record<CrimeType, string> = {
  MURDER: '#ef4444',
  ASSAULT: '#f97316',
  ROBBERY: '#eab308',
  BURGLARY: '#f59e0b',
  THEFT: '#84cc16',
  VEHICLE_THEFT: '#22c55e',
  CYBER: '#3b82f6',
  FRAUD: '#6366f1',
  VANDALISM: '#a855f7',
  DRUG_OFFENSE: '#ec4899',
  OTHER: '#64748b',
};

interface StatisticsProps {
  stats: CrimeStats;
}

export function Statistics({ stats }: StatisticsProps) {
  // Prepare donut chart data
  const donutData = Object.entries(stats.byType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: type.replace('_', ' '),
      value: count,
      color: CRIME_COLORS[type as CrimeType],
    }))
    .sort((a, b) => b.value - a.value);

  // Prepare hourly data
  const hourlyData = stats.byHour.map((count, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    incidents: count,
  }));

  // Find peak hour
  const peakHour = stats.byHour.indexOf(Math.max(...stats.byHour));

  // Prepare trend data
  const trendData = stats.byDay.map(({ date, count }) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    incidents: count,
  }));

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Statistical Overview</h2>
          <p className="text-muted-foreground">Crime pattern analysis and metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalIncidents}</p>
                  <p className="text-xs text-muted-foreground">Total Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.openCases}</p>
                  <p className="text-xs text-muted-foreground">Open Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.closedCases}</p>
                  <p className="text-xs text-muted-foreground">Closed Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{String(peakHour).padStart(2, '0')}:00</p>
                  <p className="text-xs text-muted-foreground">Peak Hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crime Type Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieIcon className="w-4 h-4 text-primary" />
                Crime Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222 47% 7%)',
                        border: '1px solid hsl(217 33% 17%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Temporal Heatmap (Hourly) */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary" />
                Incidents by Hour of Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                    <XAxis
                      dataKey="hour"
                      stroke="hsl(215 20% 65%)"
                      fontSize={10}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222 47% 7%)',
                        border: '1px solid hsl(217 33% 17%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    />
                    <Bar
                      dataKey="incidents"
                      fill="hsl(217 91% 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Line */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              30-Day Incident Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(215 20% 65%)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 7%)',
                      border: '1px solid hsl(217 33% 17%)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(217 91% 60%)', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(217 91% 60%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
