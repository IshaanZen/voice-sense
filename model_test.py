from tensorflow.keras import layers, models
import tensorflow as tf
import os
import librosa
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from joblib import dump

# Function to extract features from audio files
import librosa
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


def extract_features(file_path):
    audio, _ = librosa.load("./clean_speech/"+file_path)
    # Extract relevant features using librosa (you can customize this based on your needs)
    mfccs = librosa.feature.mfcc(y=audio, sr=22050, n_mfcc=13)
    chroma = librosa.feature.chroma_stft(y=audio, sr=22050)
    mel_spec = librosa.feature.melspectrogram(y=audio, sr=22050)

    # Flatten the features
    flat_features = []
    for feature in [mfccs, chroma, mel_spec]:
        flat_features.extend(feature.mean(axis=1))

    return flat_features

# Load the CSV file
data = pd.read_csv('predictionfinal.csv')

# Apply feature extraction to all rows
data['predictions'] = data['file_names'].apply(lambda x: extract_features(x))

# Convert labels to numerical values
le = LabelEncoder()
data['file_names'] = le.fit_transform(data['predictions'])

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    np.stack(data['predictions']), data['file_names'], test_size=0.2, random_state=42
)


# You can use librosa's augmentations or create your own
# Example: Pitch shifting


def pitch_shift(features, sr, n_steps=2):
    return librosa.effects.pitch_shift(features, sr=sr, n_steps=n_steps)


# Apply pitch shifting to augment the data
X_train_augmented = []
for features, label in zip(X_train, y_train):
    augmented_features = pitch_shift(features, sr=your_sampling_rate)
    X_train_augmented.append((augmented_features, label))

X_train_augmented = np.stack(X_train_augmented)
X_train = np.concatenate([X_train, X_train_augmented[:, 0]])
y_train = np.concatenate([y_train, X_train_augmented[:, 1]])

# Shuffle the data
shuffle_idx = np.random.permutation(len(X_train))
X_train, y_train = X_train[shuffle_idx], y_train[shuffle_idx]


# Define the model
model = models.Sequential([
    layers.Input(shape=(your_input_shape)),
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=your_input_shape),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(num_classes, activation='softmax')
])

# Compile the model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=your_epochs,
          validation_data=(X_test, y_test))

