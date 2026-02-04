import { useState, useMemo } from 'react'
import { formatCurrency, getTimeAgo } from '../utils/api'
import '../styles/Reports.css'

function Reports({ transactions, expenses, accounts }) {
  const [filterType, setFilterType] = useState('month') // 'month' or 'date-range'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Extract unique categories from expenses
  const allCategories = useMemo(() => {
    const cats = new Set(['all'])
    expenses.forEach(exp => {
      if (exp.category) cats.add(exp.category)
    })
    return Array.from(cats)
  }, [expenses])

  // Filter transactions based on date range
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-')
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.expense_date)
        return expDate.getFullYear() === parseInt(year) && 
               (expDate.getMonth() + 1).toString().padStart(2, '0') === month
      })
    } else if (filterType === 'date-range' && startDate && endDate) {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.expense_date)
        return expDate >= new Date(startDate) && expDate <= new Date(endDate)
      })
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === selectedCategory)
    }

    return filtered.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
  }, [expenses, filterType, selectedMonth, startDate, endDate, selectedCategory])

  // Calculate income and expense totals
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0
    let expense = 0

    // Get opening balance from accounts (initial money)
    const openingBalance = accounts.reduce((sum, acc) => {
      return sum + (parseFloat(acc.balance) || 0)
    }, 0)

    // Get income from transactions
    transactions.forEach(tx => {
      if (tx.type === 'income') {
        let includeDate = false
        if (filterType === 'month') {
          const [year, month] = selectedMonth.split('-')
          const txDate = new Date(tx.created_at)
          includeDate = txDate.getFullYear() === parseInt(year) && 
                       (txDate.getMonth() + 1).toString().padStart(2, '0') === month
        } else if (filterType === 'date-range' && startDate && endDate) {
          const txDate = new Date(tx.created_at)
          includeDate = txDate >= new Date(startDate) && txDate <= new Date(endDate)
        } else {
          includeDate = true
        }
        if (includeDate) income += parseFloat(tx.amount)
      }
    })

    // Add opening balance when no filter is applied (showing all-time report)
    if (filterType === 'month' && selectedMonth === new Date().toISOString().slice(0, 7)) {
      // Only add opening balance to current month if user wants historical data
      // For now, we'll include it
    } else if (filterType === 'date-range' && startDate && endDate) {
      // Check if date range includes the beginning of time (opening balance time)
      // For now, only add opening balance if we're looking at all time
      const start = new Date(startDate)
      const allAccountsCreatedBefore = accounts.every(acc => {
        const createdAt = new Date(acc.created_at || 0)
        return createdAt <= start
      })
      if (allAccountsCreatedBefore) {
        income += openingBalance
      }
    } else {
      // If no specific filter, include opening balance
      income += openingBalance
    }

    // Get expenses from filtered list
    filteredExpenses.forEach(exp => {
      expense += parseFloat(exp.amount)
    })

    return { totalIncome: income, totalExpense: expense }
  }, [transactions, filteredExpenses, filterType, selectedMonth, startDate, endDate, accounts])

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Account']
    const rows = filteredExpenses.map(exp => [
      exp.expense_date,
      exp.description,
      exp.amount,
      exp.category || 'N/A',
      accounts.find(a => a.id === exp.account_id)?.name || 'Unknown'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_${selectedMonth || 'report'}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    try {
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const element = document.getElementById('report-content')
      const canvas = await html2canvas(element)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`expenses_${selectedMonth || 'report'}.pdf`)
    } catch (error) {
      alert('Error generating PDF. Make sure jspdf and html2canvas are installed.')
      console.error('PDF export error:', error)
    }
  }

  const exportToExcel = async () => {
    try {
      // Dynamically import xlsx
      const XLSX = (await import('xlsx')).default

      const data = filteredExpenses.map(exp => ({
        Date: exp.expense_date,
        Description: exp.description,
        Amount: exp.amount,
        Category: exp.category || 'N/A',
        Account: accounts.find(a => a.id === exp.account_id)?.name || 'Unknown'
      }))

      // Add summary row
      data.push({})
      data.push({
        Date: 'SUMMARY',
        Description: '',
        Amount: '',
        Category: '',
        Account: ''
      })
      data.push({
        Date: 'Total Income',
        Description: '',
        Amount: totalIncome,
        Category: '',
        Account: ''
      })
      data.push({
        Date: 'Total Expense',
        Description: '',
        Amount: totalExpense,
        Category: '',
        Account: ''
      })
      data.push({
        Date: 'Net',
        Description: '',
        Amount: totalIncome - totalExpense,
        Category: '',
        Account: ''
      })

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')
      XLSX.writeFile(workbook, `expenses_${selectedMonth || 'report'}.xlsx`)
    } catch (error) {
      alert('Error generating Excel file. Make sure xlsx is installed.')
      console.error('Excel export error:', error)
    }
  }

  return (
    <div className="reports-container">
      <h2>Financial Reports</h2>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Filter By</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="month">Month</option>
            <option value="date-range">Date Range</option>
          </select>
        </div>

        {filterType === 'month' && (
          <div className="filter-group">
            <label>Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        )}

        {filterType === 'date-range' && (
          <>
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="reports-export">
        <button className="btn-export csv" onClick={exportToCSV}>
          📊 Export CSV
        </button>
        <button className="btn-export pdf" onClick={exportToPDF}>
          📄 Export PDF
        </button>
        <button className="btn-export excel" onClick={exportToExcel}>
          📈 Export Excel
        </button>
      </div>

      <div className="reports-summary">
        <div className="summary-card income">
          <div className="summary-label">Total Income</div>
          <div className="summary-value">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="summary-card expense">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value">{formatCurrency(totalExpense)}</div>
        </div>
        <div className="summary-card net">
          <div className="summary-label">Net</div>
          <div className="summary-value" style={{ color: totalIncome - totalExpense >= 0 ? '#10b981' : '#ef4444' }}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      <div id="report-content" className="reports-table">
        <h3>Expense Details</h3>
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found for the selected period.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Account</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp, idx) => (
                <tr key={idx}>
                  <td>{new Date(exp.expense_date).toLocaleDateString('en-IN')}</td>
                  <td>{exp.description}</td>
                  <td className="amount">{formatCurrency(exp.amount)}</td>
                  <td>{exp.category || 'N/A'}</td>
                  <td>{accounts.find(a => a.id === exp.account_id)?.name || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Reports
