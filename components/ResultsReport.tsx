import React, { useEffect, useState, useRef } from 'react';
import { CalculationResult, SelectedAppliance, SolarConfig } from '../types';
import { generateSolarConsultation } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { FileText, Sun, Battery, DollarSign, ArrowLeft, Loader2, Share2, Printer, Box, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PANEL_OPTIONS } from '../constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsReportProps {
  selectedAppliances: SelectedAppliance[];
  config: SolarConfig;
  result: CalculationResult;
  onBack: () => void;
}

export const ResultsReport: React.FC<ResultsReportProps> = ({ selectedAppliances, config, result, onBack }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAdvice = async () => {
      setLoading(true);
      const text = await generateSolarConsultation(selectedAppliances, config, result);
      if (isMounted) {
        setAdvice(text);
        setLoading(false);
      }
    };
    fetchAdvice();
    return () => { isMounted = false; };
  }, [selectedAppliances, config, result]);

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      // Small delay to ensure charts are fully rendered if needed
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Improve quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image to PDF. If height > page height, we'll just let it scale or cut for this simple version.
      // For a better experience with long reports, we simply add it as a long image or just one page
      // To keep it simple and fitting on A4 usually works for this layout if not too long.
      // If it's very long, we might want to split, but for now single page resize is safest for layout integrity.
      
      // Calculate height to see if we need multiple pages, 
      // but simplistic approach: fit width, let height expand if needed (custom page size) 
      // OR standard A4 (might shrink content).
      // Let's use standard A4 and if it's too long, add a new page logic is complex with images.
      // Better approach: Set PDF page height to match content height.
      
      const contentHeightMM = pdfHeight;
      const pdfCustom = new jsPDF('p', 'mm', [pdfWidth, Math.max(contentHeightMM, 297)]);
      
      pdfCustom.addImage(imgData, 'PNG', 0, 0, pdfWidth, contentHeightMM);
      pdfCustom.save(`Bao-Cao-SolarExpert-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Data for Category Pie Chart
  const categoryData = selectedAppliances.reduce((acc, curr) => {
    const power = curr.watts !== undefined ? curr.watts : curr.defaultWatts;
    const consumption = curr.quantity * power * curr.hoursPerDay;
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += consumption;
    } else {
      acc.push({ name: curr.category, value: consumption });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Data for Cost Comparison Chart (Comparison Mode)
  // Logic: Calculate Bill Without Solar vs With Solar at different rates
  const monthlyConsumptionKWh = result.monthlyConsumptionKWh;
  const monthlyProductionKWh = result.estimatedDailyProductionKWh * 30;
  
  // Simple Net Metering assumption: Bill = (Consumption - Production) * Price. Min 0.
  const calcBill = (consumption: number, production: number, price: number) => {
    const netUsage = Math.max(0, consumption - production);
    return Math.round(netUsage * price);
  };

  const costComparisonData = [
    { 
      name: '2.000đ/kWh', 
      'Hiện tại': Math.round(monthlyConsumptionKWh * 2000),
      'Có Solar': calcBill(monthlyConsumptionKWh, monthlyProductionKWh, 2000)
    },
    { 
      name: '2.500đ/kWh', 
      'Hiện tại': Math.round(monthlyConsumptionKWh * 2500),
      'Có Solar': calcBill(monthlyConsumptionKWh, monthlyProductionKWh, 2500)
    },
    { 
      name: '3.000đ/kWh', 
      'Hiện tại': Math.round(monthlyConsumptionKWh * 3000),
      'Có Solar': calcBill(monthlyConsumptionKWh, monthlyProductionKWh, 3000)
    },
  ];

  const panelName = PANEL_OPTIONS.find(p => p.watts === config.panelWattage)?.label || `${config.panelWattage}W Mono Panel`;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in px-4 md:px-8 pt-8">
      {/* HEADER ACTIONS */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <ArrowLeft size={20} /> Quay lại chỉnh sửa
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm" onClick={() => window.print()}>
            <Printer size={18} /> In báo cáo
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-wait"
          >
            {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPdf ? 'Đang tạo PDF...' : 'Tải PDF báo cáo'}
          </button>
        </div>
      </div>

      {/* REPORT CONTENT TO BE CAPTURED */}
      <div ref={reportRef} className="bg-slate-50 p-4 md:p-8 -mx-4 md:-mx-8 rounded-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Báo Cáo Tư Vấn Điện Mặt Trời</h1>
          <p className="text-slate-500">Được tạo tự động bởi SolarExpert VN AI</p>
          <p className="text-xs text-slate-400 mt-1">Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        {/* KEY METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sun size={100} />
            </div>
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <div className="bg-white/20 p-2 rounded-lg"><Battery size={24} /></div>
              <span className="font-medium text-lg">Hệ thống đề xuất</span>
            </div>
            <div className="text-5xl font-bold mb-2 tracking-tight">{result.requiredSystemSizeKWp} <span className="text-2xl font-medium opacity-80">kWp</span></div>
            <div className="text-emerald-50 text-sm mt-2 pt-4 border-t border-white/20">
              {result.recommendedBatterySizeKWh ? 
                `Inverter Hybrid + Lưu trữ ${result.recommendedBatterySizeKWh}kWh` : 
                `Biến tần: ${result.recommendedInverter?.label || "Đang tính toán..."}`
              }
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-slate-500">
               <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Sun size={24} /></div>
              <span className="font-medium text-lg text-slate-700">Sản lượng dự kiến</span>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{result.estimatedDailyProductionKWh} <span className="text-xl text-slate-400 font-normal">kWh/ngày</span></div>
            <div className="text-slate-500 text-sm mt-2">
              Tương đương <strong>{(result.estimatedDailyProductionKWh * 30).toFixed(0)} kWh/tháng</strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-slate-500">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><DollarSign size={24} /></div>
              <span className="font-medium text-lg text-slate-700">Tiết kiệm ước tính</span>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-2">
               {(Math.min(result.estimatedDailyProductionKWh * 30, result.monthlyConsumptionKWh) * 2500 / 1000000).toFixed(2)} <span className="text-xl text-slate-400 font-normal">triệu đ/tháng</span>
            </div>
            <div className="text-slate-500 text-sm mt-2">
              Tính theo giá điện trung bình 2.500đ
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Cost Comparison Chart - Updated */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-500" size={20} />
              So sánh chi phí điện hàng tháng
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis hide />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} đ`, '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar name="Hiện tại" dataKey="Hiện tại" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Sau khi lắp Solar" dataKey="Có Solar" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} label={{ position: 'top', fill: '#10b981', fontSize: 10, formatter: (val:number) => (val/1000000).toFixed(1) + 'tr' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">Giả định hệ thống hoạt động hiệu quả và tiêu thụ hết sản lượng điện tạo ra</p>
          </div>

          {/* Consumption Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              Phân bổ tiêu thụ theo nhóm
            </h3>
            <div className="flex flex-col sm:flex-row items-center h-64">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `${(value / 1000).toFixed(2)} kWh`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 grid grid-cols-1 gap-2 pl-4 text-sm">
                 {categoryData.map((entry, index) => (
                   <div key={index} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                     <span className="text-slate-600 truncate flex-1">{entry.name}</span>
                     <span className="font-medium text-slate-900">{(entry.value / 1000).toFixed(1)} kWh</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM CONFIG TABLE & AI ADVICE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Box className="text-emerald-500" size={20} />
                  Chi tiết cấu hình hệ thống
              </h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                          <tr>
                              <th className="px-4 py-3 rounded-tl-lg">Hạng mục</th>
                              <th className="px-4 py-3">Thiết bị / Vật tư</th>
                              <th className="px-4 py-3 text-center">SL</th>
                              <th className="px-4 py-3 rounded-tr-lg text-right">Ghi chú</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-slate-900">Tấm pin NLMT</td>
                              <td className="px-4 py-4">{panelName}</td>
                              <td className="px-4 py-4 text-center font-bold text-emerald-600 bg-emerald-50 rounded-lg">{result.numberOfPanels}</td>
                              <td className="px-4 py-4 text-right">Bảo hành 12 năm</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-slate-900">Biến tần (Inverter)</td>
                              <td className="px-4 py-4">{result.recommendedInverter?.label}</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-700">1</td>
                              <td className="px-4 py-4 text-right">Bảo hành 5 năm</td>
                          </tr>
                          {/* Battery Row - Conditionally Rendered */}
                          {result.recommendedBatterySizeKWh && (
                            <tr className="hover:bg-slate-50 transition-colors bg-emerald-50/50">
                                <td className="px-4 py-4 font-medium text-emerald-800 flex items-center gap-2">
                                  <Battery size={16} /> Pin lưu trữ
                                </td>
                                <td className="px-4 py-4 font-medium text-emerald-800">Pack Pin Lithium-ion {result.recommendedBatterySizeKWh}kWh</td>
                                <td className="px-4 py-4 text-center font-bold text-slate-700">1</td>
                                <td className="px-4 py-4 text-right">Lưu trữ cho ban đêm</td>
                            </tr>
                          )}
                          <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-slate-900">Hệ thống khung</td>
                              <td className="px-4 py-4">Khung nhôm định hình Anode hóa, kẹp biên, kẹp giữa</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-700">1</td>
                              <td className="px-4 py-4 text-right">Áp mái tôn/ngói</td>
                          </tr>
                           <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-slate-900">Tủ điện bảo vệ</td>
                              <td className="px-4 py-4">Tủ điện IP65, CB DC 1000V, CB AC, Chống sét lan truyền</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-700">1</td>
                              <td className="px-4 py-4 text-right">Full phụ kiện</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-slate-900">Vật tư thi công</td>
                              <td className="px-4 py-4">Cáp điện DC chuyên dụng 4.0mm2, ống luồn dây, đầu cốt...</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-700">1</td>
                              <td className="px-4 py-4 text-right">Trọn gói</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          {/* AI ADVICE PANEL */}
          <div className="bg-slate-900 text-slate-50 rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-10 -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10 flex-grow flex flex-col">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/30"><Sun size={24} className="text-white" /></span>
                    Tư vấn AI
                </h2>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 flex-grow">
                    <Loader2 size={48} className="animate-spin mb-4 text-emerald-500" />
                    <p>Đang phân tích dữ liệu...</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-emerald text-sm overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[500px]">
                     <ReactMarkdown>{advice}</ReactMarkdown>
                    </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};