'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function DashboardPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  );
}

function DashboardContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        if (!res.ok) {
          throw new Error('Failed to load transactions');
        }
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError('Could not load transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }

      const newTx = await res.json();
      setTransactions((prev) => [newTx, ...prev]);

      setForm({
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#fff7f5] px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 border border-pink-100">
        <h1 className="text-2xl font-bold mb-4 text-[#5b2b29]">
          MoneyTracker Dashboard 💸
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Add your income & expenses below. Each entry is saved to your account in the database.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Food, Rent, Shopping..."
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date (optional)
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-md px-4 py-2 text-sm font-semibold bg-[#d08e92] text-white hover:bg-[#b97377] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Transaction'}
          </button>
        </form>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-[#5b2b29]">
            Recent Transactions
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No transactions yet. Add your first one above!
            </p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex justify-between items-center border rounded-md px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {tx.category}{' '}
                      <span className="text-xs text-gray-500">
                        ({tx.type.toLowerCase()})
                      </span>
                    </div>
                    {tx.description && (
                      <div className="text-xs text-gray-500">
                        {tx.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={
                        'font-semibold ' +
                        (tx.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600')
                      }
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}$
                      {tx.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}