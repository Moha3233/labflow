import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Calendar } from '../components/ui/calendar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Beaker, Calculator, Calendar as CalendarIcon, FileText, LineChart, TestTube2, AlertTriangle } from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import { isTaskOnDate } from '../lib/utils';

export function Dashboard() {
  const { tasks, toggleTask, reagents } = useStore();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const displayTasks = tasks.filter((t) => isTaskOnDate(t, selectedDateStr));

  const quickLinks = [
    { name: 'Dilution Calc', path: '/calculators', icon: Calculator, color: 'text-blue-500' },
    { name: 'Buffer Prep', path: '/calculators', icon: Beaker, color: 'text-green-500' },
    { name: 'Lab Planner', path: '/planner', icon: CalendarIcon, color: 'text-purple-500' },
    { name: 'Protocol Gen', path: '/protocol', icon: FileText, color: 'text-orange-500' },
    { name: 'Reagents', path: '/reagents', icon: TestTube2, color: 'text-red-500' },
    { name: 'Visualizer', path: '/visualizer', icon: LineChart, color: 'text-indigo-500' },
  ];

  // Get expiring reagents (within 30 days) or already expired
  const thirtyDaysFromNow = addDays(new Date(), 30);
  const expiringReagents = reagents
    .filter((r) => r.expiry && isBefore(new Date(r.expiry), thirtyDaysFromNow))
    .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back. Here's your lab overview.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Access */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.name} to={link.path}>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors h-full">
                      <Icon className={`w-8 h-8 mb-2 ${link.color}`} />
                      <span className="text-sm font-medium text-center">{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mini Calendar */}
        <Card className="col-span-full md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{ hasTask: (d) => tasks.some(t => isTaskOnDate(t, format(d, 'yyyy-MM-dd'))) }}
              modifiersClassNames={{ hasTask: "bg-primary/10 font-bold text-primary" }}
            />
          </CardContent>
        </Card>

        <div className="col-span-full md:col-span-1 lg:col-span-2 space-y-6">
          {/* Tasks for Date */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Tasks for {date ? format(date, 'MMM dd, yyyy') : 'Today'}</CardTitle>
            </CardHeader>
            <CardContent>
              {displayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks scheduled for this date.</p>
              ) : (
                <ScrollArea className="h-[200px] pr-4">
                  <ul className="space-y-3">
                    {displayTasks.map((task) => {
                      const isCompleted = task.type === 'event' ? task.completed : (task.completedDates || []).includes(selectedDateStr);
                      return (
                        <li key={task.id} className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 transition-colors">
                          <Checkbox
                            id={task.id}
                            checked={isCompleted}
                            onCheckedChange={() => toggleTask(task.id, selectedDateStr)}
                          />
                          <label
                            htmlFor={task.id}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer ${
                              isCompleted ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
              <div className="mt-4">
                <Link to="/planner" className="text-sm font-medium text-primary hover:underline">
                  Manage all tasks &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Reagents Overview */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5" />
                Expiring Reagents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringReagents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reagents expiring soon.</p>
              ) : (
                <div className="space-y-4">
                  {expiringReagents.map((reagent) => {
                    const isExpired = isBefore(new Date(reagent.expiry), new Date());
                    return (
                      <div key={reagent.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {reagent.name}
                            {isExpired && <AlertTriangle className="w-4 h-4 text-destructive" />}
                          </p>
                          <p className="text-xs text-muted-foreground">Loc: {reagent.location} | Qty: {reagent.quantity}</p>
                        </div>
                        <div className={`text-sm font-medium ${isExpired ? 'text-destructive' : 'text-orange-500'}`}>
                          {isExpired ? 'Expired' : 'Expiring'} {format(new Date(reagent.expiry), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-2">
                    <Link to="/reagents" className="text-sm font-medium text-primary hover:underline">
                      View all reagents &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
