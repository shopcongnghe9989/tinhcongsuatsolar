import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calculator, Zap, Settings, MapPin, Clock, Gauge, Search, X, Banknote, RotateCcw, Battery, BatteryCharging, Users, Eye, Moon, Sun } from 'lucide-react';
import { APPLIANCES_DB, REGIONS, PANEL_OPTIONS, INVERTER_OPTIONS } from './constants';
import { Appliance, SelectedAppliance, SolarConfig, CalculationResult, StringDesign } from './types';
import { ApplianceCard } from './components/ApplianceCard';
import { ResultsReport } from './components/ResultsReport';
import { TechnicianDesign } from './components/TechnicianDesign';

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'input' | 'report' | 'technician'>('input');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('solar_theme') === 'dark';
    } catch { return false; }
  });
  
  // Calculation Mode: 'device' (Manual list) or 'bill' (Money based)
  const [calcMode, setCalcMode] = useState<'device' | 'bill'>('device');
  const [monthlyBill, setMonthlyBill] = useState<number>(1000000); // Default 1M VND
  const [visitCount, setVisitCount] = useState<number>(12540); // Base count

  const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>(() => {
    try {
      const saved = localStorage.getItem('solar_appliances');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load appliances from storage", e);
      return [];
    }
  });

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
      // Default region South (Index 2 in constants) usually has ~5.2 hours, so we default logic below
      return saved ? JSON.parse(saved) : {
        peakSunHours: 5.2, // Default for South
        panelWattage: 450,
        systemEfficiency: 0.8,
        includeBattery: false
      };
    } catch (e) {
      return {
        peakSunHours: 5.2,
        panelWattage: 450,
        systemEfficiency: 0.8,
        includeBattery: false
      };
    }
  });

  // Default to Index 2 (Miền Nam) if not saved
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('solar_region_index');
      return saved ? Number(saved) : 2; // Default 2: Miền Nam
    } catch {
      return 2;
    }
  });

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('solar_appliances', JSON.stringify(selectedAppliances));
    localStorage.setItem('solar_config', JSON.stringify(config));
    localStorage.setItem('solar_region_index', String(selectedRegionIndex));
  }, [selectedAppliances, config, selectedRegionIndex]);

  useEffect(() => {
    localStorage.setItem('solar_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Visit Counter Effect
  useEffect(() => {
    try {
      const storageKey = 'solar_visit_count';
      const lastVisitKey = 'solar_last_visit_ts';
      const storedCount = localStorage.getItem(storageKey);
      const lastVisit = localStorage.getItem(lastVisitKey);
      const now = Date.now();
      
      // Base start number to make the tool look established
      let currentCount = storedCount ? parseInt(storedCount) : 12540;

      // Only increment if last visit was more than 1 hour ago (prevent refresh spamming)
      if (!lastVisit || (now - parseInt(lastVisit) > 3600000)) {
        currentCount += Math.floor(Math.random() * 3) + 1; // Increment by 1-3 randomly
        localStorage.setItem(storageKey, currentCount.toString());
        localStorage.setItem(lastVisitKey, now.toString());
      }
      
      setVisitCount(currentCount);
    } catch (e) {
      console.warn("Could not update visit count", e);
    }
  }, []);

  // --- HANDLERS ---
  const handleAddAppliance = (appliance: Appliance) => {
    if (calcMode === 'bill') setCalcMode('device');

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

  const toggleBattery = () => {
    setConfig(prev => ({ ...prev, includeBattery: !prev.includeBattery }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- CALCULATIONS ---
  const result: CalculationResult = useMemo(() => {
    let totalDailyConsumptionWh = 0;
    
    if (calcMode === 'device') {
      totalDailyConsumptionWh = selectedAppliances.reduce((sum, item) => {
        const power = item.watts !== undefined ? item.watts : item.defaultWatts;
        return sum + (item.quantity * power * item.hoursPerDay);
      }, 0);
    } else {
      // Bill Mode Calculation
      const avgPricePerKWh = 2500;
      const monthlyKWh = monthlyBill / avgPricePerKWh;
      totalDailyConsumptionWh = (monthlyKWh * 1000) / 30;
    }

    const requiredSystemSizeWatts = totalDailyConsumptionWh > 0 
      ? (totalDailyConsumptionWh / config.peakSunHours) / config.systemEfficiency
      : 0;
    
    const requiredSystemSizeKWp = Math.ceil((requiredSystemSizeWatts / 1000) * 10) / 10;
    const numberOfPanels = Math.ceil(requiredSystemSizeWatts / config.panelWattage);
    const estimatedDailyProductionKWh = (numberOfPanels * config.panelWattage * config.peakSunHours * config.systemEfficiency) / 1000;

    const suitableInverter = INVERTER_OPTIONS.find(inv => inv.capacity >= requiredSystemSizeKWp * 0.85) || INVERTER_OPTIONS[INVERTER_OPTIONS.length - 1];

    // --- Technical String Sizing Logic ---
    const panelVoc = 50; // Volts
    const tempSafetyFactor = 1.15;
    const isThreePhase = suitableInverter.type === '3-Phase';
    
    // Inverter Max Input Voltage Limits
    const maxInverterVoltage = isThreePhase ? 1000 : 550;
    
    // Calculate max panels allowed in a single series string safely
    const maxPanelsPerString = Math.floor(maxInverterVoltage / (panelVoc * tempSafetyFactor));
    
    let stringDesign: StringDesign;

    if (numberOfPanels <= maxPanelsPerString) {
      // Scenario A: All panels fit in one string within voltage limits
      stringDesign = {
        totalStrings: 1,
        panelsPerString: numberOfPanels,
        connectionType: '1 Chuỗi Nối tiếp (Series)',
        inputMode: '1 MPPT',
        stringVoltage: numberOfPanels * panelVoc
      };
    } else {
      // Scenario B: Voltage exceeds limit, split into 2 strings
      const panelsStr1 = Math.ceil(numberOfPanels / 2);
      const panelsStr2 = Math.floor(numberOfPanels / 2);
      
      const inputModeLabel = (panelsStr1 !== panelsStr2) 
        ? '2 MPPT Độc lập' 
        : '2 MPPT Độc lập (Khuyên dùng)';

      stringDesign = {
        totalStrings: 2,
        panelsPerString: panelsStr1, // Show the count of the larger string for reference
        connectionType: `Chia 2 giàn: ${panelsStr1} tấm & ${panelsStr2} tấm`,
        inputMode: inputModeLabel,
        stringVoltage: panelsStr1 * panelVoc // Voltage of the longest string
      };
    }
    // -------------------------------------

    let recommendedBatterySizeKWh = 0;
    if (config.includeBattery) {
       // Estimate battery needed to store ~4 hours of peak load or 40% of daily production
       recommendedBatterySizeKWh = Math.ceil((estimatedDailyProductionKWh * 0.4) * 10) / 10;
       if (recommendedBatterySizeKWh < 2.4) recommendedBatterySizeKWh = 2.4; // Minimum practical size (e.g. 1 module)
    }

    return {
      totalDailyConsumptionWh,
      monthlyConsumptionKWh: (totalDailyConsumptionWh * 30) / 1000,
      requiredSystemSizeKWp,
      numberOfPanels,
      estimatedDailyProductionKWh: Math.round(estimatedDailyProductionKWh * 10) / 10,
      recommendedInverter: suitableInverter,
      recommendedBatterySizeKWh: config.includeBattery ? recommendedBatterySizeKWh : undefined,
      stringDesign // Include technical calculation
    };
  }, [selectedAppliances, config, calcMode, monthlyBill]);

  const filteredAppliances = useMemo(() => {
    return APPLIANCES_DB.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const appClassName = isDarkMode ? 'dark' : '';

  if (activeTab === 'technician') {
    return (
      <div className={appClassName}>
         <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <TechnicianDesign 
            config={config} 
            result={result} 
            onBack={() => setActiveTab('report')} 
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'report') {
    return (
      <div className={appClassName}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <ResultsReport 
            selectedAppliances={selectedAppliances} 
            config={config} 
            result={result} 
            onBack={() => setActiveTab('input')}
            onOpenTechDesign={() => setActiveTab('technician')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={appClassName}>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* LEFT CONTENT: SELECTION & CONFIG */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative custom-scrollbar">
          <header className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Zap className="text-yellow-500 fill-yellow-500" />
                SolarExpert VN
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Công cụ tính toán công suất điện & tư vấn Solar.</p>
            </div>
            
            {/* Config Summary / Quick Toggle */}
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3 text-sm transition-colors">
              
               <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <select 
                    value={selectedRegionIndex}
                    onChange={(e) => handleRegionChange(Number(e.target.value))}
                    className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 max-w-[140px]"
                  >
                    {REGIONS.map((region, idx) => (
                      <option key={idx} value={idx} className="dark:bg-slate-800">{region.name}</option>
                    ))}
                  </select>
               </div>
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 hidden sm:block"></div>
               <div className="flex items-center gap-2">
                  <Settings size={16} className="text-blue-500" />
                   <select 
                    value={config.panelWattage}
                    onChange={(e) => setConfig(prev => ({ ...prev, panelWattage: Number(e.target.value) }))}
                    className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {PANEL_OPTIONS.map((opt) => (
                      <option key={opt.watts} value={opt.watts} className="dark:bg-slate-800">{opt.label}</option>
                    ))}
                  </select>
               </div>
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 hidden sm:block"></div>
               
               {/* Battery Toggle */}
               <div 
                 onClick={toggleBattery}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all select-none ${config.includeBattery ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'}`}
               >
                  <BatteryCharging size={16} className={config.includeBattery ? 'fill-current' : ''} />
                  <span className="font-semibold text-xs">Pin lưu trữ</span>
               </div>

               <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 hidden sm:block"></div>
               {/* Dark Mode Toggle */}
               <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                title="Chế độ tối/sáng"
               >
                 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
               </button>
            </div>
          </header>

          {/* SEARCH & TOOLS */}
          <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 py-2 mb-4 transition-colors">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm thiết bị (ví dụ: Máy lạnh, Tủ lạnh...)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Plus size={20} /> <span className="hidden sm:inline">Thêm thiết bị khác</span>
              </button>
            </div>
          </div>

          {/* APPLIANCE LIST */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">Danh sách thiết bị đề xuất</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{filteredAppliances.length} thiết bị</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y dark:divide-slate-700 xl:divide-y-0 xl:gap-4 p-4">
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
                    className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    Tạo thiết bị tùy chỉnh mới?
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: CALCULATION HUB */}
        <aside className="w-full md:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col h-screen sticky top-0 z-30 transition-colors">
          
          {/* Sidebar Header & Tabs */}
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="p-5 pb-3">
               <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Calculator size={20} className="text-emerald-600 dark:text-emerald-400" />
                Tính toán hệ thống
              </h2>
              
              {/* TABS */}
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setCalcMode('device')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${calcMode === 'device' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <Zap size={16} /> Theo thiết bị
                </button>
                <button 
                  onClick={() => setCalcMode('bill')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${calcMode === 'bill' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <Banknote size={16} /> Theo tiền điện
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50 dark:bg-slate-900">
            
            {/* CONTENT: BILL MODE */}
            {calcMode === 'bill' && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 rounded-xl p-6 shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nhập tiền điện trung bình / tháng (VNĐ)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={monthlyBill.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setMonthlyBill(Number(rawValue));
                      }}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-3 text-lg font-bold text-slate-800 dark:text-white bg-emerald-50 dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">đ</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                     <span>Quy đổi sơ bộ:</span>
                     <span className="font-medium text-slate-700 dark:text-slate-300">~{Math.round(monthlyBill / 2500)} kWh/tháng</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300 flex gap-3">
                  <RotateCcw className="shrink-0 mt-0.5" size={18} />
                  <p>Hệ thống sẽ ước tính công suất dựa trên giá điện trung bình 2.500đ/kWh. Kết quả mang tính chất tham khảo để lựa chọn cấu hình phù hợp.</p>
                </div>
              </div>
            )}

            {/* CONTENT: DEVICE MODE */}
            {calcMode === 'device' && (
              <>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2 px-1">
                  <span>Danh sách đã chọn</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{selectedAppliances.length}</span>
                </div>

                {selectedAppliances.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <Plus size={24} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p>Danh sách trống</p>
                    <p className="text-xs mt-1 opacity-70">Chọn thiết bị từ danh sách bên trái</p>
                  </div>
                ) : (
                  selectedAppliances.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group animate-fade-in">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1" title={item.name}>{item.name}</div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAppliance(item.id)} 
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-1.5 border border-slate-100 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Số lượng</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded shadow-sm text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold">-</button>
                            <span className="font-semibold w-6 text-center text-sm text-slate-700 dark:text-slate-200">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded shadow-sm text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold">+</button>
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
                            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 text-center text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
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
                            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 text-center text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
                          />
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">Tiêu thụ:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{(item.quantity * item.watts * item.hoursPerDay).toLocaleString()} Wh/ngày</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 transition-colors">
            <div className="space-y-2 mb-4">
               <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tổng tiêu thụ ngày</span>
                <span className="font-bold text-slate-800 dark:text-white">{(result.totalDailyConsumptionWh / 1000).toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Hệ thống Solar cần</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{result.requiredSystemSizeKWp} kWp</span>
              </div>
               {result.recommendedBatterySizeKWh && (
                <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1"><Battery size={14} /> Pin lưu trữ</span>
                  <span className="font-bold">{result.recommendedBatterySizeKWh} kWh</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('report')}
              disabled={calcMode === 'device' && selectedAppliances.length === 0}
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap size={20} className={result.requiredSystemSizeKWp > 0 ? "fill-yellow-400 text-yellow-400" : ""} />
              Xem Báo Cáo Tư Vấn
            </button>
            
            <div className="mt-4 text-center">
               <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mb-1">
                  <Eye size={14} className="text-slate-300 dark:text-slate-600" />
                  <span>Lượt sử dụng công cụ: <span className="text-slate-500 dark:text-slate-400 font-bold">{visitCount.toLocaleString()}</span></span>
               </div>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">tool design by Lê Sơn IT</p>
            </div>
          </div>
        </aside>

        {/* CUSTOM APPLIANCE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 rounded-full p-1" size={28} />
                Thêm thiết bị tùy chỉnh
              </h3>
              
              <form onSubmit={handleCreateCustomAppliance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên thiết bị</label>
                  <input 
                    autoFocus
                    type="text" 
                    required
                    placeholder="Ví dụ: Máy sấy tóc..."
                    value={customForm.name}
                    onChange={e => setCustomForm({...customForm, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Công suất (W)</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={customForm.watts}
                      onChange={e => setCustomForm({...customForm, watts: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Loại</label>
                     <select 
                      value={customForm.category}
                      onChange={e => setCustomForm({...customForm, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
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
    </div>
  );
}