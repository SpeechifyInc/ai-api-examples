import os
from pathlib import Path

from dotenv import load_dotenv
from speechify import SpeechifyAPI

load_dotenv()  # loads env variables from .env if present

SCRIPT_DIR = Path(__file__).parent


def main():
    client = SpeechifyAPI()

    # Normalize CWD to the script directory so the class's hardcoded
    # "../audio.ogg" path resolves one level up, then we move it back here.
    os.chdir(SCRIPT_DIR)

    # Use get_client_voices() to browse available names, engines, and language codes
    result = client.generate_audio_files(
        paragraph="Welcome to Speechify!",
        name="george",
        engine="resemble",
        language="en-US",
    )

    # Move the file from ../audio.ogg (where the class saved it) into this folder
    output_path = SCRIPT_DIR / "output.ogg"
    (SCRIPT_DIR.parent / "audio.ogg").rename(output_path)

    print(result)  # "File generated successfully!"
    print(f"Audio saved to {output_path}")


if __name__ == "__main__":
    main()
