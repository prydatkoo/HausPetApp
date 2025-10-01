"""
HausPet AI Server - Vercel Deployment
Created by Maryan - Full Stack Developer
"""

import sys
import os

# Add the parent directory to the path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel expects the app to be named 'app'
# This file acts as the entry point
if __name__ == "__main__":
    app.run()