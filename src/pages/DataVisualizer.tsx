import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { Printer, Upload, Plus, Trash2 } from 'lucide-react';

type DataPoint = {
  id: string;
  x: number;
  y: number;
};

export function DataVisualizer() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => {
          const keys = Object.keys(row);
          return {
            id: crypto.randomUUID(),
            x: Number(row[keys[0]]),
            y: Number(row[keys[1]]),
          };
        }).filter(point => !isNaN(point.x) && !isNaN(point.y));
        setData(parsedData);
      },
    });
  };

  const handleAddData = () => {
    const x = parseFloat(newX);
    const y = parseFloat(newY);
    if (isNaN(x) || isNaN(y)) return;
    setData([...data, { id: crypto.randomUUID(), x, y }]);
    setNewX('');
    setNewY('');
  };

  const handleDeleteData = (id: string) => {
    setData(data.filter(d => d.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderChart = () => {
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>;

    const sortedData = [...data].sort((a, b) => a.x - b.x);

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="y" stroke="#8884d8" activeDot={{ r: 8 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="y" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" name="X" />
              <YAxis dataKey="y" type="number" name="Y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Data" data={sortedData} fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Visualizer</h1>
          <p className="text-muted-foreground">Plot and analyze your experimental data.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handlePrint} className="print:hidden flex-1 sm:flex-none" disabled={data.length === 0}>
            <Printer className="w-4 h-4 mr-2" /> Print Chart
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Data Entry & Controls */}
        <Card className="lg:col-span-1 print:hidden h-fit">
          <CardHeader>
            <CardTitle>Data Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Upload CSV (2 columns: X, Y)</Label>
              <Input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
            
            <div className="space-y-2">
              <Label>Manual Entry</Label>
              <div className="flex gap-2">
                <Input type="number" value={newX} onChange={(e) => setNewX(e.target.value)} placeholder="X value" />
                <Input type="number" value={newY} onChange={(e) => setNewY(e.target.value)} placeholder="Y value" />
                <Button onClick={handleAddData} size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(val: any) => setChartType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>X</TableHead>
                      <TableHead>Y</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((point) => (
                      <TableRow key={point.id}>
                        <TableCell>{point.x}</TableCell>
                        <TableCell>{point.y}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteData(point.id)} className="h-6 w-6 text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart Area */}
        <Card className="lg:col-span-2 min-h-[500px] print:shadow-none print:border-none">
          <CardHeader className="print:hidden">
            <CardTitle>Visualization</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] print:h-[600px]">
            {renderChart()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
