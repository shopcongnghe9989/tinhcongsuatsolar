import { GoogleGenAI } from "@google/genai";
import { CalculationResult, SelectedAppliance, SolarConfig } from "../types";

const createPrompt = (
  items: SelectedAppliance[],
  config: SolarConfig,
  result: CalculationResult
) => {
  const itemList = items.map(i => `- ${i.name} (x${i.quantity}): ${i.watts}W, dùng ${i.hoursPerDay}h/ngày -> Tổng: ${(i.quantity * i.watts * i.hoursPerDay).toLocaleString()} Wh`).join('\n');
  const inverterInfo = result.recommendedInverter 
    ? `${result.recommendedInverter.label} (${result.recommendedInverter.type})`
    : "Chưa xác định";

  return `
    Bạn là một kỹ sư chuyên gia tư vấn về Điện Năng Lượng Mặt Trời (Solar Energy) tại Việt Nam.
    Hãy phân tích dữ liệu tiêu thụ điện của khách hàng và đưa ra báo cáo tư vấn chuyên nghiệp.

    Dữ liệu khách hàng:
    - Khu vực (Giờ nắng): ${config.peakSunHours} giờ nắng đỉnh/ngày.
    - Loại tấm pin dự kiến: ${config.panelWattage}W.
    - Tổng tiêu thụ điện dự kiến: ${(result.totalDailyConsumptionWh / 1000).toFixed(2)} kWh/ngày.
    
    Cấu hình hệ thống đề xuất:
    - Công suất hệ thống: ${result.requiredSystemSizeKWp} kWp.
    - Số lượng tấm pin: ${result.numberOfPanels} tấm.
    - Biến tần (Inverter) đề xuất: ${inverterInfo}.

    Chi tiết thiết bị sử dụng trong nhà:
    ${itemList}

    Yêu cầu đầu ra (Định dạng Markdown):
    1.  **Đánh giá nhu cầu**: Nhận xét ngắn gọn về mức độ tiêu thụ điện. Thiết bị nào tiêu tốn năng lượng nhất? (Lưu ý công suất và thời gian sử dụng mục tiêu của khách).
    2.  **Đánh giá cấu hình**: 
        - Hệ thống ${result.requiredSystemSizeKWp} kWp có đủ dùng không? 
        - Nhận xét về việc sử dụng biến tần ${inverterInfo} (Ví dụ: Nếu là hệ 1 pha/3 pha thì có phù hợp với gia đình không?).
    3.  **Lợi ích kinh tế**: Ước tính số tiền điện tiết kiệm được hàng tháng (giá điện ~2.500 VNĐ/kWh) và thời gian hoàn vốn (ước lượng sơ bộ, ví dụ 4-5 năm).
    4.  **Lời khuyên lắp đặt**: Lưu ý về hướng lắp đặt (thường là hướng Nam), vệ sinh tấm pin, và an toàn điện.

    Văn phong: Chuyên nghiệp, tin cậy, sử dụng tiếng Việt tự nhiên.
  `;
};

export const generateSolarConsultation = async (
  items: SelectedAppliance[],
  config: SolarConfig,
  result: CalculationResult
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
        return "Lỗi: Chưa cấu hình API Key. Vui lòng thêm API Key vào biến môi trường.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for fast, reasoning-capable responses
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: createPrompt(items, config, result),
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response, logic is simple enough
      }
    });

    return response.text || "Xin lỗi, không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với chuyên gia AI. Vui lòng thử lại sau.";
  }
};