import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const COMMON_BUFFERS = [
  { name: 'Acetate', pka: 4.76, acid: 'Acetic acid', base: 'Sodium acetate', acidMw: 60.05, baseMw: 82.03 },
  { name: 'MES', pka: 6.15, acid: 'MES free acid', base: 'MES sodium salt', acidMw: 195.2, baseMw: 217.2 },
  { name: 'Bis-Tris', pka: 6.46, acid: 'Bis-Tris hydrochloride', base: 'Bis-Tris free base', acidMw: 245.7, baseMw: 209.2 },
  { name: 'PIPES', pka: 6.76, acid: 'PIPES free acid', base: 'PIPES sodium salt', acidMw: 302.4, baseMw: 346.3 },
  { name: 'Phosphate', pka: 7.20, acid: 'Monobasic phosphate (e.g., NaH2PO4)', base: 'Dibasic phosphate (e.g., Na2HPO4)', acidMw: 119.98, baseMw: 141.96 },
  { name: 'MOPS', pka: 7.20, acid: 'MOPS free acid', base: 'MOPS sodium salt', acidMw: 209.3, baseMw: 231.3 },
  { name: 'HEPES', pka: 7.48, acid: 'HEPES free acid', base: 'HEPES sodium salt', acidMw: 238.3, baseMw: 260.3 },
  { name: 'Tris', pka: 8.06, acid: 'Tris-HCl', base: 'Tris base', acidMw: 157.6, baseMw: 121.1 },
  { name: 'Bicine', pka: 8.26, acid: 'Bicine free acid', base: 'Bicine sodium salt', acidMw: 163.2, baseMw: 185.2 },
  { name: 'Tricine', pka: 8.05, acid: 'Tricine free acid', base: 'Tricine sodium salt', acidMw: 179.2, baseMw: 201.2 },
  { name: 'CHES', pka: 9.50, acid: 'CHES free acid', base: 'CHES sodium salt', acidMw: 207.3, baseMw: 229.3 },
  { name: 'CAPS', pka: 10.40, acid: 'CAPS free acid', base: 'CAPS sodium salt', acidMw: 221.3, baseMw: 243.3 },
];

