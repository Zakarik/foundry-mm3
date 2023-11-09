## Version 1.27.0
### Améliorations
- Ajout de plusieurs autres méthodes de calcul pour les distances en diagonal (Manhattan et Pathfinder/3.5), à sélectionner dans les options.

## Version 1.26.10
### Bugfix
- Correction d'un bug empêchant d'accéder au menu de contexte du tchat des anciens jets dans certains cas.

## Version 1.26.9
### Bugfix
- Correction d'un bug avec les macros de personnage, qui ne pouvait ne pas fonctionner dans le cas d'une expertise, d'un combat au contact ou à distance.
- Correction d'un bug qui empêchait la création de macro pour les véhicules.

## Version 1.26.8
### Bugfix
- Correction d'un bug avec les attaques de type "affliction", ne prenant pas en compte la défense correctement.

## Version 1.26.7
### Bugfix
- Correction d'un oubli de changement de version... !

## Version 1.26.6
### Bugfix
- Correction de la boîte de texte "Pouvoir principal" manquante pour les pouvoirs alternatifs.
- Correction de deux bugs d'importation depuis Hero Lab, pouvant empêcher l'importation d'arriver à son terme dans de rares cas.
- Changement de la valeur de distance de base de la grille de 5m à 1.5m.

## Version 1.26.5
### Bugfix
- Correction d'un bug avec les macros de jets qui prenaient l'utilisateur au lieu de l'acteur pour les messages.

## Version 1.26.4
### Bugfix
- Correction d'un bug empêchant l'édition des attaques sur les véhicules et les QG.

## Version 1.26.3
### Bugfix
- Correction d'un bug dans les jets de résistance, dans le cas d'une attaque sans jet d'attaque.

## Version 1.26.2
### Bugfix
- Correction d'un bug de mise en page sur le pied de page des fiches d'acteurs (dans les astuces). (Oui, encore)
- Correction d'un bug de mise en page dans les talents et des modificateurs.

## Version 1.26.1
### Bugfix
- Correction d'un bug de mise en page sur le pied de page des fiches d'acteurs (dans les astuces).
- Correction de la traduction anglaise.
- Correction d'un problème avec GM Notes.

## Version 1.26.0
### Améliorations
- Ajout de la possibilité de détailler les effets principaux à part, dans les pouvoirs.
Sera affiché en dessous du nom du pouvoir dans la liste.
- Ajout de deux boutons replier tout / déplier tout.
- Ajout d'une séparation dans les pouvoirs, pour mieux distinguer les éventails de pouvoirs.
- Ajout de la possibilité de sélectionner plusieurs cibles lors d'un jet d'attaque. Un jet sera fait pour chacune des cibles.
- Ajout d'une fenêtre de paramétrage des attaques, permettant de définir si celles-ci sont liées à une compétence, à un pouvoir, un éventuel modificateur d'attaque ou d'effet, ou tout autre paramètre de l'attaque, de manière beaucoup plus simple que la précédente façon de faire.
- Ajout de la possibilité de paramétrer les attaques avec trois types différents "Dégâts", pour toutes les attaques provoquant des dégâts, "Affliction", pour toutes les attaques provoquant des afflictions, et "Autre" pour tous le reste. Les dégâts et les afflictions seront automatiquement appliqués selon le résultat de la cible.
- Amélioration de l'aspect visuel de certains boutons, pour que ce soit davantage adapté aux daltoniens.
- Ajout d'astuces en bas des fiches.
- Ajout d'une fenêtre permettant de rentrer un modificateur pour les jets (en maintenant alt appuyé lors du clic sur un bouton).
- Modification des imports depuis Hero Lab pour prendre en compte les modifications sur les attaques.
**Attention :** Pensez toujours à vérifier les attaques, toutes les données peuvent ne pas s'être mise en place, car tout n'est pas récupérable, et certaines choses peuvent mal avoir été lues.
- Modification du HUD des tokens (Pas Token Action HUD, mais bien le HUD des tokens de Foundry) pour transformer la barre paramétrée sur "blessure" en type "number", ce qui permet de modifier la valeur avec les flèches haut et bas du clavier directement.
**Attention :** Il est toujours nécessaire de valider avec la touche enter.
- Ajout d'une icône par défaut aux capacités n'en disposant pas (caractéristiques, compétences, ...) lors du drag & drop en barre de macro.
- Ajout d'un indicateur pour savoir la cible d'une attaque lors d'un jet.

