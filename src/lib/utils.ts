import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, differenceInDays } from "date-fns"
import { Task } from "../store/useStore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isTaskOnDate(task: Task, targetDateStr: string): boolean {
  const taskDate = parseISO(task.date);
  const targetDate = parseISO(targetDateStr);

  // Strip time for comparison
  taskDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate < taskDate) return false; // Task hasn't started yet

  if (task.type === 'event') {
    return task.date === targetDateStr;
  }

  if (task.type === 'daily') {
    return true; // Occurs every day after start date
  }

  if (task.type === 'weekly') {
    const diff = differenceInDays(targetDate, taskDate);
    return diff % 7 === 0;
  }

  if (task.type === 'monthly') {
    return taskDate.getDate() === targetDate.getDate();
  }

  return false;
}
