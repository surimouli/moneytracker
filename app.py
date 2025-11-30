from flask import Flask, session, redirect, url_for
import os

from models import db  # db object
from decorators import login_required  # used in templates via imports in routes

app = Flask(__name__)

# 🔐 Secret for sessions (change for real projects, don’t commit real value)
app.secret_key = "change_this_to_a_random_secret_string"

# 📦 SQLite DB config
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(BASE_DIR, "app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with this app
db.init_app(app)


@app.context_processor
def inject_user():
    # available as {{ current_user }} in templates
    return {"current_user": session.get("username")}


@app.route("/")
def home():
    # Redirect root to Transactions tab
    return redirect(url_for("transactions.transactions_view"))


# Create tables once app + db are ready
with app.app_context():
    from models import User, Transaction, Category  # noqa: F401
    db.create_all()


# Import and register blueprints AFTER app + db setup
from auth_routes import auth_bp
from transactions_routes import transactions_bp
from categories_routes import categories_bp
from history_routes import history_bp

app.register_blueprint(auth_bp)
app.register_blueprint(transactions_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(history_bp)


if __name__ == "__main__":
    app.run(debug=True)

@app.route("/debug-db")
def debug_db():
    from models import User, Transaction, Category
    users = User.query.all()
    txs = Transaction.query.all()
    cats = Category.query.all()

    return {
        "users": [u.username for u in users],
        "transactions": len(txs),
        "categories": len(cats)
    }
