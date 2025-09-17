import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useMediaQuery } from 'react-responsive';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [editExpense, setEditExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('expenses/');
      setExpenses(response.data);
    } catch (error) {
      toast.error('❌ Failed to fetch expenses');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const update = editExpense ? setEditExpense : setNewExpense;
    update(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateExpense = async () => {
    try {
      const response = await api.post('expenses/', newExpense);
      setExpenses([...expenses, response.data]);
      setNewExpense({ description: '', amount: '' });
      toast.success('✅ Expense added');
    } catch (error) {
      toast.error('❌ Failed to create expense');
    }
  };

  const handleEdit = (expense) => {
    setEditExpense({
      ...expense,
      spent_at: new Date(expense.spent_at).toISOString().slice(0, 16)
    });
  };

  const handleUpdateExpense = async () => {
    try {
      const response = await api.put(`expenses/${editExpense.id}/`, editExpense);
      setExpenses(expenses.map(e => (e.id === editExpense.id ? response.data : e)));
      setEditExpense(null);
      toast.success('✅ Expense updated');
    } catch (error) {
      toast.error('❌ Failed to update expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`expenses/${id}/`);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.info('🗑️ Expense deleted');
    } catch (error) {
      toast.error('❌ Failed to delete expense');
    }
  };

  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.spent_by_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(e.spent_at).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">💸 Expenses</h2>

      {/* Search Bar */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by description, user, or date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
            ❌ Clear
          </button>
        )}
      </div>

      {/* Create/Edit Expense Form */}
      <div className="card p-3 mb-4">
        <h4>{editExpense ? 'Edit Expense' : 'Add New Expense'}</h4>
        <div className="row g-3">
          <div className="col-sm-12 col-md-6">
            <input
              type="text"
              className="form-control"
              name="description"
              value={editExpense ? editExpense.description : newExpense.description}
              placeholder="Description"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-sm-12 col-md-6">
            <input
              type="number"
              className="form-control"
              name="amount"
              value={editExpense ? editExpense.amount : newExpense.amount}
              placeholder="Amount"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-sm-12 d-flex gap-2 mt-2">
            {editExpense ? (
              <>
                <button className="btn btn-primary w-50" onClick={handleUpdateExpense}>💾 Save</button>
                <button className="btn btn-secondary w-50" onClick={() => setEditExpense(null)}>❌ Cancel</button>
              </>
            ) : (
              <button className="btn btn-success w-100" onClick={handleCreateExpense}>➕ Add</button>
            )}
          </div>
        </div>
      </div>

      {/* Expense Display */}
      {filteredExpenses.length === 0 ? (
        <p>No expenses match your search.</p>
      ) : isMobile ? (
        <div className="row">
          {filteredExpenses.map((expense) => (
            <div className="col-sm-12 mb-3" key={expense.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{expense.description}</h5>
                  <p><strong>Amount:</strong> {formatTZS(expense.amount)}</p>
                  <p><strong>Spent By:</strong> {expense.spent_by_username || '—'}</p>
                  <p><strong>Date:</strong> {new Date(expense.spent_at).toLocaleString()}</p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-warning w-50" onClick={() => handleEdit(expense)}>Edit</button>
                    <button className="btn btn-sm btn-danger w-50" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Spent By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, index) => (
                <tr key={expense.id}>
                  <td>{index + 1}</td>
                  <td>{expense.description}</td>
                  <td>{formatTZS(expense.amount)}</td>
                  <td>{expense.spent_by_username || '—'}</td>
                  <td>{new Date(expense.spent_at).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(expense)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Expenses;