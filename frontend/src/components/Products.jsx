import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Products = ({ showSearch = true }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  let componentMounted = true;

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  const matchesQuery = (product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const haystack = `${product?.title ?? ""} ${product?.description ?? ""} ${
      product?.category ?? ""
    }`.toLowerCase();

    return haystack.includes(q);
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);

      // Keep existing call (works with the new backend search too)
      const response = await fetch("/api/products");

      if (componentMounted) {
        setData(await response.clone().json());
        setFilter(await response.json());
        setLoading(false);
      }

      return () => {
        componentMounted = false;
      };
    };

    getProducts();
  }, []);

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };

  const ShowProducts = () => {
    const visible = filter.filter(matchesQuery);

    return (
      <>
        <div className="buttons text-center py-5">
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => setFilter(data)}>
            All
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("men's clothing")}>
            Men's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("women's clothing")}>
            Women's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("jewelery")}>
            Jewelery
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("electronics")}>
            Electronics
          </button>
        </div>

        {showSearch && (
          <div className="col-12 mb-3">
            <input
              className="form-control"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, keyword..."
            />
          </div>
        )}

        {visible.length === 0 ? (
          <div className="col-12 text-center py-4">
            <p className="text-muted m-0">No products match your search.</p>
          </div>
        ) : (
          visible.map((product) => {
            return (
              <div id={product.id} key={product.id} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <div className="card text-center h-100" key={product.id}>
                  <img
                    className="card-img-top p-3"
                    src={product.image}
                    alt="Card"
                    height={300}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {product.title.substring(0, 12)}.....
                    </h5>
                    <p className="card-text">
                      {product.description.substring(0, 90)}....
                    </p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item lead">$ {product.price}</li>
                  </ul>
                  <div className="card-body">
                    <Link to={"/product/" + product.id} className="btn btn-dark m-1">
                      Buy Now
                    </Link>
                    <button
                      className="btn btn-dark m-1"
                      onClick={() => {
                        toast.success("Added to cart");
                        addProduct(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? Loading() : ShowProducts()}
        </div>
      </div>
    </>
  );
};

export default Products;
