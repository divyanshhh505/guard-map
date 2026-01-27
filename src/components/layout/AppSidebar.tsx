import { cn } from '@/lib/utils';
import { 
  Upload, 
  Map, 
  BarChart3, 
  Brain, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'upload', label: 'Data Upload', icon: Upload },
  { id: 'map', label: 'Spatial Analysis', icon: Map },
  { id: 'stats', label: 'Statistical Overview', icon: BarChart3 },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function AppSidebar() {
  const { activeView, setActiveView, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        !sidebarOpen && "justify-center"
      )}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <Shield className="w-6 h-6" />
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">Crime Analysis</h1>
            <p className="text-xs text-muted-foreground truncate">System v1.0</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive 
                  ? "bg-sidebar-accent text-primary" 
                  : "text-sidebar-foreground",
                !sidebarOpen && "justify-center"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-foreground",
            sidebarOpen && "justify-start"
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
