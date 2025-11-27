from flask import Flask, render_template, request, redirect, url_for
import csv
import os
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)

DATA_FILE = "transactions.csv"


def load_transactions():
    transactions = []
    if not os.path.exists(DATA_FILE):
        return transactions

    with open(DATA_FILE, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                row["amount"] = float(row["amount"])
            except ValueError:
                continue
            transactions.append(row)
    return transactions


def save_transactions(transactions):
    fieldnames = ["date", "amount", "category", "note"]
    with open(DATA_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for t in transactions:
            writer.writerow({
                "date": t["date"],
                "amount": t["amount"],
                "category": t["category"],
                "note": t["note"],
            })


def add_transaction(amount, category, note):
    transactions = load_transactions()
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    transaction = {
        "date": now,
        "amount": amount,
        "category": category if category.strip() else "Uncategorized",
        "note": note.strip(),
    }
    transactions.append(transaction)
    save_transactions(transactions)


def get_summary(transactions):
    total = 0.0
    by_category = defaultdict(float)

    for t in transactions:
        amt = t["amount"]
        total += amt
        by_category[t["category"]] += amt

    return total, by_category


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        amount_str = request.form.get("amount", "").strip()
        category = request.form.get("category", "").strip()
        note = request.form.get("note", "").strip()

        # Validate amount
        try:
            amount = float(amount_str)
        except ValueError:
            error = "Please enter a valid number for amount."
            transactions = load_transactions()
            total, by_category = get_summary(transactions)
            recent = transactions[-5:][::-1]  # last 5, most recent first
            return render_template(
                "index.html",
                error=error,
                transactions=recent,
                total=total,
                by_category=by_category,
            )

        add_transaction(amount, category, note)
        return redirect(url_for("index"))

    transactions = load_transactions()
    total, by_category = get_summary(transactions)
    recent = transactions[-5:][::-1]  # last 5, most recent first
    return render_template(
        "index.html",
        transactions=recent,
        total=total,
        by_category=by_category,
        error=None,
    )


@app.route("/transactions")
def all_transactions():
    transactions = load_transactions()
    transactions = transactions[::-1]  # newest first
    return render_template("transactions.html", transactions=transactions)


if __name__ == "__main__":
    app.run(debug=True)