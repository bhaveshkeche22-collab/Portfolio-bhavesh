
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_app.db import get_db_connection

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("index.html")



@main.route("/contact", methods=["POST"])
def contact():
    from flask import jsonify

    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    subject = request.form.get("subject", "").strip()
    message = request.form.get("message", "").strip()

    if not all([name, email, subject, message]):
        return jsonify({
            "success": False,
            "message": "Please fill in all fields."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO contact_messages
                (name, email, subject, message)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, subject, message)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully!"
        }), 200

    except Exception:
        main.logger.exception("Failed to save contact message")

        return jsonify({
            "success": False,
            "message": "Could not send your message. Please try again."
        }), 500

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()
