import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def load_json(file_name, default_data):
    try:
        with open(file_name, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return default_data


def save_json(file_name, data):
    with open(file_name, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


def kritik_talep_var_mi(mesaj):
    kritikler = [
        "iptal",
        "değiştir",
        "siparişime ekle",
        "ürün ekle",
        "adres değiştir",
        "ürün değiştir",
        "iade"
    ]

    mesaj = mesaj.lower()

    return any(kelime in mesaj for kelime in kritikler)


def temsilciye_aktar(customer_id, mesaj):
    requests = load_json("handoff_requests.json", [])

    yeni = {
        "id": len(requests) + 1,
        "customer_id": customer_id,
        "request_type": "kritik işlem",
        "message": mesaj,
        "status": "Temsilciye aktarıldı"
    }

    requests.append(yeni)
    save_json("handoff_requests.json", requests)

    return """Talebinizi aldım ✅

Bu işlem yetki gerektirdiği için sizi müşteri temsilcisine yönlendiriyorum.

Temsilci en kısa sürede sizinle iletişime geçecektir."""


def siparis_durumu_sorgula(mesaj):
    mesaj_kucuk = mesaj.lower()

    durum_kelimeleri = [
        "siparişim nerede",
        "siparişim ne durumda",
        "sipariş durumu",
        "kargoya verildi mi",
        "kargo",
        "nerede"
    ]

    if not any(kelime in mesaj_kucuk for kelime in durum_kelimeleri):
        return None

    eslesme = re.search(r"#?(\d+)", mesaj)

    if not eslesme:
        return "Sipariş durumunu kontrol edebilmem için sipariş numaranızı yazar mısınız? Örnek: 3 numaralı siparişim nerede?"

    siparis_no = int(eslesme.group(1))

    orders = load_json("orders.json", [])

    for order in orders:
        if order.get("id") == siparis_no:
            return f"""#{siparis_no} numaralı siparişinizin durumu: {order.get("status", "Durum bilgisi yok")}.

Ürün: {order.get("product_name", "-")}
Ürün Kodu: {order.get("product_code", "-")}
Adet: {order.get("quantity", "-")}"""

    return f"#{siparis_no} numaralı bir sipariş kaydı bulamadım. Sipariş numarasını kontrol eder misiniz?"


def cevap_ver(mesaj, customer_id="demo_customer_1"):
    if kritik_talep_var_mi(mesaj):
        return temsilciye_aktar(customer_id, mesaj)

    siparis_cevabi = siparis_durumu_sorgula(mesaj)

    if siparis_cevabi:
        return siparis_cevabi

    company = load_json("company_config.json", {})

    company_info = json.dumps(
        company,
        ensure_ascii=False,
        indent=2
    )

    prompt = f"""
Sen {company["company_name"]} firmasının WhatsApp yapay zekâ müşteri temsilcisisin.

Firma sektörü:
{company["sector"]}

Konuşma tarzı:
{company["company_tone"]}

Firma bilgileri:
{company_info}

Kurallar:
- Sadece firma bilgilerine göre cevap ver.
- Bilmediğin bilgi uydurma.
- Ürün kodlarını anlayabilirsin.
- Ürün stok bilgilerini kullan.
- Kritik işlemler temsilciye aktarılır.
- Sipariş durumu için sipariş numarası istenir.
- Kısa ve WhatsApp gibi doğal konuş.

Müşteri:
{mesaj}

Cevap:
"""

    response = model.generate_content(prompt)

    return response.text