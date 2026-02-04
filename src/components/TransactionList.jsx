import { formatCurrency, getTimeAgo } from '../utils/api'
import '../styles/TransactionList.css'

function TransactionList({ transactions, accounts, onDeleteTransaction, onEditTransaction }) {
  const getAccountName = (id) => {
    return accounts.find(a => a.id === id)?.name || 'Unknown'
  }

  const renderIcon = (type) => {
    switch (type) {
      case 'expense':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'transfer':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7l10 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 17l-10 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 21l-4-4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'credit_payment':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        )
      case 'income':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M7 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M7 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )
      default:
        return null
    }
  }

  const typeLabels = {
    expense: 'Expense',
    transfer: 'Transfer',
    credit_payment: 'Credit Payment',
    income: 'Income'
  }

  const sortedTx = [...transactions].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )

  return (
    <div className="transaction-list">
      <h2>Transaction History</h2>
      
      {sortedTx.length === 0 ? (
        <div className="empty-state">
          <p>📭 No transactions yet. Start by recording your first transaction!</p>
        </div>
      ) : (
        <div className="transactions">
          {sortedTx.map(tx => {
            const isNegative = ['expense', 'credit_payment'].includes(tx.type)
            const isIncome = tx.type === 'income'
            
            return (
              <div key={tx.id} className={`transaction-card ${tx.type}`}>
                <div className="tx-icon">{renderIcon(tx.type)}</div>
                
                <div className="tx-main">
                  <div className="tx-header">
                    <div>
                      <p className="tx-title">{tx.description}</p>
                      <p className="tx-meta">{typeLabels[tx.type]}</p>
                    </div>
                    <div className="tx-right">
                      <p className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <div className="tx-actions">
                        {onEditTransaction && (
                          <button
                            className="btn-edit-tx"
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            aria-label="Edit transaction"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                        {onDeleteTransaction && (
                          <button
                            className="btn-delete-tx"
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete transaction"
                            aria-label="Delete transaction"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18M8 6V4a1 1 0 011-1h4a1 1 0 011 1v2m-1 0v10a1 1 0 01-1 1H9a1 1 0 01-1-1V6m3 3v4m-4-4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="tx-footer">
                    <span className="tx-account">
                      {tx.type === 'transfer' || tx.type === 'credit_payment' 
                        ? `${getAccountName(tx.from_account_id)} → ${getAccountName(tx.to_account_id)}`
                        : getAccountName(tx.from_account_id)
                      }
                    </span>
                    <span className="tx-time">{getTimeAgo(tx.created_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TransactionList
