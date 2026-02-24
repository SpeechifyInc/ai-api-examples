import base64
import os

from dotenv import load_dotenv
from speechify import Speechify

load_dotenv()

client = Speechify(token=os.environ["SPEECHIFY_API_KEY"])

response = client.tts.audio.speech(
    input="Welcome to Speechify!",
    voice_id="george",
    audio_format="mp3",
)

with open("output.mp3", "wb") as f:
    f.write(base64.b64decode(response.audio_data))
