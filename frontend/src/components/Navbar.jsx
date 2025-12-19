import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const state = useSelector((state) => state.handleCart);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return setUser(null);
    try { setUser(JSON.parse(storedUser)); }
    catch { setUser(null); }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top">
      <div className="container">
        <NavLink className="navbar-brand fw-bold fs-4 px-2" to="/">
          Ecommerce Website
        </NavLink>
        <button
          className="navbar-toggler mx-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto my-2 text-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="buttons text-center">
            {user ? (
              <>
                <span className="mx-2">Hi, {user.name || user.email}</span>

                <NavLink to="/account" className="btn btn-outline-dark m-2">
                  <i className="fa fa-user me-1"></i> Account
                </NavLink>

                <button
                  className="btn btn-outline-dark m-2"
                  type="button"
                  onClick={handleLogout}
                >
                  <i className="fa fa-sign-out me-1"></i> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline-dark m-2">
                  <i className="fa fa-sign-in me-1"></i> Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-dark m-2">
                  <i className="fa fa-user-plus me-1"></i> Register
                </NavLink>
              </>
            )}

            <NavLink to="/admin-login" className="btn btn-outline-dark m-2">
              <i className="fa fa-sign-in me-1"></i> Admin
            </NavLink>

            <NavLink to="/cart" className="btn btn-outline-dark m-2">
              <i className="fa fa-shopping-cart me-1"></i> Cart ({state.length})
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
