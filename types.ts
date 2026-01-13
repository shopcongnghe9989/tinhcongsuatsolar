export interface Appliance {
  id: string;
  name: string;
  category: string;
  defaultWatts: number;
  imageSeed: string;
}

export interface SelectedAppliance extends Appliance {
  quantity: number;
  hoursPerDay: number;
  watts: number; // User editable wattage
}

export interface SolarConfig {
  peakSunHours: number; // Average sun hours per day (e.g., 4.5 for South Vietnam)
  panelWattage: number; // Wattage of a single panel (e.g., 450W, 550W)
  systemEfficiency: number; // Usually 0.75 - 0.85
}

export interface Inverter {
  capacity: number; // kW
  label: string;
  brand: string;
  type: '1-Phase' | '3-Phase';
}

export interface CalculationResult {
  totalDailyConsumptionWh: number;
  monthlyConsumptionKWh: number;
  requiredSystemSizeKWp: number;
  numberOfPanels: number;
  estimatedDailyProductionKWh: number;
  recommendedInverter: Inverter | null;
}