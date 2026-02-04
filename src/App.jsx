import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import AccountsPanel from './components/AccountsPanel'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Reports from './components/Reports'
import { api } from './utils/api'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [accountsData, transactionsData, expensesData] = await Promise.all([
          api.accounts.getAll(),
          api.transactions.getAll(),
          api.expenses.getAll()
        ])
        setAccounts(accountsData)
        setTransactions(transactionsData)
        setExpenses(expensesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAddAccount = async (accountData) => {
    try {
      await api.accounts.create(accountData)
      handleRefresh()
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  const handleEditAccount = async (id, accountData) => {
    try {
      await api.accounts.update(id, accountData)
      handleRefresh()
    } catch (error) {
      console.error('Failed to update account:', error)
      alert('Error updating account: ' + error.message)
    }
  }

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Delete this account?')) {
      try {
        await api.accounts.delete(id)
        handleRefresh()
      } catch (error) {
        console.error('Failed to delete account:', error)
      }
    }
  }

  const handleAddTransaction = async (txData) => {
    try {
      await api.transactions.create(txData)
      handleRefresh()
    } catch (error) {
      console.error('Failed to create transaction:', error)
      alert('Error creating transaction: ' + error.message)
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction? This will reverse the balance changes.')) {
      try {
        await api.transactions.delete(id)
        handleRefresh()
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        alert('Error deleting transaction: ' + error.message)
      }
    }

  if (loading) {
    return <div className="app-loading">Loading...</div>
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💰 Financial Manager</h1>
        <nav className="app-tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            Accounts
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard accounts={accounts} transactions={transactions} expenses={expenses} />
        )}

        {activeTab === 'accounts' && (
          <div className="tab-content">
            <div className="accounts-section">
              <AccountsPanel 
                accounts={accounts} 
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="tab-content">
            <div className="transactions-section">
              <TransactionForm 
                accounts={accounts}
                onAddTransaction={handleAddTransaction}
              />
              <TransactionList 
                transactions={transactions}
                accounts={accounts}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <Reports 
              transactions={transactions}
              expenses={expenses}
              accounts={accounts}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
