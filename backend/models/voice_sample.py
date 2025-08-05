from mongoengine import Document, StringField, ReferenceField, DateTimeField
import datetime
from models.user import User

class VoiceSample(Document):
    user = ReferenceField(User, required=True)
    file_path = StringField(required=True)  # e.g. "static/audio/bharat1.wav"
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"ordering": ["-created_at"]}
