import { formatCurrency, getTimeAgo } from '../utils/api'
import '../styles/Dashboard.css'

function Dashboard({ accounts, transactions, expenses }) {
  const totalAssets = accounts.reduce((sum, acc) => {
    if (acc.type === 'credit_card') return sum - acc.balance
    return sum + acc.balance
  }, 0)

  const cashAccounts = accounts.filter(a => a.type === 'cash')
  const bankAccounts = accounts.filter(a => a.type === 'bank')
  const creditCards = accounts.filter(a => a.type === 'credit_card')

  const totalCash = cashAccounts.reduce((sum, a) => sum + a.balance, 0)
  const totalBank = bankAccounts.reduce((sum, a) => sum + a.balance, 0)
  const totalCreditDue = creditCards.reduce((sum, a) => sum + Math.max(0, -a.balance), 0)

  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const monthlyExpense = expenses
    .filter(e => new Date(e.expense_date) >= lastMonth && !e.description.includes('Credit Card Payment'))
    .reduce((sum, e) => sum + e.amount, 0)

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.created_at) >= lastMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryStats = expenses.reduce((acc, exp) => {
    if (!exp.description.includes('Credit Card Payment')) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    }
    return acc
  }, {})

  const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    shopping: '🛍️',
    other: '📌',
    credit_payment: '💳'
  }

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="dashboard">
      {/* Main Balance Card */}
      <div className="balance-card">
        <div className="balance-content">
          <h2>Total Balance</h2>
          <p className="balance-amount">{formatCurrency(totalAssets)}</p>
          <div className="balance-subtext">
            {transactions.length > 0 && (
              <span>Last transaction: {getTimeAgo(transactions[0].created_at)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow Overview */}
      <div className="cashflow-grid">
        <div className="cashflow-card income">
          <div className="cf-icon">📈</div>
          <div className="cf-content">
            <h3>Income (30d)</h3>
            <p className="cf-amount">{formatCurrency(monthlyIncome)}</p>
          </div>
        </div>

        <div className="cashflow-card expense">
          <div className="cf-icon">📉</div>
          <div className="cf-content">
            <h3>Expenses (30d)</h3>
            <p className="cf-amount">{formatCurrency(monthlyExpense)}</p>
          </div>
        </div>

        <div className="cashflow-card savings">
          <div className="cf-icon">💰</div>
          <div className="cf-content">
            <h3>Net (30d)</h3>
            <p className="cf-amount" style={{color: monthlyIncome - monthlyExpense >= 0 ? '#10b981' : '#ef4444'}}>
              {formatCurrency(monthlyIncome - monthlyExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="accounts-summary">
        <h3>Accounts</h3>
        <div className="summary-row">
          <div className="summary-item">
            <span className="item-label">💵 Cash</span>
            <span className="item-value">{formatCurrency(totalCash)}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">🏦 Bank</span>
            <span className="item-value">{formatCurrency(totalBank)}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">💳 Credit Due</span>
            <span className="item-value" style={{color: '#ef4444'}}>{formatCurrency(totalCreditDue)}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="category-breakdown">
          <h3>Top Spending</h3>
          <div className="category-list">
            {topCategories.map(([cat, amount]) => {
              const total = monthlyExpense || 1
              const percentage = Math.round((amount / total) * 100)
              return (
                <div key={cat} className="category-item">
                  <div className="cat-left">
                    <span className="cat-emoji">{categoryEmojis[cat]}</span>
                    <div className="cat-info">
                      <span className="cat-name">{cat}</span>
                      <div className="progress-bar">
                        <div className="progress" style={{width: `${percentage}%`}}></div>
                      </div>
                    </div>
                  </div>
                  <span className="cat-amount">{formatCurrency(amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="recent-transactions">
          <h3>Recent Activity</h3>
          <div className="tx-list">
            {transactions.slice(0, 8).map(tx => {
              const fromAccount = accounts.find(a => a.id === tx.from_account_id)
              const typeIcon = {
                expense: '🛒',
                transfer: '↔️',
                credit_payment: '💳',
                income: '💰'
              }
              const isNegative = ['expense', 'credit_payment'].includes(tx.type)
              
              return (
                <div key={tx.id} className={`tx-item ${tx.type}`}>
                  <div className="tx-icon">{typeIcon[tx.type]}</div>
                  <div className="tx-details">
                    <p className="tx-desc">{tx.description}</p>
                    <p className="tx-account">{fromAccount?.name}</p>
                  </div>
                  <div className="tx-amount-section">
                    <span className={`tx-amount ${isNegative ? 'negative' : 'positive'}`}>
                      {isNegative ? '-' : '+'}{formatCurrency(tx.amount)}
                    </span>
                    <span className="tx-time">{getTimeAgo(tx.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="empty-state">
          <p>👋 Welcome! Start by adding your first account</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
