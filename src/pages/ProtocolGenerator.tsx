import { useState } from 'react';
import { useStore, Protocol, DataTable } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileText, Printer, Save, Trash2, Edit2, Eye, Download, Plus, Table as TableIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function TableEditor({ table, onChange, onRemove, label }: { table: DataTable, onChange: (t: DataTable) => void, onRemove: () => void, label: string }) {
  return (
    <div className="border rounded-md p-4 space-y-4 bg-muted/10 mt-2">
      <div className="flex justify-between items-center">
        <Label className="font-semibold">{label} Table</Label>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive h-8 px-2"><Trash2 className="w-4 h-4 mr-1"/> Remove Table</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} className="border p-1 font-normal">
                  <Input value={h} onChange={e => {
                    const newH = [...table.headers];
                    newH[i] = e.target.value;
                    onChange({...table, headers: newH});
                  }} className="h-8 min-w-[100px] font-semibold" placeholder={`Header ${i+1}`} />
                </th>
              ))}
              <th className="border p-1 w-10">
                <Button variant="ghost" size="icon" onClick={() => {
                  onChange({
                    headers: [...table.headers, `Col ${table.headers.length + 1}`],
                    rows: table.rows.map(r => [...r, ''])
                  });
                }}><Plus className="w-4 h-4"/></Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border p-1">
                    <Input value={cell} onChange={e => {
                      const newR = [...table.rows];
                      newR[ri] = [...newR[ri]];
                      newR[ri][ci] = e.target.value;
                      onChange({...table, rows: newR});
                    }} className="h-8 min-w-[100px]" />
                  </td>
                ))}
                <td className="border p-1 text-center">
                  <Button variant="ghost" size="icon" onClick={() => {
                    const newR = table.rows.filter((_, i) => i !== ri);
                    onChange({...table, rows: newR});
                  }} className="text-destructive"><Trash2 className="w-4 h-4"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={() => {
        onChange({...table, rows: [...table.rows, Array(table.headers.length).fill('')]});
      }}><Plus className="w-4 h-4 mr-2"/> Add Row</Button>
    </div>
  )
}

