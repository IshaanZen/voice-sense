from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import wave
from voice_model import run_model


def homePage(request):
  return render(request, 'index.html')

def resultPage(request):
  emotion_data = run_model('recorded_voice.wav')
  return render(request, 'result.html', emotion_data)


def aboutUsPage(request):
  return render(request, 'about-us.html')


@csrf_exempt
def save_audio(request):
    if request.method == 'POST':
        audio_file = request.FILES.get('audio')

        if audio_file:
            try:
                with wave.open('recorded_voice.wav', 'wb') as destination:
                    destination.setnchannels(1)  # Mono
                    destination.setsampwidth(2)  # 16-bit
                    destination.setframerate(44100)  # 44.1 kHz

                    for chunk in audio_file.chunks():
                        destination.writeframes(chunk)
                
                print('Audio file saved successfully')
                return JsonResponse({'status': 'success', 'message': 'Audio file saved successfully'})
            except Exception as e:
                print(f'Error saving audio file: {e}')
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        else:
            print('Audio file not found in request.FILES')
            return JsonResponse({'status': 'error', 'message': 'Audio file not provided in request.FILES'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
