import { useEffect, useState } from "react";

const API_URL = "https://ai-commerce-assistant-w59n.onrender.com";

function BusinessPanel() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/company`)
      .then((res) => res.json())
      .then((data) => setCompany(data))
      .catch(() => alert("İşletme bilgileri alınamadı."));
  }, []);

  const saveCompany = async () => {
    try {
      const response = await fetch(`${API_URL}/company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(company)
      });

      const data = await response.json();

      if (response.ok) {
        alert("İşletme bilgileri kaydedildi.");
      } else {
        alert(data.message || "Kaydetme sırasında hata oluştu.");
      }
    } catch (error) {
      alert("Backend bağlantısı kurulamadı.");
    }
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

        <p className="panelInfo">
          Bu alan müşteriye görünmez. İşletme kendi ürünlerini, stoklarını ve kurallarını buradan belirler.
        </p>

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
          onChange={(e) =>
            setCompany({ ...company, sector: e.target.value })
          }
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
              placeholder="Örn: TS-56"
            />

            <label>Ürün / Hizmet Adı</label>
            <input
              value={product.name || ""}
              onChange={(e) => updateProduct(index, "name", e.target.value)}
              placeholder="Örn: Siyah Baskılı Tişört"
            />

            <label>Fiyat</label>
            <input
              value={product.price || ""}
              onChange={(e) => updateProduct(index, "price", e.target.value)}
              placeholder="Örn: 499 TL"
            />

            <label>Renk / Çeşit Seçenekleri</label>
            <input
              value={(product.colors || []).join(", ")}
              onChange={(e) =>
                updateProduct(
                  index,
                  "colors",
                  e.target.value.split(",").map((x) => x.trim())
                )
              }
              placeholder="Örn: Siyah, Beyaz, Mavi"
            />

            <label>Beden / Gramaj / Paket Seçenekleri</label>
            <input
              value={(product.sizes || []).join(", ")}
              onChange={(e) =>
                updateProduct(
                  index,
                  "sizes",
                  e.target.value.split(",").map((x) => x.trim())
                )
              }
              placeholder="Örn: S, M, L veya 500 gr, 1 kg"
            />

            <label>Stok</label>
            <input
              type="number"
              value={product.stock || 0}
              onChange={(e) =>
                updateProduct(index, "stock", Number(e.target.value))
              }
            />

            <button className="removeProductBtn" onClick={() => removeProduct(index)}>
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