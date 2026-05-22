import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const getOrders = () => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => alert("Siparişler alınamadı."));
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });

    const data = await response.json();
    alert(data.message);
    getOrders();
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Bu siparişi silmek istediğinize emin misiniz?"
    );

    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "DELETE"
    });

    const data = await response.json();
    alert(data.message);
    getOrders();
  };

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Sipariş Yönetimi</h2>

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