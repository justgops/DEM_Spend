import { useState, useEffect } from 'react'
import { formatCurrency, api } from '../utils/api'
import '../styles/EditTransactionModal.css'

function EditTransactionModal({ transaction, accounts, onClose, onSave }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const defaultCategories = ['food', 'transport', 'entertainment', 'utilities', 'health', 'shopping', 'other']

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category || 'other'
      })
    }
  }, [transaction])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.description.trim()) {
      setMessage('Please fill in all required fields')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const updatedTx = await api.transactions.update(transaction.id, {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category
      })
      onSave(updatedTx)
      setMessage('✓ Transaction updated!', 'success')
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!transaction) return null

  const typeLabels = {
    expense: 'Expense',
    transfer: 'Transfer',
    credit_payment: 'Credit Payment',
    income: 'Income'
  }

  const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    shopping: '🛍️',
    other: '📌'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Transaction</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="tx-info">
            <span className="tx-type-badge">{typeLabels[transaction.type]}</span>
          </div>

          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
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

            {transaction.type === 'expense' && (
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {categoryEmojis[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {message && (
            <div className={`message message-${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditTransactionModal
