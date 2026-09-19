import React, { useState } from 'react';
import {
  AirfieldInvoice,
  AircraftMovement,
  FuelStorageTank,
  AirfieldFeeSchedule,
} from '../types/airfield';
import {
  Receipt,
  FileText,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  Mail,
  Search,
  Fuel,
  Plane,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  calculateFlightFees,
  getBaseLandingFee,
  generateInvoiceForMovement,
} from '../utils/feeCalculator';

interface BillingEngineViewProps {
  movements: AircraftMovement[];
  invoices: AirfieldInvoice[];
  fuelTanks: FuelStorageTank[];
  feeSchedule?: AirfieldFeeSchedule;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onGenerateInvoice: (movement: AircraftMovement) => void;
}

export const BillingEngineView: React.FC<BillingEngineViewProps> = ({
  movements,
  invoices,
  fuelTanks,
  feeSchedule,
  onMarkInvoicePaid,
  onGenerateInvoice,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<AirfieldInvoice | null>(
    invoices[0] || null
  );

  // Test MTOW calculator state
  const [testWeightKg, setTestWeightKg] = useState<number>(1150);
  const [testCircuits, setTestCircuits] = useState<number>(3);
  const [testFuelLiters, setTestFuelLiters] = useState<number>(50);

  // Derived Financial Summaries
  const totalBilledGbp = invoices.reduce((sum, inv) => sum + inv.totalGbp, 0);
  const totalPaidGbp = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalGbp, 0);
  const unbilledMovements = movements.filter((m) => m.billingStatus === 'UNBILLED');

  return (
    <div className="space-y-6 font-mono">
      {/* Financial Overview KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Total Revenue Logged Today
          </span>
          <span className="text-2xl font-bold text-zinc-950">
            £{totalBilledGbp.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">
            Landings, Fuel, Parking, VAT
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Paid & Settled
          </span>
          <span className="text-2xl font-bold text-zinc-950">
            £{totalPaidGbp.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">
            Card Terminal & Direct BACS
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Unbilled Flights Pending
          </span>
          <span className="text-2xl font-bold text-zinc-950">
            {unbilledMovements.length}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">
            Auto-generate invoice with 1-click
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            AVGAS Pump Price
          </span>
          <span className="text-2xl font-bold text-zinc-950">£2.18 / L</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">
            Jet A-1: £1.18 / L • UL91: £1.98 / L
          </span>
        </div>
      </div>

      {/* Two Column Grid: Pending Flights Billing & Interactive Weight Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Flight Movements Billing Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-zinc-800" />
                <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                  Automated Movement Fee Calculation & Billing Ledger
                </h3>
              </div>
              <span className="text-xs text-zinc-500">
                Auto-derived from CAA ATSU Movement Log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-wider">
                    <th className="pb-2">Callsign</th>
                    <th className="pb-2">Aircraft / MTOW</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Movement</th>
                    <th className="pb-2">Fuel Uplift</th>
                    <th className="pb-2 text-right">Computed Total</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {movements.map((mov) => {
                    const fee = calculateFlightFees(mov, feeSchedule);
                    const isUnbilled = mov.billingStatus === 'UNBILLED';

                    return (
                      <tr key={mov.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 font-bold text-zinc-950">{mov.callsign}</td>
                        <td className="py-3">
                          <div className="text-zinc-900 font-medium">{mov.aircraftType}</div>
                          <div className="text-[10px] text-zinc-500">{mov.mtowKg} kg MTOW</div>
                        </td>
                        <td className="py-3 text-zinc-600 text-[11px]">
                          {mov.category.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 text-zinc-700">
                          {mov.movementKind === 'TOUCH_AND_GO'
                            ? `T&G (${mov.touchAndGoCount}x)`
                            : mov.movementKind.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 text-zinc-950 font-bold">
                          {mov.fuelUpliftLiters > 0 ? `${mov.fuelUpliftLiters} L` : '—'}
                        </td>
                        <td className="py-3 text-right font-bold text-zinc-950 text-sm">
                          £{fee.totalGbp.toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {mov.billingStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {isUnbilled ? (
                            <button
                              onClick={() => onGenerateInvoice(mov)}
                              className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-medium transition-colors shadow-xs"
                            >
                              Issue Invoice
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const found = invoices.find((inv) => inv.callsign === mov.callsign);
                                if (found) setSelectedInvoice(found);
                              }}
                              className="text-[11px] text-zinc-800 hover:text-zinc-950 font-medium flex items-center gap-1 justify-end"
                            >
                              <span>View Invoice</span>
                              <ChevronRight className="w-3 h-3 text-zinc-500" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Airfield Standard Fee Matrix & Interactive Weight Tier Estimator */}
        <div className="space-y-6">
          {/* Interactive GA Landing Fee Estimator */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <DollarSign className="w-4 h-4 text-zinc-800" />
              <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Statutory GA Fee Tier Simulator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 mb-1">
                  Aircraft MTOW Weight: <strong className="text-zinc-950">{testWeightKg} kg</strong>
                </label>
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="50"
                  value={testWeightKg}
                  onChange={(e) => setTestWeightKg(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                  <span>450kg (Microlight)</span>
                  <span>1150kg (PA-28)</span>
                  <span>4740kg (PC-12)</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 mb-1">
                  Touch & Go Circuits: <strong className="text-zinc-950">{testCircuits}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={testCircuits}
                  onChange={(e) => setTestCircuits(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1">
                  AVGAS 100LL Uplift: <strong className="text-zinc-950">{testFuelLiters} Litres</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="10"
                  value={testFuelLiters}
                  onChange={(e) => setTestFuelLiters(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>

              {/* Instant Output Breakdown Box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Base Landing Fee:</span>
                  <span className="text-zinc-950 font-bold">
                    £{getBaseLandingFee(testWeightKg, feeSchedule).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Circuits ({testCircuits}x @ £{(feeSchedule?.circuitFee ?? 10.0).toFixed(2)}):</span>
                  <span className="text-zinc-950 font-bold">
                    £{(testCircuits * (feeSchedule?.circuitFee ?? 10.0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Fuel ({testFuelLiters}L @ £2.18):</span>
                  <span className="text-zinc-950 font-bold">
                    £{(testFuelLiters * 2.18).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>20% VAT (on landing & circuits):</span>
                  <span className="text-zinc-950 font-bold">
                    £{((getBaseLandingFee(testWeightKg) + testCircuits * 10) * 0.2).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm">
                  <span className="text-zinc-950">Total Calculated:</span>
                  <span className="text-zinc-950">
                    £{(
                      getBaseLandingFee(testWeightKg) +
                      testCircuits * 10 +
                      testFuelLiters * 2.18 +
                      (getBaseLandingFee(testWeightKg) + testCircuits * 10) * 0.2
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard UK GA Aerodrome Published Tariff Matrix */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-zinc-950 uppercase tracking-wider pb-2 border-b border-zinc-200">
              Published Tariff Schedule (EGMS)
            </h4>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">Microlight / VLA (&lt;450kg):</span>
              <span className="text-zinc-950 font-bold">£12.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">Sub-1000kg (C152, Robin):</span>
              <span className="text-zinc-950 font-bold">£18.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">1001 - 1500kg (PA-28, C172):</span>
              <span className="text-zinc-950 font-bold">£25.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">1501 - 2000kg (Cirrus SR22):</span>
              <span className="text-zinc-950 font-bold">£38.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">Touch & Go Circuit:</span>
              <span className="text-zinc-950 font-bold">£10.00 / circuit</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-600">Overnight Tie-Down (Grass):</span>
              <span className="text-zinc-950 font-bold">£16.00 / night</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-600">Overnight Hangarage (Secure):</span>
              <span className="text-zinc-950 font-bold">£45.00 / night</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Invoice Preview & Payment Settlement Card */}
      {selectedInvoice && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-800" />
                <h3 className="text-sm font-bold text-zinc-950 uppercase">
                  Official Aerodrome Invoice — {selectedInvoice.invoiceNumber}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {selectedInvoice.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Billed to: <strong>{selectedInvoice.pilotName}</strong> ({selectedInvoice.pilotEmail}) • Aircraft: {selectedInvoice.callsign} ({selectedInvoice.aircraftType})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                <span>Print Invoice</span>
              </button>

              {selectedInvoice.status !== 'PAID' && (
                <button
                  onClick={() => onMarkInvoicePaid(selectedInvoice.id)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Mark as Paid (Card Terminal / Cash)</span>
                </button>
              )}
            </div>
          </div>

          {/* Itemized Invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-wider">
                  <th className="pb-2">Service Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {selectedInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 text-zinc-800">{item.description}</td>
                    <td className="py-2.5 text-center text-zinc-500">{item.quantity}</td>
                    <td className="py-2.5 text-right text-zinc-600">
                      £{item.unitPriceGbp.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-zinc-950">
                      £{item.amountGbp.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & VAT Footer */}
          <div className="pt-3 border-t border-zinc-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="text-zinc-950 font-bold">
                  £{selectedInvoice.subtotalGbp.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>UK VAT (20% on non-fuel services):</span>
                <span className="text-zinc-950 font-bold">
                  £{selectedInvoice.vatGbp.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Total Due:</span>
                <span>£{selectedInvoice.totalGbp.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
