import React, { useEffect, useState } from 'react';
import api from '../api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [newPurchase, setNewPurchase] = useState({
    product: '', quantity: '', price_per_unit: ''
  });
  const [editPurchase, setEditPurchase] = useState(null);

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/api/purchases/');
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
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
    const updater = editPurchase ? setEditPurchase : setNewPurchase;
    updater(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePurchase = async () => {
    try {
      const { product, quantity, price_per_unit } = newPurchase;
      const payload = { product, quantity, price_per_unit };
      const response = await api.post('/api/purchases/', payload);
      setPurchases([...purchases, response.data]);
      setNewPurchase({ product: '', quantity: '', price_per_unit: '' });
    } catch (error) {
      console.error('Failed to create purchase:', error.response?.data || error.message);
    }
  };

  const handleEdit = (purchase) => {
    setEditPurchase({
      ...purchase,
      purchased_at: new Date(purchase.purchased_at).toISOString().slice(0, 16)
    });
  };

  const handleUpdatePurchase = async () => {
    try {
      const { product, quantity, price_per_unit } = editPurchase;
      const payload = { product, quantity, price_per_unit };
      const response = await api.put(`/api/purchases/${editPurchase.id}/`, payload);
      setPurchases(purchases.map(p => (p.id === editPurchase.id ? response.data : p)));
      setEditPurchase(null);
    } catch (error) {
      console.error('Failed to update purchase:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/purchases/${id}/`);
      setPurchases(purchases.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete purchase:', error);
    }
  };

  // ✅ Format price and total cost in TZS
  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📥 Purchases</h2>

      {/* Create Purchase Form */}
      <div className="card p-3 mb-4">
        <h4>Add New Purchase</h4>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Product</label>
            <select
              className="form-select"
              name="product"
              value={newPurchase.product}
              onChange={handleInputChange}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={newPurchase.quantity}
              placeholder="Quantity"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="price_per_unit"
              value={newPurchase.price_per_unit}
              placeholder="Price per unit"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-3 mt-3">
            <button className="btn btn-success w-100" onClick={handleCreatePurchase}>
              ➕ Add
            </button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      {purchases.length === 0 ? (
        <div className="alert alert-warning">No purchases found.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Cost</th>
              <th>Purchased By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={purchase.id}>
                <td>{index + 1}</td>
                <td>{purchase.product_name}</td>
                <td>{purchase.quantity}</td>
                <td>{formatTZS(purchase.price_per_unit)}</td>
                <td>{formatTZS(purchase.quantity * purchase.price_per_unit)}</td>
                <td>{purchase.purchased_by_username || '—'}</td>
                <td>{new Date(purchase.purchased_at).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(purchase)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(purchase.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Purchase Form */}
      {editPurchase && (
        <div className="card p-3 mt-4">
          <h4>Edit Purchase</h4>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                name="product"
                value={editPurchase.product}
                onChange={handleInputChange}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={editPurchase.quantity}
                placeholder="Quantity"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                name="price_per_unit"
                value={editPurchase.price_per_unit}
                placeholder="Price per unit"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mt-3 d-flex">
              <button className="btn btn-primary w-100 me-2" onClick={handleUpdatePurchase}>💾 Save</button>
              <button className="btn btn-secondary w-100" onClick={() => setEditPurchase(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;