import React from 'react';
import { ArrowLeft, Cable, Zap, Cpu, Battery, Sun, Maximize2, GitMerge, AlertTriangle, Download, Printer } from 'lucide-react';
import { CalculationResult, SolarConfig } from '../types';

interface TechnicianDesignProps {
  config: SolarConfig;
  result: CalculationResult;
  onBack: () => void;
}

export const TechnicianDesign: React.FC<TechnicianDesignProps> = ({ config, result, onBack }) => {
  const { stringDesign, recommendedInverter } = result;
  
  // Heuristic for cable sizing based on current
  // Standard PV cable is 4.0mm2 or 6.0mm2. 4.0 is usually fine for < 20A strings.
  const dcCableSize = "DC 4.0 mm² (Solar Cable)";
  
  // AC Cable sizing approximation
  const inverterCapacity = recommendedInverter?.capacity || 5;
  let acCableSize = "2x4.0 mm² + E";
  let cbSize = "32A";
  
  if (inverterCapacity <= 3) { acCableSize = "2x2.5 mm² + E"; cbSize = "20A"; }
  else if (inverterCapacity <= 5.5) { acCableSize = "2x6.0 mm² + E"; cbSize = "40A"; }
  else if (inverterCapacity <= 10) { acCableSize = "2x10.0 mm² + E"; cbSize = "63A"; } // Single phase high current or 3-phase lower

  if (recommendedInverter?.type === '3-Phase') {
     if (inverterCapacity <= 10) { acCableSize = "4x4.0 mm² + E"; cbSize = "25A (3P)"; }
     else { acCableSize = "4x10.0 mm² + E"; cbSize = "40A (3P)"; }
  }

  // Voltage estimates
  const vocPerPanel = 49.5; // Approx
  const vmpPerPanel = 41.5; // Approx
  const iscPerPanel = 11.5; // Approx
  
  const stringVoc = stringDesign ? (stringDesign.stringVoltage).toFixed(1) : "0";
  const stringVmp = stringDesign ? (stringDesign.panelsPerString * vmpPerPanel).toFixed(1) : "0";

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-8 pt-6 font-mono text-slate-800 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
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
            
            {/* 1. PV Array Diagram */}
            <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-br uppercase tracking-wider font-bold">Sơ đồ đấu nối DC</div>
                
                <div className="mt-6 flex flex-col items-center gap-8">
                    {/* Render Strings */}
                    {Array.from({ length: stringDesign?.totalStrings || 1 }).map((_, idx) => (
                        <div key={idx} className="w-full flex items-center gap-4">
                            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-2 justify-center relative min-h-[80px]">
                                <div className="absolute -top-3 left-4 bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded border border-slate-300 font-bold">
                                    PV String {idx + 1}
                                </div>
                                {Array.from({ length: Math.min(10, stringDesign?.panelsPerString || 0) }).map((__, pIdx) => (
                                    <div key={pIdx} className="w-8 h-12 bg-blue-500 border border-blue-600 rounded-sm shadow-sm" title="Panel"></div>
                                ))}
                                {(stringDesign?.panelsPerString || 0) > 10 && (
                                    <div className="flex items-center justify-center font-bold text-slate-400 text-xs">+{ (stringDesign?.panelsPerString || 0) - 10 }</div>
                                )}
                            </div>
                            
                            {/* Connection Line */}
                            <div className="w-12 h-0.5 bg-red-500 relative">
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-bold">DC+</span>
                            </div>
                            
                            {/* Inverter MPPT Input Representation */}
                            <div className="w-24 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-white text-xs font-bold border-2 border-slate-600 relative">
                                MPPT {idx + 1}
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>

                 {/* Battery Connection Diagram (If applicable) */}
                 {config.includeBattery && (
                    <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-center gap-6">
                         <div className="w-32 h-20 bg-emerald-100 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center text-emerald-800 relative">
                            <Battery size={24} className="mb-1" />
                            <span className="text-xs font-bold">Lithium Pack</span>
                            <span className="text-[10px]">{result.recommendedBatterySizeKWh} kWh</span>
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-600 rounded-full"></div>
                         </div>
                         <div className="flex-1 h-0.5 border-t-2 border-dashed border-emerald-500 relative">
                             <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald-600 font-bold bg-white px-1">BMS Comms</span>
                         </div>
                         <div className="w-24 h-16 bg-slate-800 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold border-2 border-slate-600">
                             BAT Input
                         </div>
                    </div>
                 )}
            </div>

            {/* 2. Specs Table */}
             <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                 <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between">
                    <span>THÔNG SỐ VẬN HÀNH DỰ KIẾN (STC)</span>
                    <span className="text-slate-400 font-normal text-xs">*Điều kiện tiêu chuẩn</span>
                 </div>
                 <table className="w-full text-sm">
                     <tbody>
                         <tr className="border-b border-slate-100">
                             <td className="px-4 py-2 text-slate-500">Cấu hình chuỗi</td>
                             <td className="px-4 py-2 font-bold">{stringDesign?.connectionType}</td>
                         </tr>
                         <tr className="border-b border-slate-100">
                             <td className="px-4 py-2 text-slate-500">Số lượng chuỗi</td>
                             <td className="px-4 py-2 font-bold">{stringDesign?.totalStrings} Strings</td>
                         </tr>
                         <tr className="border-b border-slate-100">
                             <td className="px-4 py-2 text-slate-500">Điện áp hở mạch (Voc) / String</td>
                             <td className="px-4 py-2 font-bold text-blue-600">~ {stringVoc} V</td>
                         </tr>
                         <tr className="border-b border-slate-100">
                             <td className="px-4 py-2 text-slate-500">Điện áp làm việc (Vmp) / String</td>
                             <td className="px-4 py-2 font-bold text-emerald-600">~ {stringVmp} V</td>
                         </tr>
                         <tr>
                             <td className="px-4 py-2 text-slate-500">Dòng ngắn mạch (Isc)</td>
                             <td className="px-4 py-2 font-bold">~ {iscPerPanel} A</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>

        {/* RIGHT COLUMN: EQUIPMENT & BOM */}
        <div className="space-y-6">
            
            {/* Inverter Spec Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={18} />
                    Thông số Biến tần
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Model:</span>
                        <span className="font-medium text-right">{recommendedInverter?.label}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Công suất:</span>
                        <span className="font-bold">{recommendedInverter?.capacity} kW</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Pha:</span>
                        <span className="font-medium">{recommendedInverter?.type === '3-Phase' ? '3 Pha (380V)' : '1 Pha (220V)'}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-xs text-slate-500 block mb-1">Chế độ đầu vào (Input Mode):</span>
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1.5 rounded border border-yellow-200">
                            {stringDesign?.inputMode}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cable Recommendation */}
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Cable className="text-slate-500" size={18} />
                    Vật tư & Cáp điện
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                        <div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Cáp DC (Solar)</div>
                            <div className="text-sm font-medium">{dcCableSize}</div>
                            <div className="text-[10px] text-slate-400">Chuyên dụng chống UV, 1500VDC</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                             <div className="text-xs text-slate-500 font-bold uppercase">Cáp AC (Lưới)</div>
                            <div className="text-sm font-medium">{acCableSize}</div>
                             <div className="text-[10px] text-slate-400">CV/CXV ruột đồng</div>
                        </div>
                    </div>
                    
                     <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-2"></div>
                        <div>
                             <div className="text-xs text-slate-500 font-bold uppercase">Aptomat (MCB)</div>
                            <div className="text-sm font-medium">{cbSize}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Warnings */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                <div className="text-xs text-amber-800">
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