export function Calculators() {
  // Dilution State (C1V1 = C2V2)
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');

  // Solution State (Mass = M * V * MW)
  const [molarity, setMolarity] = useState('');
  const [volume, setVolume] = useState('');
  const [mw, setMw] = useState('');

  // Buffer State (pH = pKa + log(A-/HA))
  const [pka, setPka] = useState('');
  const [ph, setPh] = useState('');
  const [totalConc, setTotalConc] = useState('');
  const [bufferVolume, setBufferVolume] = useState('');
  const [acidMw, setAcidMw] = useState('');
  const [baseMw, setBaseMw] = useState('');
  const [selectedBufferName, setSelectedBufferName] = useState('');

  const handleBufferSelect = (val: string) => {
    const buf = COMMON_BUFFERS.find(b => b.name === val);
    if (buf) {
      setSelectedBufferName(buf.name);
      setPka(buf.pka.toString());
      setAcidMw(buf.acidMw.toString());
      setBaseMw(buf.baseMw.toString());
    }
  };

  const calculateDilution = () => {
    const vals = [parseFloat(c1), parseFloat(v1), parseFloat(c2), parseFloat(v2)];
    const missingCount = vals.filter((v) => isNaN(v)).length;
    if (missingCount !== 1) return 'Please leave exactly one field empty to calculate.';

    if (isNaN(vals[0])) return `C1 = ${((vals[2] * vals[3]) / vals[1]).toFixed(4)}`;
    if (isNaN(vals[1])) return `V1 = ${((vals[2] * vals[3]) / vals[0]).toFixed(4)}`;
    if (isNaN(vals[2])) return `C2 = ${((vals[0] * vals[1]) / vals[3]).toFixed(4)}`;
    if (isNaN(vals[3])) return `V2 = ${((vals[0] * vals[1]) / vals[2]).toFixed(4)}`;
    return '';
  };

  const calculateSolution = () => {
    const m = parseFloat(molarity);
    const v = parseFloat(volume); // in L
    const w = parseFloat(mw);
    if (isNaN(m) || isNaN(v) || isNaN(w)) return 'Enter all values to calculate mass.';
    return `Mass required = ${(m * v * w).toFixed(4)} g`;
  };

  const calculateBuffer = () => {
    const pk = parseFloat(pka);
    const p = parseFloat(ph);
    const tc = parseFloat(totalConc);
    const vol = parseFloat(bufferVolume);
    const aMw = parseFloat(acidMw);
    const bMw = parseFloat(baseMw);

    if (isNaN(pk) || isNaN(p) || isNaN(tc)) return 'Enter pH, pKa, and Total Conc to calculate ratio.';
    
    const ratio = Math.pow(10, p - pk); // [A-]/[HA]
    const ha = tc / (1 + ratio);
    const a = tc - ha;

    const buf = COMMON_BUFFERS.find(b => b.name === selectedBufferName);
    const acidName = buf ? buf.acid : 'Acid';
    const baseName = buf ? buf.base : 'Base';

    let acidMassStr = '';
    let baseMassStr = '';

    if (!isNaN(vol)) {
      if (!isNaN(aMw)) acidMassStr = ` (${(ha * vol * aMw).toFixed(4)} g)`;
      if (!isNaN(bMw)) baseMassStr = ` (${(a * vol * bMw).toFixed(4)} g)`;
    }

    return (
      <div className="flex flex-col gap-1">
        <span>[{acidName}] = {ha.toFixed(4)} M{acidMassStr}</span>
        <span>[{baseName}] = {a.toFixed(4)} M{baseMassStr}</span>
        {isNaN(vol) && <span className="text-sm text-muted-foreground mt-2">Enter Target Volume & MW to calculate mass (g).</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Lab Calculators</h1>
      <p className="text-muted-foreground">Essential calculators for daily biochemistry tasks.</p>

      <Tabs defaultValue="dilution" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dilution">Dilution (C1V1 = C2V2)</TabsTrigger>
          <TabsTrigger value="solution">Solution Prep</TabsTrigger>
          <TabsTrigger value="buffer">Buffer Prep</TabsTrigger>
        </TabsList>

        {/* Dilution Calculator */}
        <TabsContent value="dilution">
          <Card>
            <CardHeader>
              <CardTitle>Dilution Calculator</CardTitle>
              <CardDescription>Leave one field empty to calculate its value.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Conc. (C1)</Label>
                  <Input type="number" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="e.g. 10" />
                </div>
                <div className="space-y-2">
                  <Label>Stock Volume (V1)</Label>
                  <Input type="number" value={v1} onChange={(e) => setV1(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="space-y-2">
                  <Label>Final Conc. (C2)</Label>
                  <Input type="number" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="e.g. 1" />
                </div>
                <div className="space-y-2">
                  <Label>Final Volume (V2)</Label>
                  <Input type="number" value={v2} onChange={(e) => setV2(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center font-mono text-lg">
                {calculateDilution() || 'Result will appear here'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solution Prep */}
        <TabsContent value="solution">
          <Card>
            <CardHeader>
              <CardTitle>Solution Preparation</CardTitle>
              <CardDescription>Calculate mass required for a specific molarity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Target Molarity (M)</Label>
                  <Input type="number" value={molarity} onChange={(e) => setMolarity(e.target.value)} placeholder="mol/L" />
                </div>
                <div className="space-y-2">
                  <Label>Target Volume (L)</Label>
                  <Input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Liters" />
                </div>
                <div className="space-y-2">
                  <Label>Molecular Weight (g/mol)</Label>
                  <Input type="number" value={mw} onChange={(e) => setMw(e.target.value)} placeholder="g/mol" />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center font-mono text-lg">
                {calculateSolution()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buffer Prep */}
        <TabsContent value="buffer">
          <Card>
            <CardHeader>
              <CardTitle>Buffer Preparation</CardTitle>
              <CardDescription>Henderson-Hasselbalch equation calculator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Common Buffers</Label>
                  <Select onValueChange={handleBufferSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a buffer" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_BUFFERS.map((b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name} (pKa {b.pka})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target pH</Label>
                  <Input type="number" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="e.g. 7.4" />
                </div>
                <div className="space-y-2">
                  <Label>pKa of Acid</Label>
                  <Input type="number" value={pka} onChange={(e) => setPka(e.target.value)} placeholder="e.g. 7.2" />
                </div>
                <div className="space-y-2">
                  <Label>Total Concentration (M)</Label>
                  <Input type="number" value={totalConc} onChange={(e) => setTotalConc(e.target.value)} placeholder="e.g. 0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Target Volume (L)</Label>
                  <Input type="number" value={bufferVolume} onChange={(e) => setBufferVolume(e.target.value)} placeholder="e.g. 1" />
                </div>
                <div className="space-y-2">
                  <Label>Acid MW (g/mol)</Label>
                  <Input type="number" value={acidMw} onChange={(e) => setAcidMw(e.target.value)} placeholder="e.g. 119.98" />
                </div>
                <div className="space-y-2">
                  <Label>Base MW (g/mol)</Label>
                  <Input type="number" value={baseMw} onChange={(e) => setBaseMw(e.target.value)} placeholder="e.g. 141.96" />
                </div>
              </div>

              {selectedBufferName && (
                <div className="p-3 bg-muted/30 rounded-md text-sm text-muted-foreground border border-muted">
                  <p className="font-semibold mb-1 text-foreground">Components for {selectedBufferName} Buffer:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Acid Component:</strong> {COMMON_BUFFERS.find(b => b.name === selectedBufferName)?.acid}</li>
                    <li><strong>Base Component:</strong> {COMMON_BUFFERS.find(b => b.name === selectedBufferName)?.base}</li>
                  </ul>
                </div>
              )}

              <div className="p-4 bg-muted rounded-md text-center font-mono text-lg">
                {calculateBuffer()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
