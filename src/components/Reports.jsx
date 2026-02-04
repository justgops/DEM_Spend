import { useState, useMemo } from 'react'
import { formatCurrency } from '../utils/api'

function Reports({ transactions, expenses, accounts }) {
  const [filterType, setFilterType] = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculate ledger entries
  const ledgerData = useMemo(() => {
    // Get opening balance from all accounts
    const openingBalance = accounts.reduce((sum, acc) => {
      return sum + (parseFloat(acc.balance) || 0)
    }, 0)

    // Get all transactions for the period
    let relevantTxs = []
    let relevantExpenses = []

    if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-')
      relevantTxs = transactions.filter(tx => {
        const txDate = new Date(tx.created_at)
        return txDate.getFullYear() === parseInt(year) &&
               (txDate.getMonth() + 1).toString().padStart(2, '0') === month
      })
      relevantExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.expense_date)
        return expDate.getFullYear() === parseInt(year) &&
               (expDate.getMonth() + 1).toString().padStart(2, '0') === month
      })
    } else if (filterType === 'date-range' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      relevantTxs = transactions.filter(tx => {
        const txDate = new Date(tx.created_at)
        return txDate >= start && txDate <= end
      })
      relevantExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.expense_date)
        return expDate >= start && expDate <= end
      })
    }

    // Create ledger entries
    const entries = []

    // Add opening balance
    entries.push({
      date: filterType === 'month' ? `${selectedMonth}-01` : startDate || new Date().toISOString().split('T')[0],
      type: 'opening',
      description: 'Opening Balance',
      amount: 0,
      balance: openingBalance
    })

    // Add income transactions
    relevantTxs.filter(tx => tx.type === 'income').forEach(tx => {
      entries.push({
        date: tx.created_at,
        type: 'income',
        description: tx.description,
        amount: parseFloat(tx.amount) || 0,
        balance: 0,
        txId: tx.id
      })
    })

    // Add expense transactions
    relevantExpenses.forEach(exp => {
      entries.push({
        date: exp.expense_date,
        type: 'expense',
        description: exp.description,
        amount: -(parseFloat(exp.amount) || 0),
        balance: 0,
        expId: exp.id
      })
    })

    // Add other transaction types
    relevantTxs.filter(tx => !['income'].includes(tx.type)).forEach(tx => {
      let amount = 0
      if (tx.type === 'expense') {
        amount = -(parseFloat(tx.amount) || 0)
      } else {
        amount = parseFloat(tx.amount) || 0
      }
      entries.push({
        date: tx.created_at,
        type: tx.type,
        description: tx.description,
        amount: amount,
        balance: 0,
        txId: tx.id
      })
    })

    // Sort by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate running balance
    let runningBalance = openingBalance
    entries.forEach(entry => {
      if (entry.type !== 'opening') {
        runningBalance += entry.amount
      }
      entry.balance = runningBalance
    })

    // Calculate totals
    const totalIncome = entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)
    const totalExpense = Math.abs(entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0))
    const closingBalance = entries.length > 0 ? entries[entries.length - 1].balance : openingBalance

    return { entries, openingBalance, totalIncome, totalExpense, closingBalance }
  }, [transactions, expenses, accounts, filterType, selectedMonth, startDate, endDate])

  const getTypeColor = (type) => {
    switch (type) {
      case 'opening':
        return 'text-blue-400'
      case 'income':
        return 'text-green-400'
      case 'expense':
        return 'text-red-400'
      case 'transfer':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTypeBgColor = (type) => {
    switch (type) {
      case 'opening':
        return 'bg-blue-900/20'
      case 'income':
        return 'bg-green-900/20'
      case 'expense':
        return 'bg-red-900/20'
      case 'transfer':
        return 'bg-yellow-900/20'
      default:
        return 'bg-gray-900/20'
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full bg-slate-900 rounded-lg border border-slate-700 p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Ledger Report</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Filter Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="month">Month</option>
            <option value="date-range">Date Range</option>
          </select>
        </div>

        {filterType === 'month' ? (
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 border border-blue-600 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Opening Balance</h3>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(ledgerData.openingBalance)}</p>
        </div>

        <div className="bg-slate-800 border border-green-600 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(ledgerData.totalIncome)}</p>
        </div>

        <div className="bg-slate-800 border border-red-600 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Total Expense</h3>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(ledgerData.totalExpense)}</p>
        </div>

        <div className="bg-slate-800 border border-purple-600 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Closing Balance</h3>
          <p className={`text-2xl font-bold ${ledgerData.closingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(ledgerData.closingBalance)}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600 bg-slate-900">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.entries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                    No transactions found for the selected period
                  </td>
                </tr>
              ) : (
                ledgerData.entries.map((entry, idx) => (
                  <tr key={idx} className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${getTypeBgColor(entry.type)}`}>
                    <td className="px-6 py-3 text-sm text-slate-300">{formatDate(entry.date)}</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-medium">{entry.description}</td>
                    <td className={`px-6 py-3 text-sm font-semibold uppercase ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold">
                      {entry.type === 'opening' ? '' : (
                        <span className={entry.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-bold text-slate-100">
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
