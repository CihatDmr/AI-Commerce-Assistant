import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => alert("Siparişler alınamadı."));
  }, []);

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Siparişler</h2>

        {orders.map((order, index) => (
          <div className="productBox" key={index}>
            <p><strong>Müşteri:</strong> {order.customer_name}</p>
            <p><strong>Ürün:</strong> {order.product}</p>
            <p><strong>Beden:</strong> {order.size}</p>
            <p><strong>Renk:</strong> {order.color}</p>
            <p><strong>Telefon:</strong> {order.phone}</p>
            <p><strong>Adres:</strong> {order.address}</p>
            <p><strong>Durum:</strong> {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;