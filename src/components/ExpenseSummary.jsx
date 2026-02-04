import '../styles/ExpenseSummary.css'

function ExpenseSummary({ expenses }) {
  const totalExpense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    const amount = parseFloat(exp.amount) || 0
    acc[exp.category] = (acc[exp.category] || 0) + amount
    return acc
  }, {})

  const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    shopping: '🛍️',
    other: '📌'
  }

  const topCategory = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b)
    : null

  return (
    <div className="expense-summary">
      <div className="summary-card total">
        <h3>Total Spent</h3>
        <p className="total-amount">${totalExpense.toFixed(2)}</p>
        <span className="expense-count">{expenses.length} transactions</span>
      </div>

      <div className="summary-card average">
        <h3>Average Per Transaction</h3>
        <p className="average-amount">
          ${expenses.length > 0 ? (totalExpense / expenses.length).toFixed(2) : '0.00'}
        </p>
      </div>

      {topCategory && (
        <div className="summary-card top-category">
          <h3>Top Category</h3>
          <p className="category-name">
            {categoryEmojis[topCategory[0]] || '📌'} {topCategory[0]}
          </p>
          <span className="category-amount">${topCategory[1].toFixed(2)}</span>
        </div>
      )}

      {Object.keys(categoryTotals).length > 0 && (
        <div className="summary-card breakdown">
          <h3>By Category</h3>
          <div className="category-list">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="category-item">
                <span className="cat-name">{categoryEmojis[category] || '📌'} {category}</span>
                <span className="cat-amount">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseSummary
