function updateStats() {
    var cpuUsage = document.getElementById("cpu-usage");
    var memoryUsage = document.getElementById("memory-usage");
    var uptime = document.getElementById("uptime");

    // Update CPU usage
    fetch("/api/cpu/" + containerId)
        .then(response => response.text())
        .then(data => {
            cpuUsage.innerHTML = data + "%";
        });

    // Update memory usage
    fetch("/api/memory/" + containerId)
        .then(response => response.text())
        .then(data => {
            memoryUsage.innerHTML = data + " MB";
        });

    // Update uptime
    fetch("/api/uptime/" + containerId)
        .then(response => response.text())
        .then(data => {
            let startTime = new Date(data);
            let currentTime = new Date();
            let timeDiff = currentTime - startTime;
            let hours = Math.floor(timeDiff / (1000 * 60 * 60));
            let minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            let seconds = Math.floor((timeDiff / 1000) % 60);
            uptime.innerHTML = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        });
}

// Update stats every 1 seconds
setInterval(updateStats, 1000);

// Initial update
updateStats();