import { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  BookOpen, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import Card from '@/components/Card';
import { courseAPI, materialAPI, ingestAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Material {
  id: number;
  course_id: number;
  filename: string;
  filepath: string;
  uploaded_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isIngesting, setIsIngesting] = useState<number | null>(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const data = await courseAPI.list();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async (courseId: number) => {
    try {
      const data = await materialAPI.list(courseId);
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const newCourse = await courseAPI.create(newCourseName, newCourseDesc);
      setCourses([...courses, newCourse]);
      setSelectedCourse(newCourse);
      setShowNewCourseForm(false);
      setNewCourseName('');
      setNewCourseDesc('');
      setSuccess('Course created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;

    setIsUploading(true);
    setError('');

    try {
      const newMaterial = await materialAPI.upload(selectedCourse.id, file);
      setMaterials([...materials, newMaterial]);
      setSuccess('File uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleIngest = async (materialId: number) => {
    setIsIngesting(materialId);
    setError('');

    try {
      await ingestAPI.ingest(materialId);
      setSuccess('Material processed and indexed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process material');
    } finally {
      setIsIngesting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
          <p className="text-gray-500 mt-1">Manage your courses and learning materials</p>
        </div>

        <button
          onClick={() => setShowNewCourseForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* New Course Form */}
      {showNewCourseForm && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Create New Course</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="input"
                placeholder="e.g., Introduction to Machine Learning"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                className="input"
                rows={3}
                placeholder="Brief description of the course..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowNewCourseForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <Card title="Your Courses" icon={<BookOpen className="w-5 h-5" />}>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No courses yet</p>
              <p className="text-sm">Create your first course to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCourse?.id === course.id
                      ? 'bg-primary-100 border-primary-300 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">{course.name}</p>
                  {course.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Course Materials */}
        <Card title="Course Materials" icon={<FileText className="w-5 h-5" />} className="lg:col-span-2">
          {selectedCourse ? (
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400" />
                  )}
                  <p className="mt-2 text-gray-600">
                    {isUploading ? 'Uploading...' : 'Click to upload a PDF or text file'}
                  </p>
                  <p className="text-sm text-gray-400">PDF, TXT, or MD files supported</p>
                </label>
              </div>

              {/* Materials List */}
              <div className="space-y-3">
                {materials.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No materials uploaded yet
                  </p>
                ) : (
                  materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{material.filename}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {formatDate(material.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleIngest(material.id)}
                        disabled={isIngesting === material.id}
                        className="btn-secondary text-sm flex items-center gap-2"
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
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Select a course to manage materials</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
