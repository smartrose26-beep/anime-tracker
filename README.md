# AnimePulse

AnimePulse utilise des données live via l’API Jikan et affiche aussi les bandes-annonces disponibles pour les titres, en ouvrant le trailer YouTube associé.

## Ce qui a changé

- recherche réelle d’anime via l’API Jikan
- vraies images de couverture d’anime
- notes, genres et dates d’anime provenant de sources live
- boutons "▶ Trailer" pour ouvrir les bandes-annonces YouTube
- watchlist enregistrée dans le navigateur
- notation personnelle de 1 à 10 par anime

## Démarrage

Ouvrez simplement `index.html` dans votre navigateur.

## API utilisée

- https://api.jikan.moe/v4/

## Fichiers

- `index.html` : structure du site
- `style.css` : design et mise en page
- `script.js` : chargement des données, recherche, favoris, sorties et trailers

## Remarque

Cette version est une application front-end sans backend, donc les données sont récupérées en direct depuis Jikan et les préférences sont sauvegardées localement dans le navigateur.

Si tu veux ensuite, je peux encore te faire une version plus avancée avec :
- page détaillée par anime
- filtres par genre / saison
- calendrier complet
- authentification
- backend et base de données
