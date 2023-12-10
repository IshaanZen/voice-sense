const scroll = new LocomotiveScroll({
  el: document.querySelector("body"),
  // el =
  smooth: true,
});

function cursorfollow() {
  window.addEventListener("mousemove", (e) => {
    console.log(e.clientX, e.clientY);

    document.querySelector(".cursor-follow").style.transform = `translate(${
      e.clientX + 10
    }px , ${e.clientY - 10}px)`;
  });
}

function mainAnimation() {
  var tl = gsap.timeline();

  tl.from("#nav", {
    y: "-100",
    opacity: 0,
    duration: 0.8,
    ease: Expo.easeinout,
  });
  tl.from(".flip-card-left-1", {
    y: "-100",
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
  tl.from(".flip-card", {
    // y:'-100' ,
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
  tl.from(".flip-card-left-2", {
    x: "-100",
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
  tl.from(".flip-card-left-3", {
    y: "100",
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
  tl.from(".left-Heading", {
    // y:'100' ,
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
  tl.from(".guideline", {
    // y:'100' ,
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });

  tl.from(".start-analysis>a", {
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
    ease: Expo.easeinout,
  });
}

cursorfollow();
mainAnimation();

// ----RECORDING SCRIPTS ----
//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var rec; //Recorder.js object
var input; //MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");
var state = document.getElementById("state");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
  var constraints = { audio: true, video: false };

  recordButton.disabled = true;
  stopButton.disabled = false;
  pauseButton.disabled = false;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      console.log(
        "getUserMedia() success, stream created, initializing Recorder.js ..."
      );

      audioContext = new AudioContext();

      //update the format
      state.innerHTML = "Recording..."

      /*  assign to gumStream for later use  */
      gumStream = stream;

      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);

      /* 
			Create the Recorder object and configure to record mono sound (1 channel)
		*/
      rec = new Recorder(input, { numChannels: 1 });

      //start the recording process
      rec.record();

      console.log("Recording started");
    })
    .catch(function (err) {
      //enable the record button if getUserMedia() fails
      console.log("error in recording", err);
      recordButton.disabled = false;
      stopButton.disabled = true;
      pauseButton.disabled = true;
    });
}

function pauseRecording() {
  console.log("pauseButton clicked rec.recording=", rec.recording);
  if (rec.recording) {
    //pause
    rec.stop();
    pauseButton.innerHTML = "Resume";
    state.innerHTML = "Paused"
  } else {
    //resume
    rec.record();
    pauseButton.innerHTML = "Pause";
    state.innerHTML = "Recording..."
  }
}

function stopRecording() {
  console.log("stopButton clicked");

  // disable the stop button, enable the record too allow for new recordings
  stopButton.disabled = true;
  recordButton.disabled = false;
  pauseButton.disabled = true;

  // reset button just in case the recording is stopped while paused
  pauseButton.innerHTML = "Pause";

  // tell the recorder to stop the recording
  rec.stop();

  // stop microphone access
  gumStream.getAudioTracks()[0].stop();
  sendRecording();
}

function createDownloadLink(blob) {
  var url = URL.createObjectURL(blob);
  var au = document.createElement("audio");
  var li = document.createElement("li");
  var link = document.createElement("a");

  //name of .wav file to use during upload and download (without extendion)
  var filename = new Date().toISOString();

  //add controls to the <audio> element
  au.controls = true;
  au.src = url;

  //save to disk link
  link.href = url;
  link.download = filename + ".wav"; //download forces the browser to donwload the file using the  filename
  link.innerHTML = "Save to disk";

  //add the new audio element to li
  li.appendChild(au);

  //add the filename to the li
  li.appendChild(document.createTextNode(filename + ".wav "));

  //add the save to disk link to li
  li.appendChild(link);

  //upload link
  // var upload = document.createElement('a');
  // upload.href="#";
  // upload.innerHTML = "Upload";
  // upload.addEventListener("click", function(event){
  // 	  var xhr=new XMLHttpRequest();
  // 	  xhr.onload=function(e) {
  // 	      if(this.readyState === 4) {
  // 	          console.log("Server returned: ",e.target.responseText);
  // 	      }
  // 	  };
  // 	  var fd=new FormData();
  // 	  fd.append("audio_data",blob, filename);
  // 	  xhr.open("POST","upload.php",true);
  // 	  xhr.send(fd);
  // })
  // li.appendChild(document.createTextNode (" "))//add a space in between
  // li.appendChild(upload)//add the upload link to li

  //add the li element to the ol
  recordingsList.appendChild(li);
}

function sendRecording() {
  // export the WAV blob
  rec.exportWAV(function (blob) {
    // create FormData object and append the audio blob
    var formData = new FormData();
    formData.append("audio", blob, "recorded_voice.wav");

    // create XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // configure it to make a POST request to your Django view
    xhr.open("POST", "/save-audio/", true);

    // set a callback function to handle the response
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
        window.location.href = "/result";
      } else {
        console.error("Error submitting form:", xhr.statusText);
      }
    };

    // send the FormData object
    xhr.send(formData);
  });
}
