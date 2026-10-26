/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Planner Akuntansi UPNVJ - Aplikasi Lengkap Jadwal Kuliah & List Tugas Mahasiswa S1 Akuntansi UPNVJ
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sidebar,
} from './components/Sidebar';
import {
  Topbar,
} from './components/Topbar';
import {
  BottomNav,
} from './components/BottomNav';
import {
  TaskCard,
} from './components/TaskCard';
import {
  TaskModal,
} from './components/TaskModal';
import {
  KanbanView,
} from './components/KanbanView';
import {
  ScheduleView,
} from './components/ScheduleView';
import {
  CalendarView,
} from './components/CalendarView';
import {
  StatsView,
} from './components/StatsView';
import {
  GradesView,
} from './components/GradesView';
import {
  PomodoroModal,
} from './components/PomodoroModal';
import {
  QuickAddModal,
} from './components/QuickAddModal';
import {
  SettingsModal,
} from './components/SettingsModal';
import {
  OnboardingModal,
} from './components/OnboardingModal';
import {
  CommandPalette,
} from './components/CommandPalette';
import {
  Task,
  Course,
  CalendarEvent,
  GradeItem,
  PomodoroSession,
  AppSettings,
  TaskFilterOptions,
  TaskStatus,
} from './types';
import {
  taskRepository,
  courseRepository,
  eventRepository,
  gradeRepository,
  pomodoroRepository,
  settingsRepository,
  DEFAULT_SETTINGS,
  getSampleAccountingCourses,
  getSampleAccountingTasks,
  getSampleGrades,
  initializeDatabaseWithSampleIfEmpty,
} from './services/db';
import {
  formatFullIndonesianDateTime,
  formatLiveCountdown,
  getLocalDateAndTimeParts,
  getRelativeCalendarDay,
} from './utils/time';
import { fireConfetti } from './utils/confetti';
import { downloadIcsFile } from './utils/ics';
import { APP_CONFIG } from './config';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  BookOpen,
  Filter,
  ArrowUpDown,
  Download,
  RotateCcw,
  Sparkles,
  Inbox,
  LayoutGrid,
  List,
  Timer,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export default function App() {
  // Global State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Active View / Tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Time Ticker (updates every minute for far deadlines, every second for topbar & near countdowns)
  const [nowUtc, setNowUtc] = useState<number>(Date.now());

  // Filters & Sorting for Tasks
  const [filterOptions, setFilterOptions] = useState<TaskFilterOptions>({
    tab: 'semua',
    search: '',
    courseId: '',
    priority: '',
    type: '',
    sortBy: 'deadline',
    sortOrder: 'asc',
    groupBy: 'none',
    viewMode: 'list',
  });

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [selectedPomodoroTask, setSelectedPomodoroTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [iosInstallModalOpen, setIosInstallModalOpen] = useState(false);

  // Undo Toast State
  const [undoToast, setUndoToast] = useState<{
    show: boolean;
    message: string;
    action: () => void;
  } | null>(null);

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabaseWithSampleIfEmpty();
        const loadedTasks = await taskRepository.getAll();
        const loadedCourses = await courseRepository.getAll();
        const loadedEvents = await eventRepository.getAll();
        const loadedGrades = await gradeRepository.getAll();
        const loadedSettings = await settingsRepository.get();

        setTasks(loadedTasks);
        setCourses(loadedCourses);
        setEvents(loadedEvents);
        setGrades(loadedGrades);
        setSettings(loadedSettings);

        // Check if onboarding needed (skip if autostart=1 in URL)
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1') {
          setIsOnboardingOpen(false);
        } else if (!loadedSettings.hasCompletedOnboarding && loadedTasks.length === 0) {
          setIsOnboardingOpen(true);
        }

        // Check shortcut params in URL (?action=new-task, ?view=schedule)
        if (params.get('action') === 'new-task') {
          setIsTaskModalOpen(true);
        } else if (params.get('view')) {
          setCurrentTab(params.get('view')!);
        }
      } catch (err) {
        console.error('Failed to load initial data from IndexedDB:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. Global Ticker (updates every second for precise countdowns)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowUtc(Date.now());
    }, 1000);

    // Sync on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNowUtc(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Theme Application (Tema Terang Mint Fresh Saja)
  useEffect(() => {
    document.documentElement.classList.remove('dark');

    if (settings.highContrast) {
      document.documentElement.classList.add('contrast-125');
    } else {
      document.documentElement.classList.remove('contrast-125');
    }
  }, [settings.highContrast]);

  // 4. PWA beforeinstallprompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 5. Global Keyboard Shortcuts: N, /, Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(targetTag)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsQuickAddOpen(false);
        setIsPomodoroOpen(false);
        setIsSettingsOpen(false);
        setIsCommandPaletteOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 6. Notifications for Upcoming Deadlines
  useEffect(() => {
    if (!settings.enableNotifications || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const activeTasks = tasks.filter((t) => t.status !== 'completed' && !t.deletedAt && t.deadlineAt);
      for (const task of activeTasks) {
        const diffMs = task.deadlineAt - nowUtc;
        const diffMins = Math.floor(diffMs / (60 * 1000));

        // Check if within 60 mins or 30 mins
        if (diffMins === 60 || diffMins === 30 || diffMins === 180) {
          try {
            new Notification(`Pengingat Tenggat: ${task.title}`, {
              body: `${task.courseName || 'Akuntansi'}: Tersisa ${diffMins} menit lagi!`,
              icon: APP_CONFIG.fallbackLogoUrl,
            });
          } catch {}
        }
      }
    }
  }, [nowUtc, settings.enableNotifications, tasks]);

  // Request Notification Permission
  const handleRequestNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          setSettings((prev) => ({ ...prev, enableNotifications: true }));
          settingsRepository.save({ ...settings, enableNotifications: true });
        }
      });
    }
  };

  // PWA Install Trigger
  const handleTriggerInstallPwa = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        setDeferredInstallPrompt(null);
      });
    } else {
      // Show iOS guidance or instructions
      setIosInstallModalOpen(true);
    }
  };

  // -------------------------------------------------------------
  // Task Handlers (Toggle Complete, Save, Delete, Extend, Undo)
  // -------------------------------------------------------------
  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const willBeCompleted = task.status !== 'completed';
    const completedAt = willBeCompleted ? Date.now() : undefined;
    const onTime = willBeCompleted ? task.deadlineAt >= Date.now() : undefined;

    const updatedTask: Task = {
      ...task,
      status: willBeCompleted ? 'completed' : 'pending',
      completedAt,
      onTime,
    };

    // Optimistic state update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    await taskRepository.save(updatedTask);

    if (willBeCompleted && settings.enableConfetti) {
      fireConfetti();
    }

    // Show 6-second undo toast
    setUndoToast({
      show: true,
      message: willBeCompleted
        ? `Tugas "${task.title}" ditandai selesai!`
        : `Tugas "${task.title}" dikembalikan ke belum selesai.`,
      action: async () => {
        const reverted: Task = {
          ...task,
          status: willBeCompleted ? 'pending' : 'completed',
          completedAt: willBeCompleted ? undefined : task.completedAt,
          onTime: willBeCompleted ? undefined : task.onTime,
        };
        setTasks((prev) => prev.map((t) => (t.id === taskId ? reverted : t)));
        await taskRepository.save(reverted);
        setUndoToast(null);
      },
    });

    setTimeout(() => {
      setUndoToast((current) => (current?.show ? null : current));
    }, 6000);
  };

  const handleSaveTask = async (task: Task) => {
    await taskRepository.save(task);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = task;
        return copy;
      }
      return [task, ...prev];
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await taskRepository.moveToTrash(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, deletedAt: Date.now() } : t)));

    setUndoToast({
      show: true,
      message: `Tugas "${task.title}" dipindahkan ke tong sampah.`,
      action: async () => {
        await taskRepository.restoreFromTrash(taskId);
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === taskId) {
              const copy = { ...t };
              delete copy.deletedAt;
              return copy;
            }
            return t;
          })
        );
        setUndoToast(null);
      },
    });

    setTimeout(() => {
      setUndoToast((current) => (current?.show ? null : current));
    }, 6000);
  };

  const handleDuplicateTask = async (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${task.title} (Salinan)`,
      status: 'pending',
      completedAt: undefined,
      onTime: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await taskRepository.save(duplicated);
    setTasks((prev) => [duplicated, ...prev]);
  };

  const handleExtendDeadline = async (taskId: string, days: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newDeadline = (task.deadlineAt || Date.now()) + days * 24 * 3600 * 1000;
    const updated: Task = {
      ...task,
      deadlineAt: newDeadline,
      updatedAt: Date.now(),
    };
    await taskRepository.save(updated);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const updatedTask: Task = { ...task, subtasks: updatedSubtasks, updatedAt: Date.now() };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    await taskRepository.save(updatedTask);
  };

  const handleChangeStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isNowCompleted = newStatus === 'completed';
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      completedAt: isNowCompleted ? Date.now() : undefined,
      onTime: isNowCompleted ? task.deadlineAt >= Date.now() : undefined,
      updatedAt: Date.now(),
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    await taskRepository.save(updatedTask);

    if (isNowCompleted && settings.enableConfetti) {
      fireConfetti();
    }
  };

  // -------------------------------------------------------------
  // Course & Event & Grade Handlers
  // -------------------------------------------------------------
  const handleSaveCourse = async (course: Course) => {
    await courseRepository.save(course);
    setCourses((prev) => {
      const idx = prev.findIndex((c) => c.id === course.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = course;
        return copy;
      }
      return [...prev, course];
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    await courseRepository.delete(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const handleSaveEvent = async (event: CalendarEvent) => {
    await eventRepository.save(event);
    setEvents((prev) => [...prev, event]);
  };

  const handleSaveGrade = async (grade: GradeItem) => {
    await gradeRepository.save(grade);
    setGrades((prev) => [...prev, grade]);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    await gradeRepository.delete(gradeId);
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
  };

  const handlePomodoroComplete = async (session: PomodoroSession) => {
    await pomodoroRepository.save(session);
    alert(`🎉 Sesi Pomodoro ${session.durationMinutes} menit selesai! Istirahat sejenak untuk memulihkan energi.`);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await settingsRepository.save(newSettings);
    setSettings(newSettings);
  };

  const handleRestoreData = async (data: {
    tasks: Task[];
    courses: Course[];
    events: CalendarEvent[];
    grades: GradeItem[];
  }) => {
    await taskRepository.saveMany(data.tasks);
    await courseRepository.saveMany(data.courses);
    setTasks(data.tasks);
    setCourses(data.courses);
    setEvents(data.events);
    setGrades(data.grades);
  };

  const handleResetSampleData = async () => {
    const sCourses = getSampleAccountingCourses();
    const sTasks = getSampleAccountingTasks();
    const sGrades = getSampleGrades();

    await courseRepository.saveMany(sCourses);
    await taskRepository.saveMany(sTasks);
    await gradeRepository.saveMany(sGrades);

    setCourses(sCourses);
    setTasks(sTasks);
    setGrades(sGrades);
  };

  // -------------------------------------------------------------
  // Filtered & Sorted Tasks
  // -------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Exclude deleted (trash)
        if (t.deletedAt) return false;

        // Tab filter
        if (filterOptions.tab === 'aktif') {
          if (t.status === 'completed' || t.status === 'archived') return false;
        } else if (filterOptions.tab === 'hari_ini') {
          if (t.status === 'completed') return false;
          const dayLabel = getRelativeCalendarDay(t.deadlineAt, settings.timezone, nowUtc);
          if (dayLabel !== 'Hari ini') return false;
        } else if (filterOptions.tab === 'minggu_ini') {
          if (t.status === 'completed') return false;
          const oneWeek = 7 * 24 * 3600 * 1000;
          if (t.deadlineAt < nowUtc || t.deadlineAt > nowUtc + oneWeek) return false;
        } else if (filterOptions.tab === 'terlambat') {
          if (t.status === 'completed') return false;
          if (!t.deadlineAt || t.deadlineAt >= nowUtc) return false;
        } else if (filterOptions.tab === 'selesai') {
          if (t.status !== 'completed') return false;
        }

        // Search filter
        if (filterOptions.search.trim()) {
          const q = filterOptions.search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCourse = t.courseName?.toLowerCase().includes(q);
          const matchSummary = t.summary?.toLowerCase().includes(q);
          if (!matchTitle && !matchCourse && !matchSummary) return false;
        }

        // Course filter
        if (filterOptions.courseId && t.courseId !== filterOptions.courseId) {
          return false;
        }

        // Priority filter
        if (filterOptions.priority && t.priority !== filterOptions.priority) {
          return false;
        }

        // Type filter
        if (filterOptions.type && t.type !== filterOptions.type) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting logic
        if (filterOptions.sortBy === 'deadline') {
          const res = (a.deadlineAt || 0) - (b.deadlineAt || 0);
          return filterOptions.sortOrder === 'asc' ? res : -res;
        } else if (filterOptions.sortBy === 'priority') {
          const weight: Record<string, number> = { kritis: 4, tinggi: 3, sedang: 2, rendah: 1 };
          const res = (weight[b.priority] || 0) - (weight[a.priority] || 0);
          return filterOptions.sortOrder === 'asc' ? res : -res;
        } else if (filterOptions.sortBy === 'course') {
          const res = (a.courseName || '').localeCompare(b.courseName || '');
          return filterOptions.sortOrder === 'asc' ? res : -res;
        } else {
          const res = b.createdAt - a.createdAt;
          return filterOptions.sortOrder === 'asc' ? res : -res;
        }
      });
  }, [tasks, filterOptions, settings.timezone, nowUtc]);

  // Active tasks count for badges
  const activeTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived' && !t.deletedAt).length;
  }, [tasks]);

  // Nearest upcoming deadline task for Dashboard Hero
  const nearestTask = useMemo(() => {
    const upcoming = tasks
      .filter((t) => t.status !== 'completed' && !t.deletedAt && t.deadlineAt)
      .sort((a, b) => a.deadlineAt - b.deadlineAt);
    return upcoming[0] || null;
  }, [tasks]);

  // Greeting based on Indonesian local hour
  const greeting = useMemo(() => {
    const parts = getLocalDateAndTimeParts(nowUtc, settings.timezone);
    const hour = parseInt(parts.timeStr.split(':')[0], 10);
    if (hour >= 4 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, [nowUtc, settings.timezone]);

  // Today's classes for dashboard
  const todayClasses = useMemo(() => {
    const parts = getLocalDateAndTimeParts(nowUtc, settings.timezone);
    const d = new Date(`${parts.dateStr}T00:00:00Z`);
    const dayOfWeek = d.getUTCDay();
    return courses
      .filter((c) => c.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, nowUtc, settings.timezone]);

  // Tasks within the next 7 days for dashboard
  const next7DaysTasks = useMemo(() => {
    const oneWeek = 7 * 24 * 3600 * 1000;
    return tasks
      .filter(
        (t) =>
          t.status !== 'completed' &&
          !t.deletedAt &&
          t.deadlineAt &&
          t.deadlineAt >= nowUtc &&
          t.deadlineAt <= nowUtc + oneWeek
      )
      .sort((a, b) => a.deadlineAt - b.deadlineAt);
  }, [tasks, nowUtc]);

  // Summary counts for dashboard badges
  const counts = useMemo(() => {
    const nonDeleted = tasks.filter((t) => !t.deletedAt);
    const active = nonDeleted.filter((t) => t.status !== 'completed' && t.status !== 'archived').length;
    const completed = nonDeleted.filter((t) => t.status === 'completed').length;
    const overdue = nonDeleted.filter(
      (t) => t.status !== 'completed' && t.deadlineAt && t.deadlineAt < nowUtc
    ).length;
    const today = nonDeleted.filter((t) => {
      if (t.status === 'completed') return false;
      return getRelativeCalendarDay(t.deadlineAt, settings.timezone, nowUtc) === 'Hari ini';
    }).length;
    return { active, completed, overdue, today, total: nonDeleted.length };
  }, [tasks, nowUtc, settings.timezone]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F0FDFA] text-slate-800 transition-colors">
      {/* 1. Left Sidebar (Desktop) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeTasksCount={activeTasksCount}
        onOpenTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenPomodoro={() => {
          setSelectedPomodoroTask(null);
          setIsPomodoroOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        canInstallPwa={Boolean(deferredInstallPrompt)}
        onTriggerInstallPwa={handleTriggerInstallPwa}
        customLogoUrl={settings.customLogoUrl}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Topbar */}
        <Topbar
          timezone={settings.timezone}
          onOpenTaskModal={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onRequestNotificationPermission={handleRequestNotification}
          notificationPermission={typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : undefined}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================== */}
          {/* TAB: DASHBOARD                                                 */}
          {/* ============================================================== */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Greeting & Subtitle */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {greeting}, {settings.userName}! 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-700 font-semibold mt-0.5">
                    {APP_CONFIG.institution} • Tetap semangat dan tuntaskan perkuliahan tepat waktu.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tugas Baru</span>
                  </button>
                </div>
              </div>

              {/* ASYMMETRIC HERO ROW: SATU ELEMEN UTAMA SEBAGAI SOROTAN (TERANG & SEGAR) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* HERO CARD (2 Cols): KARTU "TENGGAT TERDEKAT" HIJAU & BIRU TOSCA TERANG */}
                <div className="lg:col-span-2 relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-teal-50 via-emerald-50/80 to-cyan-50 border-2 border-teal-300 text-slate-800 shadow-lg shadow-teal-500/10 overflow-hidden flex flex-col justify-between">
                  {/* Subtle Accounting Ledger Pattern in Soft Bright Tosca */}
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(20,184,166,0.08) 24px)',
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                        <Flame className="w-4 h-4 text-amber-200" />
                        <span>Sorotan: Tenggat Terdekat</span>
                      </div>
                      {nearestTask && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-teal-200 text-teal-800 shadow-2xs">
                          {nearestTask.courseName || nearestTask.type}
                        </span>
                      )}
                    </div>

                    {nearestTask ? (
                      <>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
                          {nearestTask.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 max-w-xl leading-relaxed mb-4">
                          {nearestTask.summary || 'Pelajari instruksi soal dan kumpulkan sebelum batas waktu.'}
                        </p>

                        {/* BIG COUNTDOWN NUMBER (BRIGHT & HIGH CONTRAST) */}
                        <div className="pt-3 border-t border-teal-200/80 flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-teal-800 font-bold">
                              Hitung Mundur Realtime:
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-teal-600 tracking-tight font-mono tabular-nums">
                              {formatLiveCountdown(nearestTask.deadlineAt, nowUtc).text}
                            </div>
                            <div className="text-xs font-medium text-slate-600 mt-0.5">
                              {formatFullIndonesianDateTime(nearestTask.deadlineAt, settings.timezone)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(nearestTask.id)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-98 transition-all cursor-pointer"
                            >
                              Tandai Selesai
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPomodoroTask(nearestTask);
                                setIsPomodoroOpen(true);
                              }}
                              className="p-2.5 rounded-xl bg-white border border-teal-200 hover:bg-teal-50 text-teal-700 shadow-2xs transition-colors cursor-pointer"
                              title="Mulai Fokus Pomodoro"
                            >
                              <Timer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <h4 className="text-lg font-bold text-slate-900">Semua tugas Anda telah selesai!</h4>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto">
                          Tidak ada tenggat mendesak saat ini. Unggah file soal tugas baru untuk memulai.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUMMARY STATS COLUMN (1 Col) - Clean White & Bright Colored Icons */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    onClick={() => {
                      setFilterOptions({ ...filterOptions, tab: 'aktif' });
                      setCurrentTab('tasks');
                    }}
                    className="p-4 rounded-3xl bg-white border border-teal-100 shadow-sm hover:border-teal-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-teal-600">
                      <div className="p-2 rounded-xl bg-teal-50">
                        <Clock className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aktif</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums mt-2">
                      {counts.active}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">Belum tuntas</div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterOptions({ ...filterOptions, tab: 'hari_ini' });
                      setCurrentTab('tasks');
                    }}
                    className="p-4 rounded-3xl bg-white border border-amber-100 shadow-sm hover:border-amber-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-amber-500">
                      <div className="p-2 rounded-xl bg-amber-50">
                        <Calendar className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hari Ini</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums mt-2">
                      {counts.today}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">Tenggat hari ini</div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterOptions({ ...filterOptions, tab: 'terlambat' });
                      setCurrentTab('tasks');
                    }}
                    className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-rose-600">
                      <div className="p-2 rounded-xl bg-rose-50">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Terlambat</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums mt-2">
                      {counts.overdue}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">Perlu tindakan</div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterOptions({ ...filterOptions, tab: 'selesai' });
                      setCurrentTab('tasks');
                    }}
                    className="p-4 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-emerald-600">
                      <div className="p-2 rounded-xl bg-emerald-50">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selesai</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums mt-2">
                      {counts.completed}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">Tepat waktu</div>
                  </div>
                </div>
              </div>

              {/* SECOND ROW: KULIAH HARI INI & TUGAS 7 HARI KE DEPAN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kuliah Hari Ini */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Perkuliahan Hari Ini ({todayClasses.length})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('schedule')}
                      className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Jadwal Penuh</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {todayClasses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {c.room} • {c.lecturer}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-teal-700 tabular-nums">
                            {c.startTime} - {c.endTime}
                          </span>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {c.sks} SKS
                          </div>
                        </div>
                      </div>
                    ))}

                    {todayClasses.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        Tidak ada perkuliahan hari ini. Nikmati waktu luang Anda atau cicil tugas akuntansi!
                      </div>
                    )}
                  </div>
                </div>

                {/* Tugas 7 Hari ke Depan */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Tugas 7 Hari ke Depan ({next7DaysTasks.length})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('tasks')}
                      className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Semua Tugas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {next7DaysTasks.slice(0, 4).map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-teal-700 font-semibold">
                            {t.courseName || t.type}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-amber-600 tabular-nums">
                            {formatLiveCountdown(t.deadlineAt, nowUtc).text}
                          </span>
                        </div>
                      </div>
                    ))}

                    {next7DaysTasks.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        Belum ada tugas yang mendekati tenggat dalam 7 hari ke depan.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: TUGAS (LIST, KANBAN, FILTER, MASS ACTIONS)                */}
          {/* ============================================================== */}
          {currentTab === 'tasks' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    Daftar Tugas Akuntansi
                  </h2>
                  <p className="text-xs text-teal-700 mt-0.5">
                    Kelola tugas per mata kuliah, hitung mundur realtime, dan tandai selesai seketika
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Mode Toggle (List / Kanban) */}
                  <div className="flex items-center p-1 rounded-xl bg-teal-50/70 border border-teal-200">
                    <button
                      type="button"
                      onClick={() => setFilterOptions({ ...filterOptions, viewMode: 'list' })}
                      aria-label="Tampilan Daftar"
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        filterOptions.viewMode === 'list'
                          ? 'bg-white text-teal-800 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-teal-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterOptions({ ...filterOptions, viewMode: 'kanban' })}
                      aria-label="Tampilan Kanban"
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        filterOptions.viewMode === 'kanban'
                          ? 'bg-white text-teal-800 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-teal-700'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export all to .ics */}
                  <button
                    type="button"
                    onClick={() => downloadIcsFile(tasks.filter((t) => t.status !== 'completed' && !t.deletedAt))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-teal-200 text-slate-700 text-xs font-semibold hover:bg-teal-50 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ekspor Kalender (.ics)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tugas</span>
                  </button>
                </div>
              </div>

              {/* Status Tab Filters (Semua, Aktif, Hari Ini, Minggu Ini, Terlambat, Selesai) */}
              <div className="flex border-b border-teal-100 overflow-x-auto gap-2 sm:gap-4 text-xs font-semibold pb-1">
                {[
                  { id: 'semua', label: 'Semua Tugas', count: counts.total },
                  { id: 'aktif', label: 'Aktif', count: counts.active },
                  { id: 'hari_ini', label: 'Hari Ini', count: counts.today },
                  { id: 'minggu_ini', label: 'Minggu Ini', count: next7DaysTasks.length },
                  { id: 'terlambat', label: 'Terlambat', count: counts.overdue, isAlert: true },
                  { id: 'selesai', label: 'Selesai', count: counts.completed },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterOptions({ ...filterOptions, tab: tab.id as any })}
                    className={`py-2 px-3.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      filterOptions.tab === tab.id
                        ? 'border-b-2 border-teal-600 text-teal-800 font-bold bg-teal-50/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tab.isAlert && tab.count > 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search, Sort, Course Dropdowns */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <input
                    type="text"
                    value={filterOptions.search}
                    onChange={(e) => setFilterOptions({ ...filterOptions, search: e.target.value })}
                    placeholder="Saring tugas atau topik..."
                    className="w-full max-w-sm px-3.5 py-2 rounded-xl border border-teal-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
                  />

                  {/* Course Dropdown */}
                  <select
                    value={filterOptions.courseId}
                    onChange={(e) => setFilterOptions({ ...filterOptions, courseId: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
                  >
                    <option value="">Semua Mata Kuliah</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
                    <select
                      value={filterOptions.sortBy}
                      onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value as any })}
                      className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
                    >
                      <option value="deadline">Tenggat Terdekat (Default)</option>
                      <option value="priority">Prioritas Tertinggi</option>
                      <option value="course">Mata Kuliah</option>
                      <option value="created">Terbaru Dibuat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* View Switcher: List vs Kanban */}
              {filterOptions.viewMode === 'kanban' ? (
                <KanbanView
                  tasks={filteredTasks}
                  timezone={settings.timezone}
                  nowUtc={nowUtc}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDuplicateTask={handleDuplicateTask}
                  onDeleteTask={handleDeleteTask}
                  onExtendDeadline={handleExtendDeadline}
                  onStartPomodoro={(t) => {
                    setSelectedPomodoroTask(t);
                    setIsPomodoroOpen(true);
                  }}
                  onChangeStatus={handleChangeStatus}
                />
              ) : (
                /* List View */
                <div className="space-y-3.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      timezone={settings.timezone}
                      nowUtc={nowUtc}
                      onToggleComplete={handleToggleComplete}
                      onEditTask={(t) => {
                        setTaskToEdit(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDuplicateTask={handleDuplicateTask}
                      onDeleteTask={handleDeleteTask}
                      onExtendDeadline={handleExtendDeadline}
                      onStartPomodoro={(t) => {
                        setSelectedPomodoroTask(t);
                        setIsPomodoroOpen(true);
                      }}
                      onToggleSubtask={handleToggleSubtask}
                    />
                  ))}

                  {filteredTasks.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-teal-200 shadow-sm space-y-3">
                      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Belum ada tugas di kategori ini.
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Unggah file soal tugas (PDF / Word / Excel) atau gunakan Quick Add untuk menambahkan tugas baru.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTaskToEdit(null);
                          setIsTaskModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Unggah Soal / Buat Tugas</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: JADWAL KULIAH                                             */}
          {/* ============================================================== */}
          {currentTab === 'schedule' && (
            <ScheduleView
              courses={courses}
              onSaveCourse={handleSaveCourse}
              onDeleteCourse={handleDeleteCourse}
              timezone={settings.timezone}
              nowUtc={nowUtc}
            />
          )}

          {/* ============================================================== */}
          {/* TAB: KALENDER TERPADU                                          */}
          {/* ============================================================== */}
          {currentTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              courses={courses}
              events={events}
              onSaveEvent={handleSaveEvent}
              timezone={settings.timezone}
              nowUtc={nowUtc}
            />
          )}

          {/* ============================================================== */}
          {/* TAB: NILAI & IPK                                               */}
          {/* ============================================================== */}
          {currentTab === 'grades' && (
            <GradesView
              courses={courses}
              grades={grades}
              onSaveGrade={handleSaveGrade}
              onDeleteGrade={handleDeleteGrade}
            />
          )}

          {/* ============================================================== */}
          {/* TAB: STATISTIK & ANALISIS                                      */}
          {/* ============================================================== */}
          {currentTab === 'stats' && <StatsView tasks={tasks} nowUtc={nowUtc} />}
        </main>
      </div>

      {/* 2. Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activeTasksCount={activeTasksCount}
      />

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl border-l border-teal-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                <span className="font-bold text-sm text-slate-900">
                  Menu Lengkap
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('tasks');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Daftar Tugas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('schedule');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Jadwal Kuliah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('calendar');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Kalender Terpadu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('grades');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Nilai & IPK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('stats');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                >
                  Statistik & Analisis
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-teal-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPomodoroOpen(true);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
              >
                ⏱️ Fokus Pomodoro
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                ⚙️ Pengaturan Aplikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        taskToEdit={taskToEdit}
        courses={courses}
        timezone={settings.timezone}
        nowUtc={nowUtc}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaveTask={handleSaveTask}
        courses={courses}
        timezone={settings.timezone}
        nowUtc={nowUtc}
      />

      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        tasks={tasks}
        initialTask={selectedPomodoroTask}
        onSessionComplete={handlePomodoroComplete}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        tasks={tasks}
        courses={courses}
        events={events}
        grades={grades}
        onRestoreData={handleRestoreData}
        onResetSampleData={handleResetSampleData}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          handleSaveSettings({ ...settings, hasCompletedOnboarding: true });
        }}
        onLoadSampleData={handleResetSampleData}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        courses={courses}
        onSelectTab={setCurrentTab}
        onOpenTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenPomodoro={() => {
          setSelectedPomodoroTask(null);
          setIsPomodoroOpen(true);
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectTask={(t) => {
          setTaskToEdit(t);
          setIsTaskModalOpen(true);
        }}
      />

      {/* 4. Undo Toast (6 seconds) */}
      {undoToast && undoToast.show && (
        <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-medium line-clamp-2">{undoToast.message}</span>
          <button
            type="button"
            onClick={undoToast.action}
            className="px-3 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Batalkan
          </button>
        </div>
      )}

      {/* 5. iOS Safari Install Guide Modal */}
      {iosInstallModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3 border border-teal-200">
            <h4 className="text-sm font-bold text-slate-900">
              Pasang di iPhone / iPad (iOS Safari)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Ketuk ikon <strong>Bagikan / Share</strong> (kotak dengan panah ke atas) di bilah bawah peramban Safari.<br />
              2. Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.<br />
              3. Ketuk <strong>Tambah</strong> di pojok kanan atas.
            </p>
            <button
              type="button"
              onClick={() => setIosInstallModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
