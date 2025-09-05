from mongoengine import Document, StringField, EmailField, DateTimeField
import datetime

class PendingUser(Document):
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    otp = StringField(required=True)
    otp_expiry = DateTimeField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'pending_users',
        'ordering': ['username']
    }
