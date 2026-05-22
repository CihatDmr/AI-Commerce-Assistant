from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatbot import cevap_ver
import json
import os

app = Flask(__name__)
CORS(app)


def load_json(file_name, default_data):
    try:
        with open(file_name, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return default_data


def save_json(file_name, data):
    with open(file_name, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


def check_admin():
    admin_password = os.getenv("ADMIN_PASSWORD")
    incoming_password = request.headers.get("X-Admin-Password")

    if not admin_password:
        return False

    return incoming_password == admin_password


@app.route("/")
def home():
    return "Backend çalışıyor."


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        mesaj = data.get("message", "")
        customer_id = data.get("customer_id", "demo_customer_1")

        cevap = cevap_ver(mesaj, customer_id)

        return jsonify({"reply": cevap})

    except Exception as e:
        return jsonify({"reply": f"Hata oluştu: {str(e)}"})


@app.route("/admin-login", methods=["POST"])
def admin_login():
    data = request.get_json()
    password = data.get("password", "")

    admin_password = os.getenv("ADMIN_PASSWORD")

    if password == admin_password:
        return jsonify({
            "success": True,
            "message": "Giriş başarılı."
        })

    return jsonify({
        "success": False,
        "message": "Şifre hatalı."
    }), 401


@app.route("/company", methods=["GET"])
def get_company():
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    company = load_json("company_config.json", {})

    return Response(
        json.dumps(company, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


@app.route("/company", methods=["POST"])
def update_company():
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    try:
        data = request.get_json()
        save_json("company_config.json", data)

        return jsonify({"message": "İşletme bilgileri güncellendi."})

    except Exception as e:
        return jsonify({"message": f"Güncelleme hatası: {str(e)}"}), 500


@app.route("/orders", methods=["GET"])
def get_orders():
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    orders = load_json("orders.json", [])

    return Response(
        json.dumps(orders, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


@app.route("/orders/<int:order_id>", methods=["PUT"])
def update_order(order_id):
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    orders = load_json("orders.json", [])
    data = request.get_json()

    for order in orders:
        if order.get("id") == order_id:
            order["status"] = data.get("status", order.get("status", ""))
            order["cargo_company"] = data.get("cargo_company", order.get("cargo_company", ""))
            order["tracking_code"] = data.get("tracking_code", order.get("tracking_code", ""))
            order["order_note"] = data.get("order_note", order.get("order_note", ""))

            save_json("orders.json", orders)

            return jsonify({"message": "Sipariş güncellendi."})

    return jsonify({"message": "Sipariş bulunamadı."}), 404


@app.route("/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    orders = load_json("orders.json", [])

    new_orders = [
        order for order in orders
        if order.get("id") != order_id
    ]

    if len(new_orders) == len(orders):
        return jsonify({"message": "Sipariş bulunamadı."}), 404

    save_json("orders.json", new_orders)

    return jsonify({"message": "Sipariş silindi."})


@app.route("/handoff_requests", methods=["GET"])
def get_handoff_requests():
    if not check_admin():
        return jsonify({"message": "Yetkisiz erişim."}), 401

    handoff_requests = load_json("handoff_requests.json", [])

    return Response(
        json.dumps(handoff_requests, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


if __name__ == "__main__":
    app.run(debug=True)