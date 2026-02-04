import { useState } from 'react'
import { formatCurrency } from '../utils/api'
import '../styles/AccountsPanel.css'

function AccountsPanel({ accounts, onAddAccount, onDeleteAccount, onEditAccount }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: 0,
    credit_limit: 5000,
    due_date: 5,
    statement_day: 1
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'balance' || name === 'credit_limit' || name === 'due_date' || name === 'statement_day')
        ? parseFloat(value) || 0
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Account name is required')
      return
    }
    
    if (editingId) {
      onEditAccount(editingId, formData)
      setEditingId(null)
    } else {
      onAddAccount(formData)
    }
    
    setFormData({
      name: '',
      type: 'bank',
      balance: 0,
      credit_limit: 5000,
      due_date: 5,
      statement_day: 1
    })
    setShowForm(false)
  }

  const startEdit = (account) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      credit_limit: account.credit_limit || 5000,
      due_date: account.due_date || 5,
      statement_day: account.statement_day || 1
    })
    setEditingId(account.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: '',
      type: 'bank',
      balance: 0,
      credit_limit: 5000,
      due_date: 5,
      statement_day: 1
    })
  }

  const accountsByType = {
    cash: accounts.filter(a => a.type === 'cash'),
    bank: accounts.filter(a => a.type === 'bank'),
    credit_card: accounts.filter(a => a.type === 'credit_card')
  }

  return (
    <div className="accounts-panel">
      <div className="panel-header">
        <h2>My Accounts</h2>
        <button 
          className="btn-add"
          onClick={() => {
            if (editingId) {
              cancelEdit()
            } else {
              setShowForm(!showForm)
            }
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Account'}
        </button>
      </div>

      {showForm && (
        <form className="account-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Account name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="cash">Cash Wallet</option>
            <option value="bank">Bank Account</option>
            <option value="credit_card">Credit Card</option>
          </select>

          <input
            type="number"
            name="balance"
            placeholder="Initial balance"
            value={formData.balance}
            onChange={handleChange}
            step="0.01"
          />

          {formData.type === 'credit_card' && (
            <>
              <input
                type="number"
                name="credit_limit"
                placeholder="Credit limit"
                value={formData.credit_limit}
                onChange={handleChange}
                step="100"
              />
              <input
                type="number"
                name="due_date"
                placeholder="Due date (day of month)"
                value={formData.due_date}
                onChange={handleChange}
                min="1"
                max="31"
              />
              <input
                type="number"
                name="statement_day"
                placeholder="Statement day (day of month)"
                value={formData.statement_day}
                onChange={handleChange}
                min="1"
                max="31"
              />
            </>
          )}

          <button type="submit" className="btn-submit">Create Account</button>
        </form>
      )}

      <div className="accounts-groups">
        {['cash', 'bank', 'credit_card'].map(type => (
          accountsByType[type].length > 0 && (
            <div key={type} className={`account-group ${type}`}>
              <h3 className="group-title">
                {type === 'credit_card' ? '💳 Credit Cards' : type === 'bank' ? '🏦 Bank' : '💵 Cash'}
              </h3>
              <div className="accounts-list">
                {accountsByType[type].map(account => (
                  <div key={account.id} className="account-card">
                    <div className="card-top">
                      <div className="card-name">{account.name}</div>
                      <div className="card-actions">
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(account)}
                          title="Edit account"
                          aria-label="Edit account"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 17.25V21h3.75L17.81 9.94m-4.87-4.87L19.56 2.69a2.121 2.121 0 013 3l-11.62 11.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => onDeleteAccount(account.id)}
                          title="Delete account"
                          aria-label="Delete account"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M8 6V4a1 1 0 011-1h4a1 1 0 011 1v2m-1 0v10a1 1 0 01-1 1H9a1 1 0 01-1-1V6m3 3v4m-4-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="card-balance">
                      {formatCurrency(account.balance)}
                    </div>
                    {account.type === 'credit_card' && account.credit_limit && (
                      <div className="card-info">
                        <span>Limit: {formatCurrency(account.credit_limit)}</span>
                        <span>Due: {account.due_date ? account.due_date + 'th' : 'N/A'}</span>
                        <span>Statement: {account.statement_day ? account.statement_day + 'th' : 'N/A'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="empty-state">
          <p>No accounts yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}

export default AccountsPanel
