import { useState } from 'react'
import { formatCurrency } from '../utils/api'
import '../styles/TransactionForm.css'

function TransactionForm({ accounts, onAddTransaction }) {
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    type: 'expense',
    description: '',
    category: 'food'
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'health', 'shopping', 'other']

  const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    shopping: '🛍️',
    other: '📌'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      // If switching type to one that doesn't need a destination, clear to_account_id
      if (name === 'type' && !(value === 'transfer' || value === 'credit_payment')) {
        next.to_account_id = ''
      }
      return next
    })
    setMessage('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.description.trim()) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    if (!formData.from_account_id) {
      showMessage('Please select an account', 'error')
      return
    }

    if ((formData.type === 'transfer' || formData.type === 'credit_payment') && !formData.to_account_id) {
      showMessage('Please select destination account', 'error')
      return
    }

    // Check for insufficient funds (for bank, cash, and credit payment sources)
    const sourceAccount = accounts.find(a => a.id === formData.from_account_id)
    if (sourceAccount && (formData.type === 'expense' || formData.type === 'transfer' || formData.type === 'credit_payment')) {
      if (sourceAccount.balance < parseFloat(formData.amount)) {
        showMessage(`Insufficient funds! Available: ${formatCurrency(sourceAccount.balance)}`, 'error')
        return
      }
    }

    onAddTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    const categoryEmoji = categoryEmojis[formData.category] || '📌'
    const messages = {
      expense: `✓ Expense recorded! ${categoryEmoji}`,
      income: `✓ Income added! 💰`,
      transfer: `✓ Transfer successful! ↔️`,
      credit_payment: `✓ Credit card payment processed! 💳`
    }

    showMessage(messages[formData.type], 'success')

    setFormData({
      from_account_id: '',
      to_account_id: '',
      amount: '',
      type: 'expense',
      description: '',
      category: 'food'
    })

    setTimeout(() => setMessage(''), 3000)
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
  }

  return (
    <div className="transaction-form">
      <h2>New Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
              <option value="credit_payment">Pay Credit Card</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Source Account *</label>
            <select name="from_account_id" value={formData.from_account_id} onChange={handleChange} required>
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(formData.type === 'transfer' || formData.type === 'credit_payment') && (
          <div className="form-group">
            <label>{formData.type === 'credit_payment' ? 'Credit Card' : 'Destination Account'} *</label>
            <select name="to_account_id" value={formData.to_account_id} onChange={handleChange} required>
              <option value="">Select account</option>
              {(formData.type === 'credit_payment' ? accounts.filter(a => a.type === 'credit_card') : accounts).map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {formData.type === 'expense' && (
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-group full">
          <label>Description *</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this for?"
            required
          />
        </div>

        <button type="submit" className="btn-submit">Record Transaction</button>
      </form>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default TransactionForm
