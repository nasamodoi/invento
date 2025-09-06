import React, { useEffect, useState } from 'react';
import api from '../api';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [editExpense, setEditExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updater = editExpense ? setEditExpense : setNewExpense;
    updater(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateExpense = async () => {
    try {
      const { description, amount } = newExpense;
      const payload = { description, amount };
      const response = await api.post('expenses/', payload);
      setExpenses([...expenses, response.data]);
      setNewExpense({ description: '', amount: '' });
    } catch (error) {
      console.error('Failed to create expense:', error.response?.data || error.message);
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
      const { description, amount } = editExpense;
      const payload = { description, amount };
      const response = await api.put(`expenses/${editExpense.id}/`, payload);
      setExpenses(expenses.map(e => (e.id === editExpense.id ? response.data : e)));
      setEditExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`expenses/${id}/`);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
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

      {/* Add New Expense Form */}
      <div className="card p-3 mb-4">
        <h4>Add New Expense</h4>
        <div className="row g-2">
          <div className="col-md-6 col-sm-6">
            <input
              type="text"
              className="form-control"
              name="description"
              value={newExpense.description}
              placeholder="Description"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6 col-sm-6">
            <input
              type="number"
              className="form-control"
              name="amount"
              value={newExpense.amount}
              placeholder="Amount"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-3 col-sm-6 mt-3">
            <button className="btn btn-success w-100" onClick={handleCreateExpense}>
              ➕ Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="alert alert-warning">No expenses match your search.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
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

      {/* Edit Expense Form */}
      {editExpense && (
        <div className="card p-3 mt-4">
          <h4>Edit Expense</h4>
          <div className="row g-2">
            <div className="col-md-6 col-sm-6">
              <input
                type="text"
                className="form-control"
                name="description"
                value={editExpense.description}
                placeholder="Description"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6 col-sm-6">
              <input
                type="number"
                className="form-control"
                name="amount"
                value={editExpense.amount}
                placeholder="Amount"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 col-sm-6 mt-3 d-flex">
              <button className="btn btn-primary w-100 me-2" onClick={handleUpdateExpense}>💾 Save</button>
              <button className="btn btn-secondary w-100" onClick={() => setEditExpense(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;