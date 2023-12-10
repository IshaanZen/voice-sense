import numpy as np
import pickle
import librosa


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



def run_model(file_path):
    ans = []
    new_feature = extract_feature(file_path, mfcc=True, chroma=True, mel=True)
    ans.append(new_feature)
    ans = np.array(ans)

    # Assuming Emotion_Voice_Detection_Model is your trained model
    result = model.predict(ans)
    return {"emotion": result[0]}

