import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Budget | Proof of Corn",
  description: "Complete cost breakdown and revenue projections for AI-orchestrated corn farming.",
};

const expenses = [
  { item: "Domain (proofofcorn.com)", cost: 12.99, status: "paid", date: "Jan 22" },
  { item: "IoT Sensor Kit", cost: 300, status: "planned", date: "Feb" },
  { item: "Soil Testing", cost: 50, status: "planned", date: "Feb" },
  { item: "Land Lease (5 acres)", cost: 1370, status: "pending", date: "Mar" },
  { item: "Custom Operator", cost: 800, status: "pending", date: "Apr-Oct" },
];

const revenue = {
  yield: 1000, // bushels
  price: 4.0, // $/bushel
  total: 4000,
};

export default function BudgetPage() {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
  const paidExpenses = expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.cost, 0);
  const projectedProfit = revenue.total - totalExpenses;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-3 md:gap-6 text-xs md:text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/fred" className="hover:text-zinc-900 transition-colors">Fred</Link>
            <Link href="/budget" className="text-zinc-900">Budget</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Budget</h1>
          <p className="text-zinc-500 mb-12">Every dollar tracked, from domain to harvest.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white border border-zinc-200 rounded-lg p-4">
              <p className="text-sm text-zinc-500 mb-1">Total Investment</p>
              <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4">
              <p className="text-sm text-zinc-500 mb-1">Expected Revenue</p>
              <p className="text-2xl font-bold text-green-700">${revenue.total.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4">
              <p className="text-sm text-zinc-500 mb-1">Projected Profit</p>
              <p className={`text-2xl font-bold ${projectedProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ${projectedProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Expenses Table */}
          <h2 className="text-xl font-bold mb-4">Expenses</h2>
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden mb-12">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-500">Item</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-500">Timeline</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-zinc-500">Cost</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, i) => (
                  <tr key={i} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3">{expense.item}</td>
                    <td className="px-4 py-3 text-zinc-500">{expense.date}</td>
                    <td className="px-4 py-3 text-right font-mono">${expense.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        expense.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : expense.status === 'planned'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-zinc-50 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right font-mono">${totalExpenses.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-zinc-500">
                      ${paidExpenses.toFixed(2)} paid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Revenue Projection */}
          <h2 className="text-xl font-bold mb-4">Revenue Projection</h2>
          <div className="bg-white border border-zinc-200 rounded-lg p-6 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">{revenue.yield.toLocaleString()}</p>
                <p className="text-sm text-zinc-500">bushels expected</p>
                <p className="text-xs text-zinc-400 mt-1">200 bu/acre × 5 acres</p>
              </div>
              <div>
                <p className="text-3xl font-bold">${revenue.price.toFixed(2)}</p>
                <p className="text-sm text-zinc-500">per bushel</p>
                <p className="text-xs text-zinc-400 mt-1">2026 market estimate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">${revenue.total.toLocaleString()}</p>
                <p className="text-sm text-zinc-500">gross revenue</p>
                <p className="text-xs text-zinc-400 mt-1">October 2026</p>
              </div>
            </div>
          </div>

          {/* Break-even */}
          <h2 className="text-xl font-bold mb-4">Break-Even Analysis</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className="text-lg mb-2">
              <strong>Break-even yield:</strong> 621 bushels (124 bu/acre)
            </p>
            <p className="text-zinc-600">
              Iowa average is ~200 bu/acre. We need 62% of average to break even.
              Anything above that is profit for the case study.
            </p>
          </div>

          {/* Footer note */}
          <p className="text-sm text-zinc-500 mt-12 pt-8 border-t border-zinc-200">
            All projections based on{" "}
            <a href="https://www.extension.iastate.edu/agdm/crops/html/a1-20.html"
               className="text-amber-600 hover:underline"
               target="_blank" rel="noopener noreferrer">
              Iowa State University 2026 crop budget estimates
            </a>
            . Actual results will be documented in real-time.
          </p>
        </div>
      </main>
    </div>
  );
}
