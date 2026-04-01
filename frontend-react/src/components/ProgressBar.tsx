import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  blue: 'bg-primary-600',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export default function ProgressBar({ 
  value, 
  max = 100, 
  className,
  color = 'blue' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2.5', className)}>
      <div
        className={cn('h-2.5 rounded-full transition-all duration-500', colorMap[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
