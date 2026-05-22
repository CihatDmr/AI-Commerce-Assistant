import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function getAdminHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": localStorage.getItem("admin_password")
  };
}

function BusinessPanel() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/company`, {
      headers: getAdminHeaders()
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("admin_password");
          window.location.href = "/admin-login";
        }
        return res.json();
      })
      .then((data) => setCompany(data))
      .catch(() => alert("İşletme bilgileri alınamadı."));
  }, []);

  const saveCompany = async () => {
    const response = await fetch(`${API_URL}/company`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(company)
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("admin_password");
      window.location.href = "/admin-login";
      return;
    }

    alert(data.message);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...company.products];
    newProducts[index][field] = value;
    setCompany({ ...company, products: newProducts });
  };

  const addProduct = () => {
    setCompany({
      ...company,
      products: [
        ...company.products,
        {
          code: "",
          name: "",
          price: "",
          colors: [],
          sizes: [],
          stock: 0
        }
      ]
    });
  };

  const removeProduct = (index) => {
    const newProducts = company.products.filter((_, i) => i !== index);
    setCompany({ ...company, products: newProducts });
  };

  if (!company) return <div>Yükleniyor...</div>;

  return (
    <div className="businessPage">
      <div className="businessCard">
        <h2>İşletme Ayar Paneli</h2>

        <label>Firma Adı</label>
        <input
          value={company.company_name || ""}
          onChange={(e) =>
            setCompany({ ...company, company_name: e.target.value })
          }
        />

        <label>Sektör</label>
        <input
          value={company.sector || ""}
          onChange={(e) => setCompany({ ...company, sector: e.target.value })}
        />

        <label>Konuşma Tarzı</label>
        <input
          value={company.company_tone || ""}
          onChange={(e) =>
            setCompany({ ...company, company_tone: e.target.value })
          }
        />

        <label>İşletme Kuralları</label>
        <textarea
          rows="7"
          value={(company.rules || []).join("\n")}
          onChange={(e) =>
            setCompany({
              ...company,
              rules: e.target.value.split("\n")
            })
          }
        />

        <h3>Ürün / Hizmet Bilgileri</h3>

        {(company.products || []).map((product, index) => (
          <div className="productBox" key={index}>
            <label>Ürün Kodu</label>
            <input
              value={product.code || ""}
              onChange={(e) => updateProduct(index, "code", e.target.value)}
            />

            <label>Ürün / Hizmet Adı</label>
            <input
              value={product.name || ""}
              onChange={(e) => updateProduct(index, "name", e.target.value)}
            />

            <label>Fiyat</label>
            <input
              value={product.price || ""}
              onChange={(e) => updateProduct(index, "price", e.target.value)}
            />

            <label>Renk / Çeşit</label>
            <input
              value={(product.colors || []).join(", ")}
              onChange={(e) =>
                updateProduct(
                  index,
                  "colors",
                  e.target.value.split(",").map((x) => x.trim())
                )
              }
            />

            <label>Beden / Paket</label>
            <input
              value={(product.sizes || []).join(", ")}
              onChange={(e) =>
                updateProduct(
                  index,
                  "sizes",
                  e.target.value.split(",").map((x) => x.trim())
                )
              }
            />

            <label>Stok</label>
            <input
              type="number"
              value={product.stock || 0}
              onChange={(e) =>
                updateProduct(index, "stock", Number(e.target.value))
              }
            />

            <button
              className="removeProductBtn"
              onClick={() => removeProduct(index)}
            >
              Ürünü Sil
            </button>
          </div>
        ))}

        <button className="addProductBtn" onClick={addProduct}>
          Yeni Ürün Ekle
        </button>

        <button onClick={saveCompany}>Kaydet</button>
      </div>
    </div>
  );
}

export default BusinessPanel;