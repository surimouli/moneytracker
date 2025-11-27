from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash,
)
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os

app = Flask(__name__)

# 🔐 Secret key for sessions (change this to something random in real life!)
app.secret_key = "change_this_to_a_random_secret_string"

# 📦 Database configuration (SQLite file)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(BASE_DIR, "app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# 🧑‍💻 User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    transactions = db.relationship("Transaction", backref="user", lazy=True)


# 💸 Transaction model (belongs to a User)
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(80), nullable=False, default="Uncategorized")
    note = db.Column(db.String(255), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


# Create tables if they don't exist yet
with app.app_context():
    db.create_all()


# Helper: require login for certain routes
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)

    return decorated_function


# Make current_user available in all templates
@app.context_processor
def inject_user():
    return {"current_user": session.get("username")}


@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        confirm = request.form.get("confirm", "").strip()

        # Basic validation
        if not username or not password or not confirm:
            flash("Please fill in all fields.", "danger")
            return redirect(url_for("register"))

        if password != confirm:
            flash("Passwords do not match.", "danger")
            return redirect(url_for("register"))

        # Check if username is taken
        existing = User.query.filter_by(username=username).first()
        if existing:
            flash("Username already taken. Choose another.", "danger")
            return redirect(url_for("register"))

        # Create user with hashed password
        password_hash = generate_password_hash(password)
        new_user = User(username=username, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()

        flash("Account created! You can now log in.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            # Save info in session
            session["user_id"] = user.id
            session["username"] = user.username
            flash("Logged in successfully!", "success")
            return redirect(url_for("index"))
        else:
            flash("Invalid username or password.", "danger")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    user_id = session["user_id"]

    if request.method == "POST":
        amount_str = request.form.get("amount", "").strip()
        category = request.form.get("category", "").strip() or "Uncategorized"
        note = request.form.get("note", "").strip()

        try:
            amount = float(amount_str)
        except ValueError:
            flash("Please enter a valid number for amount.", "danger")
            # Fall through to GET logic below
        else:
            # Create a new transaction for this user
            new_tx = Transaction(
                amount=amount, category=category, note=note, user_id=user_id
            )
            db.session.add(new_tx)
            db.session.commit()
            flash("Transaction added!", "success")
            return redirect(url_for("index"))

    # Load this user's transactions
    transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    # Summary
    total = sum(t.amount for t in transactions)
    by_category = {}
    for t in transactions:
        by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

    # Show only the 5 most recent on dashboard
    recent = transactions[:5]

    return render_template(
        "index.html",
        transactions=recent,
        total=total,
        by_category=by_category,
    )


@app.route("/transactions")
@login_required
def all_transactions():
    user_id = session["user_id"]
    transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .all()
    )
    return render_template("transactions.html", transactions=transactions)


if __name__ == "__main__":
    app.run(debug=True)