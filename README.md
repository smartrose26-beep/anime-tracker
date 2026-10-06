# AnimePulse

AnimePulse utilise maintenant des données réelles via l’API Jikan, qui fournit des informations officielles et des images d’animes (couvertures, notes, genres, saisons, sorties à venir).

## Ce qui a changé

- recherche réelle d’anime via l’API publique Jikan
- vraies images de couverture d’anime
- notes et genres issus de données live
- section des sorties prévues alimentée via les prochaines saisons
- watchlist enregistrée dans le navigateur
- notation personnelle de 1 à 10 par anime

## Démarrage

Ouvrez simplement `index.html` dans votre navigateur.

## API utilisée

- https://api.jikan.moe/v4/

## Fichiers

- `index.html` : structure du site
- `style.css` : design et mise en page
- `script.js` : chargement des données, recherche, favoris et sorties

## Remarque

Cette version est une application front-end sans backend, donc les données sont récupérées en direct depuis Jikan et les préférences sont sauvegardées localement dans le navigateur.

Si tu veux ensuite, je peux encore te faire une version plus avancée avec :
- page détaillée par anime
- filtres par genre / saison
- calendrier complet
- authentification
- backend et base de données
