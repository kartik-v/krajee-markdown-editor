/*!
 * French Translations for krajee-markdown-editor
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 * 
 * @see http://plugins.krajee.com/markdown-editor
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
$.fn.markdownEditorLocales.fr = {
    ajaxParserErrorMsg: "EErreur lors de l'analyse du texte markdown. Veuillez réessayer plus tard.",
    ajaxParserProgressMsg: "Analyse du texte de Markdown ...",
    noDataMsg: "aucune donnée de source valides trouvé!",
    exportFileName: "exportation",
    buttonTitles: {
        undo: "défaire",
        redo: "refaire",
        bold: "gras",
        italic: "italique",
        ins: "Souligné / texte inséré",
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
        export: "Exportation de contenu",
        exportHtml: "Exporter en HTML",
        exportText: "Exporter sous forme de texte"
    },
    buttonLabels: {
        export: "Exportation",
        exportHtml: "HTML",
        exportText: "Texte"
    },
    buttonPrompts: {
        link: {
            header: "Insérer un lien hypertexte",
            hintInput: "Entrez l'adresse du lien...",
            hintTitle: "Entrez le texte du lien..."
        },
        image: {
            header: "Insérer un lien d'image",
            hintInput: "Entrez l'adresse du lien de l'image...",
            hintTitle: "Entrez un autre texte pour l'image..."
        },
        ol: {
            header: "Numéro de départ de la liste ordonnée",
            hintInput: "Entier à partir de 1"
        },
        codeblock: {
            header: "Entrez la langue du code",
            hintInput: "par exemple. html, php, js"
        }
    },
    buttonActions: {
        bold: {markup: "**(texte en gras ici)**"},
        italic: {markup: "_(le texte en italique ici)_"},
        ins: {markup: "_(insérer le texte ici)_"},
        del: {markup: "_(texte barré ici)_"},
        mark: {markup: "_(texte marqué ici)_"},
        sup: {markup: "_(texte en exposant ici)_"},
        sub: {markup: "_(texte en indice ici)_"},
        paragraph: {markup: "\n(paragraphe texte ici)\n"},
        heading1: {markup: "# (rubrique 1 texte ici)"},
        heading2: {markup: "## (la rubrique 2 texte ici)"},
        heading3: {markup: "### (la rubrique 3 texte ici)"},
        heading4: {markup: "#### (la rubrique 4 texte ici)"},
        heading5: {markup: "##### (la rubrique 5 texte ici)"},
        heading6: {markup: "###### (la rubrique 6 texte ici)"}
    },
    templates: {
        exportHeader: "> - - -\n" +
        "> Markdown Export\n" +
        "> ==============\n" +
        "> *Généré {TODAY} par {CREDITS}*\n" +
        "> - - -\n\n",
        hint: "<ul>\n" +
        "  <li><p>Vous pouvez suivre la spécification {LINK_CM} (générée via {LINK_MI} plugin) pour écrire votre texte de démarque.</p></li>\n" +
        "  <li><p>Pour utiliser les boutons de formatage de la barre d'outils, vous devez généralement mettre en " +
        "  surbrillance un texte dans l'éditeur sur lequel le formatage doit être appliqué. Vous pouvez également " +
        "  annuler l'action de format sur le texte en surbrillance en cliquant à nouveau sur le bouton " +
        " (pour la plupart des boutons).</p></li>\n" +
        "  <li><p>Raccourcis d'accès au clavier pour les boutons:</p>" +
        "    {ACCESS_KEYS}" +
        "  </li>\n" +
        "</ul>"
    },
    dialogCancelText: "Annuler",
    dialogOkText: "D'accord",
    previewErrorTitle: "Aperçu erreur",
    previewModeTitle: "Mode Aperçu",
    noPreviewUrlMsg: "Processeur aperçu Markdown indisponible. S'il vous plaît contactez l'administrateur du système.",
    previewProgressMsg: "Génération aperçu ...",
    noExportUrlMsg: "Processeur indisponible à l'exportation. S'il vous plaît contactez l'administrateur du système.",
    emojiSearchHint: "Recherche Emojis ...",
    loadingMsg: "Chargement ..."
};