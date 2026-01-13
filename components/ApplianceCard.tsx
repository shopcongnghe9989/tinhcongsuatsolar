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

const getApplianceMainIcon = (seed: string) => {
  const className = "text-blue-500 drop-shadow-sm transition-transform duration-300 group-hover:scale-110";
  const size = 32;
  
  // Mapping based on constants.ts imageSeed values
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
    <div className="group flex items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
      {/* Vector Icon Container */}
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
        {getApplianceMainIcon(appliance.imageSeed)}
      </div>

      {/* Info */}
      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-slate-800 text-sm">{appliance.name}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
             {getCategoryIcon(appliance.category)} {appliance.category}
          </span>
          
          {/* Wattage Badge with Tooltip */}
          <div className="group/tooltip relative">
            <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 font-semibold ml-2 cursor-help hover:bg-slate-200 transition-colors">
               <Zap size={10} className="fill-slate-400" /> {appliance.defaultWatts}W
            </span>
            
            {/* Tooltip Content */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-2 group-hover/tooltip:translate-y-0">
               <p className="font-bold mb-1 text-emerald-400">Công suất định danh</p>
               Đây là mức tiêu thụ điện năng tức thời của thiết bị. Chỉ số này rất quan trọng để tính toán tổng tải hệ thống Solar cần đáp ứng.
               {/* Arrow */}
               <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>

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