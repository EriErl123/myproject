import os
import time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=os.path.join(BASE_DIR, '..', 'frontend'))
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'parking.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(16), nullable=False, default='free')
    reserved_until = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'lat': self.lat,
            'lng': self.lng,
            'status': self.status,
            'reserved_until': self.reserved_until,
        }


def seed_slots():
    if Slot.query.count() == 0:
        demo = [
            (1, 'A1', 37.7750, -122.4194),
            (2, 'A2', 37.7752, -122.4188),
            (3, 'B1', 37.7746, -122.4198),
            (4, 'B2', 37.7742, -122.4185),
        ]
        for sid, name, lat, lng in demo:
            db.session.add(Slot(id=sid, name=name, lat=lat, lng=lng, status='free'))
        db.session.commit()


def broadcast_slots():
    slots = [s.to_dict() for s in Slot.query.order_by(Slot.id).all()]
    socketio.emit('slots_update', {'slots': slots}, broadcast=True)


@app.route('/api/slots')
def get_slots():
    slots = [s.to_dict() for s in Slot.query.order_by(Slot.id).all()]
    return jsonify({'slots': slots})


@app.route('/api/reserve', methods=['POST'])
def reserve_slot():
    data = request.json or {}
    slot_id = data.get('slot_id')
    minutes = int(data.get('minutes', 30))
    if slot_id is None:
        return jsonify({'error': 'slot_id required'}), 400

    slot = Slot.query.get(int(slot_id))
    if not slot:
        return jsonify({'error': 'slot not found'}), 404
    if slot.status == 'occupied':
        return jsonify({'error': 'slot already occupied'}), 400

    expire_at = time.time() + minutes * 60
    slot.status = 'occupied'
    slot.reserved_until = expire_at
    db.session.commit()
    broadcast_slots()
    return jsonify({'ok': True, 'reserved_until': expire_at})


@socketio.on('connect')
def handle_connect():
    broadcast_slots()


def reservation_watcher():
    while True:
        now = time.time()
        changed = False
        for slot in Slot.query.filter(Slot.reserved_until != None).all():
            if slot.reserved_until and slot.reserved_until <= now:
                slot.status = 'free'
                slot.reserved_until = None
                changed = True
        if changed:
            db.session.commit()
            broadcast_slots()
        socketio.sleep(5)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_proxy(path):
    frontend_dir = os.path.join(BASE_DIR, '..', 'frontend')
    if path == '' or path == 'index.html':
        return send_from_directory(frontend_dir, 'index.html')
    return send_from_directory(frontend_dir, path)


if __name__ == '__main__':
    db.create_all()
    seed_slots()
    socketio.start_background_task(reservation_watcher)
    socketio.run(app, host='0.0.0.0', port=5000)
