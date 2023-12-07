
const scroll = new LocomotiveScroll({
    el: document.querySelector('body'), 
    // el =
    smooth: true
});



function cursorfollow(){
	window.addEventListener("mousemove" , (e)=>{
		console.log(e.clientX , e.clientY)
		
		document.querySelector(".cursor-follow").style.transform= `translate(${e.clientX+10}px , ${e.clientY-10}px)`;

	})
}

function mainAnimation(){

	var tl = gsap.timeline();

	tl.from(".nav_link", {
		y:'-100' , 
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".img1", {
		y:'-100' , 
		stagger: 0.2,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".flip-card", {
		// y:'-100' , 
		stagger: 0.1,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".img2", {
		x:'-100' , 
		stagger: 0.1,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".img3", {
		y:'100' , 
		stagger: 0.2,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".left-Heading", {
		// y:'100' , 
		stagger: 0.2,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
	tl.from(".guideline", {
		// y:'100' , 
		stagger: 0.2,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})

	tl.from(".start-analysis>a", {
		stagger:0.3,
		opacity:0,
		duration:0.4,
		ease: Expo.easeinout
	})
}

cursorfollow();
mainAnimation();
    
var isRecording = false;
    var mediaRecorder;
    var audioChunks = [];
    var stopTimeout;

    document.getElementById('startRecording').onclick = function() {
        var startRecordingButton = this;

        if (!isRecording) {
            startRecordingButton.disabled = true;
            startRecordingButton.innerText = 'Recording...';

            navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = function(e) {
                    if (e.data.size > 0) {
                        audioChunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = function() {
                    var audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                    // Create a new FormData object
                    var formData = new FormData();
                    formData.append("audio", audioBlob, "recorded_voice.wav");

                    // Create an XMLHttpRequest object
                    var xhr = new XMLHttpRequest();

                    // Configure it to make a POST request
                    xhr.open('POST', '/save-audio/', true);

                    // Set a callback function to handle the response
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            console.log(JSON.parse(xhr.responseText));
                        } else {
                            console.error('Error submitting form:', xhr.statusText);
                        }

                        // Reset button and audioChunks for the next recording
                        startRecordingButton.disabled = false;
                        startRecordingButton.innerText = 'Start Your Analysis';
                        audioChunks = [];
                    };

                    // Send the FormData object
                    xhr.send(formData);

                    // Stop recording after 10 seconds
                    clearTimeout(stopTimeout);
                    isRecording = false;
                };

                mediaRecorder.start();
                isRecording = true;

                // Change button text to "Stop Recording"
                startRecordingButton.disabled = false;
                startRecordingButton.innerText = 'Stop Recording';

                // Stop recording after 10 seconds
                stopTimeout = setTimeout(function() {
                    if (isRecording) {
                        mediaRecorder.stop();
                    }
                }, 10000);

            }).catch(function(error) {
                console.error('Error accessing microphone:', error);
                startRecordingButton.disabled = false;
                startRecordingButton.innerText = 'Start Your Analysis';
            });
        } else {
            // Stop recording if the button is clicked again
            if (mediaRecorder && isRecording) {
                clearTimeout(stopTimeout);
                mediaRecorder.stop();
            }
        }
    };
