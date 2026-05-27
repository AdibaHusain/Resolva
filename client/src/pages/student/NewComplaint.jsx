import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useCreateComplaint } from '../../hooks/useComplaints';

const CATEGORIES = [
  { value: 'electrical', label: 'Electrical',   icon: '⚡' },
  { value: 'plumbing',   label: 'Plumbing',     icon: '🔧' },
  { value: 'wifi',       label: 'WiFi / Network',icon: '📶' },
  { value: 'hostel',     label: 'Hostel',        icon: '🏠' },
  { value: 'academic',   label: 'Academic',      icon: '📚' },
  { value: 'food',       label: 'Food / Mess',   icon: '🍽️' },
  { value: 'safety',     label: 'Safety',        icon: '🛡️' },
  { value: 'event',      label: 'Event',         icon: '📅' },
  { value: 'other',      label: 'Other',         icon: '📌' },
];

const schema = z.object({
  title:       z.string().min(5, 'At least 5 characters').max(120),
  description: z.string().min(10, 'At least 10 characters').max(2000),
  category:    z.string().min(1, 'Select a category'),
  location:    z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export default function NewComplaint() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateComplaint();
  const [files, setFiles]           = useState([]);
  const [previews, setPreviews]     = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isAnonymous: false, category: '' },
  });

  const selectedCategory = watch('category');

  // Drag-and-drop zone
  const onDrop = useCallback((accepted) => {
    const next = [...files, ...accepted].slice(0, 5); // max 5
    setFiles(next);
    setPreviews(next.map(f => ({
      name: f.name,
      url:  f.type.startsWith('image') ? URL.createObjectURL(f) : null,
      type: f.type,
    })));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 5,
  });

  const removeFile = (i) => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));
    files.forEach(f => formData.append('media', f));

    await mutateAsync(formData);
    navigate('/student/complaints');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
        Raise a complaint
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Describe your issue clearly. Admins are notified immediately.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Category grid ──────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all
                  ${selectedCategory === cat.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <span>{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            placeholder="e.g. Water leakage near electrical panel in C-Block"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* ── Description ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe the issue in detail. Include when it started, how severe it is, and any safety concerns..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* ── Location ───────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
            <span className="ml-1 text-xs text-gray-400">(optional but recommended)</span>
          </label>
          <input
            {...register('location')}
            placeholder="e.g. A-Block, Room 214 / Hostel C Ground Floor"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* ── Media upload ───────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attach evidence
            <span className="ml-1 text-xs text-gray-400">(images / video, max 5 files, 20 MB each)</span>
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-500">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag and drop files here, or click to browse'
              }
            </p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previews.map((p, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {p.url
                    ? <img src={p.url} alt={p.name} className="w-full h-20 object-cover" />
                    : <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500">video</div>
                  }
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Anonymous toggle ───────────────────────────────────────────── */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              {...register('isAnonymous')}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Submit anonymously</p>
            <p className="text-xs text-gray-400">Your identity won't be shown to other students</p>
          </div>
        </label>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending ? 'Submitting...' : 'Submit complaint'}
        </button>
      </form>
    </div>
  );
}