### Bugfix
- Correction d'un bug d'affichage dans les attaques.
- Correction d'un bug empêchant le drag & drop des items depuis le menu latéral sur les QG.
- Retrait des vitesses de course et de natation des véhicules qui ne servent à rien.
- Correction d'un bug n'affichant pas les icônes des macros lors du drag & drop dans la barre de macro.

## Version 1.25.7
### Bugfix
- Correction d'un bug de calcul des vitesse.

## Version 1.25.6
### Bugfix
- Correction d'un bug rare d'importation d'Hero Lab.

## Version 1.25.5
### Bugfix
- Correction d'un bug de duplication des pouvoirs suite à la mise à jour 1.25.3.

## Version 1.25.4
### Bugfix
- Correction d'un bug pouvant créer des compétences "fantômes".
Si des compétences comme ça sont créées, il est possible de les supprimer à la main, comme des compétences ajoutées, pour éviter de tout bloquer.

## Version 1.25.3
### Bugfix
- Correction d'un bug pouvant causer le plantage d'un personnage.

## Version 1.25.2
### Bugfix
- Ajout du status "Handicapé", qui avait été oublié.
- Ajout du status "Ralenti" lorsque "Fatigué" est appliqué, qui avait été oublié.

## Version 1.25.1
### Bugfix
- Correction d'un bug empêchant le drag & drop dans certains cas.
- Correction de certaines traductions.

## Version 1.25.0
### Améliorations
- Ajout de titres pour les différentes sections de la fiche, pour plus de clarté.
- Ajout automatique des états liés à un état combiné, lorsque ledit état est ajouté à un token.

### Bugfix
- Correction de traductions absentes.
- Amélioration de certaines traductions.

## Version 1.24.0
### Améliorations
- Remplacement du status de "mort" dans le combat tracker par le status "neutralisé", étant plus en phase avec MnM.

## Version 1.23.0
### Améliorations
- Ajout de la possibilité de mettre en modificateur pour le jet de robustesse fait en réponse à une attaque (via le bouton apparaissant dans le tchat) en maintenant la touche shift enfoncée lors du clique.
- Ajout du choix du système de mesure dans les options du système, afin de pouvoir sélectionner entre impérial et métrique. Il est également actif pour les importations depuis HeroLab dorénavant. Par défaut, c'est sur métrique.

### Bugfix
- Correction de traductions absentes.
- Correction de soucis de glisser-déposer pour réorganiser certains éléments, lors qu'il y a des champs de texte à l'intérieur de ceux-ci. Pour régler le problème, j'ai déporté le fait de pouvoir glisser-déposer sur une double flèche à chaque fois que c'était nécessaire.
- Correction de certains cas où les limites des stratégies n'étaient pas correctement prises en compte.

## Version 1.22.0
### Améliorations
- Améliorations des images d'en-tête.
- Ajout d'un encart permettant de gérer la vitesse des personnages/véhicules/QG, avec calcul automatique de la vitesse de déplacement par round et en km/h (désactivable dans les options pour mettre des valeurs personnalisées), et avec intégration de Drag Ruler (qui prend la valeur par round).
- Ajout des limitations des stratégies, afin de ne pas dépasser lesdites limites dans le feu de l'action. Il est possible de modifier les limites dans les options des fiches, mais elles ne sont accessibles qu'aux joueurs de confiance et au MJ.
- Ajout d'un bouton pour remettre à zéro les stratégies en un clique.
- Ajout d'un encart demandant un modificateur pour les tests d'effets. Cet encart apparait lors de l'envoi du pouvoir dans le tchat, à condition que la touche "shift" soit maintenue lors du clique.
- Ajout du type de pouvoir dans la liste sur les fiches, à gauche du coût.
- Amélioration des différences visuels entre les jets publiques, privés et aveugles, en modifiant la couleur desdits jets.
- Ajout d'une fenêtre de confirmation de suppression lors des... suppressions sur les fiches.
- Ajout de la possibilité de réorganiser les différentes listes par glisser-déposer (attaques, avantages, pouvoirs, etc.)

