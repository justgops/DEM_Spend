# 💰 Financial Manager - Full Stack App

A comprehensive financial management application built with **React + Vite** (frontend) and **Express + PostgreSQL** (backend). Manage your cash, bank accounts, credit cards, and track all expenses in one place.

## Features

✨ **Account Management**
- Track multiple cash wallets
- Manage bank accounts
- Monitor credit card balances
- Automatic balance updates

💳 **Smart Transactions**
- Record expenses with categories
- Transfer money between accounts
- Pay credit card bills with automatic settlement
- Track income

📊 **Dashboard**
- Net worth overview
- Total cash, bank, and credit card summary
- Monthly expense tracking
- Recent transaction history
- Account-by-account breakdown

🔄 **Credit Card Settlement**
- Pay credit card from bank/cash
- Automatic balance adjustments
- Records as both transaction and expense
- Track credit card usage

## Tech Stack

### Frontend
- React 19
- Vite 7
- CSS3 (modern dark theme)

### Backend
- Express.js
- PostgreSQL
- Node.js
- UUID for unique identifiers

## Prerequisites

- Node.js (v14+)
- PostgreSQL (with remote database configured)
- npm or yarn

## Installation & Setup

### 1. Clone & Install Dependencies
```bash
cd /root/DEM_Spend
npm install
```

### 2. Configure Environment

Update `.env` file with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
PORT=3001
JWT_SECRET=your_secret_key
```

### 3. Start the Application

Run both backend and frontend with a single command:
```bash
npm run dev
```

This will start:
- **Backend Server**: http://localhost:3001
- **Frontend Client**: http://localhost:5174

### 4. Access the App

Open your browser and navigate to:
```
http://localhost:5174
```

## Project Structure

```
/root/DEM_Spend/
├── server/                    # Backend Express server
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection
│   ├── init-db.js            # Database schema initialization
│   └── routes/
│       ├── accounts.js       # Account management API
│       ├── transactions.js   # Transaction handling API
│       └── expenses.js       # Expense tracking API
├── src/                       # Frontend React app
│   ├── components/
│   │   ├── Dashboard.jsx     # Overview dashboard
│   │   ├── AccountsPanel.jsx # Account management
│   │   ├── TransactionForm.jsx # New transaction form
│   │   └── TransactionList.jsx # Transaction history
│   ├── styles/               # Component styles
│   ├── utils/
│   │   └── api.js           # API client utilities
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles
│   └── index.css            # Root styles
├── package.json
├── vite.config.js           # Vite configuration
└── .env                      # Environment variables
```

## Database Schema

### accounts table
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Account name
- `type` (VARCHAR) - 'cash', 'bank', or 'credit_card'
- `balance` (DECIMAL) - Current balance
- `credit_limit` (DECIMAL) - For credit cards
- `due_date` (INTEGER) - Credit card due date

### transactions table
- `id` (UUID) - Primary key
- `from_account_id` (UUID) - Source account
- `to_account_id` (UUID) - Destination account (optional)
- `amount` (DECIMAL) - Transaction amount
- `type` (VARCHAR) - 'expense', 'transfer', 'credit_payment', 'income'
- `description` (VARCHAR) - Transaction details
- `category` (VARCHAR) - Expense category

### expenses table
- `id` (UUID) - Primary key
- `account_id` (UUID) - Associated account
- `description` (VARCHAR) - Expense description
- `amount` (DECIMAL) - Expense amount
- `category` (VARCHAR) - Expense category
- `expense_date` (DATE) - Date of expense

## API Endpoints

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/account/:id` - Get account transactions
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/range/:start/:end` - Get expenses by date range
- `GET /api/expenses/category/:category` - Get expenses by category
- `DELETE /api/expenses/:id` - Delete expense

## Usage Examples

### Add a Cash Account
1. Go to **Accounts** tab
2. Click **+ Add Account**
3. Select "Cash Wallet", enter name and initial balance
4. Click **Create Account**

### Record an Expense
1. Go to **Transactions** tab
2. Select **Expense** type
3. Choose source account
4. Enter amount and description
5. Select category
6. Click **Record Transaction**

### Pay Credit Card
1. Go to **Transactions** tab
2. Select **Pay Credit Card** type
3. Choose bank/cash account as source
4. Select credit card as destination
5. Enter payment amount
6. Click **Record Transaction**

Balance updates automatically:
- Bank/Cash balance decreases
- Credit card balance increases (debt reduces)
- Payment is recorded as expense

## Features Explained

### Smart Transactions
- **Expense**: Deducts from source account, adds to expense log
- **Transfer**: Moves money between accounts
- **Credit Payment**: Pays credit card bill, reduces debt, adds to expense
- **Income**: Adds money to account

### Dashboard Overview
- **Net Worth**: Total of all assets minus credit card debt
- **Cash**: Sum of all cash wallets
- **Bank Balance**: Sum of all bank accounts
- **Credit Due**: Total outstanding credit card balance
- **Monthly Spend**: Expenses from last 30 days

## Styling

Modern dark theme with:
- Gradient backgrounds
- Smooth transitions
- Responsive design
- Clean card-based layout
- Color-coded account types and transaction types

## Troubleshooting

### Port Already in Use
If port 5173 or 3001 is in use, the app will automatically switch to available ports.

### Database Connection Error
Check your `.env` file DATABASE_URL and ensure PostgreSQL is running.

### API Not Responding
Ensure backend is running on port 3001 and database is initialized.

## Scripts

```bash
# Start both server and client
npm run dev

# Start only server
npm run server

# Start only client
npm run client

# Build for production
npm build

# Preview production build
npm preview
```

## Future Enhancements

- [ ] User authentication & multi-user support
- [ ] Budget tracking and alerts
- [ ] Recurring transactions
- [ ] Export to CSV/PDF
- [ ] Monthly/yearly reports
- [ ] Transaction search and filters
- [ ] Bill reminders
- [ ] Investment tracking

## License

MIT

---

**Happy Financial Managing! 💰**
  - Pay credit card bills (auto-settles debt)
  - Track income
- **Automatic Settlement**: When paying credit card bills, balances are automatically updated
- **Dashboard Analytics**: Net worth, spending trends, category breakdown
- **Persistent Storage**: All data saved to PostgreSQL backend
- **Dark Theme UI**: Sleek, modern interface with real-time updates

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database

### Frontend
- **React 19** - UI library
- **Vite** - Build tool & dev server

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
