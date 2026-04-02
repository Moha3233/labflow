import { useState } from 'react';
import { useStore, Note } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Plus, Trash2, Edit2, StickyNote, BookOpen, FlaskConical, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Note['type']>('general');

  const handleOpen = (note?: Note) => {
    if (note) {
      setEditingId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setType('general');
    }
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!title || !content) return;
    if (editingId) {
      updateNote(editingId, { title, content, type });
    } else {
      addNote({
        id: crypto.randomUUID(),
        title,
        content,
        type,
        date: new Date().toISOString(),
      });
    }
    setIsOpen(false);
  };

  const getTypeIcon = (t: Note['type']) => {
    switch (t) {
      case 'daily': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'experiment': return <FlaskConical className="w-4 h-4 text-green-500" />;
      case 'scientific': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <StickyNote className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Store daily reports, experiment results, and scientific notes.</p>
        </div>
        <Button onClick={() => handleOpen()} className="w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4 mr-2" /> New Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => (
          <Card key={note.id} className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getTypeIcon(note.type)}
                  <span className="text-xs font-medium uppercase text-muted-foreground">{note.type}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(note)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl mt-2">{note.title}</CardTitle>
              <CardDescription>{format(new Date(note.date), 'MMM dd, yyyy h:mm a')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/20">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No notes yet. Click "New Note" to create one.
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Note' : 'Create New Note'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Note</SelectItem>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="experiment">Experiment Result</SelectItem>
                  <SelectItem value="scientific">Scientific Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 h-full flex flex-col">
              <Label>Content</Label>
              <Textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Write your note here..."
                className="flex-1 min-h-[300px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
