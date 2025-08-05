from mongoengine import Document, StringField, EmailField

class User(Document):
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)

    meta = {
        'collection': 'users',
        'ordering': ['username']
    }
