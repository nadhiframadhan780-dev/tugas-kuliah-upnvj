/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Pratinjau Berkas Soal Tugas (PDF & Gambar) Lengkap dengan Teks Soal Otomatis
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Paperclip,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Attachment, Task } from '../types';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  initialAttachmentIndex?: number;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  task,
  initialAttachmentIndex = 0,
}) => {
  const attachments = task.attachments || [];
  const [selectedIndex, setSelectedIndex] = useState(initialAttachmentIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedText, setCopiedText] = useState(false);
  const [showQuestionsSidebar, setShowQuestionsSidebar] = useState(true);

  if (!isOpen || attachments.length === 0) return null;

  const currentAtt: Attachment = attachments[selectedIndex] || attachments[0];
  const isPdf =
    currentAtt.mime?.includes('pdf') ||
    currentAtt.name.toLowerCase().endsWith('.pdf') ||
    currentAtt.dataUrl?.startsWith('data:application/pdf');

  const isImage =
    currentAtt.mime?.startsWith('image/') ||
    /\.(png|jpe?g|webp|bmp|gif)$/i.test(currentAtt.name) ||
    currentAtt.dataUrl?.startsWith('data:image/');

  const handleCopyText = () => {
    const textToCopy = task.summary
      ? `${task.title}\n\nUraian Soal:\n${task.summary}\n\n${
          task.keyPoints && task.keyPoints.length > 0
            ? 'Butir Pertanyaan:\n' + task.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')
            : ''
        }`
      : task.title;

    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleOpenNewTab = () => {
    if (!currentAtt.dataUrl) return;
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-teal-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                  {task.courseName || 'Akuntansi UPNVJ'}
                </span>
                <span className="text-xs font-semibold text-slate-500">Berkas Soal Tugas</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuestionsSidebar(!showQuestionsSidebar)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showQuestionsSidebar
                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tampilkan / Sembunyikan Panel Teks Soal"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showQuestionsSidebar ? 'Sembunyikan Teks' : 'Lihat Teks Soal'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Attachment Tabs if multiple files */}
        {attachments.length > 1 && (
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> Berkas ({attachments.length}):
            </span>
            {attachments.map((att, idx) => (
              <button
                key={att.id || idx}
                type="button"
                onClick={() => {
                  setSelectedIndex(idx);
                  setZoomLevel(1);
                }}
                className={`px-3 py-1 rounded-lg font-semibold truncate max-w-[200px] transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50'
                }`}
              >
                {att.name}
              </button>
            ))}
          </div>
        )}

        {/* Control Toolbar */}
        <div className="px-5 py-2.5 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 truncate max-w-xs">{currentAtt.name}</span>
            <span className="text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 font-medium">
              {isPdf ? 'Dokumen PDF' : isImage ? 'Berkas Gambar' : 'Dokumen'} ({Math.round((currentAtt.size || 0) / 1024)} KB)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isImage && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-teal-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1 hover:text-teal-700 cursor-pointer"
                  title="Perkecil Gambar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-teal-800 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1 hover:text-teal-700 cursor-pointer"
                  title="Perbesar Gambar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:text-teal-700 cursor-pointer ml-0.5"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            )}

            {currentAtt.dataUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 font-semibold border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                title="Buka di tab baru peramban"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                <span>Buka Tab Baru</span>
              </button>
            )}

            {currentAtt.dataUrl && (
              <a
                href={currentAtt.dataUrl}
                download={currentAtt.name}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
              title="Salin uraian soal ke papan klip"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Salin Teks Soal</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area: Split View (File Viewer + Question Text Sidebar) */}
        <div className="flex-1 flex overflow-hidden bg-slate-100/70">
          {/* File Viewer Box */}
          <div className="flex-1 h-full overflow-auto p-3 sm:p-4 flex items-center justify-center">
            {isPdf && currentAtt.dataUrl ? (
              <iframe
                src={currentAtt.dataUrl}
                className="w-full h-full rounded-2xl border-2 border-teal-200 bg-white shadow-md"
                title={currentAtt.name}
              />
            ) : isImage && currentAtt.dataUrl ? (
              <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                <img
                  src={currentAtt.dataUrl}
                  alt={currentAtt.name}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-md border border-teal-200 transition-transform duration-150 bg-white"
                />
              </div>
            ) : (
              <div className="max-w-md p-8 text-center bg-white rounded-3xl border border-teal-200 shadow-md">
                <FileText className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base mb-1">{currentAtt.name}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Format berkas ini dapat diunduh langsung untuk dibuka di aplikasi pendukung (mis. Microsoft Office).
                </p>
                {currentAtt.dataUrl && (
                  <a
                    href={currentAtt.dataUrl}
                    download={currentAtt.name}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh {currentAtt.name}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Collapsible Panel: Uraian & Butir Soal Lengkap */}
          {showQuestionsSidebar && (
            <div className="w-80 sm:w-96 border-l border-teal-100 bg-white flex flex-col h-full shadow-lg">
              <div className="p-3.5 border-b border-teal-100 bg-gradient-to-r from-teal-50/70 to-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Teks & Butir Soal Lengkap</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  {copiedText ? 'Tersalin' : 'Salin'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
                {/* Uraian Soal Lengkap */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1.5 text-teal-900">
                    Uraian Soal & Narasi Kasus:
                  </h4>
                  <div className="p-3 rounded-xl bg-teal-50/40 border border-teal-100 text-slate-800 whitespace-pre-wrap font-sans text-xs max-h-72 overflow-y-auto shadow-2xs">
                    {task.summary || 'Tidak ada teks uraian soal.'}
                  </div>
                </div>

                {/* Butir-butir Pertanyaan */}
                {task.keyPoints && task.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1.5 text-teal-900">
                      Yang Harus Dikerjakan ({task.keyPoints.length} Butir):
                    </h4>
                    <div className="space-y-1.5">
                      {task.keyPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 text-[11px]"
                        >
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="flex-1 leading-normal">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ketentuan Format */}
                {task.requirements && task.requirements.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1.5 text-teal-900">
                      Ketentuan & Format:
                    </h4>
                    <div className="space-y-1">
                      {task.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                          <span className="text-teal-500 font-bold">•</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
