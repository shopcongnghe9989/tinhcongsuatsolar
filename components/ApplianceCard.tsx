import React from 'react';
import { 
  Plus, Wind, Fan, Snowflake, Waves, Tv, Monitor, Laptop, 
  CookingPot, Lightbulb, Zap, Coffee, Droplets, Flame
} from 'lucide-react';
import { Appliance } from '../types';

interface ApplianceCardProps {
  appliance: Appliance;
  onAdd: (appliance: Appliance) => void;
}

const getIcon = (category: string) => {
  const className = "text-slate-500";
  const size = 16;
  switch (category) {
    case 'Làm mát': return <Wind className={className} size={size} />;
    case 'Gia dụng': return <Waves className={className} size={size} />;
    case 'Giải trí': return <Tv className={className} size={size} />;
    case 'Công việc': return <Monitor className={className} size={size} />;
    case 'Bếp': return <CookingPot className={className} size={size} />;
    case 'Chiếu sáng': return <Lightbulb className={className} size={size} />;
    default: return <Zap className={className} size={size} />;
  }
};

export const ApplianceCard: React.FC<ApplianceCardProps> = ({ appliance, onAdd }) => {
  return (
    <div className="group flex items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={`https://loremflickr.com/150/150/${appliance.imageSeed}`}
          alt={appliance.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-slate-800 text-sm">{appliance.name}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
             {getIcon(appliance.category)} {appliance.category}
          </span>
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-medium">
             <Zap size={12} /> {appliance.defaultWatts}W
          </span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onAdd(appliance)}
        className="ml-3 p-2 bg-slate-50 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-colors shadow-sm"
        title="Thêm thiết bị"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};