import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useMediaQuery } from 'react-responsive';
import './Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [newSale, setNewSale] = useState({ product: '', quantity: '', price_per_unit: '' });
  const [editSale, setEditSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('sales/');
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (error) {
      toast.error('❌ Failed to fetch sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('products/');
      setProducts(response.data);
    } catch (error) {
      toast.error('❌ Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updater = editSale ? setEditSale : setNewSale;
    updater(prev => ({ ...prev, [name]: value }));

    if (name === 'product') {
      const productObj = products.find(p => p.id === parseInt(value));
      setSelectedProduct(productObj || null);

      if (!editSale && productObj) {
        setNewSale(prev => ({
          ...prev,
          price_per_unit: productObj.selling_price
        }));
      }
    }
  };

  const handleCreateSale = async () => {
    try {
      const { product, quantity, price_per_unit } = newSale;
      if (parseInt(quantity) <= 0 || parseFloat(price_per_unit) <= 0) {
        toast.error("❌ Quantity and price must be greater than zero");
        return;
      }

      if (selectedProduct && selectedProduct.quantity < parseInt(quantity)) {
        toast.warning(`🚫 Not enough stock for '${selectedProduct.name}' (${selectedProduct.quantity} available)`);
        return;
      }

      const payload = { product, quantity, price_per_unit };
      const response = await api.post('sales/', payload);
      const updated = [...sales, response.data];
      setSales(updated);
      setFilteredSales(updated);
      setNewSale({ product: '', quantity: '', price_per_unit: '' });
      setSelectedProduct(null);
      await fetchProducts();
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
    const productObj = products.find(p => p.id === sale.product);
    setSelectedProduct(productObj || null);
  };

  const handleUpdateSale = async () => {
    try {
      const { product, quantity, price_per_unit } = editSale;
      const payload = { product, quantity, price_per_unit };
      const response = await api.put(`sales/${editSale.id}/`, payload);
      const updated = sales.map(s => (s.id === editSale.id ? response.data : s));
      setSales(updated);
      setFilteredSales(updated);
      setEditSale(null);
      setSelectedProduct(null);
      await fetchProducts();
      toast.success('✅ Sale updated');
    } catch (error) {
      const msg = error.response?.data?.quantity || 'Failed to update sale';
      toast.error(`❌ ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`sales/${id}/`);
      const updated = sales.filter(s => s.id !== id);
      setSales(updated);
      setFilteredSales(updated);
      await fetchProducts();
      toast.info('🗑️ Sale deleted and stock restored');
    } catch (error) {
      toast.error('❌ Failed to delete sale');
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
        {product.name} ({product.quantity} in stock)
      </option>
    ));
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    if (!query) {
      setFilteredSales(sales);
      return;
    }

    const results = sales.filter(
      (sale) =>
        sale.product_name.toLowerCase().includes(query) ||
        (sale.sold_by_username && sale.sold_by_username.toLowerCase().includes(query)) ||
        new Date(sale.sold_at).toLocaleDateString().toLowerCase().includes(query)
    );
    setFilteredSales(results);
  };

  const clearSearch = () => {
    setSearch('');
    setFilteredSales(sales);
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">🧾 Sales</h2>

      {/* Search Bar */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by product, seller, or date..."
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button className="btn btn-outline-secondary" onClick={clearSearch}>
            ❌ Clear
          </button>
        )}
      </div>

      {/* Add New Sale Form (CARD STYLE) */}
      {!editSale && (
        <div className="card p-3 mb-4 shadow-sm">
          <h4 className="mb-3">➕ Add New Sale</h4>
          <div className="row g-3">
            <div className="col-sm-12 col-md-6">
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
            <div className="col-sm-12 col-md-6">
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={newSale.quantity}
                placeholder="Quantity"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-sm-12 col-md-6">
              <input
                type="number"
                className="form-control"
                name="price_per_unit"
                value={newSale.price_per_unit}
                placeholder="Selling Price"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-sm-12 mt-2 d-flex">
              <button
                className="btn btn-success w-100"
                onClick={handleCreateSale}
                disabled={selectedProduct && selectedProduct.quantity < parseInt(newSale.quantity)}
              >
                ➕ Add Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Table / Mobile Cards */}
      {filteredSales.length === 0 ? (
        <div className="alert alert-warning">No sales records available.</div>
      ) : isMobile ? (
        <div className="row">
          {filteredSales.map((sale, index) => (
            <div className="col-sm-12 mb-3" key={sale.id || index}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{sale.product_name}</h5>
                  <p><strong>Quantity:</strong> {sale.quantity}</p>
                  <p><strong>Price:</strong> {formatTZS(sale.price_per_unit)}</p>
                  <p><strong>Total:</strong> {formatTZS(sale.amount)}</p>
                  <p><strong>Sold By:</strong> {sale.sold_by_username || '—'}</p>
                  <p><strong>Date:</strong> {new Date(sale.sold_at).toLocaleString()}</p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-warning w-50" onClick={() => handleEdit(sale)}>Edit</button>
                    <button className="btn btn-sm btn-danger w-50" onClick={() => handleDelete(sale.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Selling Price</th>
                <th>Total</th>
                <th>Sold By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
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
        </div>
      )}

      {/* Edit Sale Form */}
      {editSale && (
        <div className="card p-3 mt-4 shadow-sm">
          <h4>Edit Sale</h4>
          <div className="row g-2">
            <div className="col-md-4 col-sm-6">
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
            {selectedProduct && (
              <div className="col-12">
                <p><strong>Selling Price:</strong> {formatTZS(selectedProduct.selling_price)}</p>
                <small className="text-muted">Available stock: {selectedProduct.quantity}</small>
              </div>
            )}
            <div className="col-md-4 col-sm-6">
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={editSale.quantity}
                placeholder="Quantity"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4 col-sm-6">
              <input
                type="number"
                className="form-control"
                name="price_per_unit"
                value={editSale.price_per_unit}
                placeholder="Selling Price"
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 col-sm-6 mt-3 d-flex">
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
