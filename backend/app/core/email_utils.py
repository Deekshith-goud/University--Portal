import random
import string
from datetime import datetime, timedelta

import smtplib
from email.utils import formatdate, make_msgid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

import random

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def get_email_content(reason: str = "login"):
    """
    Returns the text content dictionary based on reason.
    """
    content_map = {
        "signup": {
            "title": "Welcome to VFSTR",
            "subtitle": "Account Verification",
            "greeting": "Verify Your Email",
            "text": "Thank you for joining. Use the code below to verify your email and complete your registration.",
            "btn": "VERIFY EMAIL"
        },
        "reset": {
            "title": "Password Reset",
            "subtitle": "Security Alert",
            "greeting": "Reset Your Password",
            "text": "We received a request to reset your password. Use the code below to proceed securely.",
            "btn": "RESET PASSWORD"
        },
        "login": {
            "title": "Secure Login",
            "subtitle": "University Excellence Portal",
            "greeting": "Login Verification",
            "text": "Use the code below to access your <strong>VFSTR Student Portal</strong> account.",
            "btn": "VERIFY LOGIN"
        }
    }
    return content_map.get(reason, content_map["login"])

def send_email_otp(to_email: str, otp_code: str, reason: str = "login"):
    """
    Attempts to send real email via SMTP.
    Falls back to Console Print if credentials are missing or connection fails.
    Reason: "signup", "reset", "login"
    """
    smtp_server = "smtp.gmail.com" # Default to Gmail
    smtp_port = 587
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Get content for both Plain Text and HTML
    ctx = get_email_content(reason)
    html_content = get_modern_email_html(otp_code, reason)
    
    # Determine Subject based on reason (Clean, No Emojis to avoid Spam Filters)
    subject_map = {
        "signup": f"Verify your Account: {otp_code}",
        "reset": f"Password Reset Code: {otp_code}",
        "login": f"Login Verification Code: {otp_code}"
    }
    subject = subject_map.get(reason, f"Access Code: {otp_code}")

    # FALLBACK: If Creds missing, print to console & save preview
    if not smtp_user or not smtp_password:
        print(f"⚠️ SMTP Creds not set. Saving preview to backend/uploads/last_email.html")
        
        # Save Preview
        preview_path = "uploads/last_email.html"
        os.makedirs("uploads", exist_ok=True)
        with open(preview_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        print_otp_to_console(to_email, otp_code)
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"VFSTR Portal <{smtp_user}>"
        msg["To"] = to_email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="gmail.com")

        # 1. Plain Text Version (Vital for Spam Score)
        text_content = f"""
        {ctx['title']} - {ctx['subtitle']}
        
        {ctx['greeting']}
        
        {ctx['text'].replace('<strong>', '').replace('</strong>', '')}
        
        YOUR CODE: {otp_code}
        
        (Valid for 5 minutes)
        VFSTR Deemed to be University
        """
        msg.attach(MIMEText(text_content, "plain"))

        # 2. HTML Version (Must be added last/second)
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
    
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ SMTP AUTH ERROR: Gmail blocked the login.")
        print(f"   Reason: {e}")
        print(f"   SOLUTION: You MUST use an 'App Password', not your login password.")
        print(f"   Go to: https://myaccount.google.com/apppasswords\n")
        print("Falling back to console print...")
        print_otp_to_console(to_email, otp_code)
        return False
        
    except Exception as e:
        print(f"\n❌ FAILED to send email via SMTP.")
        print(f"   Error: {e}")
        print("Falling back to console print...")
        print_otp_to_console(to_email, otp_code)
        return False

