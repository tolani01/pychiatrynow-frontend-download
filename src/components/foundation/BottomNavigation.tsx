import { cn } from "../ui/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'appointments', label: 'Appts', icon: '📅' },
    { id: 'medications', label: 'Meds', icon: '💊' },
    { id: 'messages', label: 'Messages', icon: '💬' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
              activeTab === tab.id
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600"
            )}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}