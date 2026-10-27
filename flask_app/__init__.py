from flask import Flask

def create_app():
    app = Flask(__name__)

    from flask_app.routes import main
    from flask_app.ai_assistant import ai_bp

    app.register_blueprint(main)
    app.register_blueprint(ai_bp)

    return app