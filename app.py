import os
from flask import Flask, session, redirect, url_for

from models import db  # SQLAlchemy instance
from decorators import login_required  # not used here but fine to have


# ----------------- APP SETUP -----------------

app = Flask(__name__)

# 🔐 Secret key for sessions (change this in real life and keep it secret)
app.secret_key = "change_this_to_a_random_secret_string"


# ----------------- DATABASE CONFIG -----------------
# If DATABASE_URL is set (e.g., on Render with Neon), use Postgres.
# Otherwise, use local SQLite (app.db).

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Some providers give postgres:// but SQLAlchemy expects postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
else:
    # Local dev: SQLite file
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(BASE_DIR, "app.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with this app
db.init_app(app)


# ----------------- TEMPLATE CONTEXT -----------------

@app.context_processor
def inject_user():
    """
    Makes {{ current_user }} available in all templates.
    """
    return {"current_user": session.get("username")}


# Root route → redirect to Transactions tab
@app.route("/")
def home():
    return redirect(url_for("transactions.transactions_view"))


# ----------------- DB TABLE CREATION -----------------

with app.app_context():
    # Import models so SQLAlchemy is aware of them before creating tables
    from models import User, Transaction, Category  # noqa: F401
    db.create_all()


# ----------------- BLUEPRINT REGISTRATION -----------------

from auth_routes import auth_bp
from transactions_routes import transactions_bp
from categories_routes import categories_bp
from history_routes import history_bp

app.register_blueprint(auth_bp)
app.register_blueprint(transactions_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(history_bp)


# ----------------- MAIN ENTRYPOINT -----------------

if __name__ == "__main__":
    # For local development
    app.run(debug=True)