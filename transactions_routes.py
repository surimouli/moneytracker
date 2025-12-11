from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash,
)
from datetime import datetime, timezone

from models import db, Transaction, Category
from decorators import login_required
from history_routes import LOCAL_TZ  # reuse the same timezone logic

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("/transactions", methods=["GET", "POST"])
@login_required
def transactions_view():
    user_id = session["user_id"]

    if request.method == "POST":
        amount_str = request.form.get("amount", "").strip()
        tx_type = request.form.get("type", "income")  # "income" or "spending"
        category_name = request.form.get("category", "").strip()
        note = request.form.get("note", "").strip()
        date_str = request.form.get("date", "").strip()  # YYYY-MM-DD

        # Validate amount
        try:
            amount = float(amount_str)
        except ValueError:
            flash("Please enter a valid number for amount.", "danger")
            return redirect(url_for("transactions.transactions_view"))

        # Income = positive, Spending = negative
        if tx_type == "income":
            amount = abs(amount)
        else:
            amount = -abs(amount)

        if not category_name:
            category_name = "Uncategorized"

        # Handle custom date (local) → store as UTC-naive in DB
        if date_str:
            try:
                local_date = datetime.strptime(date_str, "%Y-%m-%d")
                # Pick noon local time to avoid DST edge weirdness
                local_dt = datetime(
                    local_date.year,
                    local_date.month,
                    local_date.day,
                    12,
                    0,
                    0,
                    tzinfo=LOCAL_TZ,
                )
                utc_dt = local_dt.astimezone(timezone.utc).replace(tzinfo=None)
                tx_date = utc_dt
            except ValueError:
                tx_date = datetime.utcnow()
        else:
            tx_date = datetime.utcnow()

        new_tx = Transaction(
            user_id=user_id,
            amount=amount,
            category=category_name,
            note=note,
            date=tx_date,
        )

        db.session.add(new_tx)
        db.session.commit()
        flash("Transaction added.", "success")

        return redirect(url_for("transactions.transactions_view"))

    # GET – show the form
    categories = (
        Category.query.filter_by(user_id=user_id)
        .order_by(Category.name)
        .all()
    )

    return render_template("transactions.html", categories=categories)