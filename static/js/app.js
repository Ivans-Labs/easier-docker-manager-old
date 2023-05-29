// get container ID from query parameter in URL
const urlParams = new URLSearchParams(window.location.search);
const containerId = urlParams.get('id');

// connect to server using WebSocket
const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/console-output?id=${containerId}`);

// handle WebSocket connection errors
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// handle messages received from server over WebSocket
socket.onmessage = (event) => {
    const message = event.data;
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.innerHTML += message;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
};

// send command to server when send button is clicked
const sendButton = document.getElementById('send-btn');
sendButton.addEventListener('click', () => {
    const commandInput = document.getElementById('console-input');
    const command = commandInput.value;
    if (command) {
        socket.send(command);
        commandInput.value = '';
    }
});

// enable/disable send button based on whether there is input in the command field
const commandInput = document.getElementById('console-input');
commandInput.addEventListener('input', () => {
    sendButton.disabled = !commandInput.value;
});

// connect to container when connect button is clicked
const connectButton = document.getElementById('connect-btn');
connectButton.addEventListener('click', () => {
    // disable connect button and container select
    connectButton.disabled = true;
    const containerSelect = document.getElementById('container-select');
    containerSelect.disabled = true;

    // show console input and send button
    const consoleInput = document.getElementById('console-input');
    consoleInput.disabled = false;
    sendButton.disabled = true;
    consoleInput.focus();

    // send request to server to connect to container
    fetch(`/connect-container?id=${containerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Connected to container ${containerId}`);
            } else {
                console.error(`Failed to connect to container ${containerId}: ${data.error}`);
            }
        })
        .catch(error => {
            console.error(`Failed to connect to container ${containerId}: ${error}`);
        });
});

// populate container select dropdown with containers from server
const containerSelect = document.getElementById('container-select');
fetch('/containers')
    .then(response => response.json())
    .then(containers => {
        containers.forEach(container => {
            const option = document.createElement('option');
            option.value = container.id;
            option.textContent = container.name;
            containerSelect.appendChild(option);
        });

        // preselect the current container in the dropdown
        containerSelect.value = containerId;
    })
    .catch(error => {
        console.error('Failed to load containers:', error);
    });

// when the selected container changes, reload the page with the new container ID
containerSelect.addEventListener('change', () => {
    const selectedId = containerSelect.value;
    window.location.href = `/console?id=${selectedId}`;
});

function restartContainer(containerId) {
    if (confirm('Are you sure you want to restart this container?')) {
        fetch('/restart?id=' + containerId)
            .then(response => {
                if (response.ok) {
                    // Refresh the page after successful restart
                    location.reload();
                } else {
                    // Handle error
                    alert('Failed to restart container');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Failed to restart container');
            });
    }
}

function deleteContainer(containerId) {
    if (confirm('Are you sure you want to delete this container?')) {
        fetch('/delete?id=' + containerId)
            .then(response => {
                if (response.ok) {
                    // Refresh the page after successful deletion
                    location.reload();
                } else {
                    // Handle error
                    alert('Failed to delete container');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Failed to delete container');
            });
    }
}

function backupContainer(containerId) {
    fetch('/backup?id=' + containerId)
        .then(response => {
            if (response.ok) {
                // Handle successful backup
                alert('Backup created successfully');
            } else {
                // Handle error
                alert('Failed to create backup');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Failed to create backup');
        });
}

function openPerformance(containerId) {
    // Open a new window with the performance URL
    window.open('/performance?id=' + containerId, '_blank');
}