### Bugfix
- Corrections d'un bug qui envoyait le pouvoir principal dans le tchat lors d'un jet, plutôt que le pouvoir secondaire (dans le cadre d'un pouvoir lié à un autre)
- Correction d'un bug pouvant ne pas prendre en compte le glisser-déposer des modificateurs de pouvoir sur les pouvoirs.

## Version 1.21.2
### Bugfix
- Corrections de bug rare sur certaines importations.

## Version 1.21.1
### Bugfix
- Corrections de problèmes des nouvelles bannières disparaissant dans certains cas.

## Version 1.21.0
### Améliorations
- Ajout de nombreuses polices d'écritures à la liste des polices possibles.
- Ajout d'images thématiques en haut de chaque onglet de l'interface utilisateur à droite.
- Ajout de la prise en compte en jeu des états "Vulnérable" et "Sans défense" pour les personnages, c'est à dire que les défenses seront recalculées en tenant compte de ces états.
- Mise à jour de l'icône "Sans défense".

### Bugfix
- Correction de bugs où la couleur choisie l'interface utilisateur pouvait ne pas s'afficher correctement.

## Version 1.20.1
### Bugfix
- Correction d'un bug suite à la dernière mise à jour.

## Version 1.20.0
### Améliorations
- Ajout d'une police d'écriture "Arial Narrow" parmi les options de polices de caractères.
- Ajout de la possibilité, pour le MJ, de forcer une police de caractère sur l'ensemble du système.

## Version 1.19.0
### Améliorations
- Ajout de la possibilité de remettre l'icône de pause par défaut, pour ceux qui le souhaitent.

## Version 1.18.0
### Améliorations
- Ajout de la possibilité d'ajouter des compétences personnalisées.
- Ajout de la possibilité de modifier l'icône de pause dans les options (Chaque joueur peut choisir son icône préféré).
- Ajout de la possibilité de modifier les couleurs du menu dans les options. Indépendant par joueur, encore une fois.

## Version 1.17.1
### Bugfix
- Correction d'un bug lié à la gestion des fichiers .svg, servant pour les icônes, de Firefox.

## Version 1.17.0
### Améliorations
- Prise en charge de l'importation des véhicules et QG (il est uniquement nécessaire d'importer le personnage, les véhicules et QG liés seront importés avec). La seule limite est tous ce qui est "features" qui ne peut être importé, car ne figurant pas dans le fichier.

### Bugfix
- Correction de l'oubli d'ajout du coût des pouvoirs pour les QG.

## Version 1.16.0
### Améliorations
- Ajout des pouvoirs pour les QG.
- Ajout des attaques et des stratégies sur les Véhicules et les QG.
- Changement de l'onglet d'ouverture par défaut pour les véhicules

## Version 1.15.3
### Bugfix
- Correction de la traduction italienne.

## Version 1.15.2
### Bugfix
- Correction d'un bug d'importation.

## Version 1.15.1
### Bugfix
- Correction de la traduction italienne.

