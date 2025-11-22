'use client';

import './dashboard.css';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

function formatCurrency(value) {
  if (isNaN(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
}

function getMonthYear(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { userId, isSignedIn } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState('EXPENSE'); // EXPENSE | INCOME
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // Fetch transactions
  useEffect(() => {
    if (!isSignedIn || !userId) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/transactions?userId=${encodeURIComponent(userId)}`
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error('Failed to load transactions:', data);
          setError('Failed to load transactions');
          setTransactions([]);
          return;
        }

        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isSignedIn, userId]);

  // Derived stats
  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'INCOME') {
        acc.income += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        acc.expense += tx.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const netBalance = totals.income - totals.expense;

  const currentMonthLabel =
    transactions[0]?.date ? getMonthYear(transactions[0].date) : getMonthYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn || !userId) {
      setError('You must be signed in to add a transaction.');
      return;
    }
    if (!amount || !category) {
      setError('Amount and category are required.');
      return;
    }

    try {
      setError(null);

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          type: mode,
          category,
          description: description || null,
          date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to create transaction:', data);
        setError(data.error || 'Failed to create transaction');
        return;
      }

      // Add new transaction at top
      setTransactions((prev) => [data, ...prev]);

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setMode('EXPENSE');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Failed to create transaction');
    }
  };

  if (!isSignedIn) {
    return (
      <main className="dash-shell">
        <div className="dash-card dash-card-center">
          <h1 className="dash-title">Welcome to MoneyTracker ✨</h1>
          <p className="dash-subtitle">
            Please sign in to see your dashboard and track your beautiful little
            budget.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dash-shell">
      {/* Hero */}
      <section className="dash-hero">
        <div>
          <p className="dash-eyebrow">Welcome back, bestie 💌</p>
          <h1 className="dash-title">Let&apos;s romanticize your finances</h1>
          <p className="dash-subtitle">
            Track expenses, celebrate your wins, and keep future-you stress
            free.
          </p>
        </div>
        <div className="dash-hero-pill">
          <span>Month</span>
          <strong>{currentMonthLabel}</strong>
        </div>
      </section>

      {/* Top summary bar */}
      <section className="dash-top-summary">
        <div className="summary-chip income">
          Income: <span>{formatCurrency(totals.income)}</span>
        </div>
        <div className="summary-chip expense">
          Expenses: <span>{formatCurrency(totals.expense)}</span>
        </div>
        <div className="summary-chip balance">
          Balance: <span>{formatCurrency(netBalance)}</span>
        </div>
      </section>

      {/* Tabs */}
      <nav className="dash-tabs">
        {['overview', 'transactions', 'categories', 'budgets'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'transactions' && 'Transactions'}
            {tab === 'categories' && 'Categories'}
            {tab === 'budgets' && 'Budgets'}
          </button>
        ))}
      </nav>

      {/* Content for tabs */}
      {activeTab === 'overview' && (
        <section className="dash-grid">
          <div className="dash-card">
            <h2 className="card-title">Monthly Summary</h2>
            <p className="card-caption">{currentMonthLabel}</p>
            <div className="summary-grid">
              <div className="summary-card income">
                <span className="summary-label">Total Income</span>
                <span className="summary-value">
                  {formatCurrency(totals.income)}
                </span>
              </div>
              <div className="summary-card expense">
                <span className="summary-label">Total Expenses</span>
                <span className="summary-value">
                  {formatCurrency(totals.expense)}
                </span>
              </div>
              <div className="summary-card balance">
                <span className="summary-label">Net Balance</span>
                <span className="summary-value">
                  {formatCurrency(netBalance)}
                </span>
              </div>
              <div className="summary-card transactions">
                <span className="summary-label">Transactions</span>
                <span className="summary-value">{transactions.length}</span>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <h2 className="card-title">Recent Transactions</h2>
            {loading ? (
              <p className="card-empty">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="card-empty">
                No transactions yet. Add your first one to get started ✨
              </p>
            ) : (
              <ul className="tx-list">
                {transactions.slice(0, 5).map((tx) => (
                  <li key={tx.id} className="tx-item">
                    <div className="tx-main">
                      <span className="tx-category">{tx.category}</span>
                      {tx.description && (
                        <span className="tx-description">
                          {tx.description}
                        </span>
                      )}
                    </div>
                    <div className="tx-meta">
                      <span
                        className={`tx-amount ${
                          tx.type === 'INCOME' ? 'income' : 'expense'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {tx.amount.toFixed(2)}
                      </span>
                      <span className="tx-date">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {activeTab === 'transactions' && (
        <section className="dash-grid">
          {/* Add transaction */}
          <div className="dash-card">
            <h2 className="card-title">Add Transaction</h2>
            <p className="card-caption">
              Little habits, big glow-up. Log it and move on 💅
            </p>

            {error && (
              <p className="card-error">
                {error}
              </p>
            )}

            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-pill ${
                  mode === 'EXPENSE' ? 'active-expense' : ''
                }`}
                onClick={() => setMode('EXPENSE')}
              >
                💸 Expense
              </button>
              <button
                type="button"
                className={`mode-pill ${
                  mode === 'INCOME' ? 'active-income' : ''
                }`}
                onClick={() => setMode('INCOME')}
              >
                ✨ Income
              </button>
            </div>

            <form className="tx-form" onSubmit={handleSubmit}>
              <label>
                <span>Amount ($)</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Matcha latte, gas, rent..."
                />
              </label>

              <label>
                <span>Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Travel">Travel</option>
                  <option value="Salary">Salary</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <button
                type="submit"
                className={`primary-btn ${
                  mode === 'EXPENSE' ? 'expense' : 'income'
                }`}
              >
                {mode === 'EXPENSE' ? 'Add Expense' : 'Add Income'}
              </button>
            </form>
          </div>

          {/* All transactions */}
          <div className="dash-card">
            <h2 className="card-title">All Transactions</h2>
            {loading ? (
              <p className="card-empty">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="card-empty">
                No transactions yet. Add your first one to get started ✨
              </p>
            ) : (
              <ul className="tx-list tall">
                {transactions.map((tx) => (
                  <li key={tx.id} className="tx-item">
                    <div className="tx-main">
                      <span className="tx-category">{tx.category}</span>
                      {tx.description && (
                        <span className="tx-description">
                          {tx.description}
                        </span>
                      )}
                    </div>
                    <div className="tx-meta">
                      <span
                        className={`tx-amount ${
                          tx.type === 'INCOME' ? 'income' : 'expense'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {tx.amount.toFixed(2)}
                      </span>
                      <span className="tx-date">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {activeTab === 'categories' && (
        <section className="dash-card full-width">
          <h2 className="card-title">Manage Categories</h2>
          <p className="card-caption">
            Quick-start ideas. You can reuse these in your transactions.
          </p>

          <div className="chip-grid">
            <button className="cat-chip cat-food">Food & Dining</button>
            <button className="cat-chip cat-transport">Transportation</button>
            <button className="cat-chip cat-shopping">Shopping</button>
            <button className="cat-chip cat-bills">Bills & Utilities</button>
            <button className="cat-chip cat-entertainment">Entertainment</button>
            <button className="cat-chip cat-health">Healthcare</button>
            <button className="cat-chip cat-travel">Travel</button>
            <button className="cat-chip cat-salary">Salary</button>
          </div>

          <p className="card-note">
            (In a future phase, we can wire this up to a real categories table 💭)
          </p>
        </section>
      )}

      {activeTab === 'budgets' && (
        <section className="dash-card full-width">
          <h2 className="card-title">Budgets</h2>
          <p className="card-caption">
            Coming soon: monthly caps, savings goals, and cute progress bars.
          </p>
          <div className="budget-placeholder">
            <span className="budget-emoji">🎯</span>
            <p>For now, focus on logging a few days of spending. We’ll turn it into magic later.</p>
          </div>
        </section>
      )}
    </main>
  );
}