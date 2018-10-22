/*!
 * krajee-markdown-editor v1.0.0
 * http://plugins.krajee.com/krajee-markdown-editor
 *
 * Krajee Markdown Editor Main Plugin Library
 *
 * Author: Kartik Visweswaran
 * Copyright: 2014 - 2018, Kartik Visweswaran, Krajee.com
 *
 * Licensed under the BSD 3-Clause
 * https://github.com/kartik-v/krajee-markdown-editor/blob/master/LICENSE.md
 */
(function (factory) {
    "use strict";
    // noinspection JSUnresolvedVariable
    if (typeof define === 'function' && define.amd) {
        // noinspection JSUnresolvedFunction
        define(['jquery'], factory); // AMD. Register as an anonymous module.
    } else {
        // noinspection JSUnresolvedVariable
        if (typeof module === 'object' && module.exports) {
            // noinspection JSUnresolvedVariable, JSUnresolvedFunction
            module.exports = factory(require('jquery')); // Node/CommonJS
        } else {
            factory(window.jQuery); // Browser globals
        }
    }
}(function ($) {
    "use strict";

    $.fn.markdownEditorLocales = {};
    $.fn.markdownEditorThemes = {};

    var $h, $events, $defaults, UndoStack, UndoCommand, MarkdownEditor;

    /**
     * Global Helper Object
     */
    $h = {
        CREDITS: '<a class="text-info" href="http://plugins.krajee.com/markdown-editor">krajee-markdown-editor</a>',
        CREDITS_MD: '[krajee-markdown-editor](http://plugins.krajee.com/markdown-editor)',
        BS4_VER: '4.1.1',
        BS3_VER: '3.3.7',
        DEFAULT_TIMEOUT: 250,
        EMPTY: '',
        NAMESPACE: '.markdownEditor',
        LINK_CM: '<a href="http://spec.commonmark.org/" target="_blank">CommonMark</a>',
        LINK_MI: '<a href="https://markdown-it.github.io/markdown-it/" target="_blank">markdown-it</a>',
        htmlEncode: function (str) {
            return str === undefined ? '' : str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        },
        parseHtml: function (data) {
            return data === undefined ? '' : $h.kvUnescape(encodeURIComponent(data));
        },
        create: function (tag, attr) {
            var $el = $(document.createElement(tag));
            if (!$h.isEmpty(attr)) {
                $el.attr(attr);
            }
            return $el;
        },
        addCss: function ($el, css) {
            if (css) {
                $el.removeClass(css).addClass(css);
            }
        },
        uniqueId: function () {
            return Math.round(new Date().getTime() + (Math.random() * 100));
        },
        isEmpty: function (value, trim) {
            return value === null || value === undefined || value.length === 0 || trim && $.trim(value) === $h.EMPTY;
        },
        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        trimRight: function (str, charlist) {
            if (charlist === undefined) {
                charlist = "\s";
            }
            return str.replace(new RegExp("[" + charlist + "]+$"), "");
        },
        getMarkUp: function (txt, begin, end, skipSpaces) {
            var m = begin.length, n = end.length, str = txt, strLtrim = '', strRtrim = '',
                isTrimmed = false, l, r, t;
            if (skipSpaces) {
                str = txt.replace(/^\s+|\s+$/g, '');
                if (str !== txt) {
                    isTrimmed = true;
                }
            }
            if (m > 0) {
                str = (str.slice(0, m) === begin) ? str.slice(m) : begin + str;
            }
            if (n > 0) {
                str = (str.slice(-n) === end) ? str.slice(0, -n) : str + end;
            }
            if (isTrimmed) {
                strLtrim = txt.replace(/^\s+/, '');
                strRtrim = txt.replace(/\s+$/, '');
                t = txt.length;
                l = t - strLtrim.length;
                r = strRtrim.length;
                if (l > 0) {
                    str = txt.substring(0, l) + str;
                }
                if (r > 0) {
                    str += txt.substring(r, t);
                }
            }
            return str;
        },
        getBlockMarkUp: function (txt, begin, end, skipSpaces) {
            var str = txt, list = [];
            if (str.indexOf('\n') < 0) {
                str = $h.getMarkUp(txt, begin, end, skipSpaces);
            } else {
                list = txt.split('\n');
                $.each(list, function (k, v) {
                    list[k] = $h.getMarkUp($h.trimRight(v), begin, end + '  ', skipSpaces);
                });
                str = list.join('\n');
            }
            return str;
        },
        setWhitespace: function (scrollPre, style) {
            try {
                scrollPre.style.whiteSpace = style;
            } catch (e) {
                // do nothing
            }
        },
        setSelectionRange: function (input, selectionStart, selectionEnd) {
            var scrollPre, style;
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
                input.scrollTop = 0;
                if (selectionStart > 100) {
                    scrollPre = document.createElement('pre');
                    input.parentNode.appendChild(scrollPre);
                    style = window.getComputedStyle(input, '');
                    // noinspection JSValidateTypes
                    scrollPre.style = {
                        visibility: 'hidden',
                        lineHeight: style.lineHeight,
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        padding: 0,
                        border: style.border,
                        outline: style.outline,
                        overflow: 'scroll',
                        letterSpacing: style.letterSpacing
                    };
                    $h.setWhitespace(scrollPre, "-moz-pre-wrap");
                    $h.setWhitespace(scrollPre, "-o-pre-wrap");
                    $h.setWhitespace(scrollPre, "-pre-wrap");
                    $h.setWhitespace(scrollPre, "pre-wrap");
                    scrollPre.textContent = $(input).val().substring(0, selectionStart - 100);
                    input.scrollTop = scrollPre.scrollHeight;
                    scrollPre.parentNode.removeChild(scrollPre);
                }
            } else {
                // noinspection JSUnresolvedVariable
                if (input.createTextRange) {
                    var range = input.createTextRange();
                    range.collapse(true);
                    // noinspection JSUnresolvedFunction
                    range.moveEnd('character', selectionEnd);
                    // noinspection JSUnresolvedFunction
                    range.moveStart('character', selectionStart);
                    range.select();
                }
            }
        },
        kvUnescape: function (s) {
            return s.replace(/%([0-9A-F]{2})/ig, function (x, n) {
                return String.fromCharCode(parseInt(n, 16));
            });
        },
        handler: function (event, callback) {
            if (event && event.isDefaultPrevented()) {
                return;
            }
            callback();
        },
        delay: (function () {
            var timer = 0;
            return function (callback, duration) {
                clearTimeout(timer);
                timer = setTimeout(callback, duration || $h.DEFAULT_TIMEOUT);
            };
        })()
    };

    /**
     * List of events
     */
    $events = {
        click: 'click' + $h.NAMESPACE,
        input: 'input' + $h.NAMESPACE,
        change: 'change' + $h.NAMESPACE,
        focus: 'focus' + $h.NAMESPACE,
        blur: 'blur' + $h.NAMESPACE,
        keyup: 'keyup' + $h.NAMESPACE,
        keydown: 'keydown' + $h.NAMESPACE,
        resize: 'resize' + $h.NAMESPACE,
        reset: 'reset' + $h.NAMESPACE,
        scroll: 'scroll' + $h.NAMESPACE,
        touchstart: 'touchstart' + $h.NAMESPACE,
        mouseover: 'mouseover' + $h.NAMESPACE,
        modalShown: 'shown.bs.modal' + $h.NAMESPACE,
        modalHidden: 'hidden.bs.modal' + $h.NAMESPACE,
        buttonPress: 'buttonPress' + $h.NAMESPACE,
        beforePreview: 'beforePreview' + $h.NAMESPACE,
        successPreview: 'successPreview' + $h.NAMESPACE,
        emptyPreview: 'emptyPreview' + $h.NAMESPACE,
        errorPreview: 'errorPreview' + $h.NAMESPACE
    };

    /**
     * Default configurations for templates, icons, buttons, and export
     */
    $defaults = {
        toolbar: {
            toolbarHeaderL: [
                ['undo', 'redo'],
                ['bold', 'italic', 'ins', 'del', 'sup', 'sub', 'mark'],
                ['paragraph', 'newline', 'heading'],
                ['link', 'image'],
                ['indent', 'outdent', 'ul', 'ol', 'dl'],
                ['footnote', 'blockquote', 'hr'],
                ['code', 'codeblock'],
                ['emoji']
            ],
            toolbarHeaderR: [
                ['fullscreen']
            ],
            toolbarFooterL: [
                ['hint'],
                ['export']
            ],
            toolbarFooterR: [
                ['mode']
            ]
        },
        templates: {
            main: '<div class="md-editor" tabindex="0">\n' +
            '  {HEADER}\n' +
            '  <table class="md-input-preview">\n' +
            '    <tr>\n' +
            '      <td class="md-input-cell">{INPUT}</td>\n' +
            '      <td class="md-preview-cell">{PREVIEW}</td>\n' +
            '    </tr>' +
            '  </table>\n' +
            '  {FOOTER}\n' +
            '  {DIALOG}\n' +
            '</div>',
            header: '<div class="md-header">\n' +
            '  <div class="md-toolbar-header-r pull-right float-right">\n' +
            '    {TOOLBAR_HEADER_R}\n' +
            '  </div>\n' +
            '  <div class="md-toolbar-header-l">\n' +
            '    {TOOLBAR_HEADER_L}\n' +
            '  </div>\n' +
            '  <div class="clearfix">\n' +
            '  </div>\n' +
            '</div>',
            preview: '<div class="md-preview" tabindex="0">\n</div>',
            footer: '<div class="md-footer">\n' +
            '  <div class="md-toolbar-footer-r pull-right float-right">\n' +
            '    {TOOLBAR_FOOTER_R}\n' +
            '  </div>\n' +
            '  <div class="md-toolbar-footer-l">\n' +
            '    {TOOLBAR_FOOTER_L}\n' +
            '  </div>\n' +
            '  <div class="clearfix">\n' +
            '  </div>\n' +
            '</div>',
            dialog: '<div class="md-dialog modal fade" tabindex="-1" role="dialog">\n' +
            '  <div class="modal-dialog">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '         {HEADER}\n' +
            '      </div>\n' +
            '      <div class="modal-body">\n' +
            '        <input class="md-dialog-input form-control">\n' +
            '        <input class="md-dialog-title form-control">\n' +
            '        <div class="md-dialog-content"></div>\n' +
            '      </div>\n' +
            '      <div class="modal-footer">\n' +
            '        <button type="button" class="md-dialog-cancel btn btn-default btn-outline-secondary" data-dismiss="modal">\n' +
            '          {DIALOG_CANCEL_ICON} {DIALOG_CANCEL_TEXT}\n' +
            '        </button>\n' +
            '        <button type="button" class="md-dialog-submit btn btn-primary" data-dismiss="modal">\n' +
            '          {DIALOG_SUBMIT_ICON} {DIALOG_SUBMIT_TEXT}\n' +
            '        </button>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '</div>',
            dialogClose: '<button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '  <span aria-hidden="true">&times;</span>\n' +
            '</button>\n',
            htmlMeta: '<!DOCTYPE html>\n' +
            '  <meta http-equiv="Content-Type" content="text/html,charset=UTF-8"/>\n' +
            '  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>\n',
            exportCssJs: '{EXPORT_PREPEND_CSS_JS}\n' +
            '<style>\n' +
            '  body{margin:20px;padding:20px;border:1px solid #ddd;border-radius:5px;}\n' +
            '  .md-codeblock{padding:5px 8px;background-color:#f5f5f5;border:1px solid #ddd;border-radius:0}\n' +
            '  .md-blockquote{border-left:5px solid #eee;padding: 10px 20px}\n' +
            '  .md-line img{max-width:100%}\n' +
            '</style>',
            exportHeader: '> - - -\n' +
            '> Markdown Export\n' +
            '> ==============\n' +
            '> *Generated {TODAY} by {CREDITS}*\n' +
            '> - - -\n\n',
            hint: '<ul>\n' +
            '  <li><p>You may follow the {LINK_CM} specification (generated via {LINK_MI} plugin) for writing your markdown text.</p></li>\n' +
            '  <li><p>In order to use the formatting buttons on the toolbar, you generally need to highlight a text ' +
            '  within the editor on which the formatting is to be applied. You can also undo the format action on the ' +
            '  highlighted text by clicking the button again (for most buttons).</p></li>\n' +
            '  <li><p>Keyboard access shortcuts for buttons:</p>' +
            '    {ACCESS_KEYS}' +
            '  </li>\n' +
            '</ul>'
        },
        icons: {
            undo: '<span class="fas fa-fw fa-undo"></span>',
            redo: '<span class="fas fa-fw fa-redo"></span>',
            bold: '<span class="fas fa-fw fa-bold"></span>',
            italic: '<span class="fas fa-fw fa-italic"></span>',
            ins: '<span class="fas fa-fw fa-underline"></span>',
            del: '<span class="fas fa-fw fa-strikethrough"></span>',
            sup: '<span class="fas fa-fw fa-superscript"></span>',
            sub: '<span class="fas fa-fw fa-subscript"></span>',
            mark: '<span class="fas fa-fw fa-eraser"></span>',
            paragraph: '<span class="fas fa-fw fa-paragraph"></span>',
            newline: '<span class="fas fa-fw fa-text-height"></span>',
            heading: '<span class="fas fa-fw fa-heading"></span>',
            link: '<span class="fas fa-fw fa-link"></span>',
            image: '<span class="far fa-fw fa-image"></span>',
            indent: '<span class="fas fa-fw fa-indent"></span>',
            outdent: '<span class="fas fa-fw fa-outdent"></span>',
            ul: '<span class="fas fa-fw fa-list-ul"></span>',
            ol: '<span class="fas fa-fw fa-list-ol"></span>',
            dl: '<span class="fas fa-fw fa-th-list"></span>',
            footnote: '<span class="far fa-fw fa-sticky-note"></span>',
            blockquote: '<span class="fas fa-fw fa-quote-right"></span>',
            code: '<span class="fas fa-fw fa-code"></span>',
            codeblock: '<span class="far fa-fw fa-file-code"></span>',
            hr: '<span class="fas fa-fw fa-minus"></span>',
            emoji: '<span class="far fa-fw fa-smile"></span>',
            fullscreen: '<span class="fas fa-fw fa-arrows-alt"></span>',
            minscreen: '<span class="fas fa-fw fa-compress"></span>',
            hint: '<span class="fas fa-fw fa-lightbulb"></span>',
            modePreview: '<span class="fas fa-fw fa-search"></span>',
            modeEditor: '<span class="fas fa-fw fa-edit"></span>',
            modeSplit: '<span class="fas fa-fw fa-arrows-alt-h"></span>',
            export: '<span class="fas fa-fw fa-download"></span>',
            exportHtml: '<span class="fas fa-fw fa-file-alt"></span>',
            exportText: '<span class="fas fa-fw fa-file"></span>',
            alertMsg: '<span class="fas fa-fw fa-exclamation-circle"></span>',
            dialogCancel: '<span class="fas fa-fw fa-times"></span>',
            dialogSubmit: '<span class="fas fa-fw fa-check"></span>'
        },
        buttonAccessKeys: {
            undo: 'z',
            redo: 'y',
            bold: 'b',
            italic: 'i',
            ins: 'u',
            del: 'x',
            sup: '^',
            sub: '~',
            mark: '=',
            paragraph: '#',
            newline: '0',
            heading1: '1',
            heading2: '2',
            heading3: '3',
            heading4: '4',
            heading5: '5',
            heading6: '6',
            link: 'l',
            image: 'p',
            indent: '>',
            outdent: '<',
            ul: '*',
            ol: '9',
            dl: '+',
            footnote: 'n',
            blockquote: 'q',
            code: 'j',
            codeblock: 'k',
            hr: '-',
            emoji: ':',
            fullscreen: '.',
            hint: '?',
            modeEditor: '(',
            modePreview: ')',
            modeSplit: '_',
            exportHtml: 'h',
            exportText: 't'
        },
        buttonTitles: {
            undo: 'Undo',
            redo: 'Redo',
            bold: 'Bold',
            italic: 'Italic',
            ins: 'Underline / Inserted Text',
            del: 'Strike Through',
            sup: 'Superscript',
            sub: 'Subscript',
            mark: 'Highlighted Text',
            paragraph: 'Paragraph',
            newline: 'Append line break',
            heading: 'Heading',
            link: 'Hyperlink',
            image: 'Image Link',
            indent: 'Indent Text',
            outdent: 'Outdent Text',
            ul: 'Unordered List',
            ol: 'Ordered List',
            dl: 'Definition List',
            footnote: 'Footnote',
            blockquote: 'Block Quote',
            code: 'Inline Code',
            codeblock: 'Code Block',
            hr: 'Horizontal Line',
            emoji: 'Emojis / Emoticons',
            fullscreen: 'Toggle full screen mode',
            hint: 'Usage Hints',
            modeEditor: 'Editor mode',
            modePreview: 'Preview mode',
            modeSplit: 'Split mode',
            export: 'Export content',
            exportHtml: 'Export as HTML',
            exportText: 'Export as Text'
        },
        buttonCss: {
            hint: 'btn btn-info'
        },
        dropdownCss: {
            emoji: 'md-emojies-list pull-right float-right'
        },
        buttonLabels: {
            export: 'Export',
            exportHtml: 'HTML',
            exportText: 'Text'
        },
        buttonPrompts: {
            link: {
                header: 'Insert Hyperlink',
                hintInput: 'Enter hyperlink address...',
                hintTitle: 'Enter text for the link...'
            },
            image: {
                header: 'Insert Image Link',
                hintInput: 'Enter image link address...',
                hintTitle: 'Enter alternate text for the image...'
            },
            ol: {
                header: 'Ordered List Starting Number',
                hintInput: 'Integer starting from 1'
            },
            codeblock: {
                header: 'Enter code language',
                hintInput: 'e.g. html, php, js'
            }
        },
        buttonActions: {
            bold: {before: '**', after: '**', 'default': '**(bold text here)**', skipSpaces: true},
            italic: {before: '_', after: '_', 'default': '_(italic text here)_', skipSpaces: true},
            ins: {before: '++', after: '++', 'default': '_(inserted text here)_', skipSpaces: true},
            del: {before: '~~', after: '~~', 'default': '_(strikethrough text here)_', skipSpaces: true},
            mark: {before: '==', after: '==', 'default': '_(marked text here)_', skipSpaces: true},
            sup: {before: '^', after: '^', 'default': '_(superscript text here)_', skipSpaces: true},
            sub: {before: '~', after: '~', 'default': '_(subscript text here)_', skipSpaces: true},
            paragraph: {before: '\n', after: '\n', 'default': '\n(paragraph text here)\n', inline: true},
            newline: {before: $h.EMPTY, after: '  '},
            heading1: {before: '# ', 'default': '# (heading 1 text here)', inline: true},
            heading2: {before: '## ', 'default': '## (heading 2 text here)', inline: true},
            heading3: {before: '### ', 'default': '### (heading 3 text here)', inline: true},
            heading4: {before: '#### ', 'default': '#### (heading 4 text here)', inline: true},
            heading5: {before: '##### ', 'default': '##### (heading 5 text here)', inline: true},
            heading6: {before: '###### ', 'default': '###### (heading 6 text here)', inline: true},
            indent: function (str) {
                var ind = '  ', list;
                if (str.indexOf('\n') < 0) {
                    str = (ind + str);
                } else {
                    list = str.split('\n');
                    $.each(list, function (k, v) {
                        list[k] = ind + v;
                    });
                    str = list.join('\n');
                }
                return str;
            },
            outdent: function (str) {
                var ind = '  ', list;
                if (str.indexOf('\n') < 0 && str.substr(0, 2) === ind) {
                    str = str.slice(2);
                } else {
                    list = str.split('\n');
                    $.each(list, function (k, v) {
                        list[k] = v;
                        if (v.substr(0, 2) === ind) {
                            list[k] = v.slice(2);
                        }
                    });
                    str = list.join('\n');
                }
                return str;
            },
            link: function (str) {
                return function (link, title) {
                    if (!$h.isEmpty(link)) {
                        if (link.substring(0, 6) !== 'ftp://' &&
                            link.substring(0, 7) !== 'http://' &&
                            link.substring(0, 8) !== 'https://') {
                            link = 'http://' + link;
                        }
                        str = '[' + title + '](' + link + ')';
                    }
                    return str;
                };
            },
            image: function (str) {
                return function (link, title) {
                    if (!$h.isEmpty(link)) {
                        if (link.substring(0, 6) !== 'ftp://' &&
                            link.substring(0, 7) !== 'http://' &&
                            link.substring(0, 8) !== 'https://') {
                            link = 'http://' + link;
                        }
                        str = '![' + title + '](' + link + ')';
                    }
                    return str;
                };
            },
            ul: {before: '- ', after: $h.EMPTY},
            ol: function (str) {
                var i, list;
                return function (start) {
                    if (!$h.isEmpty(start)) {
                        if (!$h.isNumber(start)) {
                            start = 1;
                        }
                        if (str.indexOf('\n') < 0) {
                            str = $h.getMarkUp(str, start + '. ', $h.EMPTY);
                        } else {
                            i = parseInt(start);
                            list = str.split('\n');
                            $.each(list, function (k, v) {
                                list[k] = $h.getMarkUp(v, i + '. ', $h.EMPTY);
                                i++;
                            });
                            str = list.join('\n');
                        }
                        return str;
                    }
                    return $h.EMPTY;
                };
            },
            dl: function (str) {
                var i, j, list;
                if (str.indexOf('\n') > 0) {
                    i = 1;
                    list = str.split('\n');
                    $.each(list, function (k, v) {
                        j = (i % 2 === 0) ? ':    ' : $h.EMPTY;
                        list[k] = $h.getMarkUp(v, j, $h.EMPTY);
                        i++;
                    });
                    str = list.join('\n');
                } else {
                    str = str + "\n:    \n";
                }
                return str;
            },
            footnote: function (str) {
                var i, tag, list, title = 'Enter footnote ', notes = $h.EMPTY;
                if (str.indexOf('\n') < 0) {
                    notes = '[^1]: ' + title + '1\n';
                    str = $h.getMarkUp(str, $h.EMPTY, title + '[^1]') + "\n" + notes;
                } else {
                    i = 1;
                    list = str.split('\n');
                    $.each(list, function (k, v) {
                        tag = '[^' + i + ']';
                        list[k] = $h.getMarkUp(v, $h.EMPTY, tag + '  ');
                        notes = notes + tag + ': ' + title + i + '\n';
                        i++;
                    });
                    str = list.join('\n') + "  \n\n" + notes;
                }
                return str;
            },
            blockquote: {before: '> ', after: '  '},
            code: {before: '`', after: '`', inline: true},
            codeblock: function (str) {
                return function (lang) {
                    if ($h.isEmpty(lang, true)) {
                        lang = $h.EMPTY;
                    }
                    return $h.getMarkUp(str, "~~~" + lang + " \n", "\n~~~  \n");
                };
            },
            hr: {before: $h.EMPTY, after: '\n- - -', inline: true}
        },
        exportConfig: {
            exportText: {ext: 'txt', uri: 'data:text/plain;base64,'},
            exportHtml: {ext: 'htm', uri: 'data:text/html;base64,'}
        }
    };
    UndoStack = function () {
        this.init();
    };
    UndoStack.prototype = {
        constructor: UndoStack,
        init: function () {
            var self = this;
            self.commands = [];
            self.stackPosition = -1;
            self.savePosition = -1;
        },
        execute: function (command) {
            var self = this;
            self._clearRedo();
            command.execute();
            self.commands.push(command);
            self.stackPosition++;
            self.changed();
        },
        undo: function () {
            var self = this;
            self.commands[self.stackPosition].undo();
            self.stackPosition--;
            self.changed();
        },
        canUndo: function () {
            var self = this;
            return self.stackPosition >= 0;
        },
        redo: function () {
            var self = this;
            self.stackPosition++;
            self.commands[self.stackPosition].redo();
            self.changed();
        },
        canRedo: function () {
            var self = this;
            return self.stackPosition < self.commands.length - 1;
        },
        save: function () {
            var self = this;
            self.savePosition = self.stackPosition;
            self.changed();
        },
        dirty: function () {
            var self = this;
            return self.stackPosition !== self.savePosition;
        },
        _clearRedo: function () {
            var self = this;
            self.commands = self.commands.slice(0, self.stackPosition + 1);
        },
        changed: function () {
            // do nothing, override
        }
    };
    UndoCommand = function (textarea, oldValue, newValue, oldPos, newPos) {
        var self = this;
        self.textarea = textarea;
        self.oldValue = oldValue;
        self.newValue = newValue;
        self.oldPos = oldPos;
        self.newPos = newPos;
    };
    UndoCommand.prototype = {
        constructor: UndoCommand,
        execute: function () {
        },
        undo: function () {
            var self = this, $el = self.textarea, el = $el[0];
            $el.val(self.oldValue);
            $h.setSelectionRange(el, self.oldPos[0], self.oldPos[1]);
        },
        redo: function () {
            var self = this, $el = self.textarea, el = $el[0];
            $el.val(self.newValue);
            $h.setSelectionRange(el, self.newPos[0], self.newPos[1]);
        }
    };
    MarkdownEditor = function (element, options) {
        var self = this;
        self.$element = $(element);
        self.init(options);
    };
    MarkdownEditor.prototype = {
        constructor: MarkdownEditor,
        init: function (options) {
            var self = this, $el = self.$element;
            $.each(options, function (key, value) {
                self[key] = value;
            });
            self.initToolbar();
            self.isDisabled = $el.attr('disabled') || $el.attr('readonly');
            if (!$el.attr('id')) {
                $el.attr('id', $h.uniqueId());
            }
            self.isBs4 = String(self.bsVersion).substring(0, 1) === '4';
            if (self.exportPrependCssJs === undefined) {
                // noinspection CssUnusedSymbol
                self.exportPrependCssJs = '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/' +
                    (self.isBs4 ? $h.BS4_VER : $h.BS3_VER) + '/css/bootstrap.min.css" rel="stylesheet">';
            }
            self.setDefaults('icons');
            self.setDefaults('buttonTitles');
            self.setDefaults('buttonLabels');
            self.setDefaults('buttonPrompts');
            self.setDefaults('buttonAccessKeys');
            self.setDefaults('buttonActions');
            self.setDefaults('buttonCss');
            self.setDefaults('buttonGroupCss');
            self.setDefaults('dropdownCss');
            self.setDefaults('exportConfig');
            self.setDefaults('templates');
            self.defaultInputHeight = $el.height();
            if (self.enableSplitMode && self.enableLivePreview === undefined) {
                self.enableLivePreview = true;
            }
            self.render();
            self.$preview.height(self.defaultInputHeight);
            $el.height(self.defaultInputHeight);
            if (self.startFullScreen) {
                self.toggleFullScreen();
            }
            self.initLibrary();
            self.reset();
            self.listen();
        },
        getLibrary: function () {
            return this._library || null;
        },
        initLibrary: function () {
            var self = this, md;
            if (!window.markdownit) {
                if (console && typeof console.log === "function") {
                    console.log('INIT LIBRARY ERROR: Markdown IT Library not found or not loaded.');
                }
                return;
            }
            md = self._library = window.markdownit(self.markdownItOptions);
            $.each(self.markdownItPlugins, function (plugin, opts) {
                if (window[plugin]) {
                    md.use(window[plugin], opts);
                }
            });
            if (!$h.isEmpty(self.markdownItDisabledRules)) {
                md.disable(self.markdownItDisabledRules);
            }
            if ($h.isEmpty(self.parserUrl) && self.parserMethod === undefined) {
                self.parserMethod = function (data) {
                    md.renderer.rules.emoji = function (token, idx) {
                        //noinspection JSUnresolvedVariable
                        return self.useTwemoji && window.twemoji ? window.twemoji.parse(token[idx].content) :
                            '<span class="md-emoji">' + token[idx].content + '</span>';
                    };
                    md.renderer.rules.paragraph_open = md.renderer.rules.heading_open =
                        function (tokens, idx, options, env, slf) {
                            var line;
                            if (tokens[idx].map && tokens[idx].level === 0) {
                                line = tokens[idx].map[0];
                                tokens[idx].attrJoin('class', 'md-line');
                                tokens[idx].attrSet('data-line', String(line));
                            }
                            return slf.renderToken(tokens, idx, options, env, slf);
                        };
                    return md.render(data);
                };
            }
        },
        setDefaults: function (param) {
            var self = this;
            if (typeof self[param] !== "function") {
                self[param] = $.extend(true, {}, $defaults[param] || {}, self[param]);
            }
        },
        getConfig: function (prop, key) {
            var self = this, cfg = self[prop], t = self.theme && $.fn.markdownEditorThemes[self.theme] || {}, tCfg;
            if (cfg === undefined) {
                return null;
            }
            tCfg = t[prop];
            if (typeof tCfg === "function") {
                return tCfg(key);
            }
            return typeof cfg === "function" ? cfg(key) : cfg[key]
        },
        handleEvent: function ($element, event, method) {
            var self = this, ev = event + $h.NAMESPACE;
            $element.off(ev).on(ev, $.proxy(self[method], self));
        },
        listen: function () {
            var self = this, $cont = self.$container, $el = self.$element, $preview = self.$preview,
                $form = $el.closest('form'), eResize = $events.resize, eReset = $events.reset, eKeyup = $events.keyup,
                eBtnPress = $events.buttonPress, eFocus = $events.focus, eBlur = $events.blur, eChange = $events.change,
                eClick = $events.click, eTouchMouse = $events.touchstart + ' ' + $events.mouseover,
                $search = self.$editor.find('.md-emoji-search'), eKeydown = $events.keydown;
            self.parseButtons();
            $cont.find('.dropdown-toggle').dropdown();
            self.handleEvent(self.$dialog, eKeydown, 'keydownDialog');
            self.handleEvent($el, eFocus, 'focus');
            self.handleEvent($preview, eFocus, 'focus');
            self.handleEvent($el, eBlur, 'blur');
            self.handleEvent($preview, eBlur, 'blur');
            self.handleEvent($(document), eKeydown, 'escapeFullScreen');
            self.handleEvent($(window), eResize, 'resizeWindow');
            if ($form.length) {
                self.handleEvent($form, eReset, 'reset');
            }
            self.handleEvent(self.$btnUndo, eClick, 'undo');
            self.handleEvent(self.$btnRedo, eClick, 'redo');
            self.handleEvent($el, eKeyup, 'keyup');
            self.handleEvent($el, eBtnPress, 'buttonPress');
            self.handleEvent($el, eTouchMouse, 'mouseoverEditor');
            self.handleEvent($preview, eTouchMouse, 'mouseoverPreview');
            self.handleEvent(self.$modeInput, eChange, 'changeMode');
            if ($search.length) {
                self.handleEvent($search.find('input'), eKeyup, 'emojiSearch');
                self.handleEvent($search.find('.md-close'), eClick, 'emojiSearchClose');
            }
        },
        resizeWindow: function (event) {
            var self = this, $msg, w, $cont = self.$container, $preview = self.$preview;
            $h.handler(event, function () {
                if ($cont.hasClass('md-fullscreen-overlay')) {
                    self.resizeFullScreen();
                }
                $msg = $preview.find('.md-preview-message');
                if (!$msg.length) {
                    return;
                }
                w = $(window).width() < 640 ? '100%' : 0.5 * $preview.width();
                $msg.width(w);
            });
        },
        emojiSearch: function (event) {
            var self = this, $search = self.$editor.find('.md-emoji-search'), $input = $search.find('input'),
                val = $input.val(), $ul = $search.closest('ul');
            $h.handler(event, function () {
                $h.delay(function () {
                    $ul.find('li').each(function () {
                        var $li = $(this), key = $li.find('a').attr('data-key');
                        if ($li.hasClass('md-emoji-search') || (key && key.indexOf(val) !== -1)) {
                            $li.show();
                        } else {
                            $li.hide();
                        }
                    });
                });
            });
        },
        emojiSearchClose: function (event) {
            var self = this, $search = self.$editor.find('.md-emoji-search');
            $h.handler(event, function () {
                event.stopPropagation();
                $search.closest('ul').find('li').show();
                $search.find('input').val('');
            });
        },
        focus: function (event) {
            var self = this;
            $h.handler(event, function () {
                $h.addCss(self.$editor, 'active');
            });
        },
        blur: function (event) {
            var self = this;
            $h.handler(event, function () {
                self.$editor.removeClass('active');
            });
        },
        clickButton: function (event, $btn) {
            var self = this, ttl, key = $btn.data('key'), txt, isHeading = $btn.hasClass('md-btn-heading'),
                isExport = $btn.hasClass('md-btn-export'), isEmoji = $btn.hasClass('md-btn-emoji');
            $h.handler(event, function () {
                if (self.isDisabled && !self.isPreviewModeButton(key)) {
                    return false;
                }
                if (isHeading || isExport || isEmoji) {
                    event.preventDefault();
                    if (isExport && self.raise('clickExport', [key])) {
                        self.exportData(key);
                        return;
                    }
                    if (isEmoji && self.raise('clickEmoji', [key, ':' + key + ':'])) {
                        self.replaceSelected(':' + key + ':');
                        return;
                    }
                }
                switch (key) {
                    case 'fullscreen':
                        self.toggleFullScreen();
                        break;
                    case 'hint':
                        ttl = self.getTitle(key) + ' <small>' + $h.CREDITS + '</small>';
                        self.showPopup(ttl, self.renderHint(), true);
                        break;
                    default:
                        txt = self.process(key);
                        if (self.raise('clickButton', [key, txt]) && !$h.isEmpty(txt)) {
                            self.replaceSelected(txt);
                        }
                }
            });
        },
        changeMode: function (event) {
            var self = this, val, m;
            $h.handler(event, function () {
                val = self.$mode.find('input:radio[name="mdMode"]:checked').val() || 'modeEditor';
                m = val.substr(4).toLowerCase();
                if (!self.raise('changeMode', [m])) {
                    return;
                }
                self.toggleMode(val);
                self.currentMode = m;
            });
        },
        reset: function (event) {
            var self = this, $el = self.$element, el = $el[0];
            $h.handler(event, function () {
                setTimeout(function () {
                    if (self.enableUndoRedo) {
                        self.undoStack = self.resetUndoStack();
                        self.startValue = $el.val();
                        self.startPos = [el.selectionStart, el.selectionEnd];
                    } else {
                        self.undoStack = null;
                    }
                    if (self.$preview.is(':visible')) {
                        setTimeout(function () {
                            self.generatePreview();
                        }, 1);
                    }
                }, 1);
            });

        },
        undo: function (event) {
            var self = this;
            if (!self.enableUndoRedo || !self.raise('undo', [self.undoStack])) {
                return;
            }
            $h.handler(event, function () {
                self.undoStack.undo();
                self.scrollMap = null;
                if (self.enableLivePreview) {
                    self.generatePreview();
                }
            });
        },
        redo: function (event) {
            var self = this;
            if (!self.enableUndoRedo || !self.raise('undo', [self.undoStack])) {
                return;
            }
            $h.handler(event, function () {
                self.undoStack.redo();
                self.scrollMap = null;
                if (self.enableLivePreview) {
                    self.generatePreview();
                }
            });
        },
        keyup: function (event) {
            var self = this, $el = self.$element, el = $el[0], stack = self.undoStack;
            $h.handler(event, function () {
                if (self.enableLivePreview && self.$preview.is(':visible')) {
                    $h.delay(self.generatePreview());
                }
                if (self.enableUndoRedo) {
                    $h.delay(function () {
                        var newValue = $el.val(), endPos = [el.selectionEnd, el.selectionEnd];
                        if (newValue !== self.startValue) {
                            stack.execute(new UndoCommand($el, self.startValue, newValue, self.startPos, endPos));
                            self.startValue = newValue;
                            self.startPos = endPos;
                            self.scrollMap = null;
                        }
                    });
                }
            });
        },
        keydownDialog: function (event) {
            var self = this;
            $h.handler(event, function () {
                var $targ = $(event.target), isInput = $targ.hasClass('md-dialog-input'),
                    isTitle = $targ.hasClass('md-dialog-title');
                if (event.keyCode === 13 && (isInput || isTitle)) {
                    event.stopPropagation();
                    event.preventDefault();
                    if (isTitle || !self.$dialogTitle.is(':visible')) {
                        self.$dialogSubmit.trigger('click');
                    }
                }
            });
        },
        buttonPress: function (event, oldPos, newPos) {
            var self = this, $el = self.$element, newValue;
            $h.handler(event, function () {
                if (self.isDisabled) {
                    return;
                }
                if (self.enableUndoRedo) {
                    newValue = $el.val();
                    self.startPos = oldPos;
                    self.undoStack.execute(new UndoCommand($el, self.startValue, newValue, self.startPos, newPos));
                    self.startValue = newValue;
                    self.startPos = newPos;
                }
                if (self.enableLivePreview && self.$preview.is(':visible')) {
                    self.generatePreview();
                }
            });
        },
        _mouseover: function (event, type) {
            var self = this, $el = self.$element, $preview = self.$preview, eScroll = $events.scroll;
            if (event && event.isDefaultPrevented() || !$el.is(':visible') || !$preview.is(':visible')) {
                return;
            }
            if (type === 'editor') {
                $preview.off(eScroll);
                $el.on(eScroll, function () {
                    self.syncPreviewScroll();
                });
            } else {
                $el.off(eScroll);
                $preview.on(eScroll, function () {
                    self.syncInputScroll();
                });
            }
        },
        mouseoverEditor: function (event) {
            var self = this;
            $h.handler(event, function () {
                self._mouseover(event, 'editor');
            });
        },
        mouseoverPreview: function (event) {
            var self = this;
            $h.handler(event, function () {
                self._mouseover(event, 'preview');
            });
        },
        buildScrollMap: function () {
            var self = this, i, offset, pos, a, b, linesCount, $el = self.$element, $elCopy, $preview = self.$preview,
                acc = 0, lineHeightMap = [], nonEmptyList = [], _scrollMap = [];
            if (!self.enableScrollSync) {
                return '';
            }
            $elCopy = $h.create('div').css({
                position: 'absolute',
                visibility: 'hidden',
                height: 'auto',
                width: $el[0].clientWidth,
                'font-size': $el.css('font-size'),
                'font-family': $el.css('font-family'),
                'line-height': $el.css('line-height'),
                'white-space': $el.css('white-space')
            }).appendTo('body');
            offset = $preview[0].scrollTop - $preview.offset().top;
            $el.val().split('\n').forEach(function (str) {
                var h, lh;
                lineHeightMap.push(acc);
                if (str.length === 0) {
                    acc++;
                    return;
                }
                $elCopy.text(str);
                h = parseFloat($elCopy.css('height'));
                lh = parseFloat($elCopy.css('line-height'));
                acc += Math.round(h / lh);
            });
            $elCopy.remove();
            lineHeightMap.push(acc);
            linesCount = acc;
            for (i = 0; i < linesCount; i++) {
                _scrollMap.push(-1);
            }
            nonEmptyList.push(0);
            _scrollMap[0] = 0;
            $preview.find('.md-line').each(function (n, el) {
                var $el = $(el), t = $el.data('line');
                if (t === '') {
                    return;
                }
                t = lineHeightMap[t];
                if (t !== 0) {
                    nonEmptyList.push(t);
                }
                _scrollMap[t] = Math.round($el.offset().top + offset);
            });

            nonEmptyList.push(linesCount);
            _scrollMap[linesCount] = $preview[0].scrollHeight;

            pos = 0;
            for (i = 1; i < linesCount; i++) {
                if (_scrollMap[i] !== -1) {
                    pos++;
                    continue;
                }

                a = nonEmptyList[pos];
                b = nonEmptyList[pos + 1];
                _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
            }

            return _scrollMap;
        },
        syncInputScroll: function () {
            var self = this, $el = self.$element, $preview = self.$preview, scrollMap = self.scrollMap,
                scrollTop = $preview[0].scrollTop, lineHeight = parseFloat($el.css('line-height')), lines, i, line;
            if (!scrollMap) {
                scrollMap = self.scrollMap = self.buildScrollMap();
            }
            lines = Object.keys(scrollMap);
            if (lines.length < 1) {
                return;
            }
            line = lines[0];
            for (i = 1; i < lines.length; i++) {
                if (scrollMap[lines[i]] < scrollTop) {
                    line = lines[i];
                } else {
                    break;
                }
            }
            $el.stop(true).animate({
                scrollTop: lineHeight * line
            }, 100, 'linear');
        },
        syncPreviewScroll: function () {
            var self = this, $el = self.$element, $preview = self.$preview, posTo, scrollMap = self.scrollMap,
                lineHeight = parseFloat($el.css('line-height')), lineNo = Math.floor($el[0].scrollTop / lineHeight);
            if (!scrollMap) {
                scrollMap = self.scrollMap = self.buildScrollMap();
            }
            posTo = scrollMap[lineNo];
            $preview.stop(true).animate({
                scrollTop: posTo
            }, 100, 'linear');
        },
        isPreviewModeButton: function (key) {
            var self = this;
            return self.previewModeButtons.indexOf(key) !== -1;
        },
        resetUndoStack: function () {
            var self = this, stack = new UndoStack();
            self.startValue = self.$element.val();
            self.startPos = [0, 0];
            stack.changed = function () {
                self.disableButton(self.$btnUndo, !stack.canUndo());
                self.disableButton(self.$btnRedo, !stack.canRedo());
            };
            stack.changed();
            return stack;
        },
        parseButtons: function () {
            var self = this, $cont = self.$container, eClick = $events.click;
            $cont.find('.md-btn,.md-btn-heading,.md-btn-export,.md-btn-emoji').each(function () {
                var $btn = $(this);
                $btn.off(eClick).on(eClick, function (event) {
                    self.clickButton(event, $btn);
                });
            });
        },
        getSelected: function () {
            var self = this, $el = self.$element, val = $el.val(), el = $el[0];
            return val.substring(el.selectionStart, el.selectionEnd);
        },
        replaceSelected: function (txt) {
            var self = this, $el = self.$element, val = $el.val(), el = $el[0], fm = el.selectionStart,
                len = txt.length,
                to = el.selectionEnd, out = val.substring(0, fm) + txt + val.substring(to), newPos = fm + len;
            $el.val(out).trigger($events.buttonPress, [[fm, to], [fm, newPos]]);
            $h.setSelectionRange(el, fm, newPos);
        },
        destroy: function () {
            var self = this, $el = self.$element, $cont = self.$container, css = self.inputCss, ns = $h.NAMESPACE;
            if (css) {
                $el.removeClass(css).show();
            }
            $el.off(ns);
            $(window).off(ns);
            $(document).off(ns);
            $cont.before($el).remove();
        },
        getLayout: function (template) {
            var self = this, header, title, btnClose, out = self.getConfig('templates', template) || $h.EMPTY, tag;
            if (template === 'dialog') {
                tag = self.isBs4 ? 'h5' : 'h4';
                title = '<' + tag + ' class="md-dialog-head-title modal-title"></' + tag + '>';
                btnClose = self.getConfig('templates', 'dialogClose');
                header = self.isBs4 ? title + '\n' + btnClose : btnClose + '\n' + title;
                out = out.replace('{HEADER}', header)
                    .replace('{DIALOG_CANCEL_ICON}', self.renderIcon('dialogCancel'))
                    .replace('{DIALOG_SUBMIT_ICON}', self.renderIcon('dialogSubmit'))
                    .replace('{DIALOG_CANCEL_TEXT}', self.dialogCancelText)
                    .replace('{DIALOG_SUBMIT_TEXT}', self.dialogSubmitText);
            }
            return out;
        },
        submitExportForm: function (extension, content) {
            var self = this, $form = $h.create('form'), $filetype, $filename, $content,
                ifrm = self.$element.attr('id') + '-iframe', addlInputs = self.exportUrlAddlData;
            if (!$('#' + ifrm).length) {
                $h.create('iframe', {id: ifrm, name: ifrm, css: {display: 'none'}}).appendTo('body');
            }
            $filetype = $h.create('input', {type: 'hidden', name: 'export_type', value: extension});
            $filename = $h.create('input', {type: 'hidden', name: 'export_filename', value: self.exportFileName});
            $content = $h.create('input', {
                name: 'export_content',
                css: {display: 'none'}
            }).val(content || self.noDataMsg);
            $form.attr({target: ifrm, action: self.exportUrl, method: self.exportUrlMethod});
            $form.append($filetype, $filename, $content);
            if (addlInputs) {
                $form.append(typeof addlInputs === 'function' ? addlInputs() : addlInputs);
            }
            $form.appendTo('body').hide().submit().remove();
        },
        showPopup: function (header, content, isLarge) {
            var self = this, ev = $events.modalShown;
            self.$dialogMain.removeClass('modal-lg');
            if (isLarge) {
                self.$dialogMain.addClass('modal-lg');
            }
            self.$dialogHeadTitle.html(header);
            self.$dialogContent.html(content).show();
            self.$dialogInput.hide();
            self.$dialogTitle.hide();
            self.$dialogClose.show();
            self.$dialogHeader.show();
            self.$dialogFooter.hide();
            self.$dialogSubmit.off($events.click);
            self.$dialog.modal('show');
            self.$dialog.off(ev).on(ev, function () {
                self.$dialogClose.focus();
                self.$dialog.off(ev);
            });
        },
        showDialog: function (key, callback, str) {
            var self = this, prompts = self.getConfig('buttonPrompts', key), hdr = (prompts.header || $h.EMPTY),
                icon = self.renderIcon(key), p1 = prompts.hintInput || $h.EMPTY, p2 = prompts.hintTitle,
                evShow = $events.modalShown, evClick = $events.click;
            self.$dialogMain.removeClass('modal-lg');
            self.$dialogHeadTitle.html(icon ? icon + ' ' + hdr : hdr);
            self.$dialogContent.hide();
            self.$dialogTitle.hide().val(str || $h.EMPTY);
            self.$dialogClose.show();
            self.$dialogHeader.show();
            self.$dialogFooter.show();
            self.$dialogInput.show().val($h.EMPTY).attr('placeholder', p1);
            if (p2 && !str) {
                self.$dialogTitle.show().attr('placeholder', p2);
            }
            self.$dialogSubmit.off(evClick).on(evClick, function () {
                var s = callback(self.$dialogInput.val(), self.$dialogTitle.val());
                if (!$h.isEmpty(s)) {
                    self.replaceSelected(s);
                }
            });
            self.$dialog.modal('show');
            self.$dialog.off(evShow).on(evShow, function () {
                self.$dialogInput.focus();
                self.$dialog.off(evShow);
            });
        },
        raise: function (event, params, $el) {
            var self = this, ev = $.Event(event + $h.NAMESPACE);
            $el = $el || self.$element;
            if (params) {
                $el.trigger(ev, params);
            } else {
                $el.trigger(ev);
            }
            return !ev.isDefaultPrevented() || ev.result === false;
        },
        showPreviewMsg: function (msg) {
            var self = this, $preview = self.$preview, alert = self.getAlert(msg, self.previewErrorTitle);
            $preview.html('<div class="md-preview-message">' + alert + '</div>');
            $preview.find('.md-preview-message').width(0.5 * $preview.width());
            $preview.find('.md-alert').hide().fadeIn('slow');
        },
        disableButton: function ($btn, flag) {
            if (flag) {
                $btn.attr('disabled', true);
            } else {
                $btn.removeAttr('disabled');
            }
        },
        hasInvalidConfig: function (type) {
            var self = this, urlProp = self[type + 'Url'], m = type === 'export' ? 'exportUrlMethod' : type + 'Method',
                methodProp = self[m], noUrl = $h.isEmpty(urlProp), noMethod = $h.isEmpty(methodProp),
                methodType = typeof methodProp;
            return (noUrl && noMethod || !noMethod && methodType !== "function" && methodType !== "object");
        },
        parseOutput: function (data) {
            var self = this, postProcess = self.postProcess;
            if (postProcess) {
                if (typeof postProcess === "function") {
                    data = postProcess(data);
                } else {
                    if (typeof postProcess === "object") {
                        $.each(postProcess, function (key, val) {
                            if (key !== val) {
                                data = data.split(key).join(val);
                            }
                        });
                    }
                }
            }
            return data;
        },
        getPureHtml: function (src) {
            var self = this;
            return self.purifyHtml && window.DOMPurify ? window.DOMPurify.sanitize(src) : src;
        },
        getHtml: function (val) {
            var self = this, $el = self.$element, parser = self.parserMethod;
            if (val === undefined) {
                val = $el.val();
            }
            if (!$h.isEmpty(self.parserUrl)) {
                self._ajaxSubmit(val);
                return null;
            }
            val = typeof parser === "function" ? parser(val) : new parser(val); // jshint ignore:line
            val = self.parseOutput(val);
            return self.getPureHtml(val);
        },
        generatePreview: function (val, ignorePreviewUpdate) {
            var self = this, out = self.getHtml(val);
            if (!ignorePreviewUpdate) {
                self.$preview.html(out);
            } else {
                return out;
            }
        },
        output: function () {
            var self = this, $el = self.$element, $preview = self.$preview, val = $el.val(), isLoad = true, elapsed = 0,
                out, eSuccess = $events.successPreview, eEmptyError = $events.emptyPreview + ' ' + $events.errorPreview;
            if ($h.isEmpty(val) || self.hasInvalidConfig('parser')) {
                return $h.EMPTY;
            }
            out = self.generatePreview(val, true);
            if ($h.isEmpty(self.parserUrl)) {
                return out;
            }
            while (isLoad && elapsed < self.outputParseTimeout) {
                $h.delay(function () {
                    $el.off(eSuccess).on(eSuccess, function () {
                        isLoad = false;
                        out = $preview.html();
                    }).off(eEmptyError).on(eEmptyError, function () {
                        isLoad = false;
                        out = '';
                    });
                    elapsed += 150;
                }, 150); // jshint ignore:line
            }
            return out;
        },
        toggleMode: function (mode) {
            var self = this, $el = self.$element, val = $el.val(), $cont = self.$container, msg,
                currMode = self.currentMode || 'modeEditor', $tbl = $cont.find('.md-input-preview'),
                initPreview = function () {
                    if (currMode !== 'editor') {
                        return;
                    }
                    self.$preview.html(self.getProgress(self.loadingMsg));
                    setTimeout(function () {
                        self.generatePreview();
                        self.$mode.focus();
                    }, 50);
                };
            if ($h.isEmpty(val) || self.hasInvalidConfig('parser')) {
                msg = $h.isEmpty(val) ? self.noDataMsg : self.noPreviewUrlMsg;
                self.showPopupAlert(self.getTitle('mode'), msg, 'errorToggleMode', [self.$modeInput.val()]);
            }
            $cont.removeClass('md-only-preview');
            $tbl.removeClass('md-editor-mode md-preview-mode md-split-mode');
            switch (mode) {
                case 'modeEditor':
                    $h.addCss($tbl, 'md-editor-mode');
                    break;
                case 'modePreview':
                    $h.addCss($tbl, 'md-preview-mode');
                    $h.addCss($cont, 'md-only-preview');
                    initPreview();
                    break;
                case 'modeSplit':
                    $h.addCss($tbl, 'md-split-mode');
                    initPreview();
                    break;
            }
        },
        toggleFullScreen: function () {
            var self = this, $cont = self.$container, $el = self.$element, $preview = self.$preview;
            if ($cont.hasClass('md-fullscreen-overlay')) {
                if (self.raise('normalScreen')) {
                    $cont.removeClass('md-fullscreen-overlay');
                    $el.height(self.defaultInputHeight);
                    $preview.height(self.defaultInputHeight);
                }
            } else {
                if (self.raise('fullScreen')) {
                    $cont.addClass('md-fullscreen-overlay');
                    self.resizeFullScreen();
                }
            }
            if (!$preview.is(':visible')) {
                $el.focus();
            } else {
                $preview.focus();
            }
        },
        escapeFullScreen: function(e) {
            var self = this;
            if (self.enableEscKeyFullScreen && self.$container.hasClass('md-fullscreen-overlay') && e.keyCode == 27) {
                self.toggleFullScreen();
            }
        },
        resizeFullScreen: function () {
            var self = this, $cont = self.$container, $el = self.$element, $head = $cont.find('.md-header'),
                $foot = $cont.find('.md-footer'), h = $(window).height() - $head.outerHeight(true) -
                $foot.outerHeight(true) - ($el.outerHeight(true) - $el.height());
            $el.height(h);
            self.$preview.height(h);
        },
        process: function (key) {
            var self = this, $el = self.$element, str = self.getSelected(), len = str.length, out, def, bef, aft,
                action = self.getConfig('buttonActions', key), skipSp;
            if (key !== 'mode' && key.substring(0, 6) !== 'export') {
                $el.focus();
            }
            if (key === 'undo' || key === 'redo') {
                return '';
            }
            if (!action) {
                return $h.EMPTY;
            }
            if (typeof action === "function") {
                out = action(str);
                if (typeof out === "function") {
                    self.showDialog(key, out, str);
                    return $h.EMPTY;
                }
                return out;
            }
            if (typeof action === "object" && (action.before !== undefined || action.after !== undefined)) {
                bef = $h.isEmpty(action.before) ? $h.EMPTY : action.before;
                aft = $h.isEmpty(action.after) ? $h.EMPTY : action.after;
                def = action['default'];
                skipSp = action.skipSpaces;
                out = action.inline ? $h.getMarkUp(str, bef, aft, skipSp) : $h.getBlockMarkUp(str, bef, aft, skipSp);
                return def ? (len > 0 ? out : def) : out;
            }
            return $h.EMPTY;
        },
        download: function (key, content) {
            var self = this, $a, config = self.getConfig('exportConfig', key), ext = config.ext || '',
                uri = config.uri || '';
            if (!$h.isEmpty(self.exportUrl)) {
                self.submitExportForm(ext, content);
                return;
            }
            uri = uri + window.btoa(content);
            $a = $h.create('a', {'href': uri, 'download': self.getFileName(key)}).appendTo('body');
            $a[0].click();
            $a.remove();
        },
        getLabel: function (key) {
            var self = this;
            return self.renderIcon(key) + ' ' + (self.getConfig('buttonLabels', key) || $h.EMPTY);
        },
        getTitle: function (key) {
            var self = this;
            return self.renderIcon(key) + ' ' + (self.getConfig('buttonTitles', key) || $h.EMPTY);
        },
        getProgress: function (msg) {
            return '<div class="md-loading">' + msg + '</div>';
        },
        getAlert: function (msg, head, hideIcon) {
            var self = this;
            head = head ? '<h4>' + (hideIcon ? '' : self.renderIcon('alertMsg')) + head + '</h4>' : '';
            return '<div class="' + self.alertMsgCss + ' md-alert">' + head + msg + '</div>';
        },
        showPopupAlert: function (heading, content, event, params) {
            var self = this, $body = self.$dialog.find('.modal-body'), time = self.alertFadeDuration,
                evS = $events.modalShown, evH = $events.modalHidden;
            if (self.showAlerts) {
                self.showPopup('', self.getAlert(content, heading, true));
                self.$dialogHeader.hide();
                self.$dialogFooter.hide();
                self.$dialogClose.hide();
                $body.addClass('md-zero-pad');
                self.$dialog.off(evS).on(evS, function () {
                    if (time) {
                        setTimeout(function () {
                            self.$dialog.modal('hide').off(evS);
                        }, time);
                    } else {
                        self.$dialog.modal('hide').off(evS);
                    }
                });
                self.$dialog.off(evH).on(evH, function () {
                    $body.removeClass('md-zero-pad');
                    self.$dialog.off(evS).off(evH);
                    self.$element.focus();
                });
            }
            if (event) {
                params = params || [];
                params.push(heading);
                params.push(content);
                self.raise(event, params);
            }
        },
        getHtmlContent: function (data) {
            var self = this, preCss = self.exportPrependCssJs;
            return '<html>\n<head>\n' +
                self.getLayout('htmlMeta') + self.getLayout('exportCssJs').replace('{EXPORT_PREPEND_CSS_JS}', preCss) +
                '\n</head>\n<body>\n' + data + '\n</body>\n</html>';
        },
        exportData: function (key) {
            var self = this, source = self.$element.val(), tTxt = self.getTitle('exportText'), out,
                tHtm = self.getTitle('exportHtml'), noDataMsg = self.noDataMsg, typ, msg,
                noUrlMsg = self.noExportUrlMsg, today = self.today || new Date();
            if ($h.isEmpty(source) || (!$h.isEmpty(self.exportUrl) && self.hasInvalidConfig('export'))) {
                typ = key === 'exportText' ? tTxt : tHtm;
                msg = $h.isEmpty(source) ? noDataMsg : noUrlMsg;
                self.showPopupAlert(typ, msg, 'errorExport', [key]);
                return;
            }
            source = self.getLayout('exportHeader').replace('{TODAY}', today)
                .replace('{CREDITS}', $h.CREDITS_MD) + source;
            if (key !== 'exportHtml') {
                self.download('exportText', source);
                return;
            }
            out = $h.parseHtml(self.generatePreview(source, true));
            self.download('exportHtml', self.getHtmlContent(out));
        },
        renderIcon: function (key) {
            var self = this;
            return self.getConfig('icons', key) || $h.EMPTY;
        },
        render: function () {
            var self = this, $el = self.$element, $container = $h.create('div').addClass('md-container'), out,
                main = self.getLayout('main'), TEMP_CSS = 'md-editor-input-temporary',
                contId = $el.attr('id') + '-container';
            if (!main) {
                return $h.EMPTY;
            }
            if (self.theme) {
                $h.addCss($container, 'theme-' + self.theme);
            }
            out = main.replace('{INPUT}', '<div class="' + TEMP_CSS + '"></div>')
                .replace('{HEADER}', self.renderHeader())
                .replace('{FOOTER}', self.renderFooter())
                .replace('{PREVIEW}', self.getLayout('preview'))
                .replace('{DIALOG}', self.getLayout('dialog'));
            $container.attr('id', contId).insertBefore($el).html(out);
            $container.find('.' + TEMP_CSS).before($el).remove();
            $h.addCss($el, self.inputCss);
            self.$container = $container;
            self.$editor = $container.find('.md-editor');
            self.$preview = $container.find('.md-preview');
            self.$btnPreview = $container.find('.md-btn-preview');
            self.$btnUndo = $container.find('.md-btn-undo');
            self.$btnRedo = $container.find('.md-btn-redo');
            self.$dialog = $container.find('.md-dialog');
            self.$dialogHeadTitle = self.$dialog.find('.md-dialog-head-title');
            self.$dialogInput = self.$dialog.find('.md-dialog-input');
            self.$dialogTitle = self.$dialog.find('.md-dialog-title');
            self.$dialogContent = self.$dialog.find('.md-dialog-content');
            self.$dialogCancel = self.$dialog.find('.md-dialog-cancel');
            self.$dialogSubmit = self.$dialog.find('.md-dialog-submit');
            self.$dialogClose = self.$dialog.find('.close');
            self.$dialogMain = self.$dialog.find('.modal-dialog');
            self.$dialogHeader = self.$dialog.find('.modal-header');
            self.$dialogFooter = self.$dialog.find('.modal-footer');
            self.$mode = $container.find('.md-btn-mode');
            self.$modeInput = self.$mode.find('input:radio[name="mdMode"]');
            self.$inputPreview = $container.find('.md-input-preview');
            self.$inputCell = $container.find('.md-input-cell');
            self.$previewCell = $container.find('.md-preview-cell');
            if (self.previewModeTitle) {
                self.$editor.find('.md-toolbar-header-l')
                    .prepend('<div class="md-preview-mode-title">' + self.previewModeTitle + '</div>');
            }
            if (self.defaultMode !== 'preview' && (!self.enableSplitMode || self.defaultMode !== 'split')) {
                self.defaultMode = 'editor';
            }
            self.currentMode = self.defaultMode;
            $h.addCss(self.$inputPreview, 'md-' + self.defaultMode + '-mode');
            $.each(self.dropUp, function (key, val) {
                if (val) {
                    //noinspection JSValidateTypes
                    $container.find('button[data-key="' + key + '"]').parent().addClass('dropup');
                }
            });
        },
        initToolbar: function () {
            var self = this, toolbars = ['toolbarHeaderL', 'toolbarHeaderR', 'toolbarFooterL', 'toolbarFooterR'];
            $.each(toolbars, function (key, type) {
                if (self[type] === undefined || !$.isArray(self[type])) {
                    self[type] = $defaults.toolbar[type];
                }
            });
        },
        getButtons: function (toolbar) {
            var self = this, btns = [];
            $.each(self[toolbar], function (i, row) {
                var btn = $.isArray(row) ? row : [row];
                $.merge(btns, btn);
            });
            return btns;
        },
        getValidButtons: function () {
            var self = this, btns = self.getButtons('toolbarHeaderL');
            $.merge(btns, self.getButtons('toolbarHeaderR'));
            $.merge(btns, self.getButtons('toolbarFooterL'));
            $.merge(btns, self.getButtons('toolbarFooterR'));
            return btns;
        },
        renderHint: function () {
            var self = this, txt, tag = '{ACCESS_KEYS}', keys, icon, ttl, i, css;
            txt = self.getLayout('hint').replace('{LINK_CM}', $h.LINK_CM).replace('{LINK_MI}', $h.LINK_MI);
            if (txt.indexOf(tag) === -1) {
                return txt;
            }
            keys = '<div class="md-hint-access-keys"><ul>';
            $.each(self.getValidButtons(), function (idx, btn) {
                var key, isHidden = btn === 'emoji' && !self.enableEmojies || self.hiddenActions.indexOf(btn) > -1;
                if (!isHidden) {
                    css = self.getConfig('buttonCss', btn) || self.defaultButtonCss;
                    if (btn === 'heading') {
                        for (i = 1; i <= 6; i++) {
                            icon = self.renderIcon('heading') + i;
                            key = self.getConfig('buttonAccessKeys', btn + i);
                            ttl = self.getConfig('buttonTitles', 'heading') + ' ' + i;
                            keys += '<li title="' + ttl + '"><p>' + '<span class="' + css + '">' + icon +
                                '</span></p><p><kbd>ALT</kbd> &ndash; <kbd>' + key + '</kbd></p></li>';
                        }
                    } else {
                        if (btn.substring(0, 6) !== 'export' && btn.substring(0, 4) !== 'mode') {
                            key = self.getConfig('buttonAccessKeys', btn);
                            icon = self.renderIcon(btn);
                            ttl = self.getConfig('buttonTitles', btn);
                            keys += '<li title="' + ttl + '"><p>' + '<span class="' + css + '">' + icon +
                                '</span></p><p><kbd>ALT</kbd> &ndash; <kbd>' + key + '</kbd></p></li>';
                        }
                    }
                }
            });
            keys += '</ul></div>';
            return txt.replace(tag, keys);
        },
        renderHeader: function () {
            var self = this, header = self.getLayout('header');
            header = self.renderToolbar(header, 'toolbarHeaderL');
            header = self.renderToolbar(header, 'toolbarHeaderR');
            return header;
        },
        renderFooter: function () {
            var self = this, footer = self.getLayout('footer');
            footer = self.renderToolbar(footer, 'toolbarFooterL');
            footer = self.renderToolbar(footer, 'toolbarFooterR');
            return footer;
        },
        renderToolbar: function (layout, type) {
            var self = this, tag, t = type.toUpperCase(), css, btn, out = '', attr = '';
            tag = '{' + t.substring(0, 7) + '_' + t.substring(7, 13) + '_' + t.substring(13, 14) + '}';
            if (layout.indexOf(tag) === -1) {
                return layout;
            }
            $.each(self[type], function (k, v) {
                if (!$.isArray(v)) {
                    v = [v];
                }
                btn = '';
                $.each(v, function (grp, key) {
                    css = self.getConfig('buttonGroupCss', key) || self.defaultButtonGroupCss;
                    btn += self.renderButton(key) + '\n';
                    if (self.isPreviewModeButton(key)) {
                        css += ' md-always-visible';
                    }
                    if (key === 'mode') {
                        css += ' btn-group-toggle md-btn-mode';
                        attr = ' data-toggle="buttons"';
                    }
                });
                out += '<div class="' + css + '" role="group"' + attr + '>\n' + btn + '</div>\n';
            });
            return layout.replace(tag, out);
        },
        getFileName: function (key) {
            var self = this, name = self.exportFileName, cfg = self.getConfig('exportConfig', key),
                ext = cfg && cfg.ext || '';
            return ext ? name + '.' + ext : name;
        },
        renderMenuItem: function (type, btn) {
            var self = this, $a, $div = $h.create('div'), key = type + btn, title, out;
            if (type === 'export') {
                title = self.getConfig('buttonTitles', key);
                out = self.getLabel(key);
            } else {
                title = self.getConfig('buttonTitles', type);
                out = title + ' ' + btn;
            }
            $a = $h.create('a', {
                'href': '#',
                'class': 'dropdown-item md-btn-' + type + ' md-btn-' + key,
                'title': title,
                'accesskey': self.getConfig('buttonAccessKeys', key),
                'data-key': key
            }).html(out);
            out = $div.append($a).html();
            $div.remove();
            return self.isBs4 ? out : '<li>' + out + '</li>';
        },
        getEmojies: function () {
            var self = this, out = '';
            if (!self.enableEmojies || $h.isEmpty(window.mdEmojies)) {
                return '';
            }
            out = '<li class="md-emoji-search"><span class="md-close">&times;</span>' +
                '<input type="text" class="form-control form-control-sm input-sm" placeholder="' + self.emojiSearchHint + '"></li>';
            $.each(window.mdEmojies, function (key, value) {
                var ttl = ':' + $h.htmlEncode(key) + ':', shortcuts = window.mdEmojiesShortcuts[key] || '', i, lbl;
                if (shortcuts) {
                    ttl += ' or ';
                    for (i = 0; i < shortcuts.length; i++) {
                        lbl = $h.htmlEncode(shortcuts[i]);
                        ttl += i === 0 ? lbl : ' or ' + lbl;
                    }
                }
                //noinspection JSUnresolvedVariable
                out += '<li><a href="#" class="md-btn-emoji" title="' + ttl + '" data-key="' + key + '">' +
                    '<span class="md-emoji">' + (self.useTwemoji ? window.twemoji.parse(value) : value) + '</span>' +
                    '</a></li>';
            });
            return out;
        },
        getModeButton: function (type) {
            var self = this, css = self.getConfig('buttonCss', type) || self.defaultButtonCss || '', checked = '',
                mode = type.substr(4).toLowerCase(), key = self.getConfig('buttonAccessKeys', type) || '';
            if (self.defaultMode === mode) {
                css += ' active';
                checked = ' checked';
            }
            return '<label class="' + css + '" title="' + self.getConfig('buttonTitles', type) + '">' +
                '<input type="radio" value="' + type + '" name="mdMode" autocomplete="off" accesskey="' + key +
                '"' + checked + '>' + self.renderIcon(type) + '</label>';
        },
        renderButton: function (key) {
            var self = this, $btn, $div, icon, title, label, t, i, out, btnCss, icon = self.getConfig('icons', key),
                css = 'md-btn-' + key, dropCss, defDropCss = self.getConfig('dropdownCss', key),
                isValid = key === 'mode' || icon !== undefined || self.getConfig('buttonActions', key) !== undefined,
                isHidden = key === 'emoji' && !self.enableEmojies || self.hiddenActions.indexOf(key) > -1,
                tag = self.isBs4 && key !== 'emoji' ? 'div' : 'ul';
            if (!isValid || isHidden || (!self.enableUndoRedo && (key === 'undo' || key === 'redo' || key === 'editor'))) {
                return $h.EMPTY;
            }
            btnCss = self.getConfig('buttonCss', key) || self.defaultButtonCss;
            $div = $h.create('div');
            $btn = $h.create('button', {type: 'button', 'data-key': key});
            self.disableButton($btn, self.isDisabled && !self.isPreviewModeButton(key));
            icon = self.renderIcon(key);
            title = self.getConfig('buttonTitles', key) || $h.EMPTY;
            label = self.getConfig('buttonLabels', key) || $h.EMPTY;
            if (title) {
                $btn.attr('title', title);
            }
            if (key === 'fullscreen') {
                icon = '<span class="md-max-icon">' + icon + '</span>' +
                    '<span class="md-min-icon">' + self.renderIcon('minscreen') + '</span>';
            }
            label = (icon && label) ? icon + ' ' + label : icon + label;
            $div.append($btn);
            switch (key) {
                case 'emoji':
                case 'export':
                case 'heading':
                    $btn.html(label + ' ').attr({'data-toggle': 'dropdown'})
                        .append('<span class="caret"></span>').addClass(btnCss + ' dropdown-toggle');
                    dropCss = defDropCss ? 'dropdown-menu ' + defDropCss : 'dropdown-menu';
                    out = '<' + tag + ' class="' + dropCss + '">\n';
                    if (key === 'heading') {
                        for (i = 1; i < 7; i++) {
                            t = title + ' ' + i;
                            out += self.renderMenuItem('heading', i);
                        }
                    } else {
                        out += (key === 'emoji') ? self.getEmojies() :
                            self.renderMenuItem(key, 'Html') + self.renderMenuItem(key, 'Text');
                    }
                    out += '</' + tag + '>';
                    $div.append(out);
                    return $div.html();
                case 'mode':
                    return self.getModeButton('modeEditor') + self.getModeButton('modePreview') +
                        (self.enableSplitMode ? self.getModeButton('modeSplit') : '');
                default:
                    $btn.attr('accesskey', self.getConfig('buttonAccessKeys', key)).html(label)
                        .addClass(btnCss + ' ' + css + ' md-btn');
                    return $div.html();
            }
        },
        _mergeAjaxCallback: function (funcName, srcFunc) {
            var self = this, settings = self._ajaxSettings, flag = self.mergeAjaxCallbacks,
                targFunc = settings[funcName];
            if (flag && typeof targFunc === "function") {
                if (flag === 'before') {
                    settings[funcName] = function () {
                        targFunc.apply(this, arguments);
                        srcFunc.apply(this, arguments);
                    };
                } else {
                    settings[funcName] = function () {
                        srcFunc.apply(this, arguments);
                        targFunc.apply(this, arguments);
                    };
                }
            } else {
                settings[funcName] = srcFunc;
            }
        },
        _ajaxSubmit: function (val) {
            var self = this, errorMsg = self.ajaxParserErrorMsg, fnBefore, fnSuccess, fnError, settings,
                tHtm = self.getTitle('exportHtml'), pureHtml;
            fnBefore = function (jQXhr) {
                if (self.raise('beforeExportHtm', [jQXhr])) {
                    self.showPopup(tHtm, self.getProgress(self.ajaxParserProgressMsg));
                }
            };
            fnSuccess = function (data, textStatus, jQXhr) {
                self.$dialog.modal('hide');
                if (data) {
                    pureHtml = self.getPureHtml(data);
                    self.download('exportHtml', self.getHtmlContent(pureHtml));
                    self.raise('successExportHtm', [data, textStatus, jQXhr]);
                } else {
                    self.showPopupAlert(tHtm, errorMsg, 'errorExportHtm', [data, textStatus, jQXhr]);
                }
            };
            fnError = function (jqXHR, textStatus, errorThrown) {
                self.showPopupAlert(tHtm, errorMsg, 'exceptionExportHtm', [jqXHR, textStatus, errorThrown]);
            };
            self._ajaxSettings = $.extend(true, {}, self.ajaxSettings);
            self._mergeAjaxCallback('beforeSend', fnBefore);
            self._mergeAjaxCallback('success', fnSuccess);
            self._mergeAjaxCallback('error', fnError);
            settings = $.extend(true, {}, {
                type: 'POST',
                url: self.parserUrl,
                data: {source: val}
            }, self._ajaxSettings);
            $.ajax(settings);
        }
    };

    $.fn.markdownEditor = function (option) {
        var args = Array.apply(null, arguments), retvals = [];
        args.shift();
        this.each(function () {
            var self = $(this), data = self.data('markdownEditor'), options = typeof option === 'object' && option,
                theme = options.theme || self.data('theme'), l = {}, t = {},
                lang = options.language || self.data('language') || $.fn.markdownEditor.defaults.language || 'en', opt;
            if (!data) {
                if (theme) {
                    t = $.fn.markdownEditorThemes[theme] || {};
                }
                if (lang !== 'en' && !$h.isEmpty($.fn.markdownEditorLocales[lang])) {
                    l = $.fn.markdownEditorLocales[lang] || {};
                }
                opt = $.extend(true, {}, $.fn.markdownEditor.defaults, t, $.fn.markdownEditorLocales.en, l, options, self.data());
                data = new MarkdownEditor(this, opt);
                self.data('markdownEditor', data);
            }

            if (typeof option === 'string') {
                retvals.push(data[option].apply(data, args));
            }
        });
        switch (retvals.length) {
            case 0:
                return this;
            case 1:
                return retvals[0];
            default:
                return retvals;
        }
    };

    $.fn.markdownEditor.defaults = {
        language: 'en',
        theme: null, // default (uses fa5 theme)
        bsVersion: $h.BS4_VER, // default (uses bs4 version)
        defaultMode: 'editor',
        enableUndoRedo: true,
        enableSplitMode: true,
        enableLivePreview: undefined,
        enableScrollSync: true,
        startFullScreen: false,
        enableEmojies: true,
        useTwemoji: false,
        purifyHtml: true, // requires purify.js plugin
        showAlerts: true,
        enableEscKeyFullScreen: true,
        toolbarHeaderL: undefined,
        toolbarHeaderR: undefined,
        toolbarFooterL: undefined,
        toolbarFooterR: undefined,
        exportPrependCssJs: undefined,
        hiddenActions: [],
        dropUp: {
            export: true
        },
        parserUrl: $h.EMPTY,
        parserMethod: undefined,
        ajaxSettings: {},
        ajaxMergeCallbacks: true,
        markdownItOptions: {
            html: false,
            xhtmlOut: true,
            breaks: true,
            linkify: true,
            typographer: true,
            highlight: function (code) {
                return window.hljs ? window.hljs.highlightAuto(code).value : code;
            }
        },
        markdownItDisabledRules: [],
        markdownItPlugins: {
            markdownitDeflist: {},
            markdownitFootnote: {},
            markdownitAbbr: {},
            markdownitEmoji: {},
            markdownitSub: {},
            markdownitSup: {},
            markdownitMark: {},
            markdownitIns: {},
            markdownitSmartArrows: {},
            markdownitCheckbox: {
                divWrap: true,
                divClass: 'form-check checkbox',
                idPrefix: 'cbx_'
            },
            markdownitCjkBreaks: {}
        },
        exportUrl: $h.EMPTY,
        exportUrlMethod: 'post',
        exportUrlAddlData: $h.EMPTY,
        today: $h.EMPTY,
        alertFadeDuration: 2000,
        outputParseTimeout: 1800000,
        exportConfig: $defaults.exportConfig,
        // following properties are generally theme related
        templates: {},
        inputCss: 'md-input',
        alertMsgCss: 'alert alert-danger',
        defaultButtonCss: 'btn btn-default btn-outline-secondary',
        defaultButtonGroupCss: 'btn-group md-btn-group',
        previewModeButtons: ['hint', 'fullscreen', 'mode', 'export'],
        buttonCss: {},
        buttonGroupCss: {},
        buttonAccessKeys: {},
        dropdownCss: {},
        icons: {},
        postProcess: {
            '<table>': '<table class="table table-bordered table-striped">',
            '<pre>': '<pre class="md-codeblock">',
            '<blockquote>': '<blockquote class="blockquote md-blockquote">',
            '<input type="checkbox"': '<input type="checkbox" class="form-check-input"',
            '<label for="cbx': '<label class="form-check-label" for="cbx'
        }
    };

    $.fn.markdownEditorLocales.en = {
        ajaxParserErrorMsg: 'Error parsing markdown text. Please try again later.',
        ajaxParserProgressMsg: 'Parsing markdown text ...',
        noDataMsg: 'No valid source data found!',
        exportFileName: 'export',
        buttonTitles: {},
        buttonLabels: {},
        buttonPrompts: {},
        buttonActions: {},
        templates: {},
        dialogCancelText: 'Cancel',
        dialogSubmitText: 'Submit',
        previewErrorTitle: 'Preview Error',
        previewModeTitle: 'Preview Mode',
        previewProgressMsg: 'Generating preview ...',
        noPreviewUrlMsg: 'Markdown preview processor unavailable. Please contact the system administrator.',
        noExportUrlMsg: 'Export processor unavailable. Please contact the system administrator.',
        emojiSearchHint: 'Search emojis ...',
        loadingMsg: 'Loading ...'
    };

    $.fn.markdownEditor.Constructor = MarkdownEditor;

    /**
     * Convert automatically textarea inputs with class 'markdown' into a bootstrap markdownEditor control.
     */
    $(document).ready(function () {
        var $input = $('textarea.markdown');
        if ($input.length) {
            $input.markdownEditor();
        }
    });
}));