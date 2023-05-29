const loadConfigButton = document.querySelector('#load-config-button');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const closeModalButton = document.querySelector('.close-modal-button');
const form = document.querySelector('form');

loadConfigButton.addEventListener('click', () => {
    // Create a file input element and trigger a click event on it
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => {
        const reader = new FileReader();
        reader.onload = event => {
            const config = JSON.parse(event.target.result);
            // Populate the form with the config data
            document.querySelector('#image_name').value = config.image_name;
            document.querySelector('#container_name').value = config.container_name;
            document.querySelector('#game_port').value = config.game_port;
            document.querySelector('#game_type').value = config.game_type;
            // Populate the environment variables
            const envVarsContainer = document.querySelector('#env-vars');
            while (envVarsContainer.firstChild) {
                envVarsContainer.removeChild(envVarsContainer.firstChild);
            }
            config.env_vars.forEach(envVar => {
                const envVarInputContainer = document.createElement('div');
                envVarInputContainer.className = 'env-var-input-container mb-2';
                const envVarNameInput = document.createElement('input');
                envVarNameInput.className = 'block w-1/2 p-2 rounded-l bg-gray-700 text-white mr-2';
                envVarNameInput.type = 'text';
                envVarNameInput.name = 'env_var_key[]';
                envVarNameInput.placeholder = 'Enter variable name';
                envVarNameInput.value = envVar.name;
                const envVarValueInput = document.createElement('input');
                envVarValueInput.className = 'block w-1/2 p-2 rounded-r bg-gray-700 text-white';
                envVarValueInput.type = 'text';
                envVarValueInput.name = 'env_var_value[]';
                envVarValueInput.placeholder = 'Enter variable value';
                envVarValueInput.value = envVar.value;
                const removeEnvVarButton = document.createElement('span');
                removeEnvVarButton.className = 'remove-env-var-button ml-2 text-red-500 cursor-pointer';
                removeEnvVarButton.innerHTML = '&times;';
                removeEnvVarButton.addEventListener('click', () => {
                    envVarInputContainer.remove();
                });
                envVarInputContainer.appendChild(envVarNameInput);
                envVarInputContainer.appendChild(envVarValueInput);
                envVarInputContainer.appendChild(removeEnvVarButton);
                envVarsContainer.appendChild(envVarInputContainer);
            });
            // Show the modal dialog
            modal.style.display = 'block';
        };
        reader.readAsText(fileInput.files[0]);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
});

closeModalButton.addEventListener('click', () => {
    // Hide the modal dialog
    modal.style.display = 'none';
});

window.addEventListener('click', event => {
    if (event.target == modal) {
        // Hide the modal dialog if the user clicks outside of it
        modal.style.display = 'none';
    }
});

form.addEventListener('submit', event => {
    // Hide the modal dialog when the form is submitted
    modal.style.display = 'none';
});