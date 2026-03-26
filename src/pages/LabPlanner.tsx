import { useState } from 'react';
import { useStore, Task } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Calendar } from '../components/ui/calendar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, List, Edit2 } from 'lucide-react';
import { isTaskOnDate } from '../lib/utils';

export function LabPlanner() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useStore();
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'event'>('daily');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [viewAll, setViewAll] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const handleAddTask = () => {
    if (!title) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      date: dateStr,
      type,
      priority,
      completed: false,
    };
    addTask(newTask);
    setTitle('');
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    updateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };


  const displayTasks = tasks
    .filter(t => viewAll ? true : isTaskOnDate(t, dateStr))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Planner</h1>
          <p className="text-muted-foreground">Manage your daily, weekly, and monthly lab tasks.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto shrink-0" onClick={() => setViewAll(!viewAll)}>
          <List className="w-4 h-4 mr-2" />
          {viewAll ? 'View Selected Date' : 'View All Tasks'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Left Column: Calendar + Add Task */}
        <div className="md:col-span-1 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setViewAll(false);
                  }
                }}
                className="rounded-md border"
                modifiers={{ hasTask: (d) => tasks.some(t => isTaskOnDate(t, format(d, 'yyyy-MM-dd'))) }}
                modifiersClassNames={{ hasTask: "bg-primary/10 font-bold text-primary" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Calibrate pH meter" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={dateStr} 
                  onChange={(e) => {
                    const parsed = parseISO(e.target.value);
                    if (!isNaN(parsed.getTime())) {
                      setSelectedDate(parsed);
                      setViewAll(false);
                    }
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label>Recurrence / Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="event">One-time Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAddTask}>
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card className="md:col-span-2 lg:col-span-3 h-fit">
          <CardHeader>
            <CardTitle>{viewAll ? 'All Upcoming Tasks' : `Tasks for ${selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Selected Date'}`}</CardTitle>
          </CardHeader>
          <CardContent>
            {displayTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks scheduled for this view.</p>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {displayTasks.map((task) => {
                    const toggleDateStr = viewAll ? task.date : dateStr;
                    const isCompleted = task.type === 'event' ? task.completed : (task.completedDates || []).includes(toggleDateStr);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Checkbox checked={isCompleted} onCheckedChange={() => toggleTask(task.id, toggleDateStr)} />
                          <div>
                            <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {format(new Date(task.date), 'MMM dd, yyyy')} &bull; <span className="capitalize ml-1">{task.type}</span>
                              {task.priority && (
                                <>
                                  <span className="mx-1">&bull;</span>
                                  <span className={`capitalize ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {task.priority} Priority
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger render={<Button variant="ghost" size="icon" onClick={() => setEditingTask(task)} />}>
                              <Edit2 className="w-4 h-4" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                              </DialogHeader>
                              {editingTask && editingTask.id === task.id && (
                                <div className="space-y-4 mt-4">
                                  <div className="space-y-2">
                                    <Label>Task Title</Label>
                                    <Input 
                                      value={editingTask.title} 
                                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input 
                                      type="date" 
                                      value={editingTask.date} 
                                      onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })} 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Recurrence / Type</Label>
                                    <Select 
                                      value={editingTask.type} 
                                      onValueChange={(val: any) => setEditingTask({ ...editingTask, type: val })}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="event">One-time Event</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select 
                                      value={editingTask.priority || 'medium'} 
                                      onValueChange={(val: any) => setEditingTask({ ...editingTask, priority: val })}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DialogClose render={<Button className="w-full mt-4" onClick={handleUpdateTask} />}>
                                    Save Changes
                                  </DialogClose>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
