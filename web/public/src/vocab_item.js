/*
 * on page load, populate the text areas with the user's languages
 */
var loadExercise = function(exerciseid) {
  var exercise = window.userHistory.userCreatedExercises[3];
  console.log(exercise);
  document.getElementById("audio_stimuli_file").src = exercise.audio_stimuli;
  document.getElementById("image_stimuli_file").src = exercise.image_stimuli;
  var languages = exercise.text_stimuli;
  for ( var l in languages) {
    $("#users_languages")
        .append(
            '<li >'
                + languages[l].text
                + ' </li>');
  }
};

document.getElementById("delete_exercise").onclick = function(e) {
  window.userHistory.userCreatedExercises;
  //TODO look up the id of the current exercise and move it to a trash array
  window.saveUser(function(){
    window.location.replace("index.html");
  });
};


/*
 * Handle the play/pause stimuli button
 */
document.getElementById("play_stimulus_button").onclick = function(e) {
  if ($(e.target)[0].classList.toString().indexOf("icon-pause") == -1) {
    OPrime.playAudioFile('audio_stimuli_file', function() {
      // oncomplete change the text of the button to play
      $($(e.target)[0]).toggleClass("icon-pause icon-play");
    });
    $($(e.target)[0]).toggleClass("icon-play icon-pause");
  } else {
    OPrime.pauseAudioFile('audio_stimuli_file');
    $($(e.target)[0]).toggleClass("icon-pause icon-play");
  }
};

/*
 * Handle the stop stimuli button
 */
document.getElementById("stop_stimulus_button").onclick = function(e) {
  OPrime.stopAudioFile('audio_stimuli_file');
  if (document.getElementById("play_stimulus_button").classList.toString()
      .indexOf("icon-play") == -1) {
    $(document.getElementById("play_stimulus_button")).toggleClass(
        "icon-play icon-pause");
  }
};

/*
 * Handle the record/stop response button
 */
document.getElementById("record_vocab_response_button").onclick = function(e) {
  e.stopPropagation();
  var responsefilename = document.getElementById("audio_stimuli_file").src
      .replace(".wav", "").replace(/\/.*\//,"").replace("ogg", "").replace(".mp3", "") + "_response_"+Date.now()+".mp3";
  if (document.getElementById("record_vocab_response_button").classList
      .toString().indexOf("icon-stop") == -1) {
    OPrime.captureAudio(responsefilename, /* started */function(audioUrl) {
      OPrime.debug("\nRecording successfully started " + audioUrl);

      // Only change the icons once.
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-record") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-record icon-stop");// set class to stop
        $(document.getElementById("record_vocab_response_button")).html("");
      }

    }, /* Recording complete */function(audioUrl) {
      OPrime.debug("Attaching sucessful recording to the result audio div "
          + audioUrl);
      document.getElementById("audio_response_file").src = audioUrl;
      document.getElementById("record_vocab_response_button").removeAttribute(
          "disabled", "disabled");
      // Play recorded audio
      OPrime.playAudioFile('audio_response_file');
    });
  } else {
    document.getElementById("record_vocab_response_button").setAttribute(
        "disabled", "disabled");
    OPrime.stopAndSaveAudio(responsefilename, /* stopped */function(
        audioUrl) {
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-stop") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-stop icon-record");// set class to record
        $(document.getElementById("record_vocab_response_button")).html(
            '<img src="mic_white.png" />');
      }

      OPrime.debug("\nRecording successfully stopped " + audioUrl);
    });
  }
};

/*
 * Handle the play response button
 */
document.getElementById("play_response_button").onclick = function(e) {
  OPrime.playAudioFile('audio_response_file');
};

/*
 * Capturing user's play back of audio, and saving it and restoring it from
 * localstorage
 */
var userHistory = localStorage.getItem("userHistory");
if (userHistory) {
  userHistory = JSON.parse(userHistory);
  OPrime.debug("Welcome back userid " + userHistory.id);
} else {
  userHistory = {};
  userHistory.id = Date.now();
}
loadExercise();

OPrime.hub.subscribe("playbackCompleted", function(filename) {
  window.userHistory[filename] = window.userHistory[filename] || [];
  window.userHistory[filename].push(JSON.stringify(new Date()));
  window.saveUser();
}, userHistory);

window.saveUser = function(callback) {
  localStorage.setItem("userHistory", JSON.stringify(window.userHistory));
  OPrime.debug(JSON.stringify(window.userHistory));
  if(typeof callback == "function"){
    callback();
  }
};

// Android WebView is not calling the onbeforeunload to save the userHistory.
window.onbeforeunload = window.saveUser;