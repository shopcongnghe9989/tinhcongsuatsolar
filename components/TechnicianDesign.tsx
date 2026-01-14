import React, { useState } from 'react';
import { ArrowLeft, Cable, Zap, Cpu, Battery, Sun, CloudRain, CloudSun, Printer, AlertTriangle, Info } from 'lucide-react';
import { CalculationResult, SolarConfig } from '../types';

interface TechnicianDesignProps {
  config: SolarConfig;
  result: CalculationResult;
  onBack: () => void;
}

export const TechnicianDesign: React.FC<TechnicianDesignProps> = ({ config, result, onBack }) => {
  const { stringDesign, recommendedInverter } = result;
  const [sunIntensity, setSunIntensity] = useState<number>(100); // 0 to 100%

  // Heuristic for cable sizing based on current
  const dcCableSize = "DC 4.0 mm² (Solar Cable)";
  
  // AC Cable sizing approximation
  const inverterCapacity = recommendedInverter?.capacity || 5;
  let acCableSize = "2x4.0 mm² + E";
  let cbSize = "32A";
  
  if (inverterCapacity <= 3) { acCableSize = "2x2.5 mm² + E"; cbSize = "20A"; }
  else if (inverterCapacity <= 5.5) { acCableSize = "2x6.0 mm² + E"; cbSize = "40A"; }
  else if (inverterCapacity <= 10) { acCableSize = "2x10.0 mm² + E"; cbSize = "63A"; }

  if (recommendedInverter?.type === '3-Phase') {
     if (inverterCapacity <= 10) { acCableSize = "4x4.0 mm² + E"; cbSize = "25A (3P)"; }
     else { acCableSize = "4x10.0 mm² + E"; cbSize = "40A (3P)"; }
  }

  // --- REAL-TIME SIMULATION LOGIC ---
  // Base STC Values
  const baseVoc = 49.5; 
  const baseVmp = 41.5; 
  const baseIsc = 11.5; 
  
  // Simulation Factors
  // Current (Amps) & Power (Watts) are roughly linear with irradiance.
  // Voltage (Volts) drops logarithmically but stays relatively high until very low light.
  // We simulate a simplified curve here.
  const intensityFactor = sunIntensity / 100;
  
  // Voltage drops slightly as intensity decreases (approx 10-15% drop at low light before cutoff)
  const voltageDropFactor = sunIntensity < 10 ? (sunIntensity / 10) : (0.9 + 0.1 * intensityFactor);
  
  const simWatts = Math.round(config.panelWattage * intensityFactor);
  const simVoc = (baseVoc * voltageDropFactor).toFixed(1);
  const simVmp = (baseVmp * voltageDropFactor).toFixed(1);
  const simIsc = (baseIsc * intensityFactor).toFixed(1);
  
  const simStringVoc = stringDesign ? (Number(simVoc) * stringDesign.panelsPerString).toFixed(1) : "0";
  const simStringVmp = stringDesign ? (Number(simVmp) * stringDesign.panelsPerString).toFixed(1) : "0";

  // Visual Opacity for panels
  const panelOpacity = Math.max(0.3, intensityFactor);
  const panelColorIntensity = Math.max(50, Math.floor(intensityFactor * 600)); // Dynamic blue shade

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-8 pt-6 font-mono text-slate-800 dark:text-slate-200 animate-fade-in transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-slate-900 dark:bg-black text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Cpu className="text-blue-400" /> HỒ SƠ THIẾT KẾ KỸ THUẬT
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-sans">Dành cho kỹ thuật viên lắp đặt & cấu hình Inverter</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            <Printer size={16} /> In sơ đồ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: DIAGRAM */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* SUNLIGHT SIMULATOR CONTROL */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-orange-200 dark:border-slate-700 rounded-xl p-4 shadow-sm transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                        <Sun className="text-orange-500" size={18} />
                        GIẢ LẬP CƯỜNG ĐỘ NẮNG (Simulation)
                    </label>
                    <span className="bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-bold px-2 py-1 rounded border border-orange-200 dark:border-slate-600 text-xs">
                        Công suất: {simWatts}W/tấm ({sunIntensity}%)
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <CloudRain size={20} className="text-slate-400" />
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sunIntensity} 
                        onChange={(e) => setSunIntensity(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <Sun size={24} className="text-orange-500 animate-pulse" style={{ opacity: Math.max(0.3, intensityFactor) }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    <span>Mưa / Đêm (0V)</span>
                    <span>Râm mát (~30%)</span>
                    <span>Trung bình (~60%)</span>
                    <span>Nắng đỉnh (STC)</span>
                </div>
            </div>

            {/* 1. PV Array Diagram */}
            <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-6 shadow-sm relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-br uppercase tracking-wider font-bold">Sơ đồ đấu nối DC</div>
                
                {/* SCHEMATIC ILLUSTRATION */}
                <div className="mt-8 mb-6 mx-auto max-w-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <Info size={14}/> Nguyên lý đấu nối tiếp (Series)
                    </h4>
                    <div className="flex items-center justify-center gap-0 overflow-x-auto py-2">
                        {/* DC- Input */}
                        <div className="flex flex-col items-center mr-2">
                             <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">DC -</div>
                             <div className="w-4 h-0.5 bg-blue-600"></div>
                        </div>
                        
                        {/* Sample Panels connected by lines */}
                        {[1, 2, 3].map(i => (
                            <React.Fragment key={i}>
                                <div 
                                    className="w-14 h-20 border border-slate-400 dark:border-slate-500 shadow-sm flex flex-col relative shrink-0 transition-colors duration-300"
                                    style={{ 
                                        backgroundColor: `rgba(255, 255, 255, 1)`,
                                    }}
                                >
                                     {/* Dynamic Background Overlay */}
                                     <div 
                                        className="absolute inset-0 transition-opacity duration-300" 
                                        style={{ 
                                            backgroundColor: 'rgb(37, 99, 235)', 
                                            opacity: panelOpacity * 0.3 // Lighter than main diagram
                                        }} 
                                     ></div>

                                     {/* Cell Grid pattern */}
                                     <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 opacity-10 pointer-events-none p-0.5 gap-0.5 z-0">
                                         {[...Array(8)].map((_,j) => <div key={j} className="bg-blue-900 rounded-[1px]"></div>)}
                                     </div>
                                     <div className="absolute top-0 w-full flex justify-between px-1 mt-0.5 text-[8px] font-bold text-slate-500 z-10">
                                        <span>-</span>
                                        <span>+</span>
                                     </div>
                                     <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                         <div className="text-[9px] font-bold text-slate-800 leading-none">{simWatts}W</div>
                                         <div className="w-6 h-px bg-slate-300 my-0.5"></div>
                                         <div className="text-[8px] text-slate-600 leading-none">{simVoc}V</div>
                                     </div>
                                </div>
                                {/* Connecting Wire */}
                                {i < 3 ? (
                                    <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-400 relative group">
                                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Nối tiếp</div>
                                    </div>
                                ) : null}
                            </React.Fragment>
                        ))}

                        {/* DC+ Output */}
                        <div className="flex flex-col items-center ml-0">
                             <div className="w-8 h-0.5 bg-red-600 relative"></div>
                             <div className="text-[10px] font-bold text-red-600 ml-2">DC +</div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-4 italic bg-white/50 dark:bg-white/5 rounded py-1">
                        <span>Điện áp (V) = V1 + V2 + V3...</span>
                        <span>Dòng điện (A) = I1 = I2...</span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-8">
                    {/* Render Strings */}
                    {Array.from({ length: stringDesign?.totalStrings || 1 }).map((_, idx) => (
                        <div key={idx} className="w-full flex items-center gap-4">
                            <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-2 justify-center relative min-h-[100px] transition-colors duration-300" style={{ backgroundColor: `rgba(255, 237, 213, ${intensityFactor * 0.1})` }}>
                                <div className="absolute -top-3 left-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-bold">
                                    PV String {idx + 1}
                                </div>
                                {Array.from({ length: Math.min(10, stringDesign?.panelsPerString || 0) }).map((__, pIdx) => (
                                    <div 
                                      key={pIdx} 
                                      className="w-12 h-16 border-b-4 border-r-2 rounded-sm shadow-sm flex flex-col items-center justify-center text-white transition-all duration-300" 
                                      title="Panel"
                                      style={{ 
                                        backgroundColor: `rgb(37, 99, 235, ${panelOpacity})`, // Dynamic opacity
                                        borderColor: `rgba(29, 78, 216, ${panelOpacity})`
                                      }}
                                    >
                                        <div className="text-[10px] font-bold leading-none drop-shadow-md">{simWatts}W</div>
                                        <div className="w-8 h-px bg-white/50 my-0.5"></div>
                                        <div className="text-[9px] opacity-90 leading-none drop-shadow-md">{simVoc}V</div>
                                    </div>
                                ))}
                                {(stringDesign?.panelsPerString || 0) > 10 && (
                                    <div className="flex items-center justify-center font-bold text-slate-400 text-xs">+{ (stringDesign?.panelsPerString || 0) - 10 }</div>
                                )}
                            </div>
                            
                            {/* Connection Line */}
                            <div className="w-12 h-0.5 bg-red-500 relative opacity-80">
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-bold">DC+</span>
                            </div>
                            
                            {/* Inverter MPPT Input Representation */}
                            <div className="w-24 h-16 bg-slate-800 dark:bg-slate-700 rounded-lg flex items-center justify-center text-white text-xs font-bold border-2 border-slate-600 dark:border-slate-500 relative">
                                MPPT {idx + 1}
                                <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300 ${sunIntensity > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-600'}`}></div>
                                <div className="absolute -bottom-5 w-full text-center text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                                    {sunIntensity > 0 ? `${(Number(simIsc) * intensityFactor).toFixed(1)}A` : '0A'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                 {/* Battery Connection Diagram (If applicable) */}
                 {config.includeBattery && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-6">
                         <div className="w-32 h-20 bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center text-emerald-800 dark:text-emerald-400 relative">
                            <Battery size={24} className="mb-1" />
                            <span className="text-xs font-bold">Lithium Pack</span>
                            <span className="text-[10px]">{result.recommendedBatterySizeKWh} kWh</span>
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-600 rounded-full"></div>
                         </div>
                         <div className="flex-1 h-0.5 border-t-2 border-dashed border-emerald-500 relative">
                             <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-slate-800 px-1">BMS Comms</span>
                         </div>
                         <div className="w-24 h-16 bg-slate-800 dark:bg-slate-700 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold border-2 border-slate-600 dark:border-slate-500">
                             BAT Input
                         </div>
                    </div>
                 )}
            </div>

            {/* 2. Specs Table - DYNAMIC */}
             <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm transition-all">
                 <div className={`px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-bold text-sm flex justify-between items-center transition-colors ${sunIntensity < 100 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                    <span className="flex items-center gap-2">
                        {sunIntensity < 100 ? <CloudSun size={16} /> : <Zap size={16} />}
                        THÔNG SỐ VẬN HÀNH THỰC TẾ (SIMULATION)
                    </span>
                    <span className="font-normal text-xs opacity-80">
                        {sunIntensity === 100 ? '*Điều kiện tiêu chuẩn (STC)' : `*Tại cường độ nắng ${sunIntensity}%`}
                    </span>
                 </div>
                 <table className="w-full text-sm">
                     <tbody>
                         <tr className="border-b border-slate-100 dark:border-slate-700">
                             <td className="px-4 py-2 text-slate-500 dark:text-slate-400">Cấu hình chuỗi</td>
                             <td className="px-4 py-2 font-bold">{stringDesign?.connectionType}</td>
                         </tr>
                         <tr className="border-b border-slate-100 dark:border-slate-700">
                             <td className="px-4 py-2 text-slate-500 dark:text-slate-400">Số lượng chuỗi</td>
                             <td className="px-4 py-2 font-bold">{stringDesign?.totalStrings} Strings</td>
                         </tr>
                         <tr className="border-b border-slate-100 dark:border-slate-700">
                             <td className="px-4 py-2 text-slate-500 dark:text-slate-400">Điện áp hở mạch (Voc) / String</td>
                             <td className="px-4 py-2 font-bold text-blue-600 dark:text-blue-400 transition-all duration-300">~ {simStringVoc} V</td>
                         </tr>
                         <tr className="border-b border-slate-100 dark:border-slate-700">
                             <td className="px-4 py-2 text-slate-500 dark:text-slate-400">Điện áp làm việc (Vmp) / String</td>
                             <td className="px-4 py-2 font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-300">~ {simStringVmp} V</td>
                         </tr>
                         <tr>
                             <td className="px-4 py-2 text-slate-500 dark:text-slate-400">Dòng ngắn mạch (Isc)</td>
                             <td className="px-4 py-2 font-bold transition-all duration-300">~ {simIsc} A</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>

        {/* RIGHT COLUMN: EQUIPMENT & BOM */}
        <div className="space-y-6">
            
            {/* Inverter Spec Card */}
            <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5 transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={18} />
                    Thông số Biến tần
                </h3>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Model:</span>
                        <span className="font-medium text-right">{recommendedInverter?.label}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Công suất:</span>
                        <span className="font-bold">{recommendedInverter?.capacity} kW</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Pha:</span>
                        <span className="font-medium">{recommendedInverter?.type === '3-Phase' ? '3 Pha (380V)' : '1 Pha (220V)'}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Chế độ đầu vào (Input Mode):</span>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold px-2 py-1.5 rounded border border-yellow-200 dark:border-yellow-800">
                            {stringDesign?.inputMode}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cable Recommendation */}
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Cable className="text-slate-500 dark:text-slate-400" size={18} />
                    Vật tư & Cáp điện
                </h3>
                
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Cáp DC (Solar)</div>
                            <div className="text-sm font-medium">{dcCableSize}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">Chuyên dụng chống UV, 1500VDC</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Cáp AC (Lưới)</div>
                            <div className="text-sm font-medium">{acCableSize}</div>
                             <div className="text-[10px] text-slate-400 dark:text-slate-500">CV/CXV ruột đồng</div>
                        </div>
                    </div>
                    
                     <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-400 mt-2"></div>
                        <div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Aptomat (MCB)</div>
                            <div className="text-sm font-medium">{cbSize}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Warnings */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 transition-colors">
                <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={20} />
                <div className="text-xs text-amber-800 dark:text-amber-400">
                    <strong>Lưu ý kỹ thuật:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1 opacity-90">
                        <li>Kiểm tra điện áp Voc thực tế khi trời lạnh để tránh quá áp Inverter.</li>
                        <li>Đảm bảo tiếp địa (PE) cho cả giàn pin và vỏ Inverter (R &lt; 4Ω).</li>
                        <li>Siết lực ốc theo khuyến cáo nhà sản xuất (thường 2.5 - 4 Nm).</li>
                    </ul>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};