import { useRef, useCallback } from 'react';
import { Upload, FileText, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DataUploadProps {
  onUpload: (file: File) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  uploadedFileName: string | null;
  incidentCount: number;
}

export function DataUpload({ 
  onUpload, 
  onReset, 
  isLoading, 
  uploadedFileName,
  incidentCount 
}: DataUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file format', {
        description: 'Please upload a CSV file'
      });
      return;
    }

    try {
      await onUpload(file);
      toast.success('Data uploaded successfully', {
        description: `Loaded ${file.name}`
      });
    } catch (error) {
      toast.error('Upload failed', {
        description: 'Could not parse CSV file. Check the format.'
      });
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Data Upload</h2>
          <p className="text-muted-foreground">
            Upload your crime dataset to begin analysis
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
            "border-border hover:border-primary/50",
            isLoading && "pointer-events-none opacity-50",
            !uploadedFileName && "pulse-glow"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isLoading ? 'Processing...' : 'Drop CSV file here or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports standard crime data formats
              </p>
            </div>
          </div>
        </div>

        {/* Current Data Status */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Current Dataset</h3>
            {uploadedFileName ? (
              <span className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle className="w-3.5 h-3.5" />
                Custom Data
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <FileText className="w-3.5 h-3.5" />
                Demo Mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <p className="text-2xl font-bold text-foreground">{incidentCount}</p>
              <p className="text-xs text-muted-foreground">Total Incidents</p>
            </div>
            <div className="stat-card">
              <p className="text-sm font-medium text-foreground truncate">
                {uploadedFileName || 'demo_london.csv'}
              </p>
              <p className="text-xs text-muted-foreground">Source File</p>
            </div>
          </div>

          {uploadedFileName && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onReset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Demo Data
            </Button>
          )}
        </div>

        {/* Expected Format */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">Expected CSV Format</h3>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Your CSV should include these columns (case-insensitive):</p>
            <div className="bg-background/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <div className="text-primary">LATITUDE, LONGITUDE, CRIME_TYPE, DATE_TIME, STATUS</div>
              <div className="mt-2 text-muted-foreground">
                51.5074, -0.1278, THEFT, 2024-01-15 14:30, OPEN<br />
                51.5155, -0.0922, ASSAULT, 2024-01-15 23:45, CLOSED<br />
                51.4975, -0.1357, BURGLARY, 2024-01-16 02:15, UNDER_INVESTIGATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
