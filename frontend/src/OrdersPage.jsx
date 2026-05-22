import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function getAdminHeaders() {
  const password = localStorage.getItem("admin_password");

  return {
    "Content-Type": "application/json",
    "X-Admin-Password": password || ""
  };
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "GET",
        headers: getAdminHeaders()
      });

      const data = await response.json();

      if (response.status === 401) {
        alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        localStorage.removeItem("admin_password");
        window.location.href = "/admin-login";
        return;
      }

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      alert("Siparişler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const updateOrderField = (index, field, value) => {
    const updatedOrders = [...orders];
    updatedOrders[index][field] = value;
    setOrders(updatedOrders);
  };

  const saveOrder = async (order) => {
    const response = await fetch(`${API_URL}/orders/${order.id}`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(order)
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("admin_password");
      window.location.href = "/admin-login";
      return;
    }

    alert(data.message || "Sipariş güncellendi.");
    getOrders();
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Bu siparişi silmek istediğinize emin misiniz?"
    );

    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: getAdminHeaders()
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("admin_password");
      window.location.href = "/admin-login";
      return;
    }

    alert(data.message || "Sipariş silindi.");
    getOrders();
  };

  if (loading) {
    return (
      <div className="businessPage">
        <div className="businessCard">
          <h2>Sipariş Yönetimi</h2>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Sipariş Yönetimi</h2>

        <button onClick={() => (window.location.href = "/admin")}>
          Admin Panele Dön
        </button>

        {orders.length === 0 ? (
          <p>Henüz sipariş bulunmuyor.</p>
        ) : (
          orders.map((order, index) => (
            <div className="productBox" key={order.id}>
              <h3>Sipariş No: #{order.id}</h3>

              <p><strong>Müşteri:</strong> {order.customer_name || "-"}</p>
              <p><strong>Telefon:</strong> {order.phone || "-"}</p>
              <p><strong>Adres:</strong> {order.address || "-"}</p>
              <p><strong>Ürün Kodu:</strong> {order.product_code || "-"}</p>
              <p><strong>Ürün:</strong> {order.product_name || order.product || "-"}</p>
              <p><strong>Seçenek:</strong> {order.option || order.color || "-"}</p>
              <p><strong>Beden/Paket:</strong> {order.size_or_package || order.size || "-"}</p>
              <p><strong>Adet:</strong> {order.quantity || "-"}</p>
              <p><strong>Ödeme:</strong> {order.payment_method || "-"}</p>

              <label>Sipariş Durumu</label>
              <select
                value={order.status || ""}
                onChange={(e) =>
                  updateOrderField(index, "status", e.target.value)
                }
              >
                <option value="Sipariş alındı">Sipariş alındı</option>
                <option value="Hazırlanıyor">Hazırlanıyor</option>
                <option value="Kargoya verildi">Kargoya verildi</option>
                <option value="Teslim edildi">Teslim edildi</option>
                <option value="İptal edildi">İptal edildi</option>
              </select>

              <label>Kargo Firması</label>
              <input
                value={order.cargo_company || ""}
                onChange={(e) =>
                  updateOrderField(index, "cargo_company", e.target.value)
                }
                placeholder="Örn: Yurtiçi Kargo"
              />

              <label>Takip Kodu</label>
              <input
                value={order.tracking_code || ""}
                onChange={(e) =>
                  updateOrderField(index, "tracking_code", e.target.value)
                }
                placeholder="Örn: TR123456"
              />

              <label>Sipariş Notu</label>
              <textarea
                rows="3"
                value={order.order_note || ""}
                onChange={(e) =>
                  updateOrderField(index, "order_note", e.target.value)
                }
              />

              <button onClick={() => saveOrder(order)}>
                Güncelle
              </button>

              <button
                className="removeProductBtn"
                onClick={() => deleteOrder(order.id)}
              >
                Siparişi Sil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrdersPage;