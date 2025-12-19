import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const fieldGroups = {
  Account: [
    ["name", "Name"],
    ["email", "Email"],
  ],
  Shipping: [
    ["shippingAddress", "Address"],
    ["shippingAddress2", "Address 2"],
    ["shippingCountry", "Country"],
    ["shippingState", "State/Province"],
    ["shippingZip", "Postal/Zip"],
  ],
  Billing: [
    ["cardName", "Name on card"],
    ["cardNumber", "Card number"],
    ["cardExpiry", "Expiry"],
  ],
};

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load users");
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load customers");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const loadCustomer = async (id) => {
    if (!id) return;

    setLoadingCustomer(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/users/${id}/orders`),
      ]);

      const pData = await pRes.json().catch(() => ({}));
      const oData = await oRes.json().catch(() => ([]));

      if (!pRes.ok) throw new Error(pData?.error || "Failed to load profile");
      if (!oRes.ok) throw new Error(oData?.error || "Failed to load orders");

      setProfile(pData);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load customer");
    } finally {
      setLoadingCustomer(false);
    }
  };

  const onPick = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    setProfile(null);
    setOrders([]);
    if (id) loadCustomer(id);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const save = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setProfile(data);
      toast.success("Customer updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const nonAdminUsers = users.filter((u) => (u.role || "").toUpperCase() !== "ADMIN");

  return (
    <div className="card">
      <div className="card-header bg-light">
        <strong>Customer Accounts</strong>
      </div>

      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Select customer</label>
          <select className="form-select" value={selectedId} onChange={onPick} disabled={loadingUsers}>
            <option value="">
              {loadingUsers ? "Loading..." : "Pick one..."}
            </option>
            {nonAdminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ? `${u.name} (${u.email})` : u.email}
              </option>
            ))}
          </select>
        </div>

        {loadingCustomer ? (
          <p className="text-muted m-0">Loading customer...</p>
        ) : !profile ? (
          <p className="text-muted m-0">Choose a customer to view/edit their info and history.</p>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              {Object.entries(fieldGroups).map(([group, fields]) => (
                <div key={group} className="mb-3">
                  <h6 className="mb-2">{group}</h6>
                  {fields.map(([key, label]) => (
                    <div className="mb-2" key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-control"
                        name={key}
                        value={profile[key] || ""}
                        onChange={onChange}
                        disabled={key === "email"} // keep email stable, less headaches
                      />
                    </div>
                  ))}
                  <hr />
                </div>
              ))}

              <button className="btn btn-dark w-100" type="button" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="col-12 col-lg-6">
              <h6 className="mb-2">Purchase History</h6>
              {orders.length === 0 ? (
                <p className="text-muted m-0">No orders yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {orders.map((o) => (
                    <div key={o.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between">
                        <strong>Order #{o.id}</strong>
                        <strong>${Number(o.total || 0).toFixed(2)}</strong>
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        {new Date(o.createdAt).toLocaleString()}
                      </div>

                      <hr />

                      {(o.items || []).length === 0 ? (
                        <p className="text-muted m-0">No items.</p>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {(o.items || []).map((it) => (
                            <li key={it.id} className="mb-2">
                              <div style={{ fontSize: 14 }}>
                                {it.product?.title || "Unknown product"}
                              </div>
                              <div className="text-muted" style={{ fontSize: 13 }}>
                                Qty: {it.quantity} {" · "}
                                ${Number(it.product?.price || 0).toFixed(2)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
