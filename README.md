# Groupomania
## Installation Back-end
1. Vous devez entrer ces commandes dans une session root de Mysql:
```
CREATE DATABASE IF NOT EXISTS groupomania923012234;

CREATE USER 'groupomania923012234Backend'@'localhost' IDENTIFIED BY 'groupomania1234';

GRANT ALL PRIVILEGES ON groupomania923012234.* TO 'groupomania923012234Backend'@'localhost';

GRANT SUPER ON *.* TO 'groupomania923012234Backend'@'localhost';

FLUSH PRIVILEGES;
```

2. Déplacez vous dans le dossier backend

3. Vous aurez besoin d'installer les dépendances en faisant un ```npm install```

4. Vous devrez créer un fichier .env (vous pouvez copier le contenu de .env.example afin que les variables correspondent à l'étape 1)

5. Vous pouvez lancer le serveur avec ```node app```

## Installation Front-end
1. Déplacez vous dans le dossier frontend 

2. Vous aurez besoin d'installer les dépendances en faisant un ```yarn install``` (si vous n'avez pas yarn installé vous devrez l'installer avec ```npm install --global yarn```)

3. Vous pouvez lancer l'application front avec ```yarn serve```

4. Assurez vous que l'adresse et le port de l'application frontend correspondent bien à la variable FRONTEND_ADDRESS afin de pouvoir faire des requêtes au backend

## Configuration avancée du fichier .env
|Variable|Utilité|Exemple|
|----------------|--------------------|------------
|BACKEND_HOST|L'adresse de l'application backend|localhost|
|BACKEND_PORT|Le port de l'application backend|3000|
|FRONTEND_ADDRESS|L'adresse ainsi que le port du frontend autorisé à faire des requêtes (renseigné à CORS)|http://localhost:8080|
|MYSQL_HOST|L'hote Mysql|localhost|
|MYSQL_USER|L'utilisateur Mysql|groupomania923012234Backend|
|MYSQL_PASSWORD|Le mot de passe l'utilisateur Mysql|groupomania1234|
|MYSQL_DATABASE|La base de donnée Mysql utilisée|groupomania923012234|
|JWT_SECRET|La phrase secrète utilisée pour chiffrer les tokens d'authentification|sqdzezzze923123:maz:ZMEz?%23233|
|NODE_ENV|Changer le mode de l'application: "development" ou "production"|development|
