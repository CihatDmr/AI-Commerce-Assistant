import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function getAdminHeaders() {
  const password = localStorage.getItem("admin_password");

  return {
    "Content-Type": "application/json",
    "X-Admin-Password": password || ""
  };
}

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/handoff_requests`, {
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
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch {
      alert("Temsilci talepleri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  if (loading) {
    return (
      <div className="businessPage">
        <div className="businessCard">
          <h2>Temsilci Talepleri</h2>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Temsilci Talepleri</h2>

        <button onClick={() => (window.location.href = "/admin")}>
          Admin Panele Dön
        </button>

        {requests.length === 0 ? (
          <p>Henüz temsilci talebi bulunmuyor.</p>
        ) : (
          requests.map((request) => (
            <div className="productBox" key={request.id}>
              <h3>Talep No: #{request.id}</h3>

              <p><strong>Müşteri ID:</strong> {request.customer_id || "-"}</p>
              <p><strong>Talep Türü:</strong> {request.request_type || "-"}</p>
              <p><strong>Mesaj:</strong> {request.message || "-"}</p>
              <p><strong>Durum:</strong> {request.status || "-"}</p>
              <p><strong>Oluşturulma:</strong> {request.created_at || "-"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RequestsPage;