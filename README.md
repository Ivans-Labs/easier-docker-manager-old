# Easier Docker Manager Old Version

### Currently Flask + Docker + HTML and frontend will change eventually.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Description

Docker Manager is a web application that allows you to manage your Docker containers using a simple web interface. It provides a dashboard that shows the status of your containers and allows you to start, stop, restart, and delete them with a click of a button. You can also connect to the console of a container and send commands to it in real-time.

## Features

- View the status of running containers
- Start, stop, restart, and delete containers
- Connect to the console of a container and send commands to it in real-time
- Backup and restore containers
- Monitor the performance of containers

## Technologies

- Flask (Python)
- Docker API
- WebSocket API
- HTML/CSS/JavaScript

## Installation

1. Clone the repository:

```
git clone https://github.com/Ivans-Labs/easier-docker-manager.git
```

2. Install the required dependencies:

```
pip3 install -r requirements.txt
```

3. Start the application:

```
python3 app.py
```

4. Open a web browser and go to `http://localhost:5000` to access the application.

## Usage

1. Start the application by running the `app.py` script.

2. Open a web browser and go to `http://localhost:5000` to access the application.

3. Use the dashboard to manage your Docker containers.

## API Reference

- The application uses the Docker API and WebSocket API.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

- Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
