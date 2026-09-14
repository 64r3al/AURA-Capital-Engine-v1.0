import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: 'Needs' | 'Wants' | 'Savings';
  timestamp: Date;
}

interface Allocation {
  needs: number;
  lifestyle: number;
  wealth: number;
}

type Currency = 'USD' | 'EUR' | 'GBP';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Utility: animated counter hook
function useAnimatedValue(target: number, duration: number = 500) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number>(0);
  const currentRef = useRef(target);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const startValue = currentRef.current;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;
      currentRef.current = current;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

// Format currency
function formatCurrency(amount: number, currency: Currency): string {
  return `${currencySymbols[currency]}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// KPI Card Component
function KPICard({
  title,
  value,
  currency,
  icon,
  color,
  delay,
  subtitle,
}: {
  title: string;
  value: number;
  currency: Currency;
  icon: string;
  color: string;
  delay: string;
  subtitle?: string;
}) {
  const animatedValue = useAnimatedValue(value);
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 neon-text-emerald border-emerald-500/20 hover:border-emerald-500/40',
    indigo: 'text-indigo-400 neon-text-indigo border-indigo-500/20 hover:border-indigo-500/40',
    cyan: 'text-cyan-400 neon-text-cyan border-cyan-500/20 hover:border-cyan-500/40',
    amber: 'text-amber-400 neon-text-amber border-amber-500/20 hover:border-amber-500/40',
  };

  const glowClasses: Record<string, string> = {
    emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    indigo: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    amber: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  };

  return (
    <div
      className={`glass-card p-5 md:p-6 animate-fade-in-up ${delay} opacity-0 ${colorClasses[color]} ${glowClasses[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-white/50">
          {title}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="font-mono-numbers text-2xl md:text-3xl font-bold text-white mb-1 animate-count-up">
        {formatCurrency(animatedValue, currency)}
      </div>
      {subtitle && (
        <span className="text-xs text-white/40">{subtitle}</span>
      )}
    </div>
  );
}

// Progress Bar Segment
function AllocationBar({
  allocation,
  income,
  currency,
}: {
  allocation: Allocation;
  income: number;
  currency: Currency;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const segments = [
    { key: 'needs', label: 'Essential Needs', pct: allocation.needs, color: 'bg-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
    { key: 'lifestyle', label: 'Lifestyle & Liquidity', pct: allocation.lifestyle, color: 'bg-indigo-500', glow: 'shadow-[0_0_10px_rgba(99,102,241,0.5)]' },
    { key: 'wealth', label: 'Wealth Building', pct: allocation.wealth, color: 'bg-cyan-500', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
  ];

  return (
    <div className="glass-card p-5 md:p-6 animate-fade-in-up delay-500 opacity-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
        Capital Allocation Breakdown
      </h3>
      <div className="flex h-8 rounded-full overflow-hidden bg-white/5 mb-4">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`relative ${seg.color} transition-all duration-700 ease-out animate-progress-fill ${hovered === seg.key ? seg.glow : ''} cursor-pointer`}
            style={{ width: `${seg.pct}%` }}
            onMouseEnter={() => setHovered(seg.key)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === seg.key && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-xs whitespace-nowrap z-50 animate-fade-in">
                <div className="text-white font-semibold">{seg.label}</div>
                <div className="font-mono-numbers text-white/70">
                  {formatCurrency(income * (seg.pct / 100), currency)} ({seg.pct}%)
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-white/10 rotate-45 -mt-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${seg.color}`}></div>
            <span className="text-xs text-white/60">{seg.label}</span>
            <span className="text-xs font-mono-numbers text-white/80">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Insights Banner
function AIInsightsBanner({
  allocation,
  income,
  totalSpent,
  lifestyleBudget,
}: {
  allocation: Allocation;
  income: number;
  totalSpent: number;
  lifestyleBudget: number;
}) {
  const remaining = lifestyleBudget - totalSpent;
  const savingsRate = allocation.wealth;

  const getInsight = (): { text: string; type: 'success' | 'warning' | 'info' } => {
    if (income === 0) return { text: 'Enter your monthly income to activate the Capital Engine and receive personalized financial insights.', type: 'info' };
    if (remaining < 0) return { text: `⚠️ Critical: You've exceeded your lifestyle budget by ${formatCurrency(Math.abs(remaining), 'USD')}. Consider reducing discretionary spending or reallocating funds.`, type: 'warning' };
    if (remaining < lifestyleBudget * 0.2) return { text: `Caution: Only ${((remaining / lifestyleBudget) * 100).toFixed(0)}% of your discretionary budget remains. Pace your spending for the rest of the month.`, type: 'warning' };
    if (savingsRate >= 25) return { text: `Excellent! You're allocating ${savingsRate}% to wealth building — above the recommended 20%. Your future self will thank you.`, type: 'success' };
    if (savingsRate < 15) return { text: `Consider increasing your wealth allocation above 20%. Even small increments compound significantly over time.`, type: 'info' };
    return { text: `Your capital is well-balanced. You have ${formatCurrency(remaining, 'USD')} in discretionary funds and ${savingsRate}% flowing to wealth building.`, type: 'success' };
  };

  const insight = getInsight();
  const borderColors = {
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    info: 'border-indigo-500/30',
  };
  const iconColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
  };

  return (
    <div className={`glass-card p-5 md:p-6 animate-fade-in-up delay-600 opacity-0 border ${borderColors[insight.type]}`}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${iconColors[insight.type]}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <path d="M10 21h4"/>
            </svg>
          </div>
          <div className={`absolute inset-0 rounded-full animate-pulse-ring ${insight.type === 'warning' ? 'bg-amber-500/20' : insight.type === 'success' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}></div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-1 flex items-center gap-2">
            AI Heuristic Insights
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">Live</span>
          </h4>
          <p className="text-sm text-white/60 leading-relaxed">{insight.text}</p>
        </div>
      </div>
    </div>
  );
}

// Transaction Form
function TransactionForm({
  onAdd,
  currency,
}: {
  onAdd: (title: string, amount: number, category: 'Needs' | 'Wants' | 'Savings') => void;
  currency: Currency;
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Needs' | 'Wants' | 'Savings'>('Wants');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;
    onAdd(title.trim(), parseFloat(amount), category);
    setTitle('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 md:p-6 animate-fade-in-up delay-300 opacity-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Quick Transaction
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Description..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 input-glow transition-all"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono-numbers">
            {currencySymbols[currency]}
          </span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 input-glow transition-all font-mono-numbers"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'Needs' | 'Wants' | 'Savings')}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 input-glow transition-all appearance-none cursor-pointer"
          >
            <option value="Needs" className="bg-gray-900">Needs</option>
            <option value="Wants" className="bg-gray-900">Wants</option>
            <option value="Savings" className="bg-gray-900">Savings</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

// Transaction Ledger
function TransactionLedger({
  transactions,
  onDelete,
  currency,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: Currency;
}) {
  const categoryStyles = {
    Needs: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    Wants: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    Savings: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="glass-card p-5 md:p-6 animate-fade-in-up delay-400 opacity-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Transaction Ledger
        <span className="ml-auto text-xs text-white/40 font-mono-numbers">{transactions.length} entries</span>
      </h3>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">
          No transactions recorded yet. Add your first expense above.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {transactions.map((tx, idx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-all animate-slide-in-right"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-medium ${categoryStyles[tx.category]}`}>
                  {tx.category}
                </span>
                <span className="text-sm text-white/80 truncate">{tx.title}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono-numbers text-sm text-white/90">
                  -{formatCurrency(tx.amount, currency)}
                </span>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main App
export default function App() {
  const [income, setIncome] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [allocation, setAllocation] = useState<Allocation>({ needs: 50, lifestyle: 30, wealth: 20 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const numericIncome = parseFloat(income) || 0;
  const needsBudget = numericIncome * (allocation.needs / 100);
  const lifestyleBudget = numericIncome * (allocation.lifestyle / 100);
  const wealthBudget = numericIncome * (allocation.wealth / 100);
  const dailySafeToSpend = lifestyleBudget / 30;

  const wantsSpent = transactions
    .filter((t) => t.category === 'Wants')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const isOverBudget = wantsSpent > lifestyleBudget;

  const handleAllocationChange = (key: keyof Allocation, value: number) => {
    const newAllocation = { ...allocation, [key]: value };
    // Auto-adjust others to maintain 100%
    const total = newAllocation.needs + newAllocation.lifestyle + newAllocation.wealth;
    if (total !== 100) {
      const diff = total - 100;
      const otherKeys = (Object.keys(newAllocation) as (keyof Allocation)[]).filter((k) => k !== key);
      // Distribute the difference proportionally
      const otherTotal = otherKeys.reduce((s, k) => s + newAllocation[k], 0);
      if (otherTotal > 0) {
        otherKeys.forEach((k) => {
          const proportion = newAllocation[k] / otherTotal;
          newAllocation[k] = Math.max(0, Math.round(newAllocation[k] - diff * proportion));
        });
      }
      // Fix rounding
      const newTotal = newAllocation.needs + newAllocation.lifestyle + newAllocation.wealth;
      if (newTotal !== 100) {
        newAllocation[otherKeys[0]] += 100 - newTotal;
      }
    }
    setAllocation(newAllocation);
  };

  const addTransaction = useCallback((title: string, amount: number, category: 'Needs' | 'Wants' | 'Savings') => {
    const tx: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title,
      amount,
      category,
      timestamp: new Date(),
    };
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-[#08090E] bg-gradient-hero relative overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/[0.02] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                AURA <span className="text-white/30">//</span> <span className="text-indigo-400">Capital Engine</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Real-Time Financial Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Live</span>
            </div>
          </div>
        </header>

        {/* Hero Income Input */}
        <section className="mb-10 animate-fade-in-up">
          <div className="glass-card p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
            <div className="relative">
              <label className="block text-xs font-medium uppercase tracking-wider text-white/50 mb-3">
                Monthly Net Income
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono-numbers text-white/40">
                    {currencySymbols[currency]}
                  </span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-6 py-4 text-3xl md:text-4xl font-mono-numbers font-bold text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 input-glow transition-all"
                  />
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                  {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        currency === c
                          ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      {currencySymbols[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Gross Monthly Inflow"
            value={numericIncome}
            currency={currency}
            icon="💰"
            color="emerald"
            delay="delay-100"
          />
          <KPICard
            title="Fixed Commitments"
            value={needsBudget}
            currency={currency}
            icon="🏠"
            color="amber"
            delay="delay-200"
            subtitle={`${allocation.needs}% of income`}
          />
          <KPICard
            title="Daily Safe-to-Spend"
            value={dailySafeToSpend}
            currency={currency}
            icon="⚡"
            color="indigo"
            delay="delay-300"
            subtitle="Based on 30-day month"
          />
          <KPICard
            title="Wealth Accumulation"
            value={wealthBudget}
            currency={currency}
            icon="📈"
            color="cyan"
            delay="delay-400"
            subtitle={`${allocation.wealth}% allocated`}
          />
        </section>

        {/* Over Budget Warning */}
        {isOverBudget && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-300">Budget Threshold Exceeded</p>
              <p className="text-xs text-red-400/70">
                Discretionary spending exceeds your {allocation.lifestyle}% lifestyle allocation by{' '}
                <span className="font-mono-numbers">{formatCurrency(wantsSpent - lifestyleBudget, currency)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Allocation Controls & Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Sliders */}
          <div className="glass-card p-5 md:p-6 animate-fade-in-up delay-300 opacity-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-5">
              Allocation Parameters
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-emerald-400 font-medium">Essential Needs</label>
                  <span className="font-mono-numbers text-sm text-white/80">{allocation.needs}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={allocation.needs}
                  onChange={(e) => handleAllocationChange('needs', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-indigo-400 font-medium">Lifestyle & Liquidity</label>
                  <span className="font-mono-numbers text-sm text-white/80">{allocation.lifestyle}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={allocation.lifestyle}
                  onChange={(e) => handleAllocationChange('lifestyle', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-cyan-400 font-medium">Wealth Building</label>
                  <span className="font-mono-numbers text-sm text-white/80">{allocation.wealth}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={allocation.wealth}
                  onChange={(e) => handleAllocationChange('wealth', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Total Allocation</span>
                  <span className={`font-mono-numbers font-medium ${allocation.needs + allocation.lifestyle + allocation.wealth === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {allocation.needs + allocation.lifestyle + allocation.wealth}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Bar - spans 2 cols on large */}
          <div className="lg:col-span-2">
            <AllocationBar allocation={allocation} income={numericIncome} currency={currency} />
          </div>
        </section>

        {/* Transaction Form */}
        <section className="mb-6">
          <TransactionForm onAdd={addTransaction} currency={currency} />
        </section>

        {/* Transaction Ledger & AI Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <TransactionLedger
            transactions={transactions}
            onDelete={deleteTransaction}
            currency={currency}
          />
          <div className="flex flex-col gap-4">
            <AIInsightsBanner
              allocation={allocation}
              income={numericIncome}
              totalSpent={wantsSpent}
              lifestyleBudget={lifestyleBudget}
            />
            {/* Spending Summary Card */}
            <div className="glass-card p-5 md:p-6 animate-fade-in-up delay-600 opacity-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M12 20V10"/>
                  <path d="M18 20V4"/>
                  <path d="M6 20v-4"/>
                </svg>
                Spending Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Total Discretionary Budget</span>
                  <span className="font-mono-numbers text-sm text-white/80">{formatCurrency(lifestyleBudget, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Discretionary Spent</span>
                  <span className={`font-mono-numbers text-sm ${isOverBudget ? 'text-red-400' : 'text-white/80'}`}>
                    {formatCurrency(wantsSpent, currency)}
                  </span>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Remaining</span>
                  <span className={`font-mono-numbers text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.max(0, lifestyleBudget - wantsSpent), currency)}
                  </span>
                </div>
                {/* Mini progress */}
                <div className="mt-2">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isOverBudget ? 'bg-red-500' : wantsSpent > lifestyleBudget * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (wantsSpent / lifestyleBudget) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/30">0%</span>
                    <span className="text-[10px] text-white/30 font-mono-numbers">
                      {lifestyleBudget > 0 ? Math.min(100, Math.round((wantsSpent / lifestyleBudget) * 100)) : 0}% used
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-white/5 animate-fade-in">
          <p className="text-xs text-white/20">
            AURA // Capital Engine — Real-Time Financial Intelligence System
          </p>
          <p className="text-[10px] text-white/10 mt-1">
            All calculations are heuristic estimates. Not financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
