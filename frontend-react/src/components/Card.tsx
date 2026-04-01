import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export default function Card({ children, className, title, icon }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-primary-600">{icon}</div>}
          {title && <h3 className="font-semibold text-lg text-gray-800">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
