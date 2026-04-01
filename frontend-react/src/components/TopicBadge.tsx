import { cn } from '@/lib/utils';

interface TopicBadgeProps {
  topic: string;
  type: 'weak' | 'strong';
}

export default function TopicBadge({ topic, type }: TopicBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        type === 'weak'
          ? 'bg-red-100 text-red-700'
          : 'bg-green-100 text-green-700'
      )}
    >
      {topic}
    </span>
  );
}
