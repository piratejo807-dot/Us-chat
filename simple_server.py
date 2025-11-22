#!/usr/bin/env python3

import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

# Load users data
with open('public/users.json', 'r') as f:
    users = json.load(f)

class SimpleChatHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse URL
        parsed_path = urlparse(self.path)

        if parsed_path.path == '/':
            # Serve main HTML page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            # Create simple HTML page
            html_content = '''
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Group Chat - Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
        }
        .users-list {
            margin-top: 30px;
        }
        .user-item {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        h1 { color: #333; text-align: center; }
        h2 { color: #666; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Application de Chat de Groupe</h1>
        <p style="text-align: center; color: #666;">Système de connexion par numéro de matricule</p>

        <h2>🔐 Test de Connexion</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="matricule">Numéro de Matricule:</label>
                <input type="text" id="matricule" placeholder="Ex: 25BS1046" required>
            </div>
            <button type="submit">Se connecter</button>
        </form>

        <div id="result"></div>

        <div class="users-list">
            <h2>👥 Utilisateurs Disponibles</h2>
            <p style="color: #666;">Utilisez l'un de ces numéros pour tester:</p>
'''

            # Add users to the page
            for user in users[:5]:  # Show first 5 users
                html_content += f'''
            <div class="user-item">
                <strong>{user['displayName']}</strong><br>
                Numéro: {user['number']}<br>
                <small>ID: {user['id']}</small>
            </div>
'''

            html_content += '''
            <p style="margin-top: 20px; text-align: center; color: #666;">
                ... et 15 autres utilisateurs disponibles
            </p>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const matricule = document.getElementById('matricule').value.trim();

            if (!matricule) {
                alert('Veuillez entrer un numéro de matricule');
                return;
            }

            // Check if matricule exists in users list
            const users = ''' + json.dumps([{ 'id': user['id'], 'number': user['number'], 'displayName': user['displayName'] } for user in users]) + ''';
            const user = users.find(u => u.number === matricule);

            if (user) {
                document.getElementById('result').innerHTML = `
                    <div class="result">
                        <h3>✅ Connexion réussie!</h3>
                        <p><strong>Bienvenue, ${user.displayName}!</strong></p>
                        <p>Matricule: ${user.number}</p>
                        <p>ID: ${user.id}</p>
                        <br>
                        <p style="color: #666;">Le chat en temps réel et les paramètres sont implémentés dans l'application Next.js complète.</p>
                        <button onclick="window.location.reload()">Tester un autre utilisateur</button>
                    </div>
                `;
            } else {
                document.getElementById('result').innerHTML = `
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">
                        <h3>❌ Numéro non trouvé</h3>
                        <p>Vérifiez que vous utilisez un numéro de matricule valide.</p>
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
            '''

            self.wfile.write(html_content.encode())

        elif parsed_path.path == '/users.json':
            # Serve users data
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(users).encode())

        else:
            super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    with socketserver.TCPServer(("", PORT), SimpleChatHandler) as httpd:
        print(f"🌐 Serveur démarré sur http://localhost:{PORT}")
        print(f"🌐 Ou http://0.0.0.0:{PORT}")
        print("✅ Testez l'application maintenant!")
        httpd.serve_forever()