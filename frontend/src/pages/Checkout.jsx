import { useState } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { emptyCart } from "../redux/action";

const EmptyCart = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 py-5 bg-light text-center">
          <h4 className="p-3 display-5">No item in Cart</h4>
          <Link to="/" className="btn btn-outline-dark mx-4">
            <i className="fa fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const ShowCheckout = ({ state, formData, handleInputChange, handleSubmit }) => {
  const shipping = 30.0;

  const subtotal = state.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = state.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="container py-5">
      <div className="row my-4">
        <div className="col-md-5 col-lg-4 order-md-last">
          <div className="card mb-4">
            <div className="card-header py-3 bg-light">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                  Products ({totalItems}) <span>${Math.round(subtotal)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  Shipping <span>${shipping}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                  <div>
                    <strong>Total amount</strong>
                  </div>
                  <span>
                    <strong>${Math.round(subtotal + shipping)}</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-7 col-lg-8">
          <div className="card mb-4">
            <div className="card-header py-3">
              <h4 className="mb-0">Billing address</h4>
            </div>
            <div className="card-body">
              <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-sm-6 my-1">
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-sm-6 my-1">
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 my-1">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 my-1">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      placeholder="1234 Main St"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 my-1">
                    <label htmlFor="address2" className="form-label">
                      Address 2 <span className="text-muted">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address2"
                      placeholder="Apartment or suite"
                    />
                  </div>

                  <div className="col-md-5 my-1">
                    <label htmlFor="country" className="form-label">
                      Country
                    </label>
                    <select
                      className="form-select"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  <div className="col-md-4 my-1">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <select
                      className="form-select"
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>

                  <div className="col-md-3 my-1">
                    <label htmlFor="zip" className="form-label">
                      Zip
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h4 className="mb-3">Payment</h4>

                <div className="row gy-3">
                  <div className="col-md-6">
                    <label htmlFor="cc-name" className="form-label">
                      Name on card
                    </label>
                    <input type="text" className="form-control" id="cc-name" required />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cc-number" className="form-label">
                      Card number
                    </label>
                    <input type="text" className="form-control" id="cc-number" required />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="cc-expiration" className="form-label">
                      Expiration
                    </label>
                    <input type="text" className="form-control" id="cc-expiration" required />
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="cc-cvv" className="form-label">
                      CVV
                    </label>
                    <input type="text" className="form-control" id="cc-cvv" required />
                  </div>
                </div>

                <hr className="my-4" />

                <button className="w-100 btn btn-primary" type="submit">
                  Continue to checkout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    country: "India",
    state: "Punjab",
    zip: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const shipping = 30.0;
    const subtotal = state.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalAmount = subtotal + shipping;

    const orderPayload = {
      userData: formData,
      cartItems: state,
      totalAmount,
    };

    try {
      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (data.success) {
        const summaryInfo = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          items: [...state],
          total: totalAmount,
          orderId: data.orderId,
        };

        alert(`Order Successful! Your Order ID is: ${data.orderId}`);
        dispatch(emptyCart());

        // If you don't have an OrderSummary page/route, change this to navigate("/")
        navigate("/order-summary", { state: summaryInfo });
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Checkout</h1>
        <hr />
        {state.length ? (
          <ShowCheckout
            state={state}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        ) : (
          <EmptyCart />
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
