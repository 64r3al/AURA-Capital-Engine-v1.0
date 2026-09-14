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
type Theme = 'modern' | 'feudal-japan' | 'sakura' | 'zen-garden';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};



// Animated counter hook
function useAnimatedValue(target: number, duration: number = 600) {
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
      const eased = 1 - Math.pow(1 - progress, 4);
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

function formatCurrency(amount: number, currency: Currency): string {
  return `${currencySymbols[currency]}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ===== THEME SWITCHER COMPONENT =====
function ThemeSwitcher({ currentTheme, onThemeChange }: { currentTheme: Theme; onThemeChange: (t: Theme) => void }) {
  const themes: { key: Theme; className: string; title: string }[] = [
    { key: 'modern', className: 'theme-btn-modern', title: 'Modern Dark' },
    { key: 'feudal-japan', className: 'theme-btn-japan', title: 'Feudal Japan' },
    { key: 'sakura', className: 'theme-btn-sakura', title: 'Sakura' },
    { key: 'zen-garden', className: 'theme-btn-zen', title: 'Zen Garden' },
  ];

  return (
    <div className="theme-switcher">
      {themes.map((t) => (
        <button
          key={t.key}
          className={`theme-btn ${t.className} ${currentTheme === t.key ? 'active' : ''}`}
          onClick={() => onThemeChange(t.key)}
          title={t.title}
        />
      ))}
    </div>
  );
}

// ===== KPI CARD COMPONENT =====
function KPICard({
  title,
  value,
  currency,
  icon,
  color,
  delay,
  subtitle,
  isFeudal,
}: {
  title: string;
  value: number;
  currency: Currency;
  icon: string;
  color: string;
  delay: string;
  subtitle?: string;
  isFeudal?: boolean;
}) {
  const animatedValue = useAnimatedValue(value);

  const iconBg: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  const glowClass: Record<string, string> = {
    emerald: 'neon-glow-emerald',
    indigo: 'neon-glow-indigo',
    cyan: 'neon-glow-cyan',
    amber: 'neon-glow-amber',
  };

  return (
    <div className={`glass-card p-6 md:p-8 animate-fade-in-up ${delay} opacity-0 ${glowClass[color]}`}>
      <div className="flex items-center mb-6">
        <div className={`p-4 rounded-xl ${iconBg[color]} mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className={`text-lg font-medium ${isFeudal ? 'font-jp' : ''}`}>{title}</h3>
      </div>
      <p className="text-3xl md:text-4xl font-bold font-mono-numbers animate-count-up">
        {formatCurrency(animatedValue, currency)}
      </p>
      {subtitle && (
        <p className="text-sm mt-3 opacity-50">{subtitle}</p>
      )}
    </div>
  );
}



