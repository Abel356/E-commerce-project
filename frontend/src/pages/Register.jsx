import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Footer, Navbar } from "../components";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",

    shippingAddress: "",
    shippingAddress2: "",
    shippingCountry: "",
    shippingState: "",
    shippingZip: "",

    cardName: "",
    cardNumber: "",
    cardExpiry: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Registration failed");
        return;
      }

      toast.success("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Register</h1>
        <hr />

        <div className="row my-4 h-100">
          <div className="col-md-6 col-lg-6 col-sm-10 mx-auto">
            <form onSubmit={handleSubmit}>
              <h5 className="mb-3">Account</h5>

              <div className="form my-3">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form my-3">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form my-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>

              <hr className="my-4" />

              <h5 className="mb-3">Shipping</h5>

              <div className="form my-3">
                <label htmlFor="shippingAddress">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="1234 Main St"
                />
              </div>

              <div className="form my-3">
                <label htmlFor="shippingAddress2">Address 2</label>
                <input
                  type="text"
                  className="form-control"
                  id="shippingAddress2"
                  value={formData.shippingAddress2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc (Optional)"
                />
              </div>

              <div className="row">
                <div className="col-md-4 form my-3">
                  <label htmlFor="shippingCountry">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    id="shippingCountry"
                    value={formData.shippingCountry}
                    onChange={handleChange}
                    placeholder="Canada"
                  />
                </div>

                <div className="col-md-4 form my-3">
                  <label htmlFor="shippingState">State/Province</label>
                  <input
                    type="text"
                    className="form-control"
                    id="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    placeholder="Ontario"
                  />
                </div>

                <div className="col-md-4 form my-3">
                  <label htmlFor="shippingZip">Postal/Zip</label>
                  <input
                    type="text"
                    className="form-control"
                    id="shippingZip"
                    value={formData.shippingZip}
                    onChange={handleChange}
                    placeholder="M1M 1M1"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <h5 className="mb-3">Payment</h5>

              <div className="form my-3">
                <label htmlFor="cardName">Name on card</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="Full name on card"
                />
              </div>

              <div className="form my-3">
                <label htmlFor="cardNumber">Card number</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4111 1111 1111 1111"
                />
              </div>

              <div className="form my-3">
                <label htmlFor="cardExpiry">Expiry</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                />
              </div>

              <div className="my-3">
                <p>
                  Already has an account?{" "}
                  <Link to="/login" className="text-decoration-underline text-info">
                    Login
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <button className="my-2 mx-auto btn btn-dark" type="submit">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
