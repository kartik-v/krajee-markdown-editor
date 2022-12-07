/*!
 * German Translations for krajee-markdown-editor
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 * 
 * @see http://plugins.krajee.com/markdown-editor
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'window', 'document'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(require('jquery'), window, document);
    } else {
        factory(window.jQuery, window, document);
    }
}(function ($, window, document, undefined) {
    $.fn.markdownEditorLocales['de-DE'] = $.fn.markdownEditorLocales.de = {
        ajaxParserErrorMsg: 'Fehler beim Parsen von Markdown-Text. Bitte versuchen Sie es später noch einmal.',
        ajaxParserProgressMsg: 'Parsen von Markdown-Text ...',
        noDataMsg: 'Keine gültigen Quelldaten gefunden!',
        exportFileName: 'export',
        buttonTitles: {
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            bold: 'Fett',
            italic: 'Kursiv',
            ins: 'Unterstreichen / Eingefügter Text',
            del: 'Durchstreichen',
            sup: 'Hochgestellt',
            sub: 'Tiefgestellt',
            mark: 'Hervorgehobener Text',
            paragraph: 'Absatz',
            newline: 'Zeilenumbruch anhängen',
            heading: 'Überschrift',
            link: 'Hyperlink',
            image: 'Bild Link',
            indent: 'Text einrücken',
            outdent: 'Herausragender Text',
            ul: 'Unsortierte Liste',
            ol: 'Geordnete Liste',
            dl: 'Definitionsliste',
            footnote: 'Fußnote',
            blockquote: 'Blockquote',
            code: 'Inline-Code',
            codeblock: 'Code-Block',
            hr: 'Horizontale Linie',
            emoji: 'Emojis / Emoticons',
            fullscreen: 'Vollbildmodus umschalten',
            hint: 'Hinweise zur Verwendung',
            modeEditor: 'Bearbeitungsmodus',
            modePreview: 'Vorschaumodus',
            modeSplit: 'Gesplitteter Modus',
            export: 'Inhalte exportieren',
            exportHtml: 'Als HTML exportieren',
            exportText: 'Als Text exportieren'
        },
        buttonLabels: {
            export: 'Export',
            exportHtml: 'HTML',
            exportText: 'Text'
        },
        buttonPrompts: {
            link: {
                header: 'Hyperlink einfügen',
                hintInput: 'Hyperlink-Adresse eingeben...',
                hintTitle: 'Text für den Link eingeben...'
            },
            image: {
                header: 'Bild-Link einfügen',
                hintInput: 'Bildlink-Adresse eingeben...',
                hintTitle: 'Geben Sie einen alternativen Text für das Bild ein...'
            },
            ol: {
                header: 'Geordnete Liste Startnummer',
                hintInput: 'Ganzzahlig, beginnend mit 1'
            },
            codeblock: {
                header: 'Code-Sprache eingeben',
                hintInput: 'z.B. html, php, js'
            }
        },
        buttonActions: {
            bold: {markup: '**(fettgedruckter Text hier)**'},
            italic: {markup: '_(kursiver Text hier)_'},
            ins: {markup: '_(Text hier eingefügt)_'},
            del: {markup: '_(Durchgestrichener Text hier)_'},
            mark: {markup: '_(markierter Text hier)_'},
            sup: {markup: '_(hochgestellter Text hier)_'},
            sub: {markup: '_(tiefgestellter Text hier)_'},
            paragraph: {markup: '\n(Absatztext hier)\n'},
            heading1: {markup: '# (Überschrift 1 Text hier)'},
            heading2: {markup: '## (Überschrift 2 Text hier)'},
            heading3: {markup: '### (Überschrift 3 Text hier)'},
            heading4: {markup: '#### (Überschrift 4 Text hier)'},
            heading5: {markup: '##### (Überschrift 5 Text hier)'},
            heading6: {markup: '###### (Überschrift 6 Text hier)'}
        },
        templates: {
            exportHeader: '> - - -\n' +
                '> Markdown Export\n' +
                '> ==============\n' +
                '> *Generiert {TODAY} von {CREDITS}*\n' +
                '> - - -\n\n',
            hint: '<ul>\n' +
                '  <li><p>Sie können die {LINK_CM}-Spezifikation (generiert durch das {LINK_MI}-Plugin) für das Schreiben Ihres Markdown-Textes verwenden.</p></li>\n' +
                '  <li><p>Um die Formatierungsschaltflächen in der Symbolleiste verwenden zu können, müssen Sie in der Regel einen Text ' +
                ' im Editor markieren, auf den die Formatierung angewendet werden soll. Sie können auch die Formatierung des ' +
                ' markierten Text rückgängig machen, indem Sie erneut auf die Schaltfläche klicken (bei den meisten Schaltflächen).</p></li>\n' +
                '  <li><p>Tastaturkurzbefehle für Schaltflächen:</p>' +
                '    {ACCESS_KEYS}' +
                '  </li>\n' +
                '</ul>'
        },
        dialogCancelText: 'Abbrechen',
        dialogSubmitText: 'Anwenden',
        previewErrorTitle: 'Fehler in der Vorschau',
        previewModeTitle: 'Vorschaumodus',
        noPreviewUrlMsg: 'Der Markdown-Vorschau-Prozessor ist nicht verfügbar. Bitte wenden Sie sich an den Systemadministrator.',
        previewProgressMsg: 'Vorschau generieren ...',
        noExportUrlMsg: 'Der Exportprozessor ist nicht verfügbar. Bitte wenden Sie sich an den Systemadministrator.',
        emojiSearchHint: 'Suche Emojis ...',
        loadingMsg: 'Laden ...'
    };
}));
