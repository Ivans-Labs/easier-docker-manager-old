document.addEventListener("DOMContentLoaded", function() {
    var configForm = document.getElementById("config-form");
    var configFileSelect = document.getElementById("config-file");
    var configContentTextarea = document.getElementById("config-content");
    var saveBtn = document.getElementById("save-btn");
    var cancelBtn = document.getElementById("cancel-btn");
  
    // Load configuration file content when file is selected
    configFileSelect.addEventListener("change", function() {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/config/" + configFileSelect.value, true);
      xhr.onload = function() {
        configContentTextarea.value = xhr.responseText;
      };
      xhr.send();
    });
  
    // Save configuration file content when Save button is clicked
    saveBtn.addEventListener("click", function() {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/config/" + configFileSelect.value, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function() {
        // TODO: Handle success or error
      };
      xhr.send(JSON.stringify({ content: configContentTextarea.value }));
    });
  
    // Cancel editing and go back to home page when Cancel button is clicked
    cancelBtn.addEventListener("click", function() {
      window.location.href = "/";
    });
  });