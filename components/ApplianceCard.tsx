import React from 'react';
import { 
  Plus, Wind, Fan, Snowflake, Waves, Tv, Monitor, Laptop, 
  CookingPot, Lightbulb, Zap, Coffee, Droplets, Flame,
  Refrigerator, WashingMachine, Microwave, ThermometerSun
} from 'lucide-react';
import { Appliance } from '../types';

interface ApplianceCardProps {
  appliance: Appliance;
  onAdd: (appliance: Appliance) => void;
}

const getCategoryIcon = (category: string) => {
  const size = 14;
  switch (category) {
    case 'Làm mát': return <Wind size={size} />;
    case 'Gia dụng': return <Waves size={size} />;
    case 'Giải trí': return <Tv size={size} />;
    case 'Công việc': return <Monitor size={size} />;
    case 'Bếp': return <CookingPot size={size} />;
    case 'Chiếu sáng': return <Lightbulb size={size} />;
    default: return <Zap size={size} />;
  }
};

const getApplianceMainIcon = (seed: string) => {
  // White icon with slight fill for "vector" look on colored background
  const className = "text-white fill-white/20 drop-shadow-md transition-transform duration-300 group-hover:scale-110";
  const size = 32;
  
  if (seed.includes('air_conditioner') || seed.includes('ac_unit')) return <Snowflake className={className} size={size} />;
  if (seed.includes('fan')) return <Fan className={className} size={size} />;
  if (seed.includes('fridge') || seed.includes('refrigerator')) return <Refrigerator className={className} size={size} />;
  if (seed.includes('washing')) return <WashingMachine className={className} size={size} />;
  if (seed.includes('tv')) return <Tv className={className} size={size} />;
  if (seed.includes('desktop')) return <Monitor className={className} size={size} />;
  if (seed.includes('laptop')) return <Laptop className={className} size={size} />;
  if (seed.includes('rice') || seed.includes('cooker')) return <CookingPot className={className} size={size} />;
  if (seed.includes('bulb') || seed.includes('led')) return <Lightbulb className={className} size={size} />;
  if (seed.includes('heater')) return <ThermometerSun className={className} size={size} />;
  if (seed.includes('kettle')) return <Coffee className={className} size={size} />;
  if (seed.includes('pump')) return <Droplets className={className} size={size} />;
  if (seed.includes('microwave')) return <Microwave className={className} size={size} />;
  if (seed.includes('induction')) return <Flame className={className} size={size} />;
  
  return <Zap className={className} size={size} />;
};

export const ApplianceCard: React.FC<ApplianceCardProps> = ({ appliance, onAdd }) => {
  return (
    <div className="group flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300">
      {/* Blue Vector Icon Container */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200 dark:shadow-blue-900/40 group-hover:shadow-blue-300 dark:group-hover:shadow-blue-800 group-hover:scale-105 transition-all duration-300">
        {getApplianceMainIcon(appliance.imageSeed)}
      </div>

      {/* Info */}
      <div className="ml-4 flex-1">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{appliance.name}</h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
             {getCategoryIcon(appliance.category)} {appliance.category}
          </span>
        </div>
      </div>
      
       {/* Wattage Badge (moved to right for cleaner look) */}
      <div className="flex flex-col items-end gap-2">
          <div className="group/tooltip relative">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 font-bold text-xs cursor-help hover:bg-white dark:hover:bg-slate-600 hover:border-blue-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
               {appliance.defaultWatts}W
            </span>
            {/* Tooltip Content */}
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-2 group-hover/tooltip:translate-y-0">
               <p className="font-bold mb-1 text-blue-400">Công suất định danh</p>
               Mức tiêu thụ điện năng ước tính.
               <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => onAdd(appliance)}
            className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shadow-sm active:scale-95"
            title="Thêm thiết bị"
          >
            <Plus size={18} />
          </button>
      </div>
    </div>
  );
};