const renderTable = (table?: DataTable) => {
  if (!table || table.headers.length === 0) return null;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse border">
        <thead>
          <tr className="bg-muted/50">
            {table.headers.map((h, i) => <th key={i} className="border p-2 text-left font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci} className="border p-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PREBUILT_BUFFERS = [
  { name: 'PBS (Phosphate-Buffered Saline)', conc: '1x', ph: '7.4' },
  { name: 'TBS (Tris-Buffered Saline)', conc: '1x', ph: '7.6' },
  { name: 'TAE (Tris-acetate-EDTA)', conc: '1x', ph: '8.3' },
  { name: 'TBE (Tris-borate-EDTA)', conc: '1x', ph: '8.3' },
  { name: 'Tris-HCl', conc: '100 mM', ph: '8.0' },
  { name: 'HEPES', conc: '50 mM', ph: '7.4' },
  { name: 'RIPA Buffer', conc: '1x', ph: '7.4' },
  { name: 'TE Buffer', conc: '1x', ph: '8.0' },
];

export function ProtocolGenerator() {
  const { protocols, addProtocol, deleteProtocol, updateProtocol, addProtocolRun } = useStore();
  const [title, setTitle] = useState('');
  const [aim, setAim] = useState('');
  const [reagents, setReagents] = useState('');
  const [procedure, setProcedure] = useState('');
  const [observation, setObservation] = useState('');
  const [result, setResult] = useState('');

  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
  const [viewingProtocol, setViewingProtocol] = useState<Protocol | null>(null);
  const [newRunObservation, setNewRunObservation] = useState('');
  const [newRunResult, setNewRunResult] = useState('');
  const [procedureTable, setProcedureTable] = useState<DataTable | null>(null);
  const [observationTable, setObservationTable] = useState<DataTable | null>(null);
  const [newRunTable, setNewRunTable] = useState<DataTable | null>(null);

  const [selectedBufferIdx, setSelectedBufferIdx] = useState<number | ''>('');
  const [bufferConc, setBufferConc] = useState('');
  const [bufferPh, setBufferPh] = useState('');

  const handleBufferSelect = (idx: number | '') => {
    setSelectedBufferIdx(idx);
    if (idx !== '') {
      setBufferConc(PREBUILT_BUFFERS[idx].conc);
      setBufferPh(PREBUILT_BUFFERS[idx].ph);
    } else {
      setBufferConc('');
      setBufferPh('');
    }
  };

  const handleAddBuffer = () => {
    if (selectedBufferIdx === '') return;
    const buf = PREBUILT_BUFFERS[selectedBufferIdx];
    const newEntry = `- ${bufferConc} ${buf.name}, pH ${bufferPh}`;
    setReagents(prev => prev ? prev + '\n' + newEntry : newEntry);
    setSelectedBufferIdx('');
    setBufferConc('');
    setBufferPh('');
  };

  const handleSave = () => {
    if (!title) return;
    
    if (editingProtocolId) {
      updateProtocol(editingProtocolId, {
        title,
        aim,
        reagents,
        procedure,
        procedureTable: procedureTable || undefined,
        observation,
        observationTable: observationTable || undefined,
        result,
      });
      setEditingProtocolId(null);
    } else {
      const newProtocol: Protocol = {
        id: crypto.randomUUID(),
        title,
        aim,
        reagents,
        procedure,
        procedureTable: procedureTable || undefined,
        observation,
        observationTable: observationTable || undefined,
        result,
        date: new Date().toISOString().split('T')[0],
      };
      addProtocol(newProtocol);
    }
    // Reset form
    setTitle(''); setAim(''); setReagents(''); setProcedure(''); setObservation(''); setResult('');
    setProcedureTable(null); setObservationTable(null);
  };

  const handleEdit = (p: Protocol) => {
    setEditingProtocolId(p.id);
    setTitle(p.title);
    setAim(p.aim);
    setReagents(p.reagents);
    setProcedure(p.procedure);
    setProcedureTable(p.procedureTable || null);
    setObservation(p.observation);
    setObservationTable(p.observationTable || null);
    setResult(p.result);
  };

  const handleCancelEdit = () => {
    setEditingProtocolId(null);
    setTitle(''); setAim(''); setReagents(''); setProcedure(''); setObservation(''); setResult('');
    setProcedureTable(null); setObservationTable(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!viewingProtocol) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let y = 20;
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      // Title
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(viewingProtocol.title || 'Untitled Protocol', maxWidth);
      pdf.text(titleLines, margin, y);
      y += titleLines.length * 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Created: ${viewingProtocol.date}`, margin, y);
      y += 10;

      pdf.setTextColor(0, 0, 0);

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 280) {
          pdf.addPage();
          y = 20;
        }
      };

      const addSection = (title: string, content?: string, table?: DataTable) => {
        if (!content && !table) return;
        checkPageBreak(20);
        
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, y);
        y += 7;
        
        if (content) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          const lines = pdf.splitTextToSize(content, maxWidth);
          
          for (let i = 0; i < lines.length; i++) {
            checkPageBreak(10);
            pdf.text(lines[i], margin, y);
            y += 6;
          }
          y += 5;
        }

        if (table && table.headers.length > 0) {
          autoTable(pdf, {
            startY: y,
            head: [table.headers],
            body: table.rows,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          });
          y = (pdf as any).lastAutoTable.finalY + 10;
        }
      };

      addSection("Aim", viewingProtocol.aim);
      addSection("Reagents & Apparatus", viewingProtocol.reagents);
      addSection("Procedure", viewingProtocol.procedure, viewingProtocol.procedureTable);
      addSection("Observation", viewingProtocol.observation, viewingProtocol.observationTable);
      addSection("Result", viewingProtocol.result);
      
      if (viewingProtocol.runs && viewingProtocol.runs.length > 0) {
        checkPageBreak(25);
        y += 5;
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Additional Runs", margin, y);
        y += 10;

        viewingProtocol.runs.forEach((run, idx) => {
          checkPageBreak(20);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Run ${idx + 2} (${run.date})`, margin, y);
          y += 7;
          
          if (run.observation) {
            pdf.setFont("helvetica", "bold");
            pdf.text("Observation:", margin, y);
            y += 6;
            pdf.setFont("helvetica", "normal");
            const obsLines = pdf.splitTextToSize(run.observation, maxWidth);
            for (let i = 0; i < obsLines.length; i++) {
              checkPageBreak(10);
              pdf.text(obsLines[i], margin, y);
              y += 6;
            }
            y += 4;
          }

          if (run.observationTable && run.observationTable.headers.length > 0) {
            autoTable(pdf, {
              startY: y,
              head: [run.observationTable.headers],
              body: run.observationTable.rows,
              margin: { left: margin, right: margin },
              theme: 'grid',
              styles: { fontSize: 10 },
              headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
            });
            y = (pdf as any).lastAutoTable.finalY + 10;
          }

          if (run.result) {
            pdf.setFont("helvetica", "bold");
            pdf.text("Result:", margin, y);
            y += 6;
            pdf.setFont("helvetica", "normal");
            const resLines = pdf.splitTextToSize(run.result, maxWidth);
            for (let i = 0; i < resLines.length; i++) {
              checkPageBreak(10);
              pdf.text(resLines[i], margin, y);
              y += 6;
            }
            y += 5;
          }
        });
      }

      pdf.save(`${viewingProtocol.title || 'protocol'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleAddRun = () => {
    if (!viewingProtocol || (!newRunObservation && !newRunResult && !newRunTable)) return;
    
    const newRun = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      observation: newRunObservation,
      result: newRunResult,
      observationTable: newRunTable || undefined,
    };
    
    addProtocolRun(viewingProtocol.id, newRun);
    
    // Update local state to reflect the new run immediately
    setViewingProtocol({
      ...viewingProtocol,
      runs: [...(viewingProtocol.runs || []), newRun]
    });
    
    setNewRunObservation('');
    setNewRunResult('');
    setNewRunTable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protocol Generator</h1>
          <p className="text-muted-foreground">Create, save, and print experiment protocols.</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden w-full sm:w-auto">
          {editingProtocolId && (
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCancelEdit}>
              Cancel Edit
            </Button>
          )}
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> {editingProtocolId ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Draft Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project / Experiment Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Protein Extraction" />
            </div>
            <div className="space-y-2">
              <Label>Aim</Label>
              <Textarea value={aim} onChange={(e) => setAim(e.target.value)} placeholder="Objective of the experiment..." />
            </div>
            <div className="space-y-2">
              <Label>Reagents & Apparatus</Label>
              <div className="flex flex-wrap gap-2 items-end bg-muted/20 p-3 rounded-md border mb-2">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs">Prebuilt Buffer</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedBufferIdx}
                    onChange={(e) => handleBufferSelect(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Select a buffer...</option>
                    {PREBUILT_BUFFERS.map((b, i) => (
                      <option key={i} value={i}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Conc.</Label>
                  <Input className="h-9" value={bufferConc} onChange={e => setBufferConc(e.target.value)} placeholder="e.g. 1x" disabled={selectedBufferIdx === ''} />
                </div>
                <div className="w-24">
                  <Label className="text-xs">pH</Label>
                  <Input className="h-9" value={bufferPh} onChange={e => setBufferPh(e.target.value)} placeholder="e.g. 7.4" disabled={selectedBufferIdx === ''} />
                </div>
                <Button size="sm" className="h-9" variant="secondary" onClick={handleAddBuffer} disabled={selectedBufferIdx === ''}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <Textarea value={reagents} onChange={(e) => setReagents(e.target.value)} placeholder="- Reagent A&#10;- Beaker" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Procedure (Bullet points)</Label>
                {!procedureTable && (
                  <Button variant="outline" size="sm" onClick={() => setProcedureTable({ headers: ['Step', 'Action'], rows: [['1', '']] })} className="h-8">
                    <TableIcon className="w-4 h-4 mr-2" /> Add Table
                  </Button>
                )}
              </div>
              <Textarea value={procedure} onChange={(e) => setProcedure(e.target.value)} placeholder="1. Step one&#10;2. Step two" className="min-h-[150px]" />
              {procedureTable && <TableEditor table={procedureTable} onChange={setProcedureTable} onRemove={() => setProcedureTable(null)} label="Procedure" />}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Observation / Notes</Label>
                {!observationTable && (
                  <Button variant="outline" size="sm" onClick={() => setObservationTable({ headers: ['Time', 'Observation'], rows: [['0 min', '']] })} className="h-8">
                    <TableIcon className="w-4 h-4 mr-2" /> Add Table
                  </Button>
                )}
              </div>
              <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Any observations during the experiment..." />
              {observationTable && <TableEditor table={observationTable} onChange={setObservationTable} onRemove={() => setObservationTable(null)} label="Observation" />}
            </div>
            <div className="space-y-2">
              <Label>Result / Conclusion</Label>
              <Textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Final outcome..." />
            </div>
          </CardContent>
        </Card>

        {/* Preview / Saved Protocols */}
        <div className="space-y-6">
          <Card className="print:block print:shadow-none print:border-none">
            <CardHeader className="print:px-0">
              <CardTitle className="text-2xl border-b pb-2">{title || 'Untitled Protocol'}</CardTitle>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="space-y-6 print:px-0">
              {aim && (
                <div><h3 className="font-bold text-lg mb-1">Aim</h3><p className="whitespace-pre-wrap break-words">{aim}</p></div>
              )}
              {reagents && (
                <div><h3 className="font-bold text-lg mb-1">Reagents & Apparatus</h3><p className="whitespace-pre-wrap break-words">{reagents}</p></div>
              )}
              {(procedure || procedureTable) && (
                <div>
                  <h3 className="font-bold text-lg mb-1">Procedure</h3>
                  {procedure && <p className="whitespace-pre-wrap break-words">{procedure}</p>}
                  {renderTable(procedureTable)}
                </div>
              )}
              {(observation || observationTable) && (
                <div>
                  <h3 className="font-bold text-lg mb-1">Observations</h3>
                  {observation && <p className="whitespace-pre-wrap break-words">{observation}</p>}
                  {renderTable(observationTable)}
                </div>
              )}
              {result && (
                <div><h3 className="font-bold text-lg mb-1">Result</h3><p className="whitespace-pre-wrap break-words">{result}</p></div>
              )}
            </CardContent>
          </Card>

          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Saved Protocols</CardTitle>
            </CardHeader>
            <CardContent>
              {protocols.length === 0 ? (
                <p className="text-muted-foreground text-sm">No saved protocols.</p>
              ) : (
                <ul className="space-y-2">
                  {protocols.map((p) => (
                    <li key={p.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">{p.title}</span>
                        <span className="text-xs text-muted-foreground">({p.date})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingProtocol(p)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProtocol(p.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!viewingProtocol} onOpenChange={(open) => !open && setViewingProtocol(null)}>
        <DialogContent className="max-w-4xl sm:max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>Protocol Viewer & Results Manager</span>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pb-6">
              <div id="protocol-pdf-content" className="space-y-6 p-8 bg-white text-black rounded-md border">
                <div className="border-b pb-4">
                  <h1 className="text-3xl font-bold mb-2">{viewingProtocol?.title}</h1>
                  <p className="text-sm text-gray-500">Created: {viewingProtocol?.date}</p>
                </div>
                
                {viewingProtocol?.aim && (
                  <div><h3 className="font-bold text-lg mb-1">Aim</h3><p className="whitespace-pre-wrap break-words">{viewingProtocol.aim}</p></div>
                )}
                {viewingProtocol?.reagents && (
                  <div><h3 className="font-bold text-lg mb-1">Reagents & Apparatus</h3><p className="whitespace-pre-wrap break-words">{viewingProtocol.reagents}</p></div>
                )}
                {(viewingProtocol?.procedure || viewingProtocol?.procedureTable) && (
                  <div>
                    <h3 className="font-bold text-lg mb-1">Procedure</h3>
                    {viewingProtocol.procedure && <p className="whitespace-pre-wrap break-words">{viewingProtocol.procedure}</p>}
                    {renderTable(viewingProtocol.procedureTable)}
                  </div>
                )}
                {(viewingProtocol?.observation || viewingProtocol?.observationTable) && (
                  <div>
                    <h3 className="font-bold text-lg mb-1">Observations</h3>
                    {viewingProtocol.observation && <p className="whitespace-pre-wrap break-words">{viewingProtocol.observation}</p>}
                    {renderTable(viewingProtocol.observationTable)}
                  </div>
                )}
                {viewingProtocol?.result && (
                  <div><h3 className="font-bold text-lg mb-1">Result</h3><p className="whitespace-pre-wrap break-words">{viewingProtocol.result}</p></div>
                )}
                
                {viewingProtocol?.runs && viewingProtocol.runs.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold mb-4">Additional Runs</h2>
                    
                    {viewingProtocol.runs.map((run, idx) => (
                      <div key={run.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-semibold mb-2">Run {idx + 2} ({run.date})</h4>
                        {(run.observation || run.observationTable) && (
                          <div className="mb-2">
                            <span className="font-medium">Observation:</span> 
                            {run.observation && <p className="whitespace-pre-wrap break-words text-sm mt-1">{run.observation}</p>}
                            {renderTable(run.observationTable)}
                          </div>
                        )}
                        {run.result && (
                          <div><span className="font-medium">Result:</span> <p className="whitespace-pre-wrap break-words text-sm mt-1">{run.result}</p></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add New Run Form (Not included in PDF) */}
              <div className="mt-8 p-6 border rounded-lg bg-muted/30">
                <h3 className="font-bold text-lg mb-4">Add New Result (Repeating Experiment)</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Observation / Notes</Label>
                      {!newRunTable && (
                        <Button variant="outline" size="sm" onClick={() => setNewRunTable({ headers: ['Time', 'Observation'], rows: [['0 min', '']] })} className="h-8">
                          <TableIcon className="w-4 h-4 mr-2" /> Add Table
                        </Button>
                      )}
                    </div>
                    <Textarea 
                      value={newRunObservation} 
                      onChange={(e) => setNewRunObservation(e.target.value)} 
                      placeholder="What did you observe this time?" 
                    />
                    {newRunTable && <TableEditor table={newRunTable} onChange={setNewRunTable} onRemove={() => setNewRunTable(null)} label="Observation" />}
                  </div>
                  <div className="space-y-2">
                    <Label>Result / Conclusion</Label>
                    <Textarea 
                      value={newRunResult} 
                      onChange={(e) => setNewRunResult(e.target.value)} 
                      placeholder="Final outcome of this run..." 
                    />
                  </div>
                  <Button onClick={handleAddRun} className="w-full">Add Result</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
