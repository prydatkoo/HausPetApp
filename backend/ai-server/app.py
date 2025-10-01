"""
HausPet AI Server - Final Version with JWT Authentication
Created by Maryan - Full Stack Developer
"""
import os
import datetime
import jwt
import base64
from functools import wraps
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from openai import OpenAI

# --- App Initialization & Config ---
load_dotenv('.env.development.local')
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8081", "exp://*"]}}, supports_credentials=True)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a-super-secret-key-that-should-be-changed')
db_url = os.getenv('POSTGRES_URL')
if not db_url:
    raise RuntimeError("Database URL not found.")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
if not app.config['OPENAI_API_KEY']:
    raise ValueError("OPENAI_API_KEY environment variable not set!")

# --- Database Models ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    firstName = db.Column(db.String(80), nullable=True)
    lastName = db.Column(db.String(80), nullable=True)
    role = db.Column(db.String(80), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    pets = db.relationship('Pet', backref='owner', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Pet(db.Model):
    __tablename__ = 'pets'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(100), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    weight = db.Column(db.Float, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    sensor_data = db.relationship('SensorData', backref='pet', lazy=True)

class SensorData(db.Model):
    __tablename__ = 'sensor_data'
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    heart_rate = db.Column(db.Integer)
    temperature = db.Column(db.Float)
    spo2 = db.Column(db.Integer)
    activity_level = db.Column(db.Float)

with app.app_context():
    db.create_all()

# --- JWT Token Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': f'Token is invalid! {e}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- API Endpoints ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/notifications', methods=['GET'])
def get_notifications_placeholder():
    return jsonify([]), 200

@app.route('/pets/<int:pet_id>/location/current', methods=['GET'])
@token_required
def get_pet_location_placeholder(current_user, pet_id):
    return jsonify({"message": "Location data not yet available for this pet."}), 404


@app.route('/api/v1/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 409

        new_user = User(
            email=data['email'],
            firstName=data.get('firstName'),
            lastName=data.get('lastName')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()

        token = jwt.encode({
            'id': new_user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            "message": "Registered successfully", 
            "token": token, 
            "user": {
                "id": new_user.id, 
                "email": new_user.email, 
                "firstName": new_user.firstName, 
                "lastName": new_user.lastName
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Server error during registration: {str(e)}"}), 500

@app.route('/api/v1/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user:
            return jsonify({"error": "User not found. Please register."}), 404

        if user.check_password(data['password']):
            token = jwt.encode({
                'id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")

            return jsonify({
                "message": "Login successful", 
                "token": token, 
                "user": {
                    "id": user.id, 
                    "email": user.email, 
                    "firstName": user.firstName, 
                    "lastName": user.lastName
                }
            }), 200
        else:
            return jsonify({"error": "Incorrect password."}), 401
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/v1/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "role": current_user.role
    }), 200

@app.route('/api/v1/ai/chat', methods=['POST'])
@token_required
def ai_chat(current_user):
    try:
        data = request.json
        user_message = data.get('message', '')
        pet_id = data.get('pet_id')
        
        context = """You are Dr. HausPet, a friendly and empathetic virtual veterinarian. Provide clear, concise, and helpful advice. Keep your responses to 1-3 sentences for a natural voice conversation."""
            
        if pet_id:
            pet = Pet.query.filter_by(id=pet_id, user_id=current_user.id).first()
            if pet:
                context += f" You are speaking about {pet.name}, a {pet.age}-year-old {pet.breed}."

        context += """ When you identify a potential health condition, end your response with a special marker like this:
        [CONDITION_DETECTED: "Canine Dermatitis"]
        Only include this marker if you are reasonably confident in the diagnosis based on the user's description.
        """

        client = OpenAI(api_key=app.config['OPENAI_API_KEY'])
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_message}
            ]
        )
        response_message = completion.choices[0].message.content

        condition_detected = None
        if "[CONDITION_DETECTED:" in response_message:
            parts = response_message.split("[CONDITION_DETECTED:")
            response_message = parts[0].strip()
            condition_str = parts[1].split("]")[0].strip()
            condition_detected = condition_str.replace('"', '')
        
        return jsonify({
            "response": response_message, 
            "context_used": bool(pet_id),
            "condition_detected": condition_detected
        })
    except Exception as e:
        return jsonify({"error": f"Error calling OpenAI: {str(e)}"}), 500

@app.route('/api/v1/ai/voice-chat', methods=['POST'])
@token_required
def voice_chat(current_user):
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        
        client = OpenAI(api_key=app.config['OPENAI_API_KEY'])
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.m4a", audio_bytes)
        )
        user_message = transcription.text
        
        pet_id = request.form.get('pet_id')
        context = """You are Dr. HausPet, a friendly and empathetic virtual veterinarian. Provide clear, concise, and helpful advice. Keep your responses to 1-3 sentences for a natural voice conversation."""
        if pet_id:
            pet = Pet.query.filter_by(id=pet_id, user_id=current_user.id).first()
            if pet:
                context += f" You are speaking about {pet.name}, a {pet.age}-year-old {pet.breed}."

        context += """ When you identify a potential health condition, end your response with a special marker like this:
[CONDITION_DETECTED: "Canine Dermatitis"]
Only include this marker if you are reasonably confident in the diagnosis based on the user's description.
"""

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_message}
            ]
        )
        response_message = completion.choices[0].message.content
        
        condition_detected = None
        if "[CONDITION_DETECTED:" in response_message:
            parts = response_message.split("[CONDITION_DETECTED:")
            response_message = parts[0].strip()
            condition_str = parts[1].split("]")[0].strip()
            condition_detected = condition_str.replace('"', '')

        speech_response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=response_message
        )
        
        audio_base64 = base64.b64encode(speech_response.content).decode('utf-8')
        
        return jsonify({
            "transcribed_text": user_message,
            "response_text": response_message,
            "response_audio": audio_base64,
            "condition_detected": condition_detected
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/v1/pets', methods=['POST'])
@token_required
def add_pet(current_user):
    try:
        data = request.get_json()
        if not data or not data.get('name') or not data.get('species'):
            return jsonify({"error": "Name and species are required"}), 400

        new_pet = Pet(
            name=data['name'],
            species=data['species'],
            breed=data.get('breed'),
            age=data.get('age'),
            weight=data.get('weight'),
            user_id=current_user.id
        )
        
        db.session.add(new_pet)
        db.session.commit()
        
        return jsonify({
            "message": "Pet added successfully",
            "pet": {
                "id": new_pet.id,
                "name": new_pet.name,
                "species": new_pet.species,
                "breed": new_pet.breed,
                "age": new_pet.age,
                "weight": new_pet.weight
            }
        }), 201
    except Exception as db_error:
        db.session.rollback()
        return jsonify({"error": "Failed to save pet to database"}), 500

@app.route('/api/v1/pets', methods=['GET'])
@token_required
def get_pets(current_user):
    try:
        pets = Pet.query.filter_by(user_id=current_user.id).all()
        pets_data = [{
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "age": pet.age,
            "weight": pet.weight
        } for pet in pets]
        return jsonify(pets_data), 200
    except Exception as db_error:
        return jsonify([]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.getenv('PORT', 5000))
