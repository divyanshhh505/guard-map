import { AppSidebar } from '@/components/layout/AppSidebar';
import { DataUpload } from '@/components/modules/DataUpload';
import { CrimeMap } from '@/components/modules/CrimeMap';
import { Statistics } from '@/components/modules/Statistics';
import { AIInsights } from '@/components/modules/AIInsights';
import { Settings } from '@/components/modules/Settings';
import { useAppStore } from '@/store/appStore';
import { useCrimeData } from '@/hooks/useCrimeData';
import { cn } from '@/lib/utils';

const Index = () => {
  const { activeView, sidebarOpen } = useAppStore();
  const {
    incidents,
    patrolUnits,
    mapBounds,
    stats,
    insights,
    isLoading,
    cityName,
    uploadedFileName,
    uploadData,
    resetToDemo,
  } = useCrimeData();

  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return (
          <DataUpload
            onUpload={uploadData}
            onReset={resetToDemo}
            isLoading={isLoading}
            uploadedFileName={uploadedFileName}
            incidentCount={incidents.length}
          />
        );
      case 'map':
        return (
          <CrimeMap
            incidents={incidents}
            patrolUnits={patrolUnits}
            mapBounds={mapBounds}
          />
        );
      case 'stats':
        return <Statistics stats={stats} />;
      case 'insights':
        return <AIInsights insights={insights} />;
      case 'settings':
        return <Settings cityName={cityName} />;
      default:
        return (
          <CrimeMap
            incidents={incidents}
            patrolUnits={patrolUnits}
            mapBounds={mapBounds}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300"
      )}>
        {/* Header Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="font-medium text-foreground capitalize">
              {activeView === 'map' ? 'Spatial Analysis' :
               activeView === 'stats' ? 'Statistical Overview' :
               activeView === 'insights' ? 'AI Insights' :
               activeView === 'upload' ? 'Data Upload' : 'Settings'}
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {cityName}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{stats.totalIncidents}</span> incidents
            </span>
            <span className="text-destructive">
              <span className="font-semibold">{stats.openCases}</span> open
            </span>
            <span className="text-success">
              <span className="font-semibold">{stats.closedCases}</span> closed
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
