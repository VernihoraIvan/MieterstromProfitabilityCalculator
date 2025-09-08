import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Zap, TrendingUp, Building, Home } from "lucide-react";
import {
  SOLAR_YIELD_PER_KWP,
  COST_PER_KWP,
  ELECTRICITY_PRICE,
  FEED_IN_TARIFF,
  INTERNAL_CONSUMPTION_RATE,
  FEED_IN_RATE,
  OM_COST_RATE,
} from "@/lib/constants";
import { CalculationInputs, CalculationResults, InputType } from "@/lib/types";

const MieterstromCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    systemInput: "",
    apartments: 1,
    annualDemand: 0,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const getInputType = (systemInput: string): InputType => {
    const input = systemInput.toLowerCase();
    if (input.includes("kwp") || input.includes("kw")) {
      return "systemSize";
    }
    if (
      input.includes("m²") ||
      input.includes("m2") ||
      /^\d+$/.test(input.trim())
    ) {
      return "roofSize";
    }
    return "address";
  };

  const inputType = getInputType(inputs.systemInput);

  // Calculate results
  useEffect(() => {
    if (!inputs.systemInput || inputs.annualDemand <= 0) {
      setResults(null);
      return;
    }

    let systemSizeKWp = 0;

    // Calculate system size based on input type
    if (inputType === "systemSize") {
      const match = inputs.systemInput.match(/(\d+(?:\.\d+)?)/);
      systemSizeKWp = match ? parseFloat(match[1]) : 0;
    } else if (inputType === "roofSize") {
      const match = inputs.systemInput.match(/(\d+(?:\.\d+)?)/);
      const roofSize = match ? parseFloat(match[1]) : 0;
      systemSizeKWp = roofSize / 5;
    } else {
      // For address, assume roof can accommodate 35% of annual demand
      systemSizeKWp = (inputs.annualDemand * 0.35) / SOLAR_YIELD_PER_KWP;
    }

    if (systemSizeKWp <= 0) {
      setResults(null);
      return;
    }

    // Perform calculations
    const totalInvestment = systemSizeKWp * COST_PER_KWP;
    const annualProduction = systemSizeKWp * SOLAR_YIELD_PER_KWP;
    const annualInternalRevenue =
      annualProduction * INTERNAL_CONSUMPTION_RATE * ELECTRICITY_PRICE;
    const annualFeedInRevenue =
      annualProduction * FEED_IN_RATE * FEED_IN_TARIFF;
    const totalAnnualRevenue = annualInternalRevenue + annualFeedInRevenue;
    const annualOMCost = totalInvestment * OM_COST_RATE;
    const annualProfit = totalAnnualRevenue - annualOMCost;
    const paybackPeriod = annualProfit > 0 ? totalInvestment / annualProfit : 0;
    const roi =
      totalInvestment > 0 ? (annualProfit / totalInvestment) * 100 : 0;
    console.log(roi, "roi");
    console.log(paybackPeriod, "paybackPeriod");
    console.log(systemSizeKWp, "systemSizeKWp");

    setResults({
      systemSizeKWp,
      totalInvestment,
      annualProduction,
      annualInternalRevenue,
      annualFeedInRevenue,
      totalAnnualRevenue,
      annualOMCost,
      annualProfit,
      paybackPeriod,
      roi,
    });
  }, [inputs, inputType]);

  const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-white mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Tenant Power Calculator
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Calculate the profitability of your tenant power project
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Form */}
          <Card
            className="shadow-2xl border-0"
            style={{ background: "var(--gradient-card)" }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <Calculator className="h-6 w-6 text-primary mr-2" />
                <CardTitle className="text-2xl">Enter Parameters</CardTitle>
              </div>
              <CardDescription>
                Enter your building details and electricity consumption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="systemInput" className="text-base font-medium">
                  Address, Roof Area (m²) or System Size (kWp)
                </Label>
                <Input
                  id="systemInput"
                  type="text"
                  placeholder="e.g. Main Street 1, 100 m² or 20 kWp"
                  value={inputs.systemInput}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      systemInput: e.target.value,
                    }))
                  }
                  className="mt-1 h-12 text-base"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  You entered:{" "}
                  {inputType === "address"
                    ? "Address"
                    : inputType === "roofSize"
                    ? "Roof Area"
                    : "System Size"}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="apartments"
                  className="text-base font-medium flex items-center"
                >
                  <Building className="h-4 w-4 mr-1" />
                  Number of Apartments
                </Label>
                <Input
                  id="apartments"
                  type="number"
                  min="1"
                  placeholder="Number of apartments in the building"
                  value={inputs.apartments}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      apartments: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="mt-1 h-12 text-base"
                />
              </div>

              <div>
                <Label
                  htmlFor="annualDemand"
                  className="text-base font-medium flex items-center"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Annual Electricity Demand (kWh/year)
                </Label>
                <Input
                  id="annualDemand"
                  type="number"
                  min="0"
                  placeholder="Total electricity consumption of the building"
                  value={inputs.annualDemand || ""}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      annualDemand: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 h-12 text-base"
                />
              </div>

              {/* Assumptions */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Assumptions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    • Solar yield: {formatNumber(SOLAR_YIELD_PER_KWP)}{" "}
                    kWh/kWp/year
                  </li>
                  <li>
                    • Electricity price for tenants:{" "}
                    {ELECTRICITY_PRICE.toFixed(2)} €/kWh
                  </li>
                  <li>
                    • Grid feed-in tariff: {FEED_IN_TARIFF.toFixed(2)} €/kWh
                  </li>
                  <li>
                    • Internal consumption:{" "}
                    {(INTERNAL_CONSUMPTION_RATE * 100).toFixed(0)}%
                  </li>
                  <li>• Grid feed-in: {(FEED_IN_RATE * 100).toFixed(0)}%</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card
            className="shadow-2xl border-0"
            style={{ background: "var(--gradient-card)" }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-accent mr-2" />
                <CardTitle className="text-2xl">Results</CardTitle>
              </div>
              <CardDescription>
                Economic analysis of your tenant power project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results.totalInvestment)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Investment Cost
                      </div>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">
                        {results.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Annual ROI
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">System Size:</span>
                      <span className="font-semibold">
                        {formatNumber(results.systemSizeKWp, 1)} kWp
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">
                        Annual Solar Production:
                      </span>
                      <span className="font-semibold">
                        {formatNumber(results.annualProduction)} kWh
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">Annual Revenue:</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(results.totalAnnualRevenue)}
                      </span>
                    </div>

                    <div className="ml-4 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          • Direct Marketing:
                        </span>
                        <span>
                          {formatCurrency(results.annualInternalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          • Grid Feed-in:
                        </span>
                        <span>
                          {formatCurrency(results.annualFeedInRevenue)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="font-medium">Annual O&M Costs:</span>
                      <span className="font-semibold text-destructive">
                        -{formatCurrency(results.annualOMCost)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b-2 border-primary/30">
                      <span className="font-bold text-lg">Annual Profit:</span>
                      <span className="font-bold text-lg text-primary">
                        {formatCurrency(results.annualProfit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Payback Period:</span>
                      <span className="font-semibold text-accent">
                        {results.paybackPeriod > 0
                          ? `${formatNumber(results.paybackPeriod, 1)} years`
                          : "Not profitable"}
                      </span>
                    </div>
                  </div>

                  {/* Profitability Indicator */}
                  <div
                    className={`p-4 rounded-lg text-center font-semibold ${
                      results.roi > 5
                        ? "bg-primary/20 text-primary"
                        : results.roi > 0
                        ? "bg-accent/20 text-accent"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {results.roi > 5
                      ? "✓ Highly Profitable"
                      : results.roi > 0
                      ? "○ Moderately Profitable"
                      : "✗ Not Profitable"}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    Enter your parameters to start the calculation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MieterstromCalculator;
