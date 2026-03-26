import { useState } from 'react';
import { useStore, Reagent } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function ReagentTracker() {
  const { reagents, addReagent, deleteReagent, updateReagent } = useStore();
  const [name, setName] = useState('');
  const [cas, setCas] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');

  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null);

  const handleAdd = () => {
    if (!name) return;
    const newReagent: Reagent = {
      id: crypto.randomUUID(),
      name,
      cas,
      location,
      quantity,
      expiry,
    };
    addReagent(newReagent);
    setName(''); setCas(''); setLocation(''); setQuantity(''); setExpiry('');
  };

  const handleUpdate = () => {
    if (!editingReagent) return;
    updateReagent(editingReagent.id, editingReagent);
    setEditingReagent(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reagent Tracker</h1>
      <p className="text-muted-foreground">Manage your lab inventory, locations, and expiry dates.</p>

      <Card>
        <CardHeader>
          <CardTitle>Add Reagent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. NaCl" />
            </div>
            <div className="space-y-2">
              <Label>CAS Number</Label>
              <Input value={cas} onChange={(e) => setCas(e.target.value)} placeholder="e.g. 7647-14-5" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shelf A2" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 500g" />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4 w-full sm:w-auto" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add to Inventory
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
        </CardHeader>
        <CardContent>
          {reagents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No reagents in inventory.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CAS Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reagents.map((reagent) => (
                    <TableRow key={reagent.id}>
                      <TableCell className="font-medium">{reagent.name}</TableCell>
                      <TableCell>{reagent.cas}</TableCell>
                      <TableCell>{reagent.location}</TableCell>
                      <TableCell>{reagent.quantity}</TableCell>
                      <TableCell className={new Date(reagent.expiry) < new Date() ? 'text-destructive font-bold' : ''}>
                        {reagent.expiry}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger render={<Button variant="ghost" size="icon" onClick={() => setEditingReagent(reagent)} />}>
                              <Edit2 className="w-4 h-4" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Reagent</DialogTitle>
                              </DialogHeader>
                              {editingReagent && editingReagent.id === reagent.id && (
                                <div className="space-y-4 mt-4">
                                  <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={editingReagent.name} onChange={(e) => setEditingReagent({ ...editingReagent, name: e.target.value })} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>CAS Number</Label>
                                    <Input value={editingReagent.cas} onChange={(e) => setEditingReagent({ ...editingReagent, cas: e.target.value })} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={editingReagent.location} onChange={(e) => setEditingReagent({ ...editingReagent, location: e.target.value })} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input value={editingReagent.quantity} onChange={(e) => setEditingReagent({ ...editingReagent, quantity: e.target.value })} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <Input type="date" value={editingReagent.expiry} onChange={(e) => setEditingReagent({ ...editingReagent, expiry: e.target.value })} />
                                  </div>
                                  <DialogClose render={<Button className="w-full mt-4" onClick={handleUpdate} />}>
                                    Save Changes
                                  </DialogClose>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => deleteReagent(reagent.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
