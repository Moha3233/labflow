import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';

export function Settings() {
  const store = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Extract only the data arrays, not the functions
    const dataToExport = {
      tasks: store.tasks,
      reagents: store.reagents,
      protocols: store.protocols,
      notes: store.notes,
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `labflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Basic validation to ensure it's a valid backup file
        if (
          parsedData &&
          (Array.isArray(parsedData.tasks) ||
           Array.isArray(parsedData.reagents) ||
           Array.isArray(parsedData.protocols) ||
           Array.isArray(parsedData.notes))
        ) {
          if (window.confirm('Are you sure you want to import this backup? This will overwrite any existing data with the same IDs.')) {
            store.importData({
              tasks: parsedData.tasks || [],
              reagents: parsedData.reagents || [],
              protocols: parsedData.protocols || [],
              notes: parsedData.notes || [],
            });
            alert('Backup imported successfully!');
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Error parsing backup file:', error);
        alert('Error reading backup file. Please ensure it is a valid JSON file.');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application data and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export your data to a file for safekeeping, or import a previous backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border rounded-lg bg-card">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  Export Backup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Download a JSON file containing all your tasks, reagents, protocols, and notes.
                </p>
              </div>
              <Button onClick={handleExport} className="shrink-0">
                Export Data
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border rounded-lg bg-card">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Import Backup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Restore your data from a previously exported JSON file.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  <span>Importing will overwrite existing data.</span>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImport}
                />
                <Button 
                  variant="secondary" 
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0"
                >
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
