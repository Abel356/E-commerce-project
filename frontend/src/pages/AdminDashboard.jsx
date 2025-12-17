import React, { useEffect, useState } from 'react';
import { Navbar, Footer } from "../components";
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'inventory', 'customers'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthenticated");
    if (auth !== "true") {
      navigate("/admin-login");
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);




  useEffect(() => {
    
    fetch("http://localhost:5000/api/admin/orders").then(res => res.json()).then(setOrders);
    fetch("http://localhost:5000/api/products").then(res => res.json()).then(setProducts);
    fetch("http://localhost:5000/api/admin/users").then(res => res.json()).then(setUsers);
  }, []);

  // Filtering Logic for Sales
  const filteredOrders = orders.filter(order => 
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );
  if (!isAdmin) {
    return (
      <div className="container text-center my-5">
        <p>Checking authentication...</p>
      </div>
    );
  }

  const handleStockUpdate = async (id, newStock) => {
    await fetch(`http://localhost:5000/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    });
    // Refresh local state
    setProducts(products.map(p => p.id === id ? {...p, stock: newStock} : p));
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2>Admin Control Panel</h2>
          <input 
            type="text" 
            className="form-control w-25" 
            placeholder="Search..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ul className="nav nav-tabs my-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Sales History</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>Customers</button>
          </li>
        </ul>

        {activeTab === 'sales' && (
          <table className="table table-bordered">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Details</th><th>Total</th></tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.user.name}</td>
                  <td>{o.items.map(i => `${i.product.title} (x${i.quantity})`).join(", ")}</td>
                  <td>${o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'inventory' && (
          <table className="table table-bordered">
            <thead>
              <tr><th>Product</th><th>Current Stock</th><th>Action</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleStockUpdate(p.id, p.stock + 1)}>+</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleStockUpdate(p.id, p.stock - 1)}>-</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'customers' && (
          <div className="row">
            {users.map(u => (
              <div className="col-md-4 mb-3" key={u.id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>{u.name}</h5>
                    <p className="text-muted">{u.email}</p>
                    <p>Orders: {u.orders.length}</p>
                    <button className="btn btn-dark btn-sm">Edit User Info</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;