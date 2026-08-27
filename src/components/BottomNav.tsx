import React from 'react';
import {
  LayoutDashboard,
  Building,
  Briefcase,
  UserCheck,
  History,
  FileSpreadsheet,
  BarChart2,
  Wrench
} from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'landlord', label: 'Landlord', icon: Building },
    { id: 'caretaker', label: 'Caretaker', icon: Briefcase },
    { id: 'tenant', label: 'Tenant', icon: UserCheck },
    { id: 'timeline', label: 'Audit Trail', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DFE8E3] shadow-lg no-print md:hidden">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0AB77F] font-bold'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-[#E2F8EF]' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
