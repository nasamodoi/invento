import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [newPurchase, setNewPurchase] = useState({ product: '', quantity: '', price_per_unit: '' });
  const [editPurchase, setEditPurchase] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('purchases/');
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updater = editPurchase ? setEditPurchase : setNewPurchase;
    updater(prev => ({ ...prev, [name]: value }));

    if (name === 'product') {
      const productObj = products.find(p => p.id === parseInt(value));
      setSelectedProduct(productObj || null);
    }
  };

  const handleCreatePurchase = async () => {
    try {
      const { product, quantity, price_per_unit } = newPurchase;
      if (parseInt(quantity) <= 0 || parseFloat(price_per_unit) <= 0) {
        toast.error("❌ Quantity and price must be greater than zero");
        return;
      }

      if (selectedProduct && selectedProduct.quantity > 1) {
        toast.warning(`🚫 Cannot purchase: '${selectedProduct.name}' has sufficient stock (${selectedProduct.quantity})`);
        return;
      }

      const payload = { product, quantity, price_per_unit };
      const response = await api.post('purchases/', payload);
      setPurchases([...purchases, response.data]);
      setNewPurchase({ product: '', quantity: '', price_per_unit: '' });
      setSelectedProduct(null);
      await fetchProducts();
      toast.success('✅ Purchase recorded');
    } catch (error) {
      console.error('Failed to create purchase:', error.response?.data || error.message);
      toast.error('❌ Failed to record purchase');
    }
  };

  const handleEdit = (purchase) => {
    setEditPurchase({
      ...purchase,
      purchased_at: new Date(purchase.purchased_at).toISOString().slice(0, 16)
    });
    const productObj = products.find(p => p.id === purchase.product);
    setSelectedProduct(productObj || null);
  };

  const handleUpdatePurchase = async () => {
    try {
      const { product, quantity, price_per_unit } = editPurchase;
      const payload = { product, quantity, price_per_unit };
      const response = await api.put(`purchases/${editPurchase.id}/`, payload);
      setPurchases(purchases.map(p => (p.id === editPurchase.id ? response.data : p)));
      setEditPurchase(null);
      setSelectedProduct(null);
      await fetchProducts();
      toast.success('✅ Purchase updated');
    } catch (error) {
      console.error('Failed to update purchase:', error.response?.data || error.message);
      toast.error('❌ Failed to update purchase');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`purchases/${id}/`);
      setPurchases(purchases.filter(p => p.id !== id));
      await fetchProducts();
      toast.info('🗑️ Purchase deleted and stock adjusted');
    } catch (error) {
      console.error('Failed to delete purchase:', error);
    }
  };

  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredPurchases = purchases.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.purchased_by_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(p.purchased_at).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">📥 Purchases</h2>

      {/* Search Bar */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by product, user, or date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
            ❌ Clear
          </button>
        )}
      </div>

      {/* Create Purchase Form */}
      <div className="card p-3 mb-4">
        <h4>Add New Purchase</h4>
        <div className="row g-2">
          <div className="col-md-4 col-sm-6">
            <label className="form-label">Product</label>
            <select
              className="form-select"
              name="product"
              value={newPurchase.product}
              onChange={handleInputChange}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.quantity} in stock)
                </option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div className="col-12">
              <p><strong>Current Buying Price:</strong> {formatTZS(selectedProduct.buying_price)}</p>
              {selectedProduct.quantity > 1 && (
                <div className="alert alert-warning mt-2">
                  🚫 Cannot purchase: <strong>{selectedProduct.name}</strong> has sufficient stock ({selectedProduct.quantity})
                </div>
              )}
            </div>
          )}
          <div className="col-md-4 col-sm-6">
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={newPurchase.quantity}
              placeholder="Quantity"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-4 col-sm-6">
            <input
              type="number"
              className="form-control"
              name="price_per_unit"
              value={newPurchase.price_per_unit}
              placeholder="Price per unit"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-3 col-sm-6 mt-3">
            <button
              className="btn btn-success w-100"
              onClick={handleCreatePurchase}
              disabled={selectedProduct && selectedProduct.quantity > 1}
            >
              ➕ Add
            </button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      {filteredPurchases.length === 0 ? (
        <div className="alert alert-warning">No purchases match your search.</div>
      ) : (
        <div className="table-responsive">
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
              {filteredPurchases.map((purchase, index) => (
                <tr key={purchase.id}>
                  <td>{index + 1}</td>
                  <td>{purchase.product_name}</td>
                  <td>{purchase.quantity}</td>
                  <td>{formatTZS(purchase.price_per_unit)}</td>
                  <td>{formatTZS(purchase.amount)}</td>
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
        </div>
      )}

      {/* Edit Purchase Form */}
      {editPurchase && (
        <div className="card p-3 mt-4">
          <h4>Edit Purchase</h4>
          <div className="row g-2">
            <div className="col-md-4 col-sm-6">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                name="product"
                value={editPurchase.product}
                onChange={handleInputChange}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.quantity} in stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 col-sm-6">
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={editPurchase.quantity}
                placeholder="Quantity"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4 col-sm-6">
              <input
                type="number"
                className="form-control"
                name="price_per_unit"
                value={editPurchase.price_per_unit}
                placeholder="Price per unit"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 col-sm-6 mt-3 d-flex">
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