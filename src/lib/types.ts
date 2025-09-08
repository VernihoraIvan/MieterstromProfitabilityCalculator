export interface CalculationInputs {
  systemInput: string; // Can be address, roof size, or system size
  inputType: "address" | "roofSize" | "systemSize";
  apartments: number;
  annualDemand: number;
}

export interface CalculationResults {
  systemSizeKWp: number;
  totalInvestment: number;
  annualProduction: number;
  annualInternalRevenue: number;
  annualFeedInRevenue: number;
  totalAnnualRevenue: number;
  annualOMCost: number;
  annualProfit: number;
  paybackPeriod: number;
  roi: number;
}
