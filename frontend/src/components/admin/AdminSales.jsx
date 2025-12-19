import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const AdminSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    userId: "",
    productId: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load sales history");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const customers = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const u = o.user;
      if (!u?.id) continue;
      map.set(u.id, u.name ? `${u.name} (${u.email})` : u.email);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [orders]);

  const products = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      for (const it of o.items || []) {
        const p = it.product;
        if (!p?.id) continue;
        map.set(p.id, p.title || `Product ${p.id}`);
      }
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const uid = filters.userId ? Number(filters.userId) : null;
    const pid = filters.productId ? Number(filters.productId) : null;

    const fromDate = filters.from ? new Date(filters.from + "T00:00:00") : null;
    const toDate = filters.to ? new Date(filters.to + "T23:59:59.999") : null;

    return orders.filter((o) => {
      const orderUserId = o.userId ?? o.user?.id;
      if (uid && Number(orderUserId) !== uid) return false;

      if (fromDate || toDate) {
        const d = new Date(o.createdAt);
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
      }

      if (pid) {
        const has = (o.items || []).some((it) => {
          const itemPid = it.productId ?? it.product?.id;
          return Number(itemPid) === pid;
        });
        if (!has) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const clear = () => setFilters({ userId: "", productId: "", from: "", to: "" });

  return (
    <div className="card">
      <div className="card-header bg-light">
        <strong>Sales History</strong>
      </div>

      <div className="card-body">
        <div className="row g-3 mb-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label">Customer</label>
            <select className="form-select" name="userId" value={filters.userId} onChange={onFilterChange}>
              <option value="">All</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Product</label>
            <select className="form-select" name="productId" value={filters.productId} onChange={onFilterChange}>
              <option value="">All</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">From</label>
            <input className="form-control" type="date" name="from" value={filters.from} onChange={onFilterChange} />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">To</label>
            <input className="form-control" type="date" name="to" value={filters.to} onChange={onFilterChange} />
          </div>

          <div className="col-12 col-md-2">
            <button className="btn btn-outline-secondary w-100" type="button" onClick={clear}>
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted m-0">Loading orders...</p>
        ) : visibleOrders.length === 0 ? (
          <p className="text-muted m-0">No matching orders.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {visibleOrders.map((o) => (
              <details key={o.id} className="border rounded p-3">
                <summary style={{ cursor: "pointer" }}>
                  <strong>Order #{o.id}</strong>
                  <span className="ms-2 text-muted" style={{ fontSize: 13 }}>
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                  <span className="ms-3">
                    Total: <strong>${Number(o.total || 0).toFixed(2)}</strong>
                  </span>
                </summary>

                <div className="mt-3">
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Customer: <strong>{o.user?.name ? `${o.user.name} (${o.user.email})` : o.user?.email}</strong>
                  </div>

                  <hr />

                  {(o.items || []).length === 0 ? (
                    <p className="text-muted m-0">No items.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th style={{ width: 110 }}>Price</th>
                            <th style={{ width: 80 }}>Qty</th>
                            <th style={{ width: 110 }}>Line</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(o.items || []).map((it) => (
                            <tr key={it.id}>
                              <td>{it.product?.title || "Unknown product"}</td>
                              <td>${Number(it.product?.price || 0).toFixed(2)}</td>
                              <td>{it.quantity}</td>
                              <td>${(Number(it.product?.price || 0) * Number(it.quantity || 0)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSales;