// ===== AI INSIGHTS BANNER =====
function AIInsightsBanner({
  allocation,
  income,
  totalSpent,
  lifestyleBudget,
  isFeudal,
}: {
  allocation: Allocation;
  income: number;
  totalSpent: number;
  lifestyleBudget: number;
  isFeudal?: boolean;
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
    success: 'border-emerald-500',
    warning: 'border-amber-500',
    info: 'border-indigo-500',
  };
  const iconColors = {
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-indigo-500/10 text-indigo-400',
  };

  return (
    <div className={`glass-card p-6 md:p-8 insight-card animate-fade-in-up delay-600 opacity-0`} style={{ borderLeftColor: insight.type === 'success' ? 'var(--accent-emerald)' : insight.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-indigo)' }}>
      <div className="flex items-start gap-5">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColors[insight.type]} animate-pulse-glow`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <path d="M10 21h4"/>
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h4 className={`text-xl font-semibold mb-2 flex items-center gap-3 ${isFeudal ? 'font-jp' : ''}`}>
            AI Heuristic Insights
            <span className="text-[10px] px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wider font-medium">Live</span>
          </h4>
          <p className="text-lg leading-relaxed opacity-80">{insight.text}</p>
        </div>
      </div>
    </div>
  );
}

// ===== TRANSACTION FORM =====
function TransactionForm({
  onAdd,
  currency,
  isFeudal,
}: {
  onAdd: (title: string, amount: number, category: 'Needs' | 'Wants' | 'Savings') => void;
  currency: Currency;
  isFeudal?: boolean;
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
    <div className="glass-card p-6 md:p-8 animate-fade-in-up delay-300 opacity-0">
      <h3 className={`text-xl font-medium mb-6 flex items-center gap-3 ${isFeudal ? 'font-jp' : ''}`}>
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        Add New Expense
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Expense Title</label>
          <input
            type="text"
            placeholder="Dinner, Groceries..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 input-glow transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono-numbers">
              {currencySymbols[currency]}
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-base text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 input-glow transition-all font-mono-numbers"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'Needs' | 'Wants' | 'Savings')}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-emerald-500/50 input-glow transition-all appearance-none cursor-pointer"
          >
            <option value="Needs" className="bg-gray-900">Needs</option>
            <option value="Wants" className="bg-gray-900">Wants</option>
            <option value="Savings" className="bg-gray-900">Savings</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
}

// ===== SPENDING SUMMARY =====
function SpendingSummary({
  lifestyleBudget,
  wantsSpent,
  currency,
  isFeudal,
}: {
  lifestyleBudget: number;
  wantsSpent: number;
  currency: Currency;
  isFeudal?: boolean;
}) {
  const progress = lifestyleBudget > 0 ? Math.min(100, (wantsSpent / lifestyleBudget) * 100) : 0;
  const isOverBudget = wantsSpent > lifestyleBudget;

  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in-up delay-400 opacity-0">
      <h3 className={`text-xl font-medium mb-6 flex items-center gap-3 ${isFeudal ? 'font-jp' : ''}`}>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10"/>
            <path d="M18 20V4"/>
            <path d="M6 20v-4"/>
          </svg>
        </div>
        Spending Summary
      </h3>
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="opacity-60">Lifestyle Budget Utilized</span>
          <span className="font-mono-numbers">
            <span>{formatCurrency(wantsSpent, currency)}</span>
            <span className="opacity-50"> / </span>
            <span>{formatCurrency(lifestyleBudget, currency)}</span>
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : ''}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-2 opacity-50">
          <span>0%</span>
          <span className="font-mono-numbers">{progress.toFixed(1)}%</span>
        </div>
      </div>

      {isOverBudget && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>You've exceeded your lifestyle budget!</span>
        </div>
      )}
      {!isOverBudget && progress >= 80 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>You've used {progress.toFixed(1)}% of your lifestyle budget!</span>
        </div>
      )}
    </div>
  );
}

// ===== TRANSACTION LEDGER =====
function TransactionLedger({
  transactions,
  onDelete,
  currency,
  isFeudal,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: Currency;
  isFeudal?: boolean;
}) {
  const badgeStyles = {
    Needs: 'badge-needs',
    Wants: 'badge-wants',
    Savings: 'badge-savings',
  };

  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in-up delay-400 opacity-0">
      <h3 className={`text-xl font-medium mb-6 flex items-center gap-3 ${isFeudal ? 'font-jp' : ''}`}>
        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        Recent Transactions
        <span className="ml-auto text-sm font-mono-numbers opacity-40">{transactions.length} entries</span>
      </h3>
      {transactions.length === 0 ? (
        <div className="text-center py-12 opacity-40">
          <p className="text-lg">No transactions yet</p>
          <p className="text-sm mt-2">Add your first expense above</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {transactions.map((tx, idx) => (
            <div
              key={tx.id}
              className="transaction-row flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 animate-slide-in-right"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className={`text-[11px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold ${badgeStyles[tx.category]}`}>
                  {tx.category}
                </span>
                <span className="text-base truncate">{tx.title}</span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-mono-numbers text-base font-medium">
                  -{formatCurrency(tx.amount, currency)}
                </span>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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

// ===== MAIN APP =====
export default function App() {
  const [income, setIncome] = useState<string>('5000');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [allocation, setAllocation] = useState<Allocation>({ needs: 50, lifestyle: 30, wealth: 20 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<Theme>('modern');

  const numericIncome = parseFloat(income) || 0;
  const needsBudget = numericIncome * (allocation.needs / 100);
  const lifestyleBudget = numericIncome * (allocation.lifestyle / 100);
  const wealthBudget = numericIncome * (allocation.wealth / 100);
  const dailySafeToSpend = lifestyleBudget / 30;

  const wantsSpent = transactions
    .filter((t) => t.category === 'Wants')
    .reduce((sum, t) => sum + t.amount, 0);

  const isFeudal = theme === 'feudal-japan';

  // Apply theme to document
  useEffect(() => {
    if (theme === 'modern') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleAllocationChange = (key: keyof Allocation, value: number) => {
    const newAllocation = { ...allocation, [key]: value };
    const total = newAllocation.needs + newAllocation.lifestyle + newAllocation.wealth;
    if (total !== 100) {
      const diff = total - 100;
      const otherKeys = (Object.keys(newAllocation) as (keyof Allocation)[]).filter((k) => k !== key);
      const otherTotal = otherKeys.reduce((s, k) => s + newAllocation[k], 0);
      if (otherTotal > 0) {
        otherKeys.forEach((k) => {
          const proportion = newAllocation[k] / otherTotal;
          newAllocation[k] = Math.max(0, Math.round(newAllocation[k] - diff * proportion));
        });
      }
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
    <div className="min-h-screen bg-[#08090E] bg-gradient-hero relative overflow-x-hidden transition-colors duration-500">
      {/* Theme Switcher */}
      <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />

      {/* Decorative Elements for Feudal Japan */}
      {isFeudal && (
        <>
          <div className="decorative-circle" style={{ width: 400, height: 400, top: -150, right: -150 }}></div>
          <div className="decorative-circle" style={{ width: 250, height: 250, bottom: -80, left: -80 }}></div>
        </>
      )}

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-30" style={{ background: 'var(--accent-indigo)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20" style={{ background: 'var(--accent-emerald)' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-15" style={{ background: 'var(--accent-cyan)' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-16 text-center animate-fade-in-up relative">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-float" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-4 gradient-text ${isFeudal ? 'font-jp' : ''}`}>
            AURA // Capital Engine
          </h1>
          <p className="text-lg opacity-50 max-w-2xl mx-auto">
            Intelligent capital allocation system with real-time insights and visual analytics
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm opacity-40">Live System</span>
          </div>
        </header>

        {/* Hero Income Input */}
        <section className="mb-16 animate-fade-in-up">
          <div className="glass-card p-8 md:p-10 relative overflow-hidden">
            {isFeudal && <div className="japan-pattern"></div>}
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <h2 className={`text-3xl font-semibold mb-8 ${isFeudal ? 'font-jp' : ''}`}>Monthly Net Income</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                <div className="relative flex-1 w-full max-w-md">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-mono-numbers opacity-40">
                    {currencySymbols[currency]}
                  </span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/30 border-2 border-white/10 rounded-2xl pl-14 pr-6 py-5 text-3xl md:text-4xl font-mono-numbers font-bold text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 input-glow transition-all"
                  />
                </div>
                <div className="flex gap-1 p-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                  {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        currency === c
                          ? 'text-white shadow-lg'
                          : 'opacity-50 hover:opacity-80 hover:bg-white/5'
                      }`}
                      style={currency === c ? { background: 'var(--accent-indigo)', boxShadow: '0 0 15px rgba(99,102,241,0.3)' } : {}}
                    >
                      {currencySymbols[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-sm opacity-40">All calculations update in real-time as you type</p>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <KPICard
            title="Gross Monthly"
            value={numericIncome}
            currency={currency}
            icon="💰"
            color="emerald"
            delay="delay-100"
            isFeudal={isFeudal}
          />
          <KPICard
            title="Fixed Commitments"
            value={needsBudget}
            currency={currency}
            icon="🏠"
            color="amber"
            delay="delay-200"
            subtitle={`${allocation.needs}% of income`}
            isFeudal={isFeudal}
          />
          <KPICard
            title="Daily Safe-to-Spend"
            value={dailySafeToSpend}
            currency={currency}
            icon="⚡"
            color="indigo"
            delay="delay-300"
            subtitle="Based on 30-day month"
            isFeudal={isFeudal}
          />
          <KPICard
            title="Wealth Building"
            value={wealthBudget}
            currency={currency}
            icon="📈"
            color="cyan"
            delay="delay-400"
            subtitle={`${allocation.wealth}% allocated`}
            isFeudal={isFeudal}
          />
        </section>

        {/* Allocation Controls */}
        <section className="mb-16 animate-fade-in-up delay-300 opacity-0">
          <div className="glass-card p-8 md:p-10">
            <h2 className={`text-2xl font-semibold mb-8 text-center ${isFeudal ? 'font-jp' : ''}`}>Capital Allocation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {[
                { key: 'needs' as keyof Allocation, label: 'Essential Needs', color: 'emerald', desc: 'Housing, utilities, groceries' },
                { key: 'lifestyle' as keyof Allocation, label: 'Lifestyle & Liquidity', color: 'amber', desc: 'Discretionary safe-to-spend' },
                { key: 'wealth' as keyof Allocation, label: 'Wealth Building', color: 'cyan', desc: 'Investments, emergency fund' },
              ].map((item) => (
                <div key={item.key} className="text-center p-6 rounded-2xl bg-black/20 hover:bg-black/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium text-lg`} style={{ color: `var(--accent-${item.color})` }}>{item.label}</span>
                    <span className="font-mono-numbers font-bold text-2xl" style={{ color: `var(--accent-${item.color})` }}>
                      {allocation[item.key]}%
                    </span>
                  </div>
                  <div className="mb-4">
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={allocation[item.key]}
                      onChange={(e) => handleAllocationChange(item.key, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <p className="text-sm opacity-50">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Allocation Bar */}
            <div>
              <h3 className={`text-xl font-medium mb-6 ${isFeudal ? 'font-jp' : ''}`}>Allocation Visualization</h3>
              <div className="allocation-bar mb-6">
                {[
                  { key: 'needs', label: 'Essential Needs', pct: allocation.needs, color: 'var(--accent-emerald)' },
                  { key: 'lifestyle', label: 'Lifestyle', pct: allocation.lifestyle, color: 'var(--accent-amber)' },
                  { key: 'wealth', label: 'Wealth Building', pct: allocation.wealth, color: 'var(--accent-cyan)' },
                ].map((seg) => (
                  <div
                    key={seg.key}
                    className="allocation-segment flex items-center justify-center text-sm font-bold text-white cursor-pointer group"
                    style={{ width: `${seg.pct}%`, background: seg.color }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50" style={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="font-semibold">{seg.label}</div>
                      <div className="font-mono-numbers opacity-70">
                        {formatCurrency(numericIncome * (seg.pct / 100), currency)} ({seg.pct}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  { label: 'Essential Needs', color: 'var(--accent-emerald)', pct: allocation.needs },
                  { label: 'Lifestyle & Liquidity', color: 'var(--accent-amber)', pct: allocation.lifestyle },
                  { label: 'Wealth Building', color: 'var(--accent-cyan)', pct: allocation.wealth },
                ].map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: seg.color }}></div>
                    <span className="text-sm opacity-70">{seg.label}</span>
                    <span className="text-sm font-mono-numbers font-bold">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Transaction Form & Summary */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <TransactionForm onAdd={addTransaction} currency={currency} isFeudal={isFeudal} />
          <SpendingSummary
            lifestyleBudget={lifestyleBudget}
            wantsSpent={wantsSpent}
            currency={currency}
            isFeudal={isFeudal}
          />
        </section>

        {/* Transaction Ledger & AI Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <TransactionLedger
            transactions={transactions}
            onDelete={deleteTransaction}
            currency={currency}
            isFeudal={isFeudal}
          />
          <AIInsightsBanner
            allocation={allocation}
            income={numericIncome}
            totalSpent={wantsSpent}
            lifestyleBudget={lifestyleBudget}
            isFeudal={isFeudal}
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t opacity-30 animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm">
            AURA // Capital Engine — Real-Time Financial Intelligence System
          </p>
          <p className="text-xs mt-2 opacity-60">
            All calculations are heuristic estimates. Not financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
