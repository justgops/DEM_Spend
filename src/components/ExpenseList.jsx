import '../styles/ExpenseList.css'

function ExpenseList({ expenses, onDeleteExpense }) {
  const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    shopping: '🛍️',
    other: '📌'
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="expense-list">
      <h2>Expense History</h2>
      
      {sortedExpenses.length === 0 ? (
        <p className="empty-state">No expenses yet. Add one to get started! 👆</p>
      ) : (
        <div className="expenses">
          {sortedExpenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-icon">
                {categoryEmojis[expense.category] || '📌'}
              </div>
              
              <div className="expense-details">
                <p className="expense-description">{expense.description}</p>
                <span className="expense-category">{expense.category}</span>
                <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
              </div>
              
              <div className="expense-amount">
                ${expense.amount.toFixed(2)}
              </div>

              <button
                className="delete-btn"
                onClick={() => onDeleteExpense(expense.id)}
                title="Delete expense"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExpenseList
