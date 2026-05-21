from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatbot import cevap_ver
import json

app = Flask(__name__)
CORS(app)


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


@app.route("/company", methods=["GET"])
def get_company():
    with open("company_config.json", "r", encoding="utf-8") as file:
        company = json.load(file)

    return Response(
        json.dumps(company, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


@app.route("/company", methods=["POST"])
def update_company():
    try:
        data = request.get_json()

        with open("company_config.json", "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=4)

        return jsonify({"message": "İşletme bilgileri güncellendi."})

    except Exception as e:
        return jsonify({"message": f"Güncelleme hatası: {str(e)}"}), 500


@app.route("/orders", methods=["GET"])
def get_orders():
    with open("orders.json", "r", encoding="utf-8") as file:
        orders = json.load(file)

    return Response(
        json.dumps(orders, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


@app.route("/handoff_requests", methods=["GET"])
def get_handoff_requests():
    with open("handoff_requests.json", "r", encoding="utf-8") as file:
        handoff_requests = json.load(file)

    return Response(
        json.dumps(handoff_requests, ensure_ascii=False, indent=4),
        content_type="application/json; charset=utf-8"
    )


if __name__ == "__main__":
    app.run(debug=True)