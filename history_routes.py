from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    flash,
    send_file,
)
import io

from models import db, Transaction
from decorators import login_required

history_bp = Blueprint("history", __name__)


@history_bp.route("/history")
@login_required
def history_view():
    user_id = session["user_id"]
    transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .all()
    )
    return render_template("history.html", transactions=transactions)


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


@history_bp.route("/history/export_excel")
@login_required
def export_history_excel():
    """
    Export the current user's full transaction history
    as an Excel (.xlsx) file.
    """
    from openpyxl import Workbook

    user_id = session["user_id"]

    transactions = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    # Create workbook in memory
    wb = Workbook()
    ws = wb.active
    ws.title = "History"

    # Header row
    ws.append(["Date", "Category", "Amount", "Note"])

    # Data rows
    for t in transactions:
        ws.append(
            [
                t.date.strftime("%Y-%m-%d %H:%M"),
                t.category,
                t.amount,
                t.note or "",
            ]
        )

    # Save workbook to a bytes buffer
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