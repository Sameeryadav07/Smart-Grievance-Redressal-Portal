'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (base64: string | null, file: File | null) => void;
  error?: string;
}

export default function ImageUpload({ onImageSelect, error }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setUploadError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size exceeds 5MB limit');
        return;
      }

      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onImageSelect(base64, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    setFileSize('');
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Evidence / Site Image <span className="text-gray-400 font-normal">(Optional, max 5MB)</span>
      </label>

      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
              📷
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drag & drop photo here, or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP up to 5MB</p>
            <p className="text-xs text-indigo-600 font-medium">
              🤖 AI will verify image authenticity and scan for duplication
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-200 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">{fileSize}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                ✓ Ready for AI Analysis
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-white transition-colors"
            title="Remove photo"
          >
            🗑️
          </button>
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-600 font-medium">{uploadError || error}</p>
      )}
    </div>
  );
}
