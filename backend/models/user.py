from mongoengine import Document, StringField, EmailField, DateTimeField
import datetime

class User(Document):
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'users',
        'ordering': ['username']
    }
