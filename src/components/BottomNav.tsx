import React from 'react';
import { useMars } from '../context/MarsContext';
import {
  LayoutDashboard,
  Building,
  Briefcase,
  MapPin,
  Sparkles,
  History,
} from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { isDarkMode } = useMars();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'property_map', label: 'Map', icon: MapPin },
    { id: 'workspace_hub', label: 'Workspace', icon: Sparkles },
    { id: 'landlord', label: 'Landlord', icon: Building },
    { id: 'caretaker', label: 'Caretaker', icon: Briefcase },
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
                  ? isDarkMode ? 'text-[#10E3A0] font-bold' : 'text-[#0AB77F] font-bold'
                  : isDarkMode ? 'text-[#A3B8AD] hover:text-[#F2F7F4]' : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? (isDarkMode ? 'bg-[#162B21]' : 'bg-[#E2F8EF]') : 'bg-transparent'
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
