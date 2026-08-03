# Exemple d'application du portail de développement pour le type de subvention ROPC (Resource Owner Password Credentials).

Cet exemple montre comment utiliser la bibliothèque openid-client avec Node.js pour :
- Authentifier un utilisateur enregistré via IBM Security Verify
- Effectuer avec succès une requête API vers le point de terminaison `userinfo` pour renvoyer les détails de l'utilisateur authentifié.

## Exécution de l'exemple d'application :
1. Créez un fichier `.env` à l'aide de l'extrait généré par le portail Developer. Vous pouvez vous référer au fichier `.env.example` pour connaître les variables d'environnement nécessaires à l'exécution de cet exemple d'application.
2. Dans l'interface de gestion, entrez `npm install`
3. Après avoir installé node_modules avec succès, démarrez l'application d'exemple à partir de l'interface de gestion en exécutant la commande suivante `npm run start`
4. Lorsque vous y êtes invité, entrez un nom d'utilisateur et un mot de passe valides qui existent dans votre locataire IBM Security Verify.
5. Si l'authentification est réussie, vous verrez des informations sur l'utilisateur authentifié. Ces informations sont récupérées en appelant le point de terminaison UserInfo l'OIDC.


![capture d'écran](screenshot.png)

## Traitement des incidents
- L'ITC affiche `npm ERR! code E401` alors que l'on essaie d'exécuter `npm install`. Supprimez le fichier package-lock.json et relancez `npm install`.


## Licence

La licence MIT (MIT)

Copyright (c) 2023 - IBM Corp.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

<!-- v2.3.7 : caits-prod-app-gp_webui_20241231T140332-17_en_fr -->