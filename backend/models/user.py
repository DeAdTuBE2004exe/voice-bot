from mongoengine import Document, StringField, EmailField, DateTimeField
import datetime

class User(Document):
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    
    # Fields for password reset OTP
    password_reset_otp = StringField(required=False)
    password_reset_otp_expiry = DateTimeField(required=False)
    
    # Fields for profile update OTP (add these!)
    profile_update_otp = StringField(required=False)
    profile_update_otp_expiry = DateTimeField(required=False)

    meta = {
        'collection': 'users',
        'ordering': ['username']
    }
