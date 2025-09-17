import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useMediaQuery } from 'react-responsive';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', category: '', quantity: 0, buying_price: '', selling_price: ''
  });
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchProducts();
  }, []);

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
    const update = editProduct ? setEditProduct : setNewProduct;
    update(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    try {
      const response = await api.post('products/', newProduct);
      setProducts([...products, response.data]);
      setNewProduct({
        name: '', description: '', category: '', quantity: 0, buying_price: '', selling_price: ''
      });
      toast.success('✅ Product added');
    } catch (error) {
      toast.error('❌ Failed to create product');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await api.put(`products/${editProduct.id}/`, editProduct);
      setProducts(products.map(p => (p.id === editProduct.id ? response.data : p)));
      setEditProduct(null);
      toast.success('✅ Product updated');
    } catch (error) {
      toast.error('❌ Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`products/${id}/`);
      setProducts(products.filter(p => p.id !== id));
      toast.info('🗑️ Product deleted');
    } catch (error) {
      toast.error('❌ Failed to delete product');
    }
  };

  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderQuantityStatus = (product) => {
    if (product.quantity === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    }
    if (product.low_stock) {
      return <span className="badge bg-warning text-dark">Low Stock ({product.quantity})</span>;
    }
    return product.quantity;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">📦 Products</h2>

      {/* Search Bar */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by name, description, or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
            ❌ Clear
          </button>
        )}
      </div>

      {/* Create Product Form */}
      <div className="card p-3 mb-4">
        <h4>{editProduct ? 'Edit Product' : 'Add New Product'}</h4>
        <div className="row g-3">
          {['name', 'description', 'category', 'buying_price', 'selling_price', 'quantity'].map((field) => (
            <div className="col-sm-12 col-md-6" key={field}>
              <input
                type={['buying_price', 'selling_price', 'quantity'].includes(field) ? 'number' : 'text'}
                className="form-control"
                placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                name={field}
                value={editProduct ? editProduct[field] : newProduct[field]}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className="col-sm-12 d-flex gap-2 mt-2">
            {editProduct ? (
              <>
                <button className="btn btn-primary w-50" onClick={handleUpdateProduct}>💾 Save</button>
                <button className="btn btn-secondary w-50" onClick={() => setEditProduct(null)}>❌ Cancel</button>
              </>
            ) : (
              <button className="btn btn-success w-100" onClick={handleCreateProduct}>➕ Add</button>
            )}
          </div>
        </div>
      </div>

      {/* Product Display */}
      {filteredProducts.length === 0 ? (
        <p>No products match your search.</p>
      ) : isMobile ? (
        <div className="row">
          {filteredProducts.map((product) => (
            <div className="col-sm-12 mb-3" key={product.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Buying:</strong> {formatTZS(product.buying_price)}</p>
                  <p><strong>Selling:</strong> {formatTZS(product.selling_price)}</p>
                  <p><strong>Quantity:</strong> {renderQuantityStatus(product)}</p>
                  <p><strong>Total Value:</strong> {formatTZS(product.total_value)}</p>
                  <p><strong>Created:</strong> {new Date(product.created_at).toLocaleString()}</p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-warning w-50" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-sm btn-danger w-50" onClick={() => handleDelete(product.id)}>Delete</button>
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
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Total Value</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.category}</td>
                  <td>{formatTZS(product.buying_price)}</td>
                  <td>{formatTZS(product.selling_price)}</td>
                  <td>{renderQuantityStatus(product)}</td>
                  <td>{formatTZS(product.total_value)}</td>
                  <td>{new Date(product.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
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

export default Products;