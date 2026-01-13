import { Appliance, Inverter } from './types';

// Using specific keywords for better image relevance via loremflickr or similar services
export const APPLIANCES_DB: Appliance[] = [
  { id: 'ac_1hp', name: 'Máy lạnh 1 HP', category: 'Làm mát', defaultWatts: 750, imageSeed: 'air_conditioner' },
  { id: 'ac_2hp', name: 'Máy lạnh 2 HP', category: 'Làm mát', defaultWatts: 1500, imageSeed: 'ac_unit' },
  { id: 'fan', name: 'Quạt máy', category: 'Làm mát', defaultWatts: 60, imageSeed: 'electric_fan' },
  { id: 'fridge_small', name: 'Tủ lạnh (Nhỏ)', category: 'Gia dụng', defaultWatts: 150, imageSeed: 'fridge' },
  { id: 'fridge_side', name: 'Tủ lạnh Side-by-Side', category: 'Gia dụng', defaultWatts: 400, imageSeed: 'refrigerator_kitchen' },
  { id: 'washing_machine', name: 'Máy giặt', category: 'Gia dụng', defaultWatts: 500, imageSeed: 'washing_machine' },
  { id: 'tv_led', name: 'Tivi LED/Smart TV', category: 'Giải trí', defaultWatts: 120, imageSeed: 'smart_tv' },
  { id: 'pc', name: 'Máy tính để bàn', category: 'Công việc', defaultWatts: 300, imageSeed: 'desktop_computer' },
  { id: 'laptop', name: 'Laptop', category: 'Công việc', defaultWatts: 65, imageSeed: 'laptop_work' },
  { id: 'rice_cooker', name: 'Nồi cơm điện', category: 'Bếp', defaultWatts: 700, imageSeed: 'rice_cooker' },
  { id: 'lights_led', name: 'Đèn LED', category: 'Chiếu sáng', defaultWatts: 20, imageSeed: 'led_bulb' },
  { id: 'water_heater', name: 'Bình nóng lạnh', category: 'Gia dụng', defaultWatts: 2500, imageSeed: 'water_heater' },
  { id: 'kettle', name: 'Ấm siêu tốc', category: 'Bếp', defaultWatts: 1500, imageSeed: 'electric_kettle' },
  { id: 'pump', name: 'Máy bơm nước', category: 'Gia dụng', defaultWatts: 750, imageSeed: 'water_pump' },
  { id: 'microwave', name: 'Lò vi sóng', category: 'Bếp', defaultWatts: 1200, imageSeed: 'microwave_oven' },
  { id: 'induction_cooker', name: 'Bếp từ', category: 'Bếp', defaultWatts: 2000, imageSeed: 'induction_cooktop' },
];

export const REGIONS = [
  { name: 'Miền Bắc (Trung bình)', sunHours: 3.8 },
  { name: 'Miền Trung (Trung bình)', sunHours: 4.8 },
  { name: 'Miền Nam (Trung bình)', sunHours: 5.2 },
];

export const PANEL_OPTIONS = [
  { watts: 450, label: 'Longi 450W Mono Half-cell' },
  { watts: 475, label: 'Jinko Tiger Neo 475W' },
  { watts: 540, label: 'Canadian Solar 540W HiKu6' },
  { watts: 550, label: 'AE Solar 550W Aurora' },
  { watts: 580, label: 'Jinko 580W N-Type' },
  { watts: 600, label: 'Canadian Solar 600W BiHiKu7' },
];

export const INVERTER_OPTIONS: Inverter[] = [
  { capacity: 3, label: 'Growatt MIN 3000TL-X', brand: 'Growatt', type: '1-Phase' },
  { capacity: 3.6, label: 'Solis 3.6kW 1P', brand: 'Solis', type: '1-Phase' },
  { capacity: 5, label: 'Huawei SUN2000-5KTL-L1', brand: 'Huawei', type: '1-Phase' },
  { capacity: 5, label: 'Deye 5kW Hybrid', brand: 'Deye', type: '1-Phase' },
  { capacity: 6, label: 'Solis 6kW 1P', brand: 'Solis', type: '1-Phase' },
  { capacity: 8, label: 'Sungrow 8kW 1P', brand: 'Sungrow', type: '1-Phase' },
  { capacity: 10, label: 'Growatt MOD 10KTL3-X', brand: 'Growatt', type: '3-Phase' },
  { capacity: 12, label: 'Huawei SUN2000-12KTL-M2', brand: 'Huawei', type: '3-Phase' },
  { capacity: 15, label: 'Solis 15kW 3P', brand: 'Solis', type: '3-Phase' },
  { capacity: 20, label: 'SMA Sunny Tripower 20kW', brand: 'SMA', type: '3-Phase' },
  { capacity: 50, label: 'Huawei SUN2000-50KTL-M0', brand: 'Huawei', type: '3-Phase' },
];