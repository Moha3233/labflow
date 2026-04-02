import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Task = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  completedDates?: string[]; // For recurring tasks
  type: 'daily' | 'weekly' | 'monthly' | 'event';
  priority?: 'low' | 'medium' | 'high';
};

export type Reagent = {
  id: string;
  name: string;
  cas: string;
  location: string;
  quantity: string;
  expiry: string;
};

export type DataTable = {
  headers: string[];
  rows: string[][];
};

export type ProtocolRun = {
  id: string;
  date: string;
  observation: string;
  result: string;
  observationTable?: DataTable;
};

export type Protocol = {
  id: string;
  title: string;
  aim: string;
  reagents: string;
  procedure: string;
  procedureTable?: DataTable;
  observation: string;
  observationTable?: DataTable;
  result: string;
  date: string;
  runs?: ProtocolRun[];
};

export type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'daily' | 'experiment' | 'scientific' | 'general';
};

interface AppState {
  tasks: Task[];
  reagents: Reagent[];
  protocols: Protocol[];
  notes: Note[];
  addTask: (task: Task) => void;
  toggleTask: (id: string, dateStr?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addReagent: (reagent: Reagent) => void;
  deleteReagent: (id: string) => void;
  updateReagent: (id: string, reagent: Partial<Reagent>) => void;
  addProtocol: (protocol: Protocol) => void;
  deleteProtocol: (id: string) => void;
  updateProtocol: (id: string, protocol: Partial<Protocol>) => void;
  addProtocolRun: (protocolId: string, run: ProtocolRun) => void;
  deleteProtocolRun: (protocolId: string, runId: string) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  importData: (data: Partial<AppState>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      reagents: [],
      protocols: [],
      notes: [],
      importData: (data) => set((state) => ({ ...state, ...data })),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      toggleTask: (id, dateStr) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            if (t.type === 'event' || !dateStr) {
              return { ...t, completed: !t.completed };
            } else {
              const completedDates = t.completedDates || [];
              const isCompleted = completedDates.includes(dateStr);
              return {
                ...t,
                completedDates: isCompleted
                  ? completedDates.filter((d) => d !== dateStr)
                  : [...completedDates, dateStr],
              };
            }
          }),
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      addReagent: (reagent) =>
        set((state) => ({ reagents: [...state.reagents, reagent] })),
      deleteReagent: (id) =>
        set((state) => ({ reagents: state.reagents.filter((r) => r.id !== id) })),
      updateReagent: (id, updatedReagent) =>
        set((state) => ({
          reagents: state.reagents.map((r) =>
            r.id === id ? { ...r, ...updatedReagent } : r
          ),
        })),
      addProtocol: (protocol) =>
        set((state) => ({ protocols: [...state.protocols, protocol] })),
      deleteProtocol: (id) =>
        set((state) => ({ protocols: state.protocols.filter((p) => p.id !== id) })),
      updateProtocol: (id, updatedProtocol) =>
        set((state) => ({
          protocols: state.protocols.map((p) =>
            p.id === id ? { ...p, ...updatedProtocol } : p
          ),
        })),
      addProtocolRun: (protocolId, run) =>
        set((state) => ({
          protocols: state.protocols.map((p) =>
            p.id === protocolId
              ? { ...p, runs: [...(p.runs || []), run] }
              : p
          ),
        })),
      deleteProtocolRun: (protocolId, runId) =>
        set((state) => ({
          protocols: state.protocols.map((p) =>
            p.id === protocolId
              ? { ...p, runs: (p.runs || []).filter((r) => r.id !== runId) }
              : p
          ),
        })),
      addNote: (note) =>
        set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updatedNote) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updatedNote } : n
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: 'labflow-storage', // unique name for localStorage key
    }
  )
);
