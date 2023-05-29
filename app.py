from flask import Flask, render_template, request, redirect, url_for, send_file, jsonify, Response
import docker
import tarfile
import io
from flask_socketio import SocketIO, emit
import threading
import math

app = Flask(__name__)
client = docker.from_env()
socketio = SocketIO(app)

# Add round function to Jinja2 environment
app.jinja_env.globals.update(round=round)

@app.route('/')
def index():
    try:
        containers = client.containers.list()
        return render_template('index.html', containers=containers)
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)

@app.route('/create', methods=['POST'])
def create():
    try:
        image_name = request.form['image_name']
        container_name = request.form['container_name']
        game_port = request.form['game_port']
        game_type = request.form['game_type']
        if not image_name or not container_name or not game_port or not game_type:
            return render_template('error.html', error='Missing parameter(s) in request', status_code=400)

        if '/' in image_name:
            client.images.pull(image_name)
        else:
            client.images.build(path='.', tag=image_name)

        container = client.containers.run(
            image=image_name,
            name=container_name,
            ports={f'{game_port}/tcp': game_port},
            volumes={
                '/server': {'bind': '/server', 'mode': 'rw'}
            },
            detach=True
        )
        return redirect(url_for('index'))
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)

@app.route('/restart')
def restart():
    try:
        container_id = request.args.get('id')
        container = client.containers.get(container_id)
        container.restart()
        return redirect(url_for('index'))
    except docker.errors.NotFound as e:
        return render_template('error.html', error=f'Container not found: {container_id}', status_code=404)
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)

@app.route('/delete')
def delete():
    try:
        container_id = request.args.get('id')
        container = client.containers.get(container_id)
        container.stop()
        container.remove()
        return redirect(url_for('index'))
    except docker.errors.NotFound as e:
        return render_template('error.html', error=f'Container not found: {container_id}', status_code=404)
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)

@app.route('/backup')
def backup():
    try:
        container_id = request.args.get('id')
        container = client.containers.get(container_id)
        backup_file = io.BytesIO()
        with tarfile.open(fileobj=backup_file, mode='w') as tar:
            tar.add(container.logs(), arcname='logs.txt')
            tar.add('/path/to/config/file', arcname='config.ini')
        backup_file.seek(0)
        return send_file(backup_file, as_attachment=True, attachment_filename='backup.tar')
    except docker.errors.NotFound as e:
        return render_template('error.html', error=f'Container not found: {container_id}', status_code=404)
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)
    
@app.route('/performance')
def performance():
    try:
        containers = client.containers.list()
        return render_template('performance.html', containers=containers)
    except docker.errors.APIError as e:
        return render_template('error.html', error=str(e), status_code=500)
    
@app.route('/console')
def console():
    container_id = request.args.get('id')
    container = client.containers.get(container_id)
    return render_template('console.html', container=container)

@app.route('/api/uptime/<container_id>')
def get_container_uptime(container_id):
    try:
        container = client.containers.get(container_id)
        uptime = container.attrs['State']['StartedAt']
        return jsonify({'uptime': uptime})
    except docker.errors.NotFound as e:
        return jsonify({'error': str(e)}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def connect():
    print('Client connected')

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')

@socketio.on('console_input')
def console_input(data):
    container_id = data['container_id']
    command = data['command']
    container = client.containers.get(container_id)
    exec_id = container.exec_create(cmd=command, tty=True)
    output = container.exec_start(exec_id, tty=True)
    emit('console_output', {'output': output.decode('utf-8')})

@app.route('/api/containers')
def get_containers():
    try:
        containers = client.containers.list()
        container_data = []
        for container in containers:
            container_data.append({
                'id': container.id,
                'name': container.name,
                'status': container.status
            })
        return jsonify(container_data)
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/containers/<container_id>')
def get_container(container_id):
    try:
        container = client.containers.get(container_id)
        container_data = {
            'id': container.id,
            'name': container.name,
            'status': container.status,
            'image': container.image.tags[0] if container.image.tags else None,
            'ports': container.ports,
            'created': container.attrs['Created']
        }
        return jsonify(container_data)
    except docker.errors.NotFound as e:
        return jsonify({'error': str(e)}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/containers/<container_id>/start', methods=['POST'])
def start_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.start()
        return jsonify({'message': f'Container {container_id} started successfully.'})
    except docker.errors.NotFound as e:
        return jsonify({'error': str(e)}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/containers/<container_id>/stop', methods=['POST'])
def stop_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.stop()
        return jsonify({'message': f'Container {container_id} stopped successfully.'})
    except docker.errors.NotFound as e:
        return jsonify({'error': str(e)}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/containers/<container_id>/delete', methods=['POST'])
def delete_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.remove(force=True)
        return jsonify({'message': f'Container {container_id} deleted successfully.'})
    except docker.errors.NotFound as e:
        return jsonify({'error': str(e)}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route("/api/cpu/<container_id>")
def get_cpu_usage(container_id):
    container = client.containers.get(container_id)
    stats = container.stats(stream=False)
    return str(int(stats["cpu_stats"]["cpu_usage"]["total_usage"] / stats["cpu_stats"]["system_cpu_usage"] * 100))

@app.route("/api/memory/<container_id>")
def get_memory_usage(container_id):
    container = client.containers.get(container_id)
    stats = container.stats(stream=False)
    return str(int(stats["memory_stats"]["usage"] / 1024 / 1024))

@app.errorhandler(400)
def bad_request(e):
    return render_template('error.html', error='Bad request', status_code=400)

@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error='Page not found', status_code=404)

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('error.html', error='Internal server error', status_code=500)

if __name__ == '__main__':
    app.run(debug=True)