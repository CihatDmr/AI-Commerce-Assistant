import os
import json
import re
from datetime import datetime
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


def extract_json(text):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return None


def add_handoff_request(customer_id, message, request_type="kritik işlem"):
    requests = load_json("handoff_requests.json", [])

    new_request = {
        "id": len(requests) + 1,
        "customer_id": customer_id,
        "request_type": request_type,
        "message": message,
        "status": "Temsilciye aktarıldı",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    requests.append(new_request)
    save_json("handoff_requests.json", requests)

    return """Talebinizi aldım ✅

Bu işlem yetki gerektirdiği için sizi müşteri temsilcisine yönlendiriyorum.
Temsilci en kısa sürede sizinle iletişime geçecektir."""


def is_critical_request(message):
    critical_words = [
        "iptal", "iade", "şikayet", "memnun değilim", "beğenmedim",
        "değişim", "değiştir", "ürün ekle", "siparişime ekle",
        "adres değiştir", "yanlış geldi", "eksik geldi",
        "para iadesi", "ödeme sorunu", "temsilci", "insana bağlan"
    ]

    msg = message.lower()
    return any(word in msg for word in critical_words)


def get_history(customer_id):
    all_history = load_json("chat_history.json", {})
    if isinstance(all_history, list):
        all_history = {}

    return all_history.get(customer_id, []), all_history


def save_history(customer_id, history, all_history):
    all_history[customer_id] = history
    save_json("chat_history.json", all_history)


def decrease_stock(company, product_code, quantity):
    for product in company.get("products", []):
        if product.get("code", "").lower() == product_code.lower():
            if int(product.get("stock", 0)) >= quantity:
                product["stock"] = int(product.get("stock", 0)) - quantity
                save_json("company_config.json", company)
                return True
            return False

    return False


def extract_order_state(message, history, company):
    company_info = json.dumps(company, ensure_ascii=False, indent=2)
    history_info = json.dumps(history, ensure_ascii=False, indent=2)

    prompt = f"""
Aşağıdaki konuşma geçmişi ve son müşteri mesajına göre sipariş bilgilerini çıkar.

Firma bilgileri:
{company_info}

Konuşma geçmişi:
{history_info}

Son müşteri mesajı:
{message}

SADECE JSON döndür. Açıklama yazma.

Format:
{{
  "customer_name": "",
  "phone": "",
  "address": "",
  "product_code": "",
  "product_name": "",
  "option": "",
  "size_or_package": "",
  "quantity": "",
  "payment_method": "",
  "order_note": "",
  "is_order_intent": false,
  "is_complete": false,
  "missing_fields": []
}}

Kurallar:
- Müşteri satın almak, sipariş vermek, almak istiyorum gibi ifade kullanırsa is_order_intent true yap.
- Ürün kodunu firma ürünlerinden eşleştir. Müşteri sadece 56 derse TS-56 ile eşleşebilir.
- Firma ürünlerinde olmayan ürünü uydurma.
- Sipariş için zorunlu alanlar: customer_name, phone, address, product_code veya product_name, quantity, payment_method.
- option ve size_or_package ürün tipine göre gerekiyorsa doldur.
- Sipariş notu zorunlu değildir.
- Eksik zorunlu alanları missing_fields içine yaz.
- Tüm zorunlu alanlar tamam ise is_complete true yap.
"""

    response = model.generate_content(prompt)
    return extract_json(response.text)


def create_order(order_state, customer_id, company):
    orders = load_json("orders.json", [])

    quantity = int(order_state.get("quantity", 1))

    product_code = order_state.get("product_code", "")

    if product_code:
        stock_ok = decrease_stock(company, product_code, quantity)
        if not stock_ok:
            return "Bu ürün için yeterli stok bulunmuyor. Dilerseniz farklı bir ürün veya adet seçebilirsiniz."

    order_id = len(orders) + 1

    new_order = {
        "id": order_id,
        "customer_id": customer_id,
        "customer_name": order_state.get("customer_name", ""),
        "phone": order_state.get("phone", ""),
        "address": order_state.get("address", ""),
        "product_code": order_state.get("product_code", ""),
        "product_name": order_state.get("product_name", ""),
        "option": order_state.get("option", ""),
        "size_or_package": order_state.get("size_or_package", ""),
        "quantity": quantity,
        "payment_method": order_state.get("payment_method", ""),
        "order_note": order_state.get("order_note", ""),
        "status": "Sipariş alındı",
        "cargo_company": "",
        "tracking_code": "",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    orders.append(new_order)
    save_json("orders.json", orders)

    note_line = ""
    if order_state.get("order_note"):
        note_line = f"\nNot: {order_state.get('order_note')}"

    return f"""Siparişiniz oluşturuldu ✅

Sipariş No: #{order_id}
Ürün Kodu: {order_state.get("product_code", "-")}
Ürün: {order_state.get("product_name", "-")}
Seçenek: {order_state.get("option", "-")}
Beden/Paket: {order_state.get("size_or_package", "-")}
Adet: {quantity}
Ödeme Şekli: {order_state.get("payment_method", "-")}{note_line}

Siparişiniz hazırlanma aşamasına alınmıştır."""


def check_order_status(message):
    msg = message.lower()

    status_words = [
        "siparişim nerede", "sipariş durum", "kargo", "takip",
        "kargoya verildi mi", "ne durumda"
    ]

    if not any(word in msg for word in status_words):
        return None

    match = re.search(r"#?(\d+)", message)

    if not match:
        return "Sipariş durumunu kontrol edebilmem için sipariş numaranızı yazar mısınız? Örnek: 3 numaralı siparişim nerede?"

    order_id = int(match.group(1))
    orders = load_json("orders.json", [])

    for order in orders:
        if order.get("id") == order_id:
            cargo = ""
            if order.get("cargo_company") or order.get("tracking_code"):
                cargo = f"\nKargo Firması: {order.get('cargo_company', '-')}\nTakip Kodu: {order.get('tracking_code', '-')}"

            return f"""#{order_id} numaralı siparişinizin durumu: {order.get("status", "Durum bilgisi yok")}

Ürün: {order.get("product_name", "-")}
Ürün Kodu: {order.get("product_code", "-")}
Adet: {order.get("quantity", "-")}{cargo}"""

    return f"#{order_id} numaralı sipariş kaydı bulunamadı. Sipariş numaranızı kontrol eder misiniz?"


def create_ai_reply(message, history, company, order_state):
    company_info = json.dumps(company, ensure_ascii=False, indent=2)
    history_info = json.dumps(history, ensure_ascii=False, indent=2)
    order_info = json.dumps(order_state, ensure_ascii=False, indent=2)

    prompt = f"""
Sen {company.get("company_name", "işletme")} firmasının WhatsApp yapay zekâ müşteri temsilcisisin.

Firma bilgileri:
{company_info}

Konuşma geçmişi:
{history_info}

Mevcut sipariş bilgisi:
{order_info}

Müşteri mesajı:
{message}

Görevlerin:
- Müşteriyle samimi, kısa ve profesyonel konuş.
- Sadece firma ürünlerine ve işletme kurallarına göre cevap ver.
- Ürün yoksa varmış gibi söyleme.
- Ürün kodu, stok, fiyat, seçenek, beden/paket, kargo, iade kuralı gibi sorulara firma verisine göre cevap ver.
- Müşteri sipariş vermek istiyorsa eksik bilgileri sırayla iste.
- Sipariş için gerekli bilgiler: ürün, adet, ad soyad, telefon, adres, ödeme şekli.
- Sipariş notu varsa kaydedileceğini söyle.
- Kritik konularda işlem yapma; temsilciye aktarılacağını söyle.
- Müşteriye teknik sistem detaylarından bahsetme.

Cevap:
"""

    response = model.generate_content(prompt)
    return response.text


def cevap_ver(message, customer_id="demo_customer_1"):
    company = load_json("company_config.json", {})
    history, all_history = get_history(customer_id)

    history.append({
        "role": "customer",
        "message": message
    })

    if is_critical_request(message):
        reply = add_handoff_request(customer_id, message)
        history.append({"role": "assistant", "message": reply})
        save_history(customer_id, history, all_history)
        return reply

    status_reply = check_order_status(message)
    if status_reply:
        history.append({"role": "assistant", "message": status_reply})
        save_history(customer_id, history, all_history)
        return status_reply

    order_state = extract_order_state(message, history, company)

    if order_state and order_state.get("is_order_intent") and order_state.get("is_complete"):
        reply = create_order(order_state, customer_id, company)
        history.append({"role": "assistant", "message": reply})
        save_history(customer_id, history, all_history)
        return reply

    reply = create_ai_reply(message, history, company, order_state)

    history.append({
        "role": "assistant",
        "message": reply
    })

    save_history(customer_id, history, all_history)

    return reply