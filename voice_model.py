import speech_recognition as sr
import pandas as pd
import numpy as np
import pickle
import librosa
from pydub import AudioSegment


# Load the Model back from file
with open("model.pkl", 'rb') as file:
  model = pickle.load(file)


def extract_feature(file_path, mfcc=True, chroma=True, mel=True):
  try:
    # Load the audio file
    audio, sr_orig = librosa.load(file_path, sr=None)

    # Resample the audio to a common sampling rate (e.g., 22050)
    target_sr = 22050
    audio = librosa.resample(audio, orig_sr=sr_orig, target_sr=target_sr)

    # Extract features
    features = []

    if mfcc:
        mfccs = np.mean(librosa.feature.mfcc(
            y=audio, sr=target_sr, n_mfcc=13), axis=1)
        features.append(mfccs)

    if chroma:
        chroma = np.mean(librosa.feature.chroma_stft(
            y=audio, sr=target_sr), axis=1)
        features.append(chroma)

    if mel:
        mel_spec = np.mean(
            librosa.feature.melspectrogram(y=audio, sr=target_sr), axis=1)
        features.append(mel_spec)

    return np.concatenate(features)

  except Exception as e:
      print("Error encountered while parsing audio file:", file_path)
      return None


#   ans = []
#   new_feature = extract_feature(file, mfcc=True, chroma=True, mel=True)
#   ans.append(new_feature)
#   ans = np.array(ans)

#   # Assuming Emotion_Voice_Detection_Model is your trained model
#   result = model.predict(ans)
#   return result


def run_model(file_path):
    results = analyze_audio(file_path)
    return results


def analyze_audio(file_path):
    # Load audio from the WAV file
    audio_data = AudioSegment.from_wav(file_path)

    # Calculate pitch and loudness
    pitch = audio_data.frame_rate
    loudness = audio_data.dBFS

    # Recognize emotion and predict speech volume
    emotion = recognize_emotion(pitch, loudness)
    speech_volume = predict_speech_volume(loudness)

    # Calculate emotion percentage
    total_emotions = 3
    emotion_percentage = calculate_emotion_percentage(emotion, total_emotions)

    result = {
        'pitch': pitch,
        'loudness': loudness,
        'emotion': emotion,
        'speech_volume': speech_volume,
        'emotion_percentage': emotion_percentage
    }
    return result



def recognize_emotion(pitch, loudness):
    if pitch > 0 and loudness < -25:
        return "Happy"
    elif pitch < 0 and loudness < -30:
        return "Sad"
    else:
        return "Neutral"


def predict_speech_volume(loudness):
    if loudness > -15:
        return "Loud"
    else:
        return "Soft"


def calculate_emotion_percentage(emotion, total_emotions):
    emotion_counts = {'Happy': 0, 'Sad': 0, 'Neutral': 0}
    emotion_counts[emotion] += 1

    percentage = (emotion_counts[emotion] / total_emotions) * 100
    return round(percentage, 2)
