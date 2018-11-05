/*!
 * English Translations for krajee-markdown-editor
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 *
 * @see http://plugins.krajee.com/markdown-editor
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
$.fn.markdownEditorLocales['sk-SK'] = $.fn.markdownEditorLocales.sk = {
    ajaxParserErrorMsg: 'Chyba pri parsovaní markdown textu. Skúste neskôr prosím.',
    ajaxParserProgressMsg: 'Parsovanie markdown textu...',
    noDataMsg: 'Neboli nájdené platné zdrojové údaje!',
    exportFileName: 'export',
    buttonTitles: {
        undo: 'Späť',
        redo: 'Naspäť',
        bold: 'Tučné',
        italic: 'Kurzíva',
        ins: 'Podčiarknuté / Vložený text',
        del: 'Prečiarknutie',
        sup: 'Exponent',
        sub: 'Index',
        mark: 'Zvýraznený text',
        paragraph: 'Paragraf',
        newline: 'Pridať zalomenie riadku',
        heading: 'Nadpis',
        link: 'Odkaz',
        image: 'Odkaz na obrázok',
        indent: 'Odsadenie textu',
        outdent: 'Prisadenie textu',
        ul: 'Nezoradený zoznam',
        ol: 'Zoradený zoznam',
        dl: 'Zoznam definícií',
        footnote: 'Poznámka',
        blockquote: 'Citát',
        code: 'Inline kód',
        codeblock: 'Blok kódu',
        hr: 'Horizontálna čiara',
        emoji: 'Emoji / Emotikony',
        fullscreen: 'Prepnúť režim celej obrazovky',
        hint: 'Tipy na použitie',
        modeEditor: 'Režim editora',
        modePreview: 'Režim ukážky',
        modeSplit: 'Režim rozdelenia',
        export: 'Exportovať obsah',
        exportHtml: 'Exportovať ako HTML',
        exportText: 'Exportovať ako text'
    },
    buttonLabels: {
        export: 'Export',
        exportHtml: 'HTML',
        exportText: 'Text'
    },
    buttonPrompts: {
        link: {
            header: 'Vložiť hypertextový odkaz',
            hintInput: 'Zadajte adresu hypertextového odkazu...',
            hintTitle: 'Zadajte text odkazu...'
        },
        image: {
            header: 'Vložiť prepojenie obrázkov',
            hintInput: 'Zadajte adresu odkazu obrázka...',
            hintTitle: 'Zadajte alternatívny text pre obrázok...'
        },
        ol: {
            header: 'Začiatočné číslo zoradeného zoznamu',
            hintInput: 'Celé číslo začínajúce od 1'
        },
        codeblock: {
            header: 'Zadajte jazyk kódu',
            hintInput: 'napr. html, php, js'
        }
    },
    buttonActions: {
        bold: {markup: '**(tučný text tu)**'},
        italic: {markup: '_(kurzívou text tu)_'},
        ins: {markup: '_(podčiarknutý text tu)_'},
        del: {markup: '_(prečiarknutý text tu)_'},
        mark: {markup: '_(označený text tu)_'},
        sup: {markup: '_(exponent textu tu)_'},
        sub: {markup: '_(index textu tu)_'},
        paragraph: {markup: '\n(paragarf)\n'},
        heading1: {markup: '# (nadpis 1 tu)'},
        heading2: {markup: '## (nadpis 2 tu)'},
        heading3: {markup: '### (nadpis 3 tu)'},
        heading4: {markup: '#### (nadpis 4 tu)'},
        heading5: {markup: '##### (nadpis 5 tu)'},
        heading6: {markup: '###### (nadpis 6 tu)'}
    },
    templates: {
        exportHeader: '> - - -\n' +
        '> Markdown Export\n' +
        '> ==============\n' +
        '> *Generated {TODAY} by {CREDITS}*\n' +
        '> - - -\n\n',
        hint: '<ul>\n' +
        '  <li><p>Môžete sledovať špecifikáciu {LINK_CM} (generovanú prostredníctvom {LINK_MI} pluginu) na písanie markdown textu.</p></li>\n' +
        '  <li><p>Ak chcete použiť tlačidlá na formátovanie na paneli s nástrojmi, vo všeobecnosti musíte zdôrazniť text ' +
        '  v editore, na ktorom sa má formátovanie aplikovať. Môžete tiež zrušiť akciu formátu na ' +
        '  zvýraznenom texte kliknutím na tlačidlo znova (pre väčšinu tlačidiel).</p></li>\n' +
        '  <li><p>Klávesové skratky pre tlačidlá:</p>' +
        '    {ACCESS_KEYS}' +
        '  </li>\n' +
        '</ul>'
    },
    dialogCancelText: 'Zrušiť',
    dialogSubmitText: 'Odoslať',
    previewErrorTitle: 'Chyba ukážky',
    previewModeTitle: 'Režim ukážky',
    noPreviewUrlMsg: 'Proces zobrazenia náhľadu nie je k dispozícii. Kontaktujte správcu systému.',
    previewProgressMsg: 'Generovanie ukážky...',
    noExportUrlMsg: 'Exportný procesor nie je k dispozícii. Kontaktujte správcu systému.',
    emojiSearchHint: 'Hľadať emoji...',
    loadingMsg: 'Načítava...'
};
