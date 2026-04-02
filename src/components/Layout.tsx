import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from './theme-provider';
import {
  Beaker,
  Calculator,
  Calendar,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Moon,
  Sun,
  TestTube2,
  Palette,
  Menu,
  StickyNote,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { useState } from 'react';
import { QuoteWidget } from './QuoteWidget';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Calculators', path: '/calculators', icon: Calculator },
  { name: 'Lab Planner', path: '/planner', icon: Calendar },
  { name: 'Protocol Gen', path: '/protocol', icon: FileText },
  { name: 'Reagent Tracker', path: '/reagents', icon: TestTube2 },
  { name: 'Data Visualizer', path: '/visualizer', icon: LineChart },
  { name: 'Notes', path: '/notes', icon: StickyNote },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
  { name: 'Help', path: '/help', icon: HelpCircle },
];

const THEMES = [
  { name: 'zinc', color: 'bg-zinc-900 dark:bg-zinc-100' },
  { name: 'blue', color: 'bg-blue-600' },
  { name: 'green', color: 'bg-green-600' },
  { name: 'rose', color: 'bg-rose-600' },
  { name: 'orange', color: 'bg-orange-600' },
] as const;

export function Layout() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <Beaker className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">LabFlow</span>
        </div>
        <ScrollArea className="flex-1 min-h-0 px-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t flex flex-col gap-2 shrink-0">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" className="w-full justify-start gap-3" />}>
              <Palette className="w-5 h-5" />
              Theme Color
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" side="right" align="end">
              <div className="flex gap-2 justify-center">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setColorTheme(t.name as any)}
                    className={`w-6 h-6 rounded-full ${t.color} ${
                      colorTheme === t.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    title={t.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 bg-card md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="p-6 flex items-center gap-3 shrink-0 border-b">
                  <Beaker className="w-8 h-8 text-primary" />
                  <span className="text-xl font-bold tracking-tight">LabFlow</span>
                </div>
                <ScrollArea className="flex-1 px-4 py-4">
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            className="w-full justify-start gap-3"
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </ScrollArea>
                <div className="p-4 border-t flex flex-col gap-2 shrink-0">
                  <Popover>
                    <PopoverTrigger render={<Button variant="outline" className="w-full justify-start gap-3" />}>
                      <Palette className="w-5 h-5" />
                      Theme Color
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2" side="top" align="center">
                      <div className="flex gap-2 justify-center">
                        {THEMES.map((t) => (
                          <button
                            key={t.name}
                            onClick={() => setColorTheme(t.name as any)}
                            className={`w-6 h-6 rounded-full ${t.color} ${
                              colorTheme === t.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                            }`}
                            title={t.name}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <Beaker className="w-6 h-6 text-primary mr-2" />
              <span className="text-lg font-bold">LabFlow</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger render={<Button variant="ghost" size="icon" />}>
                <Palette className="w-5 h-5" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="bottom" align="end">
                <div className="flex gap-2 justify-center">
                  {THEMES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setColorTheme(t.name as any)}
                      className={`w-6 h-6 rounded-full ${t.color} ${
                        colorTheme === t.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col">
          <div className="flex justify-end shrink-0 mb-6">
            <QuoteWidget />
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
