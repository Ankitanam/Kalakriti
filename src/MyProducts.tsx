import { useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
}

export default function MyProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      try {
        const saved = localStorage.getItem("artisanProducts");
        const parsed = saved ? JSON.parse(saved) : [];
        setProducts(Array.isArray(parsed) ? parsed : []);
      } catch {
        setProducts([]);
      }
    };

    loadProducts();

    window.addEventListener("artisanProductsUpdated", loadProducts);

    return () => {
      window.removeEventListener("artisanProductsUpdated", loadProducts);
    };
  }, []);

  return (
    <div
      className="min-h-full p-6"
      style={{
        background: "#FFFBF7",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p
            className="text-sm font-semibold"
            style={{ color: "#9C6644" }}
          >
            ARTISAN DASHBOARD
          </p>

          <h1
            className="text-3xl font-bold mt-1"
            style={{
              color: "#3D1F0F",
              fontFamily: "'Noto Serif', serif",
            }}
          >
            My Products
          </h1>

          <p
            className="text-sm mt-2"
            style={{ color: "#9C6644" }}
          >
            Products created and published through your artisan store.
          </p>
        </div>

        {products.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "#FFF8F3",
              border: "1.5px solid rgba(196,136,107,0.2)",
            }}
          >
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "#F0E1D6" }}
            >
              🏺
            </div>

            <h2
              className="text-lg font-bold"
              style={{ color: "#3D1F0F" }}
            >
              No products yet
            </h2>

            <p
              className="text-sm mt-2"
              style={{ color: "#9C6644" }}
            >
              Create your first AI-powered product listing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl p-5"
                style={{
                  background: "#FFF8F3",
                  border: "1.5px solid rgba(196,136,107,0.2)",
                  boxShadow: "0 8px 24px rgba(107,58,42,0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        className="text-xl font-bold"
                        style={{
                          color: "#3D1F0F",
                          fontFamily: "'Noto Serif', serif",
                        }}
                      >
                        {product.title}
                      </h2>

                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "rgba(22,163,74,0.1)",
                          color: "#16A34A",
                        }}
                      >
                        ● Published
                      </span>
                    </div>

                    <p
                      className="text-sm mt-1"
                      style={{ color: "#9C6644" }}
                    >
                      {product.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: "#6B3A2A",
                        fontFamily: "'Noto Serif', serif",
                      }}
                    >
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#9C6644" }}
                    >
                      ONDC Ready
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}