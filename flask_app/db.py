
import os
import mysql.connector
from dotenv import load_dotenv

# Load settings from the project's .env file
load_dotenv()


def get_db_connection():
    """Create and return a MySQL database connection."""
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        database=os.getenv("DB_NAME", "bhavesh_portfolio"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "")
    )

    return connection
