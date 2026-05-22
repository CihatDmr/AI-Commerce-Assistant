import { useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function AdminLogin() {
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("admin_password", password);
        window.location.href = "/admin";
      } else {
        alert(data.message || "Şifre hatalı.");
      }
    } catch {
      alert("Backend bağlantı hatası.");
    }
  };

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Admin Giriş</h2>

        <p className="panelInfo">
          İşletme paneline erişmek için admin şifresi giriniz.
        </p>

        <input
          type="password"
          placeholder="Admin şifresi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
        />

        <button onClick={login}>Giriş Yap</button>
      </div>
    </div>
  );
}

export default AdminLogin;