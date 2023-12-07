from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import wave
import  io
from pydub import AudioSegment
from voice_model import run_model
from django.core.files.base import ContentFile


def homePage(request):
  return render(request, 'index.html')

def resultPage(request):
  emotion_data = run_model('output10.wav')
  return render(request, 'result.html', emotion_data)


@csrf_exempt
def save_audio(request):
    if request.method == 'POST':
        audio_file = request.FILES.get('audio')
        return redirect('/result')
        if audio_file:
            try:
                # Read the content of the uploaded file
                audio_content = audio_file.read()

                # Convert raw audio data to AudioSegment
                audio_segment = AudioSegment.from_wav(
                    io.BytesIO(audio_content))

                # Save the AudioSegment as a WAV file
                wav_file = ContentFile(
                    audio_segment.raw_data, name='recorded_voice.wav')

                # Save the ContentFile to your desired location
                # For example, you can save it in your media directory
                with open('media/recorded_voice.wav', 'wb') as destination:
                    destination.write(wav_file.read())

                print('Audio file saved successfully')
                return redirect('/result')
            except Exception as e:
                print(f'Error saving audio file: {e}')
                return JsonResponse({'status': 'error', 'message': str(e)}, content_type='application/json')
        else:
            print('Audio file not found in request.FILES')
            return JsonResponse({'status': 'error', 'message': 'Audio file not provided in request.FILES'}, content_type='application/json')
