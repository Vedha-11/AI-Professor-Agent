import { useEffect, useState } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle,
  RefreshCw,
  Sparkles,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import { courseAPI, studentAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Recommendations {
  course_id: number;
  weak_topics: string[];
  suggested_materials: string[];
  practice_questions: string[];
}

interface Course {
  id: number;
  name: string;
}

// Example recommendations when API has no data
const getExampleRecommendations = (courseId: number): Recommendations => ({
  course_id: courseId,
  weak_topics: ['Neural Networks', 'Backpropagation', 'Optimization Algorithms'],
  suggested_materials: [
    'Chapter 5: Deep Learning Fundamentals',
    'Chapter 7: Training Neural Networks',
    'Practice Set: Gradient Descent Problems'
  ],
  practice_questions: [
    'Explain how backpropagation works in a multi-layer neural network. What role does the chain rule play?',
    'Compare and contrast batch gradient descent, stochastic gradient descent, and mini-batch gradient descent.',
    'What is the vanishing gradient problem and how do modern architectures address it?',
    'Design a simple neural network architecture for classifying handwritten digits. Explain your choices.',
    'How does regularization help prevent overfitting? Compare L1 and L2 regularization techniques.'
  ]
});

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingExampleData, setUsingExampleData] = useState(false);

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

  const fetchRecommendations = async () => {
    if (!selectedCourse) return;
    
    setIsLoading(true);
    setError('');
    setUsingExampleData(false);
    try {
      const data = await studentAPI.getRecommendations(selectedCourse);
      // Check if we have meaningful data
      if (data.weak_topics?.length === 0 && data.practice_questions?.length === 0) {
        setRecommendations(getExampleRecommendations(selectedCourse));
        setUsingExampleData(true);
      } else {
        setRecommendations(data);
      }
    } catch (err: any) {
      // On error, show example data
      setRecommendations(getExampleRecommendations(selectedCourse));
      setUsingExampleData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchRecommendations();
    }
  }, [selectedCourse]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="text-dark-400 text-lg">
            Personalized suggestions to improve your learning
          </p>
        </div>

        <div className="flex gap-3">
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

          <button
            onClick={fetchRecommendations}
            disabled={isLoading || !selectedCourse}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Example Data Notice */}
      {usingExampleData && (
        <div className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue p-4 rounded-xl flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <span>Showing example recommendations. Start asking questions and completing assignments to get personalized suggestions!</span>
        </div>
      )}

      {error && !usingExampleData && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
            <p className="text-dark-400">Generating recommendations...</p>
          </div>
        </div>
      ) : recommendations ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Areas */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Focus Areas</h3>
            </div>
            
            <p className="text-dark-400 mb-4">
              These topics need more attention based on your activity
            </p>
            
            {recommendations.weak_topics.length > 0 ? (
              <div className="space-y-3">
                {recommendations.weak_topics.map((topic, i) => (
                  <div
                    key={topic}
                    className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 font-semibold text-sm">{i + 1}</span>
                    </div>
                    <span className="text-white font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                <p className="text-dark-400">No weak areas identified yet!</p>
                <p className="text-dark-500 text-sm">Keep asking questions to get insights</p>
              </div>
            )}
          </div>

          {/* Suggested Materials */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white">Study Materials</h3>
            </div>
            
            <p className="text-dark-400 mb-4">
              Review these materials to strengthen understanding
            </p>
            
            {recommendations.suggested_materials.length > 0 ? (
              <div className="space-y-3">
                {recommendations.suggested_materials.map((material, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{material}</p>
                      <p className="text-dark-400 text-sm">Course material</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                <p className="text-dark-400">No materials uploaded yet</p>
                <p className="text-dark-500 text-sm">Upload materials to get suggestions</p>
              </div>
            )}
          </div>

          {/* Practice Questions */}
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-neon-purple" />
              </div>
              <h3 className="text-xl font-bold text-white">Practice Questions</h3>
            </div>
            
            <p className="text-dark-400 mb-6">
              Test your understanding with these AI-generated questions
            </p>
            
            {recommendations.practice_questions.length > 0 ? (
              <div className="space-y-4">
                {recommendations.practice_questions.map((question, i) => (
                  <div
                    key={i}
                    className="p-5 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 border border-neon-purple/20 rounded-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-blue rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{i + 1}</span>
                      </div>
                      <p className="text-white leading-relaxed">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                <p className="text-dark-400 text-lg">No practice questions available</p>
                <p className="text-dark-500">Questions will be generated based on your weak areas</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <p className="text-white text-xl font-medium mb-2">Select a course</p>
          <p className="text-dark-400">Choose a course to see personalized recommendations</p>
        </div>
      )}
    </div>
  );
}
