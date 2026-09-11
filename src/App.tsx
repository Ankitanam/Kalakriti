
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { generateProductFromImage } from "./lib/gemini";
import Auth from "./Auth";
import ArtisanWorld from "./components/ArtisanWorld";
import GameWorld from "./components/GameWorld";

function App() {
  // =========================
  // AUTH
  // =========================
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [artisanName, setArtisanName] = useState("");
  const [artisanBio, setArtisanBio] = useState("");
  const [artisanLocation, setArtisanLocation] = useState("");
  const [artisanPhone, setArtisanPhone] = useState("");

  const [artisans, setArtisans] = useState<any[]>([]);
  const [artisanProducts, setArtisanProducts] = useState<any[]>([]);

  // =========================
  // PRODUCT STATES
  // =========================
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [image, setImage] = useState<File | null>(null);

  const [selectedArtisan, setSelectedArtisan] = useState<any | null>(null);

  // ALL PRODUCTS
  const [products, setProducts] = useState<any[]>([]);

  // ONLY LOGGED-IN ARTISAN'S PRODUCTS
  const [myProducts, setMyProducts] = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [aiLoading, setAiLoading] = useState(false);

  // =========================
  // PAGE STATES
  // =========================
  const [showDashboard, setShowDashboard] = useState(false);
  const [role, setRole] = useState("");
  const [showMyOrders, setShowMyOrders] = useState(false);

  // =========================
  // EDIT PRODUCT
  // =========================
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // =========================
  // MESSAGES
  // =========================
  const [messages, setMessages] = useState<any[]>([]);
  const [showContact, setShowContact] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [messageText, setMessageText] = useState("");

  // =========================
  // ORDERS
  // =========================
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  // =========================================================
  // AUTHENTICATION
  // =========================================================
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // GET PRODUCTS OF ONE ARTISAN
  // =========================================================
  const getArtisanProducts = async (artisanId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("artisan_id", artisanId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("Artisan products error:", error);
      setArtisanProducts([]);
      return;
    }

    setArtisanProducts(data || []);
  };

  // =========================================================
  // GET ALL ARTISANS
  // =========================================================
  const getArtisans = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, bio, location")
      .eq("role", "artisan");

    if (error) {
      console.log("Artisans error:", error);
      return;
    }

    setArtisans(data || []);
  };

  // =========================================================
  // GET ALL PRODUCTS
  // IMPORTANT:
  // We DO NOT use profiles(...) here because there is
  // no Supabase foreign-key relationship between products
  // and profiles.
  // =========================================================
  const getProducts = async () => {
    const { data: productData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (productsError) {
      console.log("Products error:", productsError);
      return;
    }

    const allProducts = productData || [];

    // Get unique artisan IDs
    const artisanIds = [
      ...new Set(
        allProducts
          .map((product) => product.artisan_id)
          .filter(Boolean)
      ),
    ];

    let profiles: any[] = [];

    // Only query profiles if there are artisan IDs
    if (artisanIds.length > 0) {
      const {
        data: profileData,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select("id, name, bio, location")
        .in("id", artisanIds);

      if (profilesError) {
        console.log("Profiles error:", profilesError);
      } else {
        profiles = profileData || [];
      }
    }

    // Match products with artisans manually
    const productsWithArtisans = allProducts.map((product) => {
      const artisan = profiles.find(
        (profile) => profile.id === product.artisan_id
      );

      return {
        ...product,
        artisan: artisan || null,
      };
    });

    console.log("Products:", productsWithArtisans);

    setProducts(productsWithArtisans);
  };

  // =========================================================
  // GET PROFILE
  // =========================================================
  const getProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name, bio, location, phone")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("Profile error:", error);
      return;
    }

    setArtisanName(data.name || "");
    setArtisanBio(data.bio || "");
    setArtisanLocation(data.location || "");
    setArtisanPhone(data.phone || "");
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================
  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: artisanName,
        bio: artisanBio,
        location: artisanLocation,
        phone: artisanPhone,
      })
      .eq("id", user.id);

    if (error) {
      console.log("Profile update error:", error);
      alert("Profile could not be updated.");
      return;
    }

    alert("Profile updated successfully!");
    getArtisans();
  };

  // =========================================================
  // GET ONLY MY PRODUCTS
  // =========================================================
  const getMyProducts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMyProducts([]);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("artisan_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("My products error:", error);
      return;
    }

    setMyProducts(data || []);
  };

  // =========================================================
  // GET ARTISAN MESSAGES
  // =========================================================
  const getMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        sender_name,
        message,
        created_at,
        products (
          title,
          artisan_id
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("Messages error:", error);
      return;
    }

    const myMessages = (data || []).filter(
      (item: any) => item.products?.artisan_id === user.id
    );

    setMessages(myMessages);
  };

  // =========================================================
  // GET ARTISAN ORDERS
  // =========================================================
  const getOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setOrders([]);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        buyer_name,
        buyer_email,
        quantity,
        total_price,
        status,
        created_at,
        products (
          title,
          artisan_id
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("Orders error:", error);
      return;
    }

    const myOrders = (data || []).filter(
      (item: any) => item.products?.artisan_id === user.id
    );

    setOrders(myOrders);
  };

  // =========================================================
  // GET BUYER ORDERS
  // =========================================================
  const getBuyerOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setOrders([]);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        buyer_name,
        buyer_email,
        quantity,
        total_price,
        status,
        created_at,
        products (
          title,
          image_url
        )
      `)
      .eq("buyer_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log("Buyer orders error:", error);
      return;
    }

    setOrders(data || []);
  };

  // =========================================================
  // INITIAL DATA
  // =========================================================
  useEffect(() => {
    if (!user) return;

    getProducts();
    getMyProducts();
    getMessages();
    getOrders();
    getArtisans();
    getUserRole();
  }, [user]);

  // =========================================================
  // GET USER ROLE
  // =========================================================
  const getUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRole("");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("Role error:", error);
      return;
    }

    setRole(data.role || "");
  };

  // =========================================================
  // REFRESH USER
  // =========================================================
  const refreshUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      await getUserRole();
      await getMyProducts();
      await getMessages();
      await getOrders();
      await getProducts();
      await getArtisans();
    }
  };

  // =========================================================
  // AI PRODUCT GENERATION
  // =========================================================
  const generateWithAI = async () => {
    if (!image) {
      alert("Please select a product image first.");
      return;
    }

    try {
      setAiLoading(true);

      const result = await generateProductFromImage(image);

      setTitle(result.title || "");
      setDescription(result.description || "");
      setCategory(result.category || "");
      setPrice(String(result.suggestedPrice || ""));

      alert("AI generated the product listing!");
    } catch (error) {
      console.log("AI error:", error);
      alert("AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================
  const addProduct = async () => {
    if (!title || !description || !category || !price) {
      alert("Please fill all product details.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        return;
      }

      let imageUrl = "";

      // Upload image
      if (image) {
        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        if (uploadError) {
          console.log("Image upload error:", uploadError);
          alert("Image upload failed.");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        artisan_id: user.id,
        title,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      });

      if (error) {
        console.log("Add product error:", error);
        alert("Product could not be added.");
        return;
      }

      alert("Product added successfully!");

      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setStock("1");
      setImage(null);

      await getProducts();
      await getMyProducts();
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  };

  // =========================================================
  // START EDITING
  // =========================================================
  const startEditing = (product: any) => {
    setEditingProduct({
      ...product,
    });

    setTimeout(() => {
      document.getElementById("edit-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================
  const updateProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("products")
      .update({
        title: editingProduct.title,
        description: editingProduct.description,
        category: editingProduct.category,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
      })
      .eq("id", editingProduct.id);

    if (error) {
      console.log("Update product error:", error);
      alert("Product could not be updated.");
      return;
    }

    alert("Product updated successfully!");

    setEditingProduct(null);

    await getProducts();
    await getMyProducts();
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================
  const deleteProduct = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Delete error:", error);
      alert("Product deletion failed.");
      return;
    }

    alert("Product deleted successfully!");

    await getProducts();
    await getMyProducts();
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================
  const sendMessage = async () => {
    if (!selectedProduct) {
      return;
    }

    if (!senderName || !messageText) {
      alert("Please enter your name and message.");
      return;
    }

    const { error } = await supabase.from("messages").insert({
      product_id: selectedProduct.id,
      sender_name: senderName,
      message: messageText,
    });

    if (error) {
      console.log("Message error:", error);
      alert("Message could not be sent.");
      return;
    }

    alert("Message sent!");

    setSenderName("");
    setMessageText("");
    setShowContact(false);

    getMessages();
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================
  const placeOrder = async () => {
    if (!selectedProduct) {
      return;
    }

    if (!buyerName || !buyerEmail) {
      alert("Please enter your name and email.");
      return;
    }

    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (quantity > Number(selectedProduct.stock)) {
      alert("Not enough stock available.");
      return;
    }

    const totalPrice =
      Number(selectedProduct.price) * Number(quantity);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      product_id: selectedProduct.id,
      buyer_id: user.id,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      quantity: Number(quantity),
      total_price: totalPrice,
      status: "pending",
    });

    if (error) {
      console.log("Order error:", error);
      alert("Order could not be placed.");
      return;
    }

    const newStock =
      Number(selectedProduct.stock) - Number(quantity);

    const { error: stockError } = await supabase
      .from("products")
      .update({
        stock: newStock,
      })
      .eq("id", selectedProduct.id);

    if (stockError) {
      console.log("Stock update error:", stockError);
      alert("Order placed, but stock could not be updated.");
      return;
    }

    alert("Order placed successfully!");

    setBuyerName("");
    setBuyerEmail("");
    setQuantity(1);
    setShowOrderForm(false);

    await getBuyerOrders();
    await getProducts();

    // Update selected product stock on screen
    setSelectedProduct({
      ...selectedProduct,
      stock: newStock,
    });
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================
  const updateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    // Get existing order
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select("id, product_id, quantity, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.log("Order fetch error:", orderError);
      alert("Could not find order.");
      return;
    }

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.log("Status update error:", error);
      alert("Status update failed.");
      return;
    }

    // If cancelling for the first time, restore stock
    if (
      newStatus === "cancelled" &&
      order.status !== "cancelled"
    ) {
      const {
        data: product,
        error: productError,
      } = await supabase
        .from("products")
        .select("stock")
        .eq("id", order.product_id)
        .single();

      if (productError || !product) {
        console.log("Product fetch error:", productError);
        return;
      }

      const restoredStock =
        Number(product.stock) + Number(order.quantity);

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: restoredStock,
        })
        .eq("id", order.product_id);

      if (stockError) {
        console.log("Stock restore error:", stockError);
        return;
      }
    }

    alert("Order status updated!");

    await getOrders();
    await getProducts();
  };

  // =========================================================
  // CATEGORIES
  // =========================================================
  const categories = [
    "All",
    ...Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ),
  ];

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      product.description
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      product.category
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // =========================================================
  // NAVIGATION
  // =========================================================
  const goMarketplace = () => {
    setShowDashboard(false);
    setShowMyOrders(false);
    setSelectedProduct(null);
    setSelectedArtisan(null);
    setShowContact(false);
    setShowOrderForm(false);
    setEditingProduct(null);
  };

  const goDashboard = async () => {
    if (role !== "artisan") return;

    setShowDashboard(true);
    setShowMyOrders(false);
    setSelectedProduct(null);
    setSelectedArtisan(null);

    await getMyProducts();
    await getMessages();
    await getOrders();
    await getProfile();
  };

  const goMyOrders = async () => {
    setShowMyOrders(true);
    setShowDashboard(false);
    setSelectedProduct(null);
    setSelectedArtisan(null);

    await getBuyerOrders();
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f7f3ed",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================
  if (!user) {
    return <Auth onLogin={refreshUser} />;
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3ed",
        color: "#222",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* =========================
          NAVBAR
      ========================= */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 40px",
          background: "#ffffff",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h2
          style={{
            margin: 0,
            cursor: "pointer",
          }}
          onClick={goMarketplace}
        >
          Artisan Marketplace
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button onClick={goMarketplace}>
            Marketplace
          </button>

          <button onClick={goMyOrders}>
            My Orders
          </button>

          {role === "artisan" && (
            <button onClick={goDashboard}>
              Artisan Dashboard
            </button>
          )}

          <button
            onClick={async () => {
              await supabase.auth.signOut();
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* =====================================================
          MY ORDERS
      ===================================================== */}
      {showMyOrders ? (
        <div
          style={{
            padding: "40px",
            maxWidth: "1100px",
            margin: "auto",
          }}
        >
          <h1>My Orders</h1>

          {orders.length === 0 ? (
            <p>You have not placed any orders yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "20px",
                marginTop: "25px",
              }}
            >
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    {order.products?.image_url && (
                      <img
                        src={order.products.image_url}
                        alt={order.products?.title}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}

                    <div>
                      <h3>
                        {order.products?.title || "Product"}
                      </h3>

                      <p>
                        Quantity: {order.quantity}
                      </p>

                      <p>
                        Total: ₹{order.total_price}
                      </p>

                      <p>
                        Ordered on:{" "}
                        {new Date(
                          order.created_at
                        ).toLocaleDateString()}
                      </p>

                      <strong>
                        Status: {order.status}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : showDashboard ? (
        /* =====================================================
           ARTISAN DASHBOARD
        ===================================================== */
        <div
          style={{
            padding: "40px",
            maxWidth: "1200px",
            margin: "auto",
          }}
        >
          <h1>Artisan Dashboard</h1>

          {/* PROFILE */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              marginTop: "25px",
              border: "1px solid #ddd",
            }}
          >
            <h2>My Artisan Profile</h2>

            <input
              type="text"
              placeholder="Your name"
              value={artisanName}
              onChange={(e) =>
                setArtisanName(e.target.value)
              }
            />

            <textarea
              placeholder="Tell buyers about yourself and your craft"
              value={artisanBio}
              onChange={(e) =>
                setArtisanBio(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Location"
              value={artisanLocation}
              onChange={(e) =>
                setArtisanLocation(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Phone"
              value={artisanPhone}
              onChange={(e) =>
                setArtisanPhone(e.target.value)
              }
            />

            <button onClick={saveProfile}>
              Save Profile
            </button>
          </div>

          {/* ADD PRODUCT */}
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              marginTop: "25px",
              border: "1px solid #ddd",
            }}
          >
            <h2>Add New Product</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] || null
                )
              }
            />

            <button
              onClick={generateWithAI}
              disabled={aiLoading}
              style={{
                marginLeft: "10px",
              }}
            >
              {aiLoading
                ? "Generating..."
                : "Generate with AI"}
            </button>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <input
                type="text"
                placeholder="Product title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <textarea
                placeholder="Product description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Stock"
                value={stock}
                min="0"
                onChange={(e) =>
                  setStock(e.target.value)
                }
              />

              <button onClick={addProduct}>
                Add Product
              </button>
            </div>
          </div>

          {/* EDIT PRODUCT */}
          {editingProduct && (
            <div
              id="edit-form"
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "12px",
                marginTop: "25px",
                border: "1px solid #ddd",
              }}
            >
              <h2>Edit Product</h2>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      title: e.target.value,
                    })
                  }
                />

                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: e.target.value,
                    })
                  }
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button onClick={updateProduct}>
                    Save Changes
                  </button>

                  <button
                    onClick={() =>
                      setEditingProduct(null)
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY PRODUCTS */}
          <div
            style={{
              marginTop: "40px",
            }}
          >
            <h2>My Products</h2>

            {myProducts.length === 0 ? (
              <p>
                You have not added any products yet.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >
                {myProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      background: "#fff",
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}

                    <h3>{product.title}</h3>

                    <p>
                      {product.description}
                    </p>

                    <p>
                      <strong>
                        ₹{product.price}
                      </strong>
                    </p>

                    <p>
                      Stock: {product.stock}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          startEditing(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ARTISANS */}
          <section
            style={{
              padding: "50px 0",
            }}
          >
            <div>
              <h2>Meet Our Artisans</h2>

              <p>
                Discover the talented people behind
                India's handcrafted products.
              </p>

              {selectedArtisan && (
                <section
                  style={{
                    padding: "30px",
                    background: "#fff",
                    borderTop: "1px solid #ddd",
                    marginTop: "25px",
                    borderRadius: "12px",
                  }}
                >
                  <button
                    onClick={() =>
                      setSelectedArtisan(null)
                    }
                  >
                    ← Back
                  </button>

                  <div style={{ marginTop: "30px" }}>
                    <h1>
                      {selectedArtisan.name ||
                        "Artisan"}
                    </h1>

                    <h3>
                      {selectedArtisan.location ||
                        "India"}
                    </h3>

                    <p>
                      {selectedArtisan.bio ||
                        "This artisan has not added a bio yet."}
                    </p>

                    <h2
                      style={{
                        marginTop: "40px",
                      }}
                    >
                      Products by this Artisan
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "25px",
                      }}
                    >
                      {artisanProducts.length === 0 ? (
                        <p>
                          This artisan has no
                          products yet.
                        </p>
                      ) : (
                        artisanProducts.map(
                          (product) => (
                            <div
                              key={product.id}
                              style={{
                                border:
                                  "1px solid #ddd",
                                borderRadius:
                                  "12px",
                                padding: "15px",
                                background:
                                  "#f7f3ed",
                              }}
                            >
                              {product.image_url && (
                                <img
                                  src={
                                    product.image_url
                                  }
                                  alt={product.title}
                                  style={{
                                    width: "100%",
                                    height: "180px",
                                    objectFit:
                                      "cover",
                                    borderRadius:
                                      "10px",
                                  }}
                                />
                              )}

                              <h3>
                                {product.title}
                              </h3>

                              <p>
                                {
                                  product.description
                                }
                              </p>

                              <h3>
                                ₹{product.price}
                              </h3>

                              <button
                                onClick={() => {
                                  setSelectedProduct(
                                    product
                                  );
                                  setSelectedArtisan(
                                    null
                                  );
                                }}
                              >
                                View Product
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </section>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >
                {artisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    onClick={() => {
                      setSelectedArtisan(artisan);
                      getArtisanProducts(
                        artisan.id
                      );
                    }}
                    style={{
                      background: "#fff",
                      padding: "25px",
                      borderRadius: "12px",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    <h3>
                      {artisan.name || "Artisan"}
                    </h3>

                    <p>
                      {artisan.location || "India"}
                    </p>

                    <p>
                      {artisan.bio ||
                        "Traditional Indian artisan"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CUSTOMER MESSAGES */}
          <div
            style={{
              marginTop: "50px",
            }}
          >
            <h2>Customer Messages</h2>

            {messages.length === 0 ? (
              <p>No customer messages yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                }}
              >
                {messages.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#fff",
                      padding: "18px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <strong>
                      {item.sender_name}
                    </strong>

                    <p>{item.message}</p>

                    <small>
                      Product:{" "}
                      {item.products?.title}
                    </small>

                    <br />

                    <small>
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOMER ORDERS */}
          <div
            style={{
              marginTop: "50px",
            }}
          >
            <h2>Customer Orders</h2>

            {orders.length === 0 ? (
              <p>No customer orders yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                }}
              >
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: "#fff",
                      padding: "18px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <h3>
                      {order.products?.title}
                    </h3>

                    <p>
                      Buyer: {order.buyer_name}
                    </p>

                    <p>
                      Email: {order.buyer_email}
                    </p>

                    <p>
                      Quantity: {order.quantity}
                    </p>

                    <p>
                      Total: ₹{order.total_price}
                    </p>

                    <label>Status:</label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      style={{
                        marginLeft: "10px",
                      }}
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =====================================================
           MARKETPLACE
        ===================================================== */
        <div>
          {/* 3D WORLD */}
          <GameWorld />

          {/* OPTIONAL ARTISAN WORLD */}
          <ArtisanWorld />

          {/* SEARCH */}
          <section
            style={{
              padding: "25px 40px 0",
              maxWidth: "1200px",
              margin: "auto",
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </section>

          {/* CATEGORIES */}
          <section
            style={{
              padding: "25px 40px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(cat)
                }
              >
                {cat}
              </button>
            ))}
          </section>

          {/* PRODUCTS */}
          <section
            id="marketplace"
            style={{
              padding: "20px 40px 60px",
              maxWidth: "1200px",
              margin: "auto",
            }}
          >
            <h2>
              {selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </h2>

            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "25px",
                  marginTop: "25px",
                }}
              >
                {filteredProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      style={{
                        background: "#fff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #ddd",
                      }}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          style={{
                            width: "100%",
                            height: "220px",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <div
                        style={{
                          padding: "18px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#777",
                          }}
                        >
                          {product.category}
                        </p>

                        <h3>
                          {product.title}
                        </h3>

                        <p>
                          {product.description}
                        </p>

                        <h3>
                          ₹{product.price}
                        </h3>

                        <p>
                          Stock: {product.stock}
                        </p>

                        {product.artisan && (
                          <p>
                            Artisan:{" "}
                            {product.artisan.name ||
                              "Artisan"}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            setSelectedProduct(
                              product
                            );
                            setShowContact(false);
                            setShowOrderForm(false);
                          }}
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* PRODUCT DETAILS */}
          {selectedProduct && (
            <section
              style={{
                padding: "40px",
                background: "#fff",
                borderTop: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  maxWidth: "900px",
                  margin: "auto",
                }}
              >
                <button
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                >
                  ← Back
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "30px",
                    marginTop: "25px",
                  }}
                >
                  <div>
                    {selectedProduct.image_url ? (
                      <img
                        src={
                          selectedProduct.image_url
                        }
                        alt={
                          selectedProduct.title
                        }
                        style={{
                          width: "100%",
                          maxHeight: "450px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "350px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f7f3ed",
                          borderRadius: "12px",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <p>
                      {selectedProduct.category}
                    </p>

                    <h1>
                      {selectedProduct.title}
                    </h1>

                    <p>
                      {
                        selectedProduct.description
                      }
                    </p>

                    <h2>
                      ₹{selectedProduct.price}
                    </h2>

                    {/* ARTISAN */}
                    {selectedProduct.artisan && (
                      <div
                        style={{
                          marginTop: "25px",
                          padding: "20px",
                          background: "#f7f3ed",
                          borderRadius: "10px",
                        }}
                      >
                        <h3>
                          Meet the Artisan
                        </h3>

                        <p>
                          <strong>
                            {selectedProduct
                              .artisan.name ||
                              "Artisan"}
                          </strong>
                        </p>

                        <p>
                          {
                            selectedProduct
                              .artisan.location
                          }
                        </p>

                        <p>
                          {
                            selectedProduct
                              .artisan.bio
                          }
                        </p>
                      </div>
                    )}

                    <p>
                      Available stock:{" "}
                      {selectedProduct.stock}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px",
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowContact(
                            !showContact
                          );
                          setShowOrderForm(false);
                        }}
                      >
                        Contact Artisan
                      </button>

                      <button
                        disabled={
                          Number(
                            selectedProduct.stock
                          ) <= 0
                        }
                        onClick={() => {
                          setShowOrderForm(
                            !showOrderForm
                          );
                          setShowContact(false);
                        }}
                      >
                        Order Now
                      </button>
                    </div>

                    {/* CONTACT FORM */}
                    {showContact && (
                      <div
                        style={{
                          marginTop: "25px",
                          padding: "20px",
                          background: "#f7f3ed",
                          borderRadius: "10px",
                        }}
                      >
                        <h3>
                          Contact Artisan
                        </h3>

                        <input
                          type="text"
                          placeholder="Your name"
                          value={senderName}
                          onChange={(e) =>
                            setSenderName(
                              e.target.value
                            )
                          }
                        />

                        <br />
                        <br />

                        <textarea
                          placeholder="Your message"
                          value={messageText}
                          onChange={(e) =>
                            setMessageText(
                              e.target.value
                            )
                          }
                        />

                        <br />
                        <br />

                        <button
                          onClick={sendMessage}
                        >
                          Send Message
                        </button>
                      </div>
                    )}

                    {/* ORDER FORM */}
                    {showOrderForm && (
                      <div
                        style={{
                          marginTop: "25px",
                          padding: "20px",
                          background: "#f7f3ed",
                          borderRadius: "10px",
                        }}
                      >
                        <h3>
                          Place Order
                        </h3>

                        <input
                          type="text"
                          placeholder="Your name"
                          value={buyerName}
                          onChange={(e) =>
                            setBuyerName(
                              e.target.value
                            )
                          }
                        />

                        <br />
                        <br />

                        <input
                          type="email"
                          placeholder="Your email"
                          value={buyerEmail}
                          onChange={(e) =>
                            setBuyerEmail(
                              e.target.value
                            )
                          }
                        />

                        <br />
                        <br />

                        <label>
                          Quantity:
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={
                            selectedProduct.stock
                          }
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Number(
                                e.target.value
                              )
                            )
                          }
                          style={{
                            marginLeft: "10px",
                          }}
                        />

                        <p>
                          Total: ₹
                          {Number(
                            selectedProduct.price
                          ) * Number(quantity)}
                        </p>

                        <button
                          onClick={placeOrder}
                        >
                          Confirm Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
