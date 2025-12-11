from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    flash,
    send_file,
    request,
)
import io
from datetime import datetime, timedelta, timezone

from models import db, Transaction, Category
from decorators import login_required

# ----- Timezone setup -----

try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
except ImportError:
    ZoneInfo = None
    ZoneInfoNotFoundError = Exception


def get_local_tz():
    """
    Try to use America/New_York; if that fails, fall back
    to the system local timezone or UTC.
    """
    if ZoneInfo is not None:
        try:
            return ZoneInfo("America/New_York")
        except ZoneInfoNotFoundError:
            pass

    # Fallback: system local tz (if available), else UTC
    try:
        return datetime.now().astimezone().tzinfo or timezone.utc
    except Exception:
        return timezone.utc


LOCAL_TZ = get_local_tz()

history_bp = Blueprint("history", __name__)


def get_date_range(range_key: str):
    """
    Returns (start_utc, end_utc, label) for a given range key.
    If range_key is 'total', returns (None, None, 'Total').
    """
    now_local = datetime.now(LOCAL_TZ)

    if range_key == "today":
        start_local = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        end_local = now_local
        label = "Today"
    elif range_key == "week":
        # Monday of this week
        start_local = now_local - timedelta(days=now_local.weekday())
        start_local = start_local.replace(hour=0, minute=0, second=0, microsecond=0)
        end_local = now_local
        label = "This Week"
    elif range_key == "month":
        # First day of this month
        start_local = now_local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_local = now_local
        label = "This Month"
    elif range_key == "3m":
        start_local = now_local - timedelta(days=90)
        end_local = now_local
        label = "Last 3 Months"
    elif range_key == "6m":
        start_local = now_local - timedelta(days=180)
        end_local = now_local
        label = "Last 6 Months"
    elif range_key == "year":
        start_local = now_local - timedelta(days=365)
        end_local = now_local
        label = "Last Year"
    else:
        # 'total' or unknown
        return None, None, "Total"

    # Convert local range boundaries to UTC
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)
    return start_utc, end_utc, label


@history_bp.route("/history")
@login_required
def history_view():
    user_id = session["user_id"]

    # Which category tab? "all" or a category name
    active_category = request.args.get("category", "all")

    # Which date range? today/week/month/3m/6m/year/total
    date_range_key = request.args.get("range", "total")

    # Base query for this user
    query = Transaction.query.filter_by(user_id=user_id)

    # Apply date range
    start_utc, end_utc, date_label = get_date_range(date_range_key)
    if start_utc is not None:
        query = query.filter(Transaction.date >= start_utc)
    if end_utc is not None:
        query = query.filter(Transaction.date <= end_utc)

    # Apply category filter (if not "all")
    if active_category != "all":
        query = query.filter(Transaction.category == active_category)

    # Final list of transactions (filtered and ordered newest → oldest)
    transactions = query.order_by(Transaction.date.desc()).all()

    # Summary numbers
    total_balance = sum(t.amount for t in transactions)
    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_spending = sum(-t.amount for t in transactions if t.amount < 0)

    summary = {
        "balance": total_balance,
        "income": total_income,
        "spending": total_spending,
    }

    # Convert timestamps to local time just for display
    for t in transactions:
        dt = t.date
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        t.local_date = dt.astimezone(LOCAL_TZ)

    # Get all categories for this user (for sub-tabs)
    categories = (
        Category.query.filter_by(user_id=user_id)
        .order_by(Category.name)
        .all()
    )

    return render_template(
        "history.html",
        transactions=transactions,
        categories=categories,
        active_category=active_category,
        date_range=date_range_key,
        date_label=date_label,
        summary=summary,
    )


@history_bp.route("/history/<int:tx_id>/delete", methods=["POST"])
@login_required
def delete_transaction(tx_id):
    user_id = session["user_id"]
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()

    if not tx:
        flash("Transaction not found or not yours.", "danger")
    else:
        db.session.delete(tx)
        db.session.commit()
        flash("Transaction deleted.", "info")

    return redirect(url_for("history.history_view"))


@history_bp.route("/history/<int:tx_id>/edit", methods=["GET", "POST"])
@login_required
def edit_transaction(tx_id):
    """
    Edit an existing transaction (amount, type, date, category, note).
    Accessible from the History tab.
    """
    user_id = session["user_id"]
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()

    if not tx:
        flash("Transaction not found or not yours.", "danger")
        return redirect(url_for("history.history_view"))

    # All categories for the dropdown
    categories = (
        Category.query.filter_by(user_id=user_id)
        .order_by(Category.name)
        .all()
    )

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
            return redirect(url_for("history.edit_transaction", tx_id=tx.id))

        # Income = positive, Spending = negative
        if tx_type == "income":
            amount = abs(amount)
        else:
            amount = -abs(amount)

        if not category_name:
            category_name = "Uncategorized"

        # Update amount, category, note
        tx.amount = amount
        tx.category = category_name
        tx.note = note

        # Update date if provided
        if date_str:
            try:
                local_date = datetime.strptime(date_str, "%Y-%m-%d")
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
                tx.date = utc_dt
            except ValueError:
                flash("Invalid date format.", "warning")

        db.session.commit()
        flash("Transaction updated.", "success")

        return redirect(url_for("history.history_view"))

    # GET: Pre-fill form with current values
    abs_amount = abs(tx.amount)
    tx_type = "income" if tx.amount >= 0 else "spending"

    # Pre-fill date as local YYYY-MM-DD
    dt = tx.date
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local_dt = dt.astimezone(LOCAL_TZ)
    date_for_input = local_dt.strftime("%Y-%m-%d")

    return render_template(
        "edit_transaction.html",
        transaction=tx,
        categories=categories,
        abs_amount=abs_amount,
        tx_type=tx_type,
        date_for_input=date_for_input,
    )


@history_bp.route("/history/export_excel")
@login_required
def export_history_excel():
    """
    Export the FULL transaction history for this user
    as an Excel (.xlsx) file (ignores filters).
    """
    from openpyxl import Workbook

    user_id = session["user_id"]

    transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "History"

    # Header row
    ws.append(["Date", "Category", "Amount", "Note"])

    # Data rows
    for t in transactions:
        dt = t.date
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        local_dt = dt.astimezone(LOCAL_TZ)

        ws.append(
            [
                local_dt.strftime("%Y-%m-%d %H:%M"),
                t.category,
                t.amount,
                t.note or "",
            ]
        )

    file_data = io.BytesIO()
    wb.save(file_data)
    file_data.seek(0)

    return send_file(
        file_data,
        mimetype=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        as_attachment=True,
        download_name="transaction_history.xlsx",
    )