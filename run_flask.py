
from flask_app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

if __name__ == "__main__":
    try:
        from flask_app.db import get_db_connection

        connection = get_db_connection()
        print("MySQL connected successfully!")

        connection.close()
        print("Database connection closed.")
    except Exception as error:
        print("MySQL connection failed:", error)
