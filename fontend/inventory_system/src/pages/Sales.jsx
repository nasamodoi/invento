import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [newSale, setNewSale] = useState({
    product: '', quantity: '', price_per_unit: ''
  });
  const [editSale, setEditSale] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('/api/sales/');
      setSales(response.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updater = editSale ? setEditSale : setNewSale;
    updater(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSale = async () => {
    try {
      const { product, quantity, price_per_unit } = newSale;
      const payload = { product, quantity, price_per_unit };
      const response = await api.post('/api/sales/', payload);
      setSales([...sales, response.data]);
      setNewSale({ product: '', quantity: '', price_per_unit: '' });
      toast.success('✅ Sale recorded successfully');
    } catch (error) {
      const msg = error.response?.data?.quantity || 'Failed to record sale';
      toast.error(`❌ ${msg}`);
    }
  };

  const handleEdit = (sale) => {
    setEditSale({
      ...sale,
      sold_at: new Date(sale.sold_at).toISOString().slice(0, 16)
    });
  };

  const handleUpdateSale = async () => {
    try {
      const { product, quantity, price_per_unit } = editSale;
      const payload = { product, quantity, price_per_unit };
      const response = await api.put(`/api/sales/${editSale.id}/`, payload);
      setSales(sales.map(s => (s.id === editSale.id ? response.data : s)));
      setEditSale(null);
      toast.success('✅ Sale updated');
    } catch (error) {
      const msg = error.response?.data?.quantity || 'Failed to update sale';
      toast.error(`❌ ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/sales/${id}/`);
      setSales(sales.filter(s => s.id !== id));
      toast.info('🗑️ Sale deleted');
    } catch (error) {
      console.error('Failed to delete sale:', error);
    }
  };

  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderProductOptions = () => {
    return products.map(product => (
      <option
        key={product.id}
        value={product.id}
        disabled={product.quantity === 0}
      >
        {product.name} {product.quantity === 0 ? '— Out of Stock' : ''}
      </option>
    ));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🧾 Sales</h2>

      {/* Add New Sale Form */}
      <div className="card p-3 mb-4">
        <h4>Add New Sale</h4>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Product</label>
            <select
              className="form-select"
              name="product"
              value={newSale.product}
              onChange={handleInputChange}
            >
              <option value="">Select Product</option>
              {renderProductOptions()}
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={newSale.quantity}
              placeholder="Quantity"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="price_per_unit"
              value={newSale.price_per_unit}
              placeholder="Price per unit"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-3 mt-3">
            <button className="btn btn-success w-100" onClick={handleCreateSale}>
              ➕ Add Sale
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {sales.length === 0 ? (
        <div className="alert alert-warning">No sales records available.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Sold By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={sale.id || index}>
                <td>{index + 1}</td>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>{formatTZS(sale.price_per_unit)}</td>
                <td>{formatTZS(sale.amount)}</td>
                <td>{sale.sold_by_username || '—'}</td>
                <td>{new Date(sale.sold_at).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(sale)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sale.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Sale Form */}
      {editSale && (
        <div className="card p-3 mt-4">
          <h4>Edit Sale</h4>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                name="product"
                value={editSale.product}
                onChange={handleInputChange}
              >
                <option value="">Select Product</option>
                {renderProductOptions()}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={editSale.quantity}
                placeholder="Quantity"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                name="price_per_unit"
                value={editSale.price_per_unit}
                placeholder="Price per unit"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mt-3 d-flex">
              <button className="btn btn-primary w-100 me-2" onClick={handleUpdateSale}>💾 Save</button>
              <button className="btn btn-secondary w-100" onClick={() => setEditSale(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;