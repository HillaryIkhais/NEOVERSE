import sys
import os

# Add root directory to python path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

# Import the existing FastAPI app
from api import app
