function AdminDashboard() {
  const logout = () => {
    localStorage.removeItem("admin_password");
    window.location.href = "/admin-login";
  };

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>Admin Paneli</h2>

        <p className="panelInfo">
          İşletme yönetimi için aşağıdaki bölümlerden birini seçiniz.
        </p>

        <button onClick={() => (window.location.href = "/business")}>
          İşletme Ayarları
        </button>

        <button onClick={() => (window.location.href = "/orders")}>
          Siparişler
        </button>

        <button onClick={() => (window.location.href = "/requests")}>
          Temsilci Talepleri
        </button>

        <button className="removeProductBtn" onClick={logout}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;