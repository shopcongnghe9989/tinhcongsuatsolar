import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calculator, Zap, Settings, MapPin, Clock, Gauge, Search, X } from 'lucide-react';
import { APPLIANCES_DB, REGIONS, PANEL_OPTIONS, INVERTER_OPTIONS } from './constants';
import { Appliance, SelectedAppliance, SolarConfig, CalculationResult } from './types';
import { ApplianceCard } from './components/ApplianceCard';
import { ResultsReport } from './components/ResultsReport';

export default function App() {
  // --- STATE ---
  const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>(() => {
    try {
      const saved = localStorage.getItem('solar_appliances');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load appliances from storage", e);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'input' | 'report'>('input');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Appliance Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    watts: 100,
    category: 'Khác'
  });

  const [config, setConfig] = useState<SolarConfig>(() => {
    try {
      const saved = localStorage.getItem('solar_config');
      return saved ? JSON.parse(saved) : {
        peakSunHours: 4.8,
        panelWattage: 450,
        systemEfficiency: 0.8
      };
    } catch (e) {
      return {
        peakSunHours: 4.8,
        panelWattage: 450,
        systemEfficiency: 0.8
      };
    }
  });

  const [selectedRegionIndex, setSelectedRegionIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('solar_region_index');
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('solar_appliances', JSON.stringify(selectedAppliances));
    localStorage.setItem('solar_config', JSON.stringify(config));
    localStorage.setItem('solar_region_index', String(selectedRegionIndex));
  }, [selectedAppliances, config, selectedRegionIndex]);

  // --- HANDLERS ---
  const handleAddAppliance = (appliance: Appliance) => {
    setSelectedAppliances(prev => {
      const existing = prev.find(p => p.id === appliance.id);
      if (existing) {
        return prev.map(p => p.id === appliance.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...appliance, quantity: 1, hoursPerDay: 4, watts: appliance.defaultWatts }];
    });
  };

  const handleCreateCustomAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name) return;

    const newAppliance: Appliance = {
      id: `custom_${Date.now()}`,
      name: customForm.name,
      category: customForm.category,
      defaultWatts: customForm.watts,
      imageSeed: 'electronics' // Generic seed
    };

    handleAddAppliance(newAppliance);
    setCustomForm({ name: '', watts: 100, category: 'Khác' });
    setIsModalOpen(false);
  };

  const handleRemoveAppliance = (id: string) => {
    setSelectedAppliances(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedAppliances(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }).filter(p => p.quantity > 0));
  };

  const handleUpdateHours = (id: string, hours: number) => {
    setSelectedAppliances(prev => prev.map(p => 
      p.id === id ? { ...p, hoursPerDay: Math.min(24, Math.max(0.1, hours)) } : p
    ));
  };

  const handleUpdateWatts = (id: string, watts: number) => {
    setSelectedAppliances(prev => prev.map(p => 
      p.id === id ? { ...p, watts: Math.max(0, watts) } : p
    ));
  };

  const handleRegionChange = (index: number) => {
    setSelectedRegionIndex(index);
    setConfig(prev => ({ ...prev, peakSunHours: REGIONS[index].sunHours }));
  };

  // --- CALCULATIONS ---
  const result: CalculationResult = useMemo(() => {
    const totalDailyConsumptionWh = selectedAppliances.reduce((sum, item) => {
      const power = item.watts !== undefined ? item.watts : item.defaultWatts;
      return sum + (item.quantity * power * item.hoursPerDay);
    }, 0);

    const requiredSystemSizeWatts = totalDailyConsumptionWh > 0 
      ? (totalDailyConsumptionWh / config.peakSunHours) / config.systemEfficiency
      : 0;
    
    const requiredSystemSizeKWp = Math.ceil((requiredSystemSizeWatts / 1000) * 10) / 10;
    const numberOfPanels = Math.ceil(requiredSystemSizeWatts / config.panelWattage);
    const estimatedDailyProductionKWh = (numberOfPanels * config.panelWattage * config.peakSunHours * config.systemEfficiency) / 1000;

    const suitableInverter = INVERTER_OPTIONS.find(inv => inv.capacity >= requiredSystemSizeKWp * 0.85) || INVERTER_OPTIONS[INVERTER_OPTIONS.length - 1];

    return {
      totalDailyConsumptionWh,
      monthlyConsumptionKWh: (totalDailyConsumptionWh * 30) / 1000,
      requiredSystemSizeKWp,
      numberOfPanels,
      estimatedDailyProductionKWh: Math.round(estimatedDailyProductionKWh * 10) / 10,
      recommendedInverter: suitableInverter
    };
  }, [selectedAppliances, config]);

  const filteredAppliances = useMemo(() => {
    return APPLIANCES_DB.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (activeTab === 'report') {
    return (
      <ResultsReport 
        selectedAppliances={selectedAppliances} 
        config={config} 
        result={result} 
        onBack={() => setActiveTab('input')} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* LEFT CONTENT: SELECTION & CONFIG */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="text-yellow-500 fill-yellow-500" />
              SolarExpert VN
            </h1>
            <p className="text-slate-500 text-sm mt-1">Công cụ tính toán công suất điện & tư vấn Solar.</p>
          </div>
          
          {/* Config Summary / Quick Toggle */}
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 text-sm">
             <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" />
                <select 
                  value={selectedRegionIndex}
                  onChange={(e) => handleRegionChange(Number(e.target.value))}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer hover:text-emerald-600"
                >
                  {REGIONS.map((region, idx) => (
                    <option key={idx} value={idx}>{region.name}</option>
                  ))}
                </select>
             </div>
             <div className="h-4 w-px bg-slate-200"></div>
             <div className="flex items-center gap-2">
                <Settings size={16} className="text-blue-500" />
                 <select 
                  value={config.panelWattage}
                  onChange={(e) => setConfig(prev => ({ ...prev, panelWattage: Number(e.target.value) }))}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer hover:text-blue-600"
                >
                  {PANEL_OPTIONS.map((opt) => (
                    <option key={opt.watts} value={opt.watts}>{opt.label}</option>
                  ))}
                </select>
             </div>
          </div>
        </header>

        {/* SEARCH & TOOLS */}
        <div className="sticky top-0 z-10 bg-slate-50 py-2 mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm thiết bị (ví dụ: Máy lạnh, Tủ lạnh...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-emerald-600 font-medium hover:bg-emerald-50 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} /> <span className="hidden sm:inline">Thêm thiết bị khác</span>
            </button>
          </div>
        </div>

        {/* APPLIANCE LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700">Danh sách thiết bị đề xuất</h2>
            <span className="text-xs text-slate-500">{filteredAppliances.length} thiết bị</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:gap-4 p-4">
            {filteredAppliances.length > 0 ? (
              filteredAppliances.map(appliance => (
                <ApplianceCard key={appliance.id} appliance={appliance} onAdd={handleAddAppliance} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Search size={48} className="mx-auto mb-3 opacity-20" />
                <p>Không tìm thấy thiết bị "{searchTerm}"</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-emerald-600 font-medium hover:underline"
                >
                  Tạo thiết bị tùy chỉnh mới?
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: CART */}
      <aside className="w-full md:w-[400px] bg-white border-l border-slate-200 shadow-xl flex flex-col h-screen sticky top-0 z-30">
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Calculator size={20} className="text-emerald-600" />
            Thiết bị đã chọn <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{selectedAppliances.length}</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50">
          {selectedAppliances.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-slate-300" />
              </div>
              <p>Danh sách trống</p>
              <p className="text-sm mt-1 opacity-70">Thêm thiết bị từ danh sách bên trái</p>
            </div>
          ) : (
            selectedAppliances.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-800 text-sm line-clamp-1" title={item.name}>{item.name}</div>
                  </div>
                  <button 
                    onClick={() => handleRemoveAppliance(item.id)} 
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                   <span className="text-xs text-slate-500 font-medium ml-1">Số lượng</span>
                   <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-emerald-600 text-xs font-bold">-</button>
                      <span className="font-semibold w-6 text-center text-sm text-slate-700">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-emerald-600 text-xs font-bold">+</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1 flex items-center gap-1">
                      <Gauge size={10} /> Công suất (W)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={item.watts}
                      onChange={(e) => handleUpdateWatts(item.id, parseFloat(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-center text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                  
                  <div>
                     <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1 flex items-center gap-1">
                      <Clock size={10} /> Dùng (h/ngày)
                    </label>
                    <input 
                      type="number" 
                      min="0" max="24" step="0.5"
                      value={item.hoursPerDay}
                      onChange={(e) => handleUpdateHours(item.id, parseFloat(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-center text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Tiêu thụ:</span>
                  <span className="font-bold text-emerald-600 text-xs">{(item.quantity * item.watts * item.hoursPerDay).toLocaleString()} Wh/ngày</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="space-y-2 mb-4">
             <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Tổng tiêu thụ ngày</span>
              <span className="font-bold text-slate-800">{(result.totalDailyConsumptionWh / 1000).toFixed(2)} kWh</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Hệ thống Solar cần</span>
              <span className="font-bold text-emerald-600 text-lg">{result.requiredSystemSizeKWp} kWp</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('report')}
            disabled={selectedAppliances.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap size={20} className={selectedAppliances.length > 0 ? "fill-yellow-400 text-yellow-400" : ""} />
            Xem Báo Cáo Tư Vấn
          </button>
        </div>
      </aside>

      {/* CUSTOM APPLIANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="bg-emerald-100 text-emerald-600 rounded-full p-1" size={28} />
              Thêm thiết bị tùy chỉnh
            </h3>
            
            <form onSubmit={handleCreateCustomAppliance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên thiết bị</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  placeholder="Ví dụ: Máy sấy tóc..."
                  value={customForm.name}
                  onChange={e => setCustomForm({...customForm, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Công suất (W)</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={customForm.watts}
                    onChange={e => setCustomForm({...customForm, watts: Number(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
                   <select 
                    value={customForm.category}
                    onChange={e => setCustomForm({...customForm, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Gia dụng">Gia dụng</option>
                    <option value="Bếp">Bếp</option>
                    <option value="Chiếu sáng">Chiếu sáng</option>
                    <option value="Làm mát">Làm mát</option>
                    <option value="Công việc">Công việc</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}