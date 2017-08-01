/*!
 * French Translations for krajee-markdown-editor
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 *
 * @see http://plugins.krajee.com/markdown-editor
 *
 * Author: Kartik Visweswaran
 * Copyright: 2014 - 2017, Kartik Visweswaran, Krajee.com
 */
$.fn.markdownEditorLocales.fr = {
    noDataMsg: "aucune donnée de source valides trouvé!",
    exportFileName: "exportation",
    buttonTitles: {
        undo: "défaire",
        redo: "refaire",
        bold: "gras",
        italic: "italique",
        ins: "texte inséré",
        del: "barré",
        sup: "exposant",
        sub: "Indice",
        mark: "texte en surbrillance",
        paragraph: "Paragraphe",
        newline: "Append saut de ligne",
        heading: "Titre",
        link: "Hyperlink",
        image: "Lien de l'image",
        indent: "texte tiret",
        outdent: "texte outdent",
        ul: "Liste non ordonnée",
        ol: "Liste ordonnée",
        dl: "Liste de définitions",
        footnote: "note de bas de page",
        blockquote: "Bloquer Citer",
        code: "code en ligne",
        codeblock: "Bloc de code",
        hr: "Ligne horizontale",
        emoji: "Emojis / Emoticons",
        fullscreen: "Mode plein écran Basculer",
        hint: "Conseils d'utilisation",
        modeEditor: "Le mode de l'éditeur",
        modePreview: "Mode Aperçu",
        modeSplit: "le mode Split",
        'export': "Exportation de contenu",
        exportHtml: "Exporter en HTML",
        exportText: "Exporter sous forme de texte"
    },
    buttonLabels: {
        'export': "Exportation",
        exportHtml: "HTML",
        exportText: "Texte"
    },
    buttonPrompts: {
        link: {
            title: "Insérer un lien hypertexte",
            placeholder: "http://"
        },
        image: {
            title: "Insérer une image Lien",
            placeholder: "http://"
        },
        ol: {
            title: "Liste ordonnée numéro de départ",
            placeholder: "Integer à partir de 1"
        },
        codeblock: {
            title: "Entrez le code de la langue",
            placeholder: "par exemple. HTML, PHP, JS"
        }
    },
    buttonActions: {
        bold: {default: "**(texte en gras ici)**"},
        italic: {default: "_(le texte en italique ici)_"},
        ins: {default: "_(insérer le texte ici)_"},
        del: {default: "_(texte barré ici)_"},
        mark: {default: "_(texte marqué ici)_"},
        sup: {default: "_(texte en exposant ici)_"},
        sub: {default: "_(texte en indice ici)_"},
        paragraph: {default: "\n(paragraphe texte ici)\n"},
        heading1: {default: "# (rubrique 1 texte ici)"},
        heading2: {default: "## (la rubrique 2 texte ici)"},
        heading3: {default: "### (la rubrique 3 texte ici)"},
        heading4: {default: "#### (la rubrique 4 texte ici)"},
        heading5: {default: "##### (la rubrique 5 texte ici)"},
        heading6: {default: "###### (la rubrique 6 texte ici)"}
    },
    hintText: "<ul><li><p>Vous pouvez suivre le " + "<a href='http://spec.commonmark.org/' target='_blank'> " +
    "CommonMark spec </a> et <a href = 'https://github.com/markdown-it/markdown-it'>markdown-it </a> " +
    "syntaxe pour écrire votre texte de démarque.</p></li>" +
    "<li><p>Pour utiliser les boutons de mise en forme sur la barre d'outils, vous devez généralement de mettre en évidence un texte " +
    "dans l'éditeur sur lequel la mise en forme doit être appliquée. Vous pouvez également annuler l'action de format sur le " +
    "texte en surbrillance en cliquant à nouveau sur le bouton (pour la plupart des boutons).</p></li>" +
    "<li><p>raccourcis d'accès au clavier pour les boutons:</p>" +
    "{accessKeys}" +
    "</li>" +
    "</ul>",
    dialogCancelText: "Annuler",
    dialogOkText: "D'accord",
    previewErrorTitle: "Aperçu erreur",
    previewModeTitle: "Mode Aperçu",
    noPreviewUrlMsg: "Processeur aperçu Markdown indisponible. S'il vous plaît contactez l'administrateur du système.",
    emptyPreviewMsg: "Pas de contenu formaté disponible pour aperçu.",
    errorPreviewMsg: "Erreur générer aperçu. Veuillez réessayer plus tard.",
    previewProgressMsg: "Génération aperçu ...",
    noExportUrlMsg: "Processeur indisponible à l'exportation. S'il vous plaît contactez l'administrateur du système.",
    exportProgressMsg: "Génération fichier d'exportation pour le téléchargement ...",
    exportErrorMsg: "Erreur générer exportation. Veuillez réessayer plus tard.",
    emojiSearchHint: "Recherche Emojis ...",
    loadingMsg: "Chargement ..."
};