import { cn } from "../ui/utils";

interface ChatBubbleProps {
  type: 'system' | 'patient';
  children: React.ReactNode;
  className?: string;
}

export function ChatBubble({ type, children, className }: ChatBubbleProps) {
  const isSystem = type === 'system';
  
  return (
    <div className={cn(
      "max-w-[85%] rounded-2xl px-4 py-3 mb-2",
      isSystem 
        ? "bg-blue-50 text-gray-900 self-start" 
        : "bg-blue-600 text-white self-end ml-auto",
      className
    )}>
      {children}
    </div>
  );
}