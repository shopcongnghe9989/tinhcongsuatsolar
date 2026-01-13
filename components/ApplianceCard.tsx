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
  const size = 16;
  switch (category) {
    case 'Làm mát': return <div className="p-1 bg-blue-100 text-blue-600 rounded-md"><Wind size={size} /></div>;
    case 'Gia dụng': return <div className="p-1 bg-purple-100 text-purple-600 rounded-md"><Waves size={size} /></div>;
    case 'Giải trí': return <div className="p-1 bg-pink-100 text-pink-600 rounded-md"><Tv size={size} /></div>;
    case 'Công việc': return <div className="p-1 bg-slate-100 text-slate-600 rounded-md"><Monitor size={size} /></div>;
    case 'Bếp': return <div className="p-1 bg-orange-100 text-orange-600 rounded-md"><CookingPot size={size} /></div>;
    case 'Chiếu sáng': return <div className="p-1 bg-yellow-100 text-yellow-600 rounded-md"><Lightbulb size={size} /></div>;
    case 'Khác': return <div className="p-1 bg-emerald-100 text-emerald-600 rounded-md"><Zap size={size} /></div>;
    default: return <div className="p-1 bg-gray-100 text-gray-600 rounded-md"><Zap size={size} /></div>;
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
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
             {getIcon(appliance.category)} {appliance.category}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 font-semibold ml-2">
             <Zap size={10} className="fill-slate-400" /> {appliance.defaultWatts}W
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