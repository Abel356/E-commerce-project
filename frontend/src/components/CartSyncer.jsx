import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../redux/action";

const CartSyncer = () => {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.handleCart);

  const [user, setUser] = useState(null);
  const hydratedRef = useRef(false);
  const timeoutRef = useRef(null);

  // keep user state updated
  useEffect(() => {
    const readUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };

    readUser();

    const onAuth = () => readUser();
    window.addEventListener("authChanged", onAuth);
    window.addEventListener("storage", onAuth);

    return () => {
      window.removeEventListener("authChanged", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  // hydrate cart from DB once per login session
  useEffect(() => {
    const hydrate = async () => {
      if (!user?.id) {
        hydratedRef.current = false;
        return;
      }

      try {
        const res = await fetch(`/api/users/${user.id}/cart`);
        const data = await res.json();
        if (res.ok) {
          dispatch(setCart(Array.isArray(data) ? data : []));
        }
        hydratedRef.current = true;
      } catch {
        hydratedRef.current = true;
      }
    };

    hydrate();
  }, [user?.id, dispatch]);

  // sync changes to DB (debounced)
  useEffect(() => {
    if (!user?.id) return;
    if (!hydratedRef.current) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const items = cart.map((it) => ({
        productId: it.id,
        quantity: it.qty,
      }));

      try {
        await fetch(`/api/users/${user.id}/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
      } catch {}
    }, 400);

    return () => clearTimeout(timeoutRef.current);
  }, [cart, user?.id]);

  return null;
};

export default CartSyncer;
