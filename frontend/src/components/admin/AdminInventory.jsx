import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load products");

        setProducts(Array.isArray(data) ? data : []);
        const map = {};
        for (const p of data || []) map[p.id] = p.stock ?? 0;
        setStock(map);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const update = async (id) => {
    const next = Number(stock[id]);
    if (!Number.isFinite(next) || next < 0) {
      toast.error("Stock must be 0 or higher");
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: next }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      toast.success("Inventory updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update inventory");
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-light">
        <strong>Inventory</strong>
      </div>

      <div className="card-body">
        {loading ? (
          <p className="text-muted m-0">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-muted m-0">No products found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Product</th>
                  <th style={{ width: 120 }}>Current</th>
                  <th style={{ width: 140 }}>New</th>
                  <th style={{ width: 140 }}>Save</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <div><strong>{p.title}</strong></div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        ${Number(p.price || 0).toFixed(2)}
                      </div>
                    </td>
                    <td>{p.stock ?? 0}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={stock[p.id] ?? 0}
                        onChange={(e) => setStock((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      />
                    </td>
                    <td>
                      <button className="btn btn-dark w-100" type="button" onClick={() => update(p.id)}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