## Version 1.15.0
### Améliorations
- Ajout d'une fenêtre pour rentrer un degré de difficulté lors d'un jet de caractéristique / compétence / défense.
- Ajout d'un paramètre en lien avec ça, permettant de définir comment cette fenêtre apparait. Soit par shift + clic gauche, soit par clic gauche simple.
- Ajout de la possibilité d'envoyer les talents et les équipements dans le tchat.
- Ajout de la possibilité de réduire les complications, talents et équipements, de la même façon que les pouvoirs.
- Ajout de la gestion des caractéristiques absentes (y compris lors de l'importation).
- Il m'a été rapporté que dans le cas de texte long (par exemple les motivations), certains pouvaient avoir du mal à lire le texte. J'ai donc ajouté une option d'accessibilité permettant de changer la police d'écriture de ces textes, pour des polices plus standards.
- Lors de l'ouverture d'une fiche de personnage, l'onglet par défaut est "Caractéristiques et Compétences" dorénavant.

## Version 1.14.1
### Bugfix
- Correction d'un bug rare sur l'importeur qui empêchais l'importation.

## Version 1.14.0
### Améliorations
- Ajout du décompte des degrés de succès pour les attaques ciblées.
- Les États seront dorénavant classés par ordre alphabétique.

## Version 1.13.0
### Améliorations
- Ajout de la traduction italienne.

### Bugfix
- Correction de problèmes de traduction en anglais, espagnole et portugais.

## Version 1.12.1
### Bugfix
- Correction d'un bug suite à la mise à jour permettant de définir le DD de défense.

## Version 1.12.0
### Améliorations
- Dorénavant, l'importation depuis Hero Lab convertira automatiquement la taille et le poids au système métrique SI le système n'est pas en anglais, sinon ça reste au système impérial.

## Version 1.11.0
### Améliorations
- Amélioration de la description des pouvoirs importés via Hero Lab.

## Version 1.10.0
### Améliorations
- Ajout d'une possibilité de définir le DD de défense (Esquive ou Parade) contre lequel l'attaque est opposé, quel que soit le type d'attaque.

## Version 1.9.2
### Bugfix
- Correction d'un problème empêchant l'importation dans certains cas.

## Version 1.9.1
### Bugfix
- Diminution de taille de la police d'écriture des boutons de compétences, pour une meilleure compatibilité avec toutes les langues.
- Correction d'un problème rare dans le décompte des points lors de l'import depuis Hero Lab.

## Version 1.9.0
### Améliorations
- Ajout de la traduction espagnole.

### Bugfix
- Corrections de traductions portugaise.

## Version 1.8.7
### Bugfix
- Corrections de traductions anglaise / portugaiss.

## Version 1.8.6
### Bugfix
- Corrections de traductions.

## Version 1.8.5
### Bugfix
- Correction d'un bug sur la gestion de la taille des QG.
- Correction de problèmes de traductions en anglais et portugais.

## Version 1.8.4
### Bugfix
- Nouvelle correction de l'importation des pouvoirs, afin d'ajouter dans la description de ceux-ci les modificateurs de traits.

## Version 1.8.3
### Bugfix
- Nouvelle correction de l'importation des éventails de pouvoirs.

## Version 1.8.2
### Bugfix
- Correction de la gestion l'importation des éventails de pouvoirs.

## Version 1.8.1
### Bugfix
- Correction de problèmes dans le système d'importation.

## Version 1.8
### Améliorations
- Ajout d'un onglet pour gérer l'importation de personnages depuis Hero Lab. Certains détails ne sont pas totalement importés, ou pas totalement optimisé, dus aux limitations du format de Hero Lab. Veuillez vous référer au wiki nouvellement créé sur le Github pour plus d'informations.

## Version 1.7.1
### Bugfix
- Correction d'une faute d'orthographe.

## Version 1.7
### Améliorations
- Amélioration de clarification des attaques en ajoutant un nom à chacune des cases.
- Amélioration de clarification des pouvoirs, en déployant, par défaut, l'ensemble de la colonne "coût".
Maintenant, il est nécessaire de cliquer pour fermer, et non plus cliquer pour ouvrir.

### Bugfix
- Correction d'un bug avec le module "Token Magic FX".

## Version 1.6.1
### Bugfix
- Correction de typo / erreurs dans la traduction portugaise.

## Version 1.6
### Améliorations
- Ajout de la traduction portugaise !

### Bugfix
- Correction des images dont le lien était cassé lors de la création des objets à même la fiche de personnage.

## Version 1.5
### Améliorations
- Ajout de la traduction anglaise !

## Version 1.4.5
### Bugfix
- Correction de typographie.
- Ajout d'un état manquant.

## Version 1.4.4
### Bugfix
- Correction de typographie.
- Ajout du drag & drop des macros de défense qui avait été oublié !

## Version 1.4.3
### Bugfix
- Quelques corrections de mises en page.
- Correction du jet de pouvoir qui n'affichait pas les informations du pouvoir.
- Correction pour faire en sorte que seul les informations rentrées s'affichent, afin de ne pas surcharger le jet.

## Version 1.4.2
### Bugfix
- Quelques corrections de mises en page.
- Correction dans certains calculs des pouvoirs alternatifs / dynamiques.

## Version 1.4.1
### Bugfix
- Correction d'un oubli suite à la dernière mise à jour permettant aussi de sélectionner la défense passive contre laquelle le jet d'attaque est opposé !

## Version 1.4.0
### Améliorations
- Âjout d'un bouton sur la droite des attaques permettant d'entrer dans les paramètres avances.
Ceux-ci permettant de définir qu'une attaque n'a pas de jet d'attaque (par ex. si la portée est "Perception"). Dans ce cas, la fenêtre apparaitra dans le tchat pour indiquer le DD de la défense ou pour afficher le bouton permettant de faire le jet de défense.

Il est aussi possible de définir la base du jet de défense. Pour un jet de défense de Robustesse, le Standard est 15 + rang d'effet et pour les autres, c'est 10 + rang d'effet. Dans de rares cas, cette base peut être modifiée, et c'est ainsi possible grâce à ça. A noter que lorsque vous sélectionnez une autre défense, les modifications faites à cette base sont remise à zéro pour correspondre au standard de la défense sélectionnée.

- Ajout de la possibilité d'ajouter manuellement une attaque.
En plus des paramètres avancés susmentionnés, il sera possible de définir le nom de cette attaque dans les paramètres avancés.
Il sera aussi possible de définir son total d'attaque librement.

- Ajout de la possibilité de drag & drop les différents boutons de jets dans la barre de macro.
- Uniformisation de l'affichage des boutons "Ajouter" sur la fiche.

### Bugfix
- Correction d'un problème avec les textarea de la fiche, qui ajoutait des indentations dans certains cas.

## Version 1.3.0
### Bugfix
- Correction d'un problème de traduction dans les status.

## Version 1.3.0
### Bugfix
- Correction encore de quelques critiques non pris en compte.

### Améliorations
- Ajout du logo de Mutants & Masterminds en haut à gauche, à la place de celui de Foundry.

## Version 1.2.6
### Bugfix
- Correction de critiques qui n'étaient pas pris en compte.

## Version 1.2.5
### Bugfix
- Correction d'un problème de mise en page dans les pouvoirs.
- Correction d'un bug dans le comptage du total des scores d'attaques.

## Version 1.2.4
### Bugfix
- Correction de l'affichage des noms de pouvoirs trop long.
Ils seront à présent coupé pour éviter tout débordement.
Leur taille a également été réduite pour améliorer ça.

## Version 1.2.3
### Bugfix
- Correction d'un bug sur les pouvoirs alternatifs/dynamiques empêchant de choisir un pouvoir principal.

## Version 1.2.2
### Bugfix
- Correction d'un bug sur les pouvoirs alternatifs.

## Version 1.2.1
### Bugfix
- Correction d'un bug sur le glisser - déposé des modificateurs.

## Version 1.2
### Bugfix
- Correction d'un bug sur le décompte des PP des compétences.

### Améliorations
- Ajout des fiches limitées pour les QG, Véhicules et Personnages.

## Version 1.1
### Bugfix
- Correction d'un bug sur l'initiative

### Améliorations
- Amélioration du design des jets d'initiatives.
- Ajout des images personnalisables pour tous les objets et acteurs.
- Redimensionnement de la taille à l'ouverture des fenêtres.
- Modifications des statuts pour qu'ils correspondent à ceux de Mutants & Masterminds.

## Version 1.0
Sortie officielle de la fiche Mutants & Masterminds 3E