def get_modern_email_html(otp_code: str, reason: str = "login"):
    """
    Returns a 'Shining Platinum' HTML email string.
    Features: Holographic gradients, White/Silver palette, Soft Glows.
    Context-aware text changes based on 'reason'.
    """
    
    ctx = get_email_content(reason)

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');
            body {{ margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background-color: #f3f4f6; color: #1f2937; }}
            .wrapper {{ width: 100%; padding: 60px 0; background: #f3f4f6; }}
            
            .card {{ 
                max-width: 450px; 
                margin: 0 auto; 
                background: #ffffff; 
                border-radius: 24px; 
                overflow: hidden; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05);
                border: 1px solid rgba(255,255,255,0.8);
                position: relative;
            }}
            
            /* The "Shining" Top Gradient */
            .card-header {{
                background: #0f172a; /* Dark Navy */
                padding: 40px;
                text-align: center;
                border-bottom: 1px solid #1e293b;
                position: relative;
            }}
            
            /* Holographic/Shine Accent */
            .shine-bar {{
                height: 4px;
                width: 100%;
                background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1);
                background-size: 300% 100%;
                position: absolute;
                top: 0; left: 0; right: 0;
            }}

            .logo-circle {{
                width: 56px; height: 56px;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%); /* Darker circle */
                border-radius: 18px;
                margin: 0 auto 20px;
                display: flex; 
                line-height: 56px; 
                text-align: center;
                color: #fff; /* White Text */
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255,255,255,0.1);
            }}

            .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }} /* White Title */
            .subtitle {{ font-size: 13px; color: #94a3b8; font-weight: 400; }} /* Muted Text */

            .content {{ padding: 40px; text-align: center; background: #fff; }}
            
            .otp-card {{
                background: #fafafa;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 15px;
                margin: 25px 0;
                position: relative;
                overflow: hidden;
            }}
            /* Subtle inner shine */
            .otp-card::before {{
                content: '';
                position: absolute;
                top: -50%; left: -50%; width: 200%; height: 200%;
                background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%);
                pointer-events: none;
            }}
            
            .otp-code {{ 
                font-family: monospace; 
                font-size: 32px; 
                letter-spacing: 8px; 
                font-weight: 700; 
                color: #111;
                position: relative;
                z-index: 2;
            }}
            
            .btn {{
                display: inline-block;
                background: #0f172a; /* Match Header */
                color: #fff;
                font-size: 12px;
                font-weight: 600;
                padding: 12px 30px;
                border-radius: 50px;
                text-decoration: none;
                margin-top: 10px;
                box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);
            }}

            .footer {{ 
                background: #0f172a; /* Dark Navy Footer */
                padding: 20px; 
                text-align: center; 
                font-size: 11px; 
                color: #94a3b8;
                border-top: 1px solid #1e293b;
            }}
            
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="card">
                <div class="shine-bar"></div>
                <div class="card-header">
                    <div class="logo-circle">U</div>
                    <div class="title">{ctx['title']}</div>
                    <div class="subtitle">{ctx['subtitle']}</div>
                </div>
                
                <div class="content">
                    <div class="greeting">{ctx['greeting']}</div>
                    <div class="text">
                        {ctx['text']}
                    </div>
                    
                    <div class="otp-card">
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    
                    <div class="subtitle" style="margin-top: 20px; font-size: 11px;">
                        This code expires in 5 minutes. Do not share it with anyone.
                    </div>
                </div>
                
                <div class="footer">
                    VFSTR Deemed to be University • Secure Portal
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def print_otp_to_console(email: str, otp: str):
    """
    Simulates sending email by printing the 'Crazy Modern' OTP to console.
    """
    print("\n" + "="*60)
    print(f"📧 SENDING OTP TO: {email}")
    print("="*60)
    print(f"SUBJECT: 🔐 YOUR ACCESS CODE: {otp}")
    print("-" * 60)
    print(f"BODY PREVIEW (HTML):")
    html = get_modern_email_html(otp)
    # Just print the raw code clearly for the user to copy
    print(f"\n   >>>>>  {otp}  <<<<<\n")
    print(f"(Valid for 5 minutes)")
    print("="*60 + "\n")
