import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components";
import toast from "react-hot-toast";

const Account = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",

    shippingAddress: "",
    shippingAddress2: "",
    shippingCountry: "",
    shippingState: "",
    shippingZip: "",

    cardName: "",
    cardNumber: "",
    cardExpiry: "",
  });

  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setAuthUser(parsed);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!authUser?.id) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/users/${authUser.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load profile");

        setProfile((p) => ({
          ...p,
          ...data,
          email: data.email || p.email,
        }));
      } catch (e) {
        console.error(e);
        toast.error("Could not load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(`/api/users/${authUser.id}/orders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Could not load purchase history");
      } finally {
        setLoadingOrders(false);
      }
    };

    loadProfile();
    loadOrders();
  }, [authUser]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!authUser?.id) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${authUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          shippingAddress: profile.shippingAddress,
          shippingAddress2: profile.shippingAddress2,
          shippingCountry: profile.shippingCountry,
          shippingState: profile.shippingState,
          shippingZip: profile.shippingZip,
          cardName: profile.cardName,
          cardNumber: profile.cardNumber,
          cardExpiry: profile.cardExpiry,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setProfile((p) => ({ ...p, ...data }));

      // update localStorage so Navbar greeting stays correct
      const updatedStored = { ...authUser, name: data.name };
      localStorage.setItem("user", JSON.stringify(updatedStored));
      setAuthUser(updatedStored);

      toast.success("Account updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">My Account</h1>
        <hr />

        <div className="row g-4">
          {/* Profile */}
          <div className="col-12 col-lg-5">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Profile</h5>
              </div>
              <div className="card-body">
                {loadingProfile ? (
                  <p className="text-muted m-0">Loading profile...</p>
                ) : (
                  <form onSubmit={onSave}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        value={profile.email || authUser?.email || ""}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        name="name"
                        value={profile.name || ""}
                        onChange={onChange}
                        placeholder="Your name"
                      />
                    </div>

                    <hr />

                    <h6 className="mb-3">Shipping</h6>

                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        name="shippingAddress"
                        value={profile.shippingAddress || ""}
                        onChange={onChange}
                        placeholder="1234 Main St"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address 2</label>
                      <input
                        className="form-control"
                        name="shippingAddress2"
                        value={profile.shippingAddress2 || ""}
                        onChange={onChange}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Country</label>
                        <input
                          className="form-control"
                          name="shippingCountry"
                          value={profile.shippingCountry || ""}
                          onChange={onChange}
                          placeholder="Canada"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">State/Province</label>
                        <input
                          className="form-control"
                          name="shippingState"
                          value={profile.shippingState || ""}
                          onChange={onChange}
                          placeholder="Ontario"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Postal/Zip</label>
                        <input
                          className="form-control"
                          name="shippingZip"
                          value={profile.shippingZip || ""}
                          onChange={onChange}
                          placeholder="M1M 1M1"
                        />
                      </div>
                    </div>

                    <hr />

                    <h6 className="mb-3">Payment</h6>

                    <div className="mb-3">
                      <label className="form-label">Name on card</label>
                      <input
                        className="form-control"
                        name="cardName"
                        value={profile.cardName || ""}
                        onChange={onChange}
                        placeholder="Name on card"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label className="form-label">Card number</label>
                        <input
                          className="form-control"
                          name="cardNumber"
                          value={profile.cardNumber || ""}
                          onChange={onChange}
                          placeholder="1111 2222 3333 4444"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Expiry</label>
                        <input
                          className="form-control"
                          name="cardExpiry"
                          value={profile.cardExpiry || ""}
                          onChange={onChange}
                          placeholder="MM/YY"
                        />
                      </div>
                    </div>

                    <button
                      className="btn btn-dark w-100"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="col-12 col-lg-7">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Purchase History</h5>
              </div>
              <div className="card-body">
                {loadingOrders ? (
                  <p className="text-muted m-0">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-muted m-0">No orders yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Order #{order.id}</strong>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <strong>${Number(order.total).toFixed(2)}</strong>
                          </div>
                        </div>

                        <hr />

                        {order.items?.length ? (
                          <ul className="list-unstyled mb-0">
                            {order.items.map((it) => (
                              <li key={it.id} className="d-flex align-items-center mb-2">
                                {it.product?.image ? (
                                  <img
                                    src={it.product.image}
                                    alt={it.product.title}
                                    width={44}
                                    height={34}
                                    style={{ objectFit: "cover" }}
                                    className="me-2 rounded"
                                  />
                                ) : null}
                                <div className="flex-grow-1">
                                  <div style={{ fontSize: 14 }}>
                                    {it.product?.title || "Unknown product"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: 13 }}>
                                    Qty: {it.quantity}
                                    {" · "}
                                    ${Number(it.product?.price || 0).toFixed(2)}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted m-0">No items found for this order.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Account;
