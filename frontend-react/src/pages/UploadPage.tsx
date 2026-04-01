import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Trash2,
  Cloud,
  File,
  X
} from 'lucide-react';
import { courseAPI, materialAPI, ingestAPI } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
  description: string;
}

interface Material {
  id: number;
  course_id: number;
  filename: string;
  filepath: string;
  uploaded_at: string;
}

export default function UploadPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isIngesting, setIsIngesting] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.list();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchMaterials = async (courseId: number) => {
    try {
      const data = await materialAPI.list(courseId);
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedCourse) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const newMaterial = await materialAPI.upload(selectedCourse, file);
      setMaterials([...materials, newMaterial]);
      setSuccess(`"${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleIngest = async (materialId: number) => {
    setIsIngesting(materialId);
    setError('');
    setSuccess('');

    try {
      await ingestAPI.ingest(materialId);
      setSuccess('Material processed and indexed for AI!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process material');
    } finally {
      setIsIngesting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="gradient-text">Upload Materials</span>
          </h1>
          <p className="text-dark-400 text-lg">
            Upload course materials for AI-powered learning
          </p>
        </div>

        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-blue/50 outline-none min-w-[200px]"
        >
          <option value="" disabled>Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-neon-green/10 border border-neon-green/30 text-neon-green px-5 py-4 rounded-xl flex items-center gap-3 message-appear">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 message-appear">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center">
              <Cloud className="w-5 h-5 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold text-white">Upload Files</h3>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
              isDragOver 
                ? "border-neon-blue bg-neon-blue/10" 
                : "border-dark-600 hover:border-dark-500 hover:bg-dark-800/50",
              isUploading && "pointer-events-none opacity-50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
              disabled={!selectedCourse || isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-neon-blue animate-spin mb-4" />
                <p className="text-white font-medium">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-neon-blue" />
                </div>
                <p className="text-white font-medium mb-2">
                  {isDragOver ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-dark-400 text-sm">
                  PDF, TXT, or Markdown files supported
                </p>
              </>
            )}
          </div>

          {!selectedCourse && (
            <p className="text-dark-400 text-sm mt-4 text-center">
              Please select a course to upload materials
            </p>
          )}
        </div>

        {/* Materials List */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white">Course Materials</h3>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">No materials uploaded yet</p>
              <p className="text-dark-500 text-sm mt-1">
                Upload files to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-dark-600 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{material.filename}</p>
                    <p className="text-sm text-dark-400">
                      {formatDate(material.uploaded_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleIngest(material.id)}
                    disabled={isIngesting === material.id}
                    className={cn(
                      "btn-secondary text-sm flex items-center gap-2",
                      isIngesting === material.id && "opacity-50"
                    )}
                  >
                    {isIngesting === material.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Process
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass rounded-2xl p-6">
        <h4 className="font-semibold text-white mb-3">💡 How it works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-neon-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-neon-blue font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-white">Upload</p>
              <p className="text-dark-400 text-sm">Upload your PDF or text files</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-neon-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-neon-purple font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-white">Process</p>
              <p className="text-dark-400 text-sm">Click "Process" to index for AI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-neon-green font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-white">Ask</p>
              <p className="text-dark-400 text-sm">Chat with AI about your materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
