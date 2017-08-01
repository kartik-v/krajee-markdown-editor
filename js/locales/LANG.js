/*!
 * LANG translations for krajee-markdown-editor. 
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 *
 * @see http://plugins.krajee.com/markdown-editor
 *
 * Author: Kartik Visweswaran
 * Copyright: 2014 - 2017, Kartik Visweswaran, Krajee.com
 */
$.fn.markdownEditorLocales["LANG"] = {
    noDataMsg: "No valid source data found!",
    exportFileName: "export",
    buttonTitles: {
        undo: "Undo",
        redo: "Redo",
        bold: "Bold",
        italic: "Italic",
        ins: "Inserted Text",
        del: "Strike Through",
        sup: "Superscript",
        sub: "Subscript",
        mark: "Highlighted Text",
        paragraph: "Paragraph",
        newline: "Append line break",
        heading: "Heading",
        link: "Hyperlink",
        image: "Image Link",
        indent: "Indent Text",
        outdent: "Outdent Text",
        ul: "Unordered List",
        ol: "Ordered List",
        dl: "Definition List",
        footnote: "Footnote",
        blockquote: "Block Quote",
        code: "Inline Code",
        codeblock: "Code Block",
        hr: "Horizontal Line",
        emoji: "Emojis / Emoticons",
        fullscreen: "Toggle full screen mode",
        hint: "Usage Hints",
        modeEditor: "Editor mode",
        modePreview: "Preview mode",
        modeSplit: "Split mode",
        "export": "Export content",
        exportHtml: "Export as HTML",
        exportText: "Export as Text"
    },
    buttonLabels: {
        "export": "Export",
        exportHtml: "HTML",
        exportText: "Text"
    },
    buttonPrompts: {
        link: {
            title: "Insert Hyperlink",
            placeholder: "http://"
        },
        image: {
            title: "Insert Image Link",
            placeholder: "http://"
        },
        ol: {
            title: "Ordered List Starting Number",
            placeholder: "Integer starting from 1"
        },
        codeblock: {
            title: "Enter code language",
            placeholder: "e.g. html, php, js"
        }
    },
    buttonActions: {
        bold: {default: "**(bold text here)**"},
        italic: {default: "_(italic text here)_"},
        ins: {default: "_(inserted text here)_"},
        del: {default: "_(strikethrough text here)_"},
        mark: {default: "_(marked text here)_"},
        sup: {default: "_(superscript text here)_"},
        sub: {default: "_(subscript text here)_"},
        paragraph: {default: "\n(paragraph text here)\n"},
        heading1: {default: "# (heading 1 text here)"},
        heading2: {default: "## (heading 2 text here)"},
        heading3: {default: "### (heading 3 text here)"},
        heading4: {default: "#### (heading 4 text here)"},
        heading5: {default: "##### (heading 5 text here)"},
        heading6: {default: "###### (heading 6 text here)"}
    },
    hintText: "<ul><li><p>You may follow the <a href='http://spec.commonmark.org/' target='_blank'>" +
        "CommonMark spec</a> and " + "<a href='https://github.com/markdown-it/markdown-it'>markdown-it</a> " +
        "syntax for writing your markdown text.</p></li>" +
        "<li><p>In order to use the formatting buttons on the toolbar, you typically need to highlight a text " +
        "within the editor on which the formatting is to be applied. You can also undo the format action on the " +
        "highlighted text by clicking the button again (for most buttons).</p></li>" +
        "<li><p>Keyboard access shortcuts for buttons:</p>" +
        "{accessKeys}" +
        "</li>" +
        "</ul>",
    dialogCancelText: "Cancel",
    dialogOkText: "Ok",
    previewErrorTitle: "Preview Error",
    previewModeTitle: "Preview Mode",
    noPreviewUrlMsg: "Markdown preview processor unavailable. Please contact the system administrator.",
    emptyPreviewMsg: "No formatted content available for preview.",
    errorPreviewMsg: "Error generating preview. Please try again later.",
    previewProgressMsg: "Generating preview ...",
    noExportUrlMsg: "Export processor unavailable. Please contact the system administrator.",
    exportProgressMsg: "Generating export file for download ...",
    exportErrorMsg: "Error generating export. Please try again later.",
    emojiSearchHint: "Search emojis ...",
    loadingMsg: "Loading ..."
};