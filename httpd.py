#!/usr/bin/env python3
import socket
import random
import http.server
import socketserver
import urllib.parse
from os import urandom
import time

from twitter_db import Execution_requetes


import json
class HttpHandler(http.server.SimpleHTTPRequestHandler):
    """Implementation d'un handler http simple:
        - fournit des fichiers (via SimpleHTTPRequestHandler)
        - parse et execute des commandes passées via des paramètres GET"""

    sessions = {}
    request_cookie = None
    moteur = Execution_requetes()
    def __init__(self, *args, **kwargs):
        self._session_id = None
        super().__init__(*args, **kwargs)
        self.sessions = {}
        self.request_cookie = None

    def end_headers(self):
        self.send_header('Set-Cookie', self.request_cookie)
        self.request_cookie = None
        super().end_headers()


    def do_GET(self):
        """Méthode à surcharger pour répondre à une requête HTTP get"""

        #Parsing the l'URL
        parsed_url = urllib.parse.urlparse(self.path)
        #Extraction des paramètres GET sous la forme d'un dictionnaire python
        #?p1=v1&p2=v2&...&pn=vn devient { 'p1' : ['v1'], …, 'pn':['vn'] }
        #Les paramètres de même noms sont fusionnés:
        #?p=v1&p=v2  devient { 'p': [ 'v1', 'v2' ]
        parameters = urllib.parse.parse_qs(parsed_url.query)
        print ("Resource :")
        print (parsed_url.path)
        print ("Paramètres :")
        print (parameters)
        print(self.client_address)
        request_headers = dict(self.headers.items())

        if(not "Cookie" in request_headers):
            print("new cookie created")
            user_id = str(urandom(4))
            self.sessions[str((self.client_address[0],user_id))] = {}
            self.sessions[str((self.client_address[0],user_id))]["dernier_acces"] = time.time()
            self.request_cookie = "id="+str(user_id)
        else:
            #extraire le cookie et check s'il est bien valide
            self.request_cookie = request_headers["Cookie"]
            print("we already have these cookies:")
            print(self.request_cookie)
            cookie_parts = self.request_cookie.split("=")
            ma_cle = str((self.client_address[0],cookie_parts[1]))
            if(not ma_cle in self.sessions):
                self.sessions[ma_cle] = {}
            self.sessions[ma_cle]["dernier_acces"] = time.time()

        if(parsed_url.path =="/requete"):

            print("traitement requete")

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()

            if(not "results" in self.sessions[ma_cle]):
                self.sessions[ma_cle]["results"] = {}


            job_id = self.moteur.get_job_id()
            #run this as parallel function
            self.moteur.requete(parameters['q'][0],self.sessions[ma_cle]["results"],parameters['t'][0],job_id)

            output = json.dumps({"job_id" : job_id})
            self.wfile.write(output.encode())

        elif((parsed_url.path =="/resultat")):

            print("traitement resultat")

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            resultat = self.sessions[ma_cle]["results"][int(parameters['q'][0])]
            del self.sessions[ma_cle]["results"][int(parameters['q'][0])]
            self.wfile.write(resultat.encode())
        else:
            #L'appel à la méthode parente SimpleHTTPRequestHandler qui va renvoyer le fichier
            #On n'est pas obligé de l'appeler.
            #on le garde pour servir les fichiers html css js si jamais c'est pas un lancement de requete
            super().do_GET()


class ExtensibleHttpServer(socketserver.TCPServer):
    """Serveur HTTP qui étend celui donné par défaut. 2 Améilorations
       - on configure la socket pour pouvoir redémarrer immédiatement le serveur
         si jamais on quitte le programme et on le relance (sinon il
         faut attendre le timeout de la socket)
       - on ajoute une méthode serve_until_interrupted qui rattrape le CTRL-C dans le terminal.
"""

    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)

    def serve_until_interrupted(self):
        try:
            self.serve_forever()
        except KeyboardInterrupt:
            self.shutdown()
        finally:
            self.server_close()


#Exemple d'utilisation :
#Naviguer sur http://localhost:9010 après avoir lancé le serveur et observer la console

#class Session:

if __name__ == "__main__":
    HTTPD = ExtensibleHttpServer(("localhost", 9010), HttpHandler)
    HTTPD.serve_until_interrupted()
