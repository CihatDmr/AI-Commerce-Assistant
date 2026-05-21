import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function RequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/handoff_requests`)
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch(() => alert("Temsilci talepleri alınamadı."));
  }, []);

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Temsilci Talepleri</h2>

        {requests.map((request, index) => (
          <div className="productBox" key={index}>
            <p><strong>Müşteri:</strong> {request.customer_name}</p>
            <p><strong>Telefon:</strong> {request.phone}</p>
            <p><strong>Talep:</strong> {request.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RequestsPage;