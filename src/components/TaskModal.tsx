/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Tambah & Edit Tugas dengan Ekstraksi Dokumen Otomatis & Input Tenggat Manual Akurat
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  AlertCircle,
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  Paperclip,
  Download,
  Users,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Task, TaskType, TaskPriority, Course, Subtask, Attachment, GroupMember } from '../types';
import {
  extractDocumentContent,
  getSubtaskTemplateForType,
  cleanFilenameToTitle,
} from '../utils/extractor';
import {
  createUtcTimestamp,
  getDeadlinePreview,
  getLocalDateAndTimeParts,
  getQuickChipDate,
} from '../utils/time';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  taskToEdit?: Task | null;
  courses: Course[];
  timezone: string;
  nowUtc: number;
}

const TASK_TYPES: TaskType[] = [
  'Individu',
  'Kelompok',
  'Kuis',
  'UTS',
  'UAS',
  'Praktikum',
  'Studi Kasus',
  'Laporan/Makalah',
  'Presentasi',
  'Lainnya',
];

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'rendah', label: 'Rendah', color: 'bg-slate-100 text-slate-700' },
  { id: 'sedang', label: 'Sedang', color: 'bg-teal-100 text-teal-800' },
  { id: 'tinggi', label: 'Tinggi', color: 'bg-amber-100 text-amber-800' },
  { id: 'kritis', label: 'Kritis', color: 'bg-rose-100 text-rose-800' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  taskToEdit,
  courses,
  timezone,
  nowUtc,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState<TaskType>('Individu');
  const [priority, setPriority] = useState<TaskPriority>('sedang');

  // Manual Deadline State (Date and Time input)
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [confirmPastDeadline, setConfirmPastDeadline] = useState(false);

  // Auto-extraction metadata & chips
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  const [suggestedDeadlines, setSuggestedDeadlines] = useState<string[]>([]);
  const [rawExtractedText, setRawExtractedText] = useState('');
  const [showRawTextModal, setShowRawTextModal] = useState(false);

  // Subtasks & Group Members
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGroupTask, setIsGroupTask] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNim, setNewMemberNim] = useState('');

  // Links, Notes & Attachments
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(true);

  // Extraction Progress
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStatusText, setExtractionStatusText] = useState('');
  const [extractionError, setExtractionError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form if editing existing task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSummary(taskToEdit.summary || '');
      setKeyPoints(taskToEdit.keyPoints || []);
      setRequirements(taskToEdit.requirements || []);
      setCourseId(taskToEdit.courseId || '');
      setType(taskToEdit.type || 'Individu');
      setPriority(taskToEdit.priority || 'sedang');

      const parts = getLocalDateAndTimeParts(taskToEdit.deadlineAt, timezone);
      setDeadlineDate(parts.dateStr);
      setDeadlineTime(parts.timeStr || '23:59');

      setSubtasks(taskToEdit.subtasks || []);
      setIsGroupTask(taskToEdit.isGroupTask || false);
      setGroupMembers(taskToEdit.groupMembers || []);
      setLinks(taskToEdit.links || []);
      setNotes(taskToEdit.notes || '');
      setAttachments(taskToEdit.attachments || []);
      setActivePreviewIndex(0);
      setShowEmbeddedPreview(true);
      setIsAutoExtracted(false);
      setSuggestedDeadlines([]);
      setRawExtractedText('');
    } else {
      // Default new task: leave title and deadline EMPTY so user explicitly sets them
      setTitle('');
      setSummary('');
      setKeyPoints([]);
      setRequirements([]);
      setCourseId(courses[0]?.id || '');
      setType('Individu');
      setPriority('sedang');
      setDeadlineDate('');
      setDeadlineTime('23:59');
      setSubtasks(getSubtaskTemplateForType('Individu'));
      setIsGroupTask(false);
      setGroupMembers([]);
      setLinks([]);
      setNotes('');
      setAttachments([]);
      setActivePreviewIndex(0);
      setShowEmbeddedPreview(true);
      setIsAutoExtracted(false);
      setSuggestedDeadlines([]);
      setRawExtractedText('');
    }
    setExtractionError('');
    setConfirmPastDeadline(false);
  }, [taskToEdit, courses, timezone, isOpen]);

  if (!isOpen) return null;

  // Deadline preview calculation
  const deadlinePreview = getDeadlinePreview(deadlineDate, deadlineTime, timezone, nowUtc);

  // Handle Quick Chips for deadline
  const handleApplyQuickChip = (chip: 'hari_ini' | 'besok' | 'lusa' | 'tiga_hari' | 'minggu_depan') => {
    const chipDate = getQuickChipDate(chip, timezone, nowUtc);
    setDeadlineDate(chipDate.dateStr);
    setDeadlineTime(chipDate.timeStr);
  };

  // Handle file extraction
  const handleProcessFile = async (file: File) => {
    // Validate size (max 25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setExtractionError(`Ukuran file "${file.name}" melebihi batas 25 MB.`);
      return;
    }

    // Convert file to Base64 attachment for storage
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        isOriginalQuestionDoc: true,
      };

      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);

    setIsExtracting(true);
    setExtractionError('');
    setExtractionProgress(10);
    setExtractionStatusText('Membaca berkas...');

    try {
      const result = await extractDocumentContent(file, (percent, status) => {
        setExtractionProgress(percent);
        setExtractionStatusText(status);
      });

      // Fill extracted fields automatically
      setTitle(result.title);
      setSummary(result.summary);
      setKeyPoints(result.keyPoints);
      setRequirements(result.requirements);
      setType(result.detectedType);
      if (result.detectedType === 'Kelompok') {
        setIsGroupTask(true);
      }
      setSubtasks(getSubtaskTemplateForType(result.detectedType));

      // Match course if found
      if (result.detectedCourse) {
        const found = courses.find((c) =>
          c.name.toLowerCase().includes(result.detectedCourse!.toLowerCase())
        );
        if (found) {
          setCourseId(found.id);
        }
      }

      setSuggestedDeadlines(result.suggestedDeadlines || []);
      setRawExtractedText(result.rawText || '');
      setIsAutoExtracted(true);

      if (result.isScannedPdf) {
        setExtractionError(
          'Perhatian: Dokumen PDF ini terdeteksi sebagai pindaian gambar tanpa lapisan teks. Anda dapat mengisi judul dan penjelasan soal secara manual.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractionError(msg);
      // Fallback title to cleaned filename
      setTitle(cleanFilenameToTitle(file.name));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: GroupMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      nim: newMemberNim.trim() || undefined,
    };
    setGroupMembers([...groupMembers, newMember]);
    setNewMemberName('');
    setNewMemberNim('');
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    let url = linkInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setLinks([...links, url]);
    setLinkInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Title and Deadline are mandatory
    if (!title.trim() || !deadlineDate) {
      return;
    }

    const deadlineUtc = createUtcTimestamp(deadlineDate, deadlineTime, timezone);

    // If deadline is in the past and user has not confirmed yet
    if (deadlineUtc < nowUtc && !confirmPastDeadline) {
      setConfirmPastDeadline(true);
      return;
    }

    const selectedCourse = courses.find((c) => c.id === courseId);

    const taskData: Task = {
      id: taskToEdit?.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      summary: summary.trim(),
      keyPoints,
      requirements,
      questions: keyPoints,
      courseId: courseId || undefined,
      courseName: selectedCourse?.name,
      type,
      priority,
      deadlineAt: deadlineUtc,
      deadlineTz: timezone,
      status: taskToEdit?.status || 'pending',
      completedAt: taskToEdit?.completedAt,
      onTime: taskToEdit?.onTime,
      subtasks,
      attachments,
      links,
      notes: notes.trim(),
      reminders: taskToEdit?.reminders || [1440, 180, 60],
      tags: taskToEdit?.tags || [],
      isGroupTask,
      groupMembers: isGroupTask ? groupMembers : [],
      createdAt: taskToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveTask(taskData);
    onClose();
  };

  const isSaveDisabled = !title.trim() || !deadlineDate || isExtracting;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-teal-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {taskToEdit ? 'Edit Detail Tugas' : 'Tambah Tugas Akuntansi'}
              </h2>
              <p className="text-xs text-teal-700">
                Unggah file soal untuk ekstrak otomatis atau isi manual secara fleksibel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Drag & Drop File Upload Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-teal-50/60 to-emerald-50/20 text-center cursor-pointer transition-colors group shadow-2xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-teal-200">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Tarik & letakkan file soal atau foto tugas di sini, atau <span className="text-teal-600 font-bold underline">pilih dari perangkat</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Mendukung <strong>Foto & Gambar (PNG, JPG, WebP)</strong>, <strong>PDF (Teks & Scan OCR)</strong>, Word (.docx), Excel (.xlsx, .csv), TXT. Judul, soal & ringkasan terisi otomatis!
              </p>
            </div>

            {/* Extraction Progress Indicator */}
            {isExtracting && (
              <div className="mt-3 pt-3 border-t border-teal-200">
                <div className="flex items-center justify-between text-xs font-semibold text-teal-800 mb-1">
                  <span>{extractionStatusText}</span>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="w-full bg-teal-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {extractionError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>{extractionError}</div>
            </div>
          )}

          {/* Auto-extracted Toolbar if applicable */}
          {isAutoExtracted && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Data berhasil diekstrak otomatis dari file!</span>
              </div>
              <div className="flex items-center gap-2">
                {rawExtractedText && (
                  <button
                    type="button"
                    onClick={() => setShowRawTextModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Lihat teks asli</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-teal-700 text-[11px] font-semibold border border-teal-200 hover:bg-teal-50 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ekstrak ulang</span>
                </button>
              </div>
            </div>
          )}

          {/* Pratinjau Berkas Soal Asli (PDF / Gambar) */}
          {attachments.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white border-2 border-teal-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-teal-600 text-white shadow-2xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-teal-950 flex items-center gap-1.5">
                      <span>Pratinjau Berkas Soal Tugas (PDF / Gambar)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
                        {attachments.length} Berkas
                      </span>
                    </h3>
                    <p className="text-[11px] text-teal-700">
                      Tampilan berkas asli agar Anda dapat langsung membaca lembar soal tugas tanpa berpindah aplikasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
                    className="text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    {showEmbeddedPreview ? 'Perkecil Pratinjau' : 'Buka Pratinjau'}
                  </button>
                </div>
              </div>

              {showEmbeddedPreview && (
                <div className="space-y-2 pt-1">
                  {/* Tabs jika ada lebih dari 1 file */}
                  {attachments.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {attachments.map((att, idx) => (
                        <button
                          key={att.id || idx}
                          type="button"
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg font-semibold truncate max-w-[200px] transition-all cursor-pointer ${
                            activePreviewIndex === idx
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          {att.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {(() => {
                    const currentAtt = attachments[activePreviewIndex] || attachments[0];
                    if (!currentAtt) return null;

                    const isPdf =
                      currentAtt.mime?.includes('pdf') ||
                      currentAtt.name.toLowerCase().endsWith('.pdf') ||
                      currentAtt.dataUrl?.startsWith('data:application/pdf');

                    const isImage =
                      currentAtt.mime?.startsWith('image/') ||
                      /\.(png|jpe?g|webp|bmp|gif)$/i.test(currentAtt.name) ||
                      currentAtt.dataUrl?.startsWith('data:image/');

                    return (
                      <div className="space-y-2">
                        {/* Toolbar Berkas */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs bg-white/80 p-2 rounded-xl border border-teal-100">
                          <span className="font-bold text-slate-800 truncate max-w-sm">
                            {currentAtt.name} ({Math.round((currentAtt.size || 0) / 1024)} KB)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {currentAtt.dataUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    if (isPdf) {
                                      win.document.write(
                                        `<iframe src="${currentAtt.dataUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
                                      );
                                    } else {
                                      win.document.write(
                                        `<body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${currentAtt.dataUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;" /></body>`
                                      );
                                    }
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200 text-xs transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                                <span>Buka di Tab Baru</span>
                              </button>
                            )}
                            {currentAtt.dataUrl && (
                              <a
                                href={currentAtt.dataUrl}
                                download={currentAtt.name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Konten Pratinjau */}
                        {isPdf && currentAtt.dataUrl ? (
                          <div className="rounded-xl overflow-hidden border border-teal-200 shadow-xs bg-white">
                            <iframe
                              src={currentAtt.dataUrl}
                              className="w-full h-80 sm:h-[460px]"
                              title={currentAtt.name}
                            />
                          </div>
                        ) : isImage && currentAtt.dataUrl ? (
                          <div className="max-h-[460px] overflow-auto rounded-xl border border-teal-200 bg-slate-50 p-2 flex items-center justify-center">
                            <img
                              src={currentAtt.dataUrl}
                              alt={currentAtt.name}
                              className="max-h-[440px] w-auto max-w-full rounded-lg object-contain shadow-xs bg-white"
                            />
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-white rounded-xl border border-teal-100 text-xs text-slate-600">
                            Berkas dokumen Office/teks telah dianalisis. Anda dapat mengunduh berkas asli atau membaca teks soal lengkap di bawah.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 2. Judul Tugas (Wajib) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Judul Tugas</span>
                <span className="text-rose-500">*</span>
                {isAutoExtracted && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-bold border border-teal-200">
                    Terisi otomatis
                  </span>
                )}
              </label>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tugas 3 Rekonsiliasi Bank dan Jurnal Penyesuaian"
              className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all shadow-xs"
            />
          </div>

          {/* 3. TENGGAT (MANUAL & WAJIB) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white border border-teal-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Tenggat Waktu Pengumpulan (Manual)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                Zona Waktu: {timezone === 'Asia/Jakarta' ? 'WIB (UTC+7)' : timezone}
              </span>
            </div>

            {/* Date and Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Tanggal Pengumpulan
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => {
                    setDeadlineDate(e.target.value);
                    setConfirmPastDeadline(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Pukul / Jam (Default 23.59)
                </label>
                <input
                  type="time"
                  required
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>
            </div>

            {/* Chip Cepat */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 mr-1 font-medium">Chip Cepat:</span>
              <button
                type="button"
                onClick={() => handleApplyQuickChip('hari_ini')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              >
                Hari ini (23.59)
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickChip('besok')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickChip('lusa')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              >
                Lusa
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickChip('tiga_hari')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              >
                +3 Hari
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickChip('minggu_depan')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              >
                Minggu Depan
              </button>
            </div>

            {/* Tanggal Saran dari Dokumen */}
            {suggestedDeadlines.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800">
                  💡 Saran dari file soal:
                </span>
                {suggestedDeadlines.map((sug, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white text-amber-900 text-xs font-semibold border border-amber-200"
                  >
                    Gunakan: {sug}
                  </span>
                ))}
              </div>
            )}

            {/* LIVE PREVIEW TENGGAT */}
            <div className="pt-2 border-t border-teal-200/60">
              <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Pratinjau Tenggat:</span>
              </div>
              <p
                className={`text-xs font-bold mt-0.5 tabular-nums ${
                  deadlinePreview.isPast
                    ? 'text-rose-600'
                    : 'text-teal-700'
                }`}
              >
                {deadlinePreview.formatted}
              </p>

              {/* Warning if deadline is in the past */}
              {deadlinePreview.isPast && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Tenggat yang Anda pilih sudah lewat waktu.</span>
                  </div>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmPastDeadline}
                      onChange={(e) => setConfirmPastDeadline(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Tetap simpan</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 4. Mata Kuliah & Jenis Tugas & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Mata Kuliah
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none shadow-xs"
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Jenis Tugas
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as TaskType;
                  setType(newType);
                  if (newType === 'Kelompok') setIsGroupTask(true);
                  // Refresh subtasks template if empty
                  if (subtasks.length === 0) {
                    setSubtasks(getSubtaskTemplateForType(newType));
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none shadow-xs"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none shadow-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Penjelasan Soal (Uraian Lengkap Sesuai Berkas, Yang Harus Dikerjakan, Ketentuan) */}
          <div className="space-y-3 pt-2 border-t border-teal-100">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Uraian & Teks Soal Tugas Lengkap (Sesuai Berkas yang Diunggah)</span>
                  {isAutoExtracted && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-bold border border-teal-200">
                      Sesuai Teks Asli Berkas
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {summary.length} karakter • {summary.split('\n').filter(Boolean).length} baris teks
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Seluruh narasi kasus, tabel/transaksi akuntansi, dan instruksi lengkap disalin utuh dari berkas tanpa dipotong.
              </p>
              <textarea
                rows={9}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Uraian dan teks soal tugas akuntansi lengkap sesuai berkas yang diunggah..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none leading-relaxed shadow-xs font-sans whitespace-pre-wrap"
              />
            </div>

            {/* Yang Harus Dikerjakan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Yang Harus Dikerjakan (Instruksi Lengkap & Butir Soal)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    {keyPoints.length} Butir
                  </span>
                </label>
              </div>
              <div className="space-y-1.5">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold shrink-0 border border-teal-200">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const copy = [...keyPoints];
                        copy[idx] = e.target.value;
                        setKeyPoints(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-teal-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setKeyPoints(keyPoints.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setKeyPoints([...keyPoints, ''])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah butir instruksi</span>
                </button>
              </div>
            </div>

            {/* Ketentuan Format & Pengumpulan */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Ketentuan (Format, Halaman, Plagiarisme, Bobot)
              </label>
              <div className="space-y-1.5">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-teal-600 font-bold text-sm">•</span>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const copy = [...requirements];
                        copy[idx] = e.target.value;
                        setRequirements(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-teal-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRequirements([...requirements, ''])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah ketentuan</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. Subtugas (Checklist) & Template Otomatis */}
          <div className="pt-2 border-t border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-600" />
                <span>Checklist Subtugas</span>
              </label>
              <button
                type="button"
                onClick={() => setSubtasks(getSubtaskTemplateForType(type))}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
              >
                Muat template {type}
              </button>
            </div>

            <div className="space-y-2 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-50/40 border border-teal-100 text-xs shadow-2xs"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={(e) => {
                      setSubtasks(
                        subtasks.map((s) => (s.id === sub.id ? { ...s, completed: e.target.checked } : s))
                      );
                    }}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={sub.title}
                    onChange={(e) => {
                      setSubtasks(
                        subtasks.map((s) => (s.id === sub.id ? { ...s, title: e.target.value } : s))
                      );
                    }}
                    className={`flex-1 bg-transparent outline-none ${
                      sub.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Input Add Subtask */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambah langkah pengerjaan baru..."
                className="flex-1 px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:from-emerald-600 hover:to-teal-700 shadow-xs cursor-pointer transition-all"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* 7. Fitur Tugas Kelompok (Opsional) */}
          <div className="pt-2 border-t border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGroupTask}
                  onChange={(e) => setIsGroupTask(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Tugas Kelompok (Daftar Anggota & Pembagian Tugas)</span>
                </span>
              </label>
            </div>

            {isGroupTask && (
              <div className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-2.5">
                <div className="space-y-1.5">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white text-xs border border-teal-100 shadow-2xs"
                    >
                      <span className="font-semibold text-slate-800">
                        {member.name} {member.nim ? `(${member.nim})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGroupMembers(groupMembers.filter((m) => m.id !== member.id))}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Nama Anggota Kelompok"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-teal-200 bg-white text-xs text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={newMemberNim}
                    onChange={(e) => setNewMemberNim(e.target.value)}
                    placeholder="NIM (Opsional)"
                    className="w-32 px-3 py-1.5 rounded-lg border border-teal-200 bg-white text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 8. Link Pengumpulan, Catatan & Lampiran */}
          <div className="space-y-3 pt-2 border-t border-teal-100">
            {/* Links */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Tautan Pengumpulan (LMS UPNVJ / Google Drive / Email)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://elearning.upnvj.ac.id/mod/assign/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 cursor-pointer transition-colors"
                >
                  Tambah Link
                </button>
              </div>

              {links.length > 0 && (
                <div className="space-y-1">
                  {links.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-teal-50/60 text-xs text-teal-800 border border-teal-200"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate max-w-[90%] flex items-center gap-1.5 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0 text-teal-600" />
                        <span className="truncate">{link}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lampiran File Asli Soal */}
            {attachments.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  File Lampiran Asli ({attachments.length} berkas tersimpan aman di peramban)
                </label>
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-teal-100 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                            title="Unduh file lampiran"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus lampiran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan pengerjaan, instruksi khusus dari dosen, atau referensi buku..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-teal-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>

              {taskToEdit && onDeleteTask && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus tugas "${taskToEdit.title}" yang sudah tidak penting?`)) {
                      onDeleteTask(taskToEdit.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus Tugas</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaveDisabled}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all cursor-pointer ${
                isSaveDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-700 active:scale-98 shadow-teal-500/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simpan Tugas</span>
            </button>
          </div>
        </form>

        {/* Raw Text Modal for Inspection */}
        {showRawTextModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col p-5 shadow-2xl border border-teal-200">
              <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                <h3 className="text-sm font-bold text-teal-900">
                  Teks Hasil Ekstraksi Mentah
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRawTextModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3.5 font-mono text-xs whitespace-pre-wrap text-slate-800 bg-teal-50/40 border border-teal-100 rounded-xl mt-3">
                {rawExtractedText || 'Tidak ada teks yang dapat ditampilkan.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
