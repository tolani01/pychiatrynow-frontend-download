import { cn } from "../ui/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomCard({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-xl bg-white p-4 shadow-sm border border-gray-100",
      className
    )}>
      {children}
    </div>
  );
}