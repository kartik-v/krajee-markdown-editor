/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2016
 * @package bootstrap-markdown-editor
 * @version 1.0.0
 *
 * A Boostrap styled markdown editor that offers live preview, export, full screen mode, and more features. Can support
 * any markdown parser via javascript library / method or even a server based parser via an ajax action. The editor by
 * default is built to support CommonMark spec parsing using [markdown-it JS based parser](https://markdown-it.github.io/).
 * Other markdown parsers are configurable (both as a server call OR a local JS method/library). In addition, the plugin
 * allows custom button actions and properties to be setup.
 * 
 * Author: Kartik Visweswaran
 * Copyright: 2015, Kartik Visweswaran, Krajee.com
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) { // jshint ignore:line
        // AMD. Register as an anonymous module.
        define(['jquery'], factory); // jshint ignore:line
    } else { // noinspection JSUnresolvedVariable
        if (typeof module === 'object' && module.exports) { // jshint ignore:line
            // Node/CommonJS
            // noinspection JSUnresolvedVariable
            module.exports = factory(require('jquery')); // jshint ignore:line
        } else {
            // Browser globals
            factory(window.jQuery);
        }
    }
}(function ($) {
    "use strict";

    $.fn.markdownEditorLocales = {};

    var CREDITS, CREDITS_MD, EMPTY, NAMESPACE, events, T_MAIN, T_HEADER, T_PREVIEW, T_FOOTER, T_DIALOG, T_EXP_HEADER,
        T_EXP_CSS, T_HTM_META, T_PREPEND_CSS, DEFAULT_HINT, getEl, addCss, uniqueId, isEmpty, defaultButtonIcons,
        defaultButtonTitles, defaultButtonAccessKeys, defaultButtonLabels, defaultButtonPrompts, defaultButtonActions,
        defaultExportConfig, htmlEncode, parseHtml, isNumber, trimRight, getMarkUp, getBlockMarkUp, setSelectionRange,
        kvUnescape, handler, delay, UndoStack, UndoCommand, MarkdownEditor;

    CREDITS = '<a class="text-info" href="http://plugins.krajee.com/markdown-editor">bootstrap-markdown-editor</a>';
    CREDITS_MD = '[bootstrap-markdown-editor](http://plugins.krajee.com/markdown-editor)';
    EMPTY = '';
    NAMESPACE = '.markdownEditor';
    events = {
        click: 'click' + NAMESPACE,
        input: 'input' + NAMESPACE,
        change: 'change' + NAMESPACE,
        focus: 'focus' + NAMESPACE,
        blur: 'blur' + NAMESPACE,
        keyup: 'keyup' + NAMESPACE,
        keydown: 'keydown' + NAMESPACE,
        resize: 'resize' + NAMESPACE,
        reset: 'reset' + NAMESPACE,
        scroll: 'scroll' + NAMESPACE,
        touchstart: 'touchstart' + NAMESPACE,
        mouseover: 'mouseover' + NAMESPACE,
        modalShown: 'shown.bs.modal' + NAMESPACE,
        modalHidden: 'hidden.bs.modal' + NAMESPACE,
        buttonPress: 'buttonPress' + NAMESPACE,
        beforePreview: 'beforePreview' + NAMESPACE,
        successPreview: 'successPreview' + NAMESPACE,
        emptyPreview: 'emptyPreview' + NAMESPACE,
        errorPreview: 'errorPreview' + NAMESPACE
    };
    T_MAIN = '<div class="md-editor" tabindex="0">' +
        '{header}' +
        '<table class="md-input-preview"><tr>' +
        '<td class="md-input-cell">{input}</td>' +
        '<td class="md-preview-cell">{preview}</td>' +
        '</tr></table>' +
        '{footer}' +
        '{dialog}' +
        '</div>';
    T_HEADER =
        '<div class="md-header">' +
        '<div class="md-toolbar-header-r btn-toolbar pull-right">' +
        '{toolbarHeaderR}' +
        '</div>' +
        '<div class="md-toolbar-header-l btn-toolbar">' +
        '{toolbarHeaderL}' +
        '</div>' +
        '<div class="clearfix">' +
        '</div>' +
        '</div>';
    T_PREVIEW =
        '<div class="md-preview" tabindex="0">' +
        '</div>';
    T_FOOTER =
        '<div class="md-footer">' +
        '<div class="md-toolbar-footer-r btn-toolbar pull-right">' +
        '{toolbarFooterR}' +
        '</div>' +
        '<div class="md-toolbar-footer-l btn-toolbar">' +
        '{toolbarFooterL}' +
        '</div>' +
        '<div class="clearfix">' +
        '</div>' +
        '</div>';
    T_DIALOG =
        '<div class="md-dialog modal fade" tabindex="-1" role="dialog">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '<h4 class="md-dialog-title modal-title"></h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<input class="md-dialog-input form-control">' +
        '<div class="md-dialog-content"></div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="md-dialog-cancel btn btn-default" data-dismiss="modal">' +
        '<i class="fa fa-remove"></i> ' +
        '</button>' +
        '<button type="button" class="md-dialog-ok btn btn-primary" data-dismiss="modal">' +
        '<i class="fa fa-check"></i> ' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    T_EXP_HEADER =
        '> - - -\n' +
        '> Markdown Export\n' +
        '> ===============\n' +
        '> *Generated {today} by {credits}*\n' +
        '> - - -\n\n';
    T_HTM_META =
        '<!DOCTYPE html>' +
        '<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>' +
        '<meta http-equiv="X-UA-Compatible" content="IE=edge;chrome=1"/>';
    T_EXP_CSS =
        '{exportPrependCssJs}' +
        '<style>' +
        'body{margin:20px;padding:20px;border:1px solid #ddd;border-radius:5px;}' +
        'th[align="right"]{text-align:right!important;}' +
        'th[align="center"]{text-align:center!important;}' +
        '</style>';
    T_PREPEND_CSS = '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">';
    DEFAULT_HINT = '<ul><li><p>You may follow the ' +
        '<a href="http://spec.commonmark.org/" target="_blank">CommonMark spec</a> and ' + '<a href="' +
        'https://github.com/markdown-it/markdown-it">markdown-it</a> syntax for writing your markdown text.</p></li>' +
        '<li><p>In order to use the formatting buttons on the toolbar, you typically need to highlight a text ' +
        'within the editor on which the formatting is to be applied. You can also undo the format action on the ' +
        'highlighted text by clicking the button again (for most buttons).</p></li>' +
        '<li><p>Keyboard access shortcuts for buttons:</p>' +
        '{accessKeys}' +
        '</li>' +
        '</ul>';
    defaultButtonIcons = {
        undo: 'undo',
        redo: 'repeat',
        bold: 'bold',
        italic: 'italic',
        ins: 'underline',
        del: 'strikethrough',
        sup: 'superscript',
        sub: 'subscript',
        mark: 'eraser',
        paragraph: 'paragraph',
        newline: 'text-height',
        heading: 'header',
        link: 'link',
        image: 'picture-o',
        indent: 'indent',
        outdent: 'outdent',
        ul: 'list-ul',
        ol: 'list-ol',
        dl: 'th-list',
        footnote: 'sticky-note-o',
        blockquote: 'quote-right',
        code: 'code',
        codeblock: 'file-code-o',
        hr: 'minus',
        emoji: 'smile-o',
        fullscreen: 'arrows-alt',
        hint: 'question-circle',
        modePreview: 'search',
        modeEditor: 'edit',
        modeSplit: 'arrows-h',
        export: 'download',
        exportHtml: 'file-text',
        exportText: 'file-text-o'
    };
    defaultButtonAccessKeys = {
        undo: 'z',
        redo: 'y',
        bold: '[',
        italic: ']',
        ins: '+',
        del: 'x',
        sup: '~',
        sub: '^',
        mark: '=',
        paragraph: 'p',
        newline: '0',
        heading1: '1',
        heading2: '2',
        heading3: '3',
        heading4: '4',
        heading5: '5',
        heading6: '6',
        link: 'l',
        image: 'p',
        indent: 'i',
        outdent: 'o',
        ul: 'u',
        ol: 'v',
        dl: 'w',
        footnote: 'n',
        blockquote: 'q',
        code: 'c',
        codeblock: 'b',
        hr: '-',
        emoji: '`',
        fullscreen: '.',
        hint: '?',
        modeEditor: '(',
        modePreview: ')',
        modeSplit: '_',
        exportHtml: 'h',
        exportText: 't'
    };
    defaultButtonTitles = {
        undo: 'Undo',
        redo: 'Redo',
        bold: 'Bold',
        italic: 'Italic',
        ins: 'Inserted Text',
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
    };
    defaultButtonLabels = {
        export: 'Export',
        exportHtml: 'HTML',
        exportText: 'Text'
    };
    defaultButtonPrompts = {
        link: {
            title: 'Insert Hyperlink',
            placeholder: 'http://'
        },
        image: {
            title: 'Insert Image Link',
            placeholder: 'http://'
        },
        ol: {
            title: 'Ordered List Starting Number',
            placeholder: 'Integer starting from 1'
        },
        codeblock: {
            title: 'Enter code language',
            placeholder: 'e.g. html, php, js'
        }
    };
    defaultButtonActions = {
        bold: {before: '**', after: '**', default: '**(bold text here)**'},
        italic: {before: '_', after: '_', default: '_(italic text here)_'},
        ins: {before: '++', after: '++', default: '_(inserted text here)_'},
        del: {before: '~~', after: '~~', default: '_(strikethrough text here)_'},
        mark: {before: '==', after: '==', default: '_(marked text here)_'},
        sup: {before: '^', after: '^', default: '_(superscript text here)_'},
        sub: {before: '~', after: '~', default: '_(subscript text here)_'},
        paragraph: {before: '\n', after: '\n', default: '\n(paragraph text here)\n', inline: true},
        newline: {before: EMPTY, after: '  '},
        heading1: {before: '# ', default: '# (heading 1 text here)', inline: true},
        heading2: {before: '## ', default: '## (heading 2 text here)', inline: true},
        heading3: {before: '### ', default: '### (heading 3 text here)', inline: true},
        heading4: {before: '#### ', default: '#### (heading 4 text here)', inline: true},
        heading5: {before: '##### ', default: '##### (heading 5 text here)', inline: true},
        heading6: {before: '###### ', default: '###### (heading 6 text here)', inline: true},
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
            return function (link) {
                if (!isEmpty(link)) {
                    if (link.substring(0, 6) !== 'ftp://' && link.substring(0,
                            7) !== 'http://' && link.substring(0, 8) !== 'https://') {
                        link = 'http://' + link;
                    }
                    str = '[' + str + '](' + link + ')';
                }
                return str;
            };
        },
        image: function (str) {
            return function (link) {
                if (!isEmpty(link)) {
                    if (link.substring(0, 6) !== 'ftp://' && link.substring(0,
                            7) !== 'http://' && link.substring(0, 8) !== 'https://') {
                        link = 'http://' + link;
                    }
                    str = '![' + str + '](' + link + ')';
                }
                return str;
            };
        },
        ul: {before: '- ', after: EMPTY},
        ol: function (str) {
            var i, list;
            return function (start) {
                if (!isEmpty(start)) {
                    if (!isNumber(start)) {
                        start = 1;
                    }
                    if (str.indexOf('\n') < 0) {
                        str = getMarkUp(str, start + '. ', EMPTY);
                    } else {
                        i = parseInt(start);
                        list = str.split('\n');
                        $.each(list, function (k, v) {
                            list[k] = getMarkUp(v, i + '. ', EMPTY);
                            i++;
                        });
                        str = list.join('\n');
                    }
                    return str;
                }
                return EMPTY;
            };
        },
        dl: function (str) {
            var i, j, list;
            if (str.indexOf('\n') > 0) {
                i = 1;
                list = str.split('\n');
                $.each(list, function (k, v) {
                    j = (i % 2 === 0) ? ':    ' : EMPTY;
                    list[k] = getMarkUp(v, j, EMPTY);
                    i++;
                });
                str = list.join('\n');
            } else {
                str = str + "\n:    \n";
            }
            return str;
        },
        footnote: function (str) {
            var i, tag, list, title = 'Enter footnote ', notes = EMPTY;
            if (str.indexOf('\n') < 0) {
                notes = '[^1]: ' + title + '1\n';
                str = getMarkUp(str, EMPTY, title + '[^1]') + "\n" + notes;
            } else {
                i = 1;
                list = str.split('\n');
                $.each(list, function (k, v) {
                    tag = '[^' + i + ']';
                    list[k] = getMarkUp(v, EMPTY, tag + '  ');
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
                if (isEmpty(lang, true)) {
                    lang = EMPTY;
                }
                return getMarkUp(str, "~~~" + lang + " \n", "\n~~~  \n");
            };
        },
        hr: {before: EMPTY, after: '\n- - -', inline: true}
    };
    defaultExportConfig = {
        exportText: {ext: 'txt', uri: 'data:text/plain;base64,'},
        exportHtml: {ext: 'htm', uri: 'data:text/html;base64,'}
    };
    htmlEncode = function (str) {
        return str === undefined ? '' : str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    parseHtml = function (data) {
        return data === undefined ? '' : kvUnescape(encodeURIComponent(data));
    };
    getEl = function (tag) {
        return $(document.createElement(tag));
    };
    addCss = function ($el, css) {
        if (css) {
            $el.removeClass(css).addClass(css);
        }
    };
    uniqueId = function () {
        return Math.round(new Date().getTime() + (Math.random() * 100));
    };
    isEmpty = function (value, trim) {
        return value === null || value === undefined || value.length === 0 || trim && $.trim(value) === EMPTY;
    };
    isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    trimRight = function (str, charlist) {
        if (charlist === undefined) {
            charlist = "\s";
        }
        return str.replace(new RegExp("[" + charlist + "]+$"), "");
    };
    getMarkUp = function (txt, begin, end) {
        var m = begin.length, n = end.length, str = txt;
        if (m > 0) {
            str = (str.slice(0, m) === begin) ? str.slice(m) : begin + str;
        }
        if (n > 0) {
            str = (str.slice(-n) === end) ? str.slice(0, -n) : str + end;
        }
        return str;
    };
    getBlockMarkUp = function (txt, begin, end) {
        var str = txt, list = [];
        if (str.indexOf('\n') < 0) {
            str = getMarkUp(txt, begin, end);
        } else {
            list = txt.split('\n');
            $.each(list, function (k, v) {
                list[k] = getMarkUp(trimRight(v), begin, end + '  ');
            });
            str = list.join('\n');
        }
        return str;
    };
    setSelectionRange = function (input, selectionStart, selectionEnd) {
        var scrollPre, style;
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
            input.scrollTop = 0;
            if (selectionStart > 100) {
                scrollPre = document.createElement('pre');
                input.parentNode.appendChild(scrollPre);
                style = window.getComputedStyle(input, '');
                scrollPre.style.visibility = 'hidden';
                scrollPre.style.lineHeight = style.lineHeight;
                scrollPre.style.fontFamily = style.fontFamily;
                scrollPre.style.fontSize = style.fontSize;
                scrollPre.style.padding = 0;
                scrollPre.style.border = style.border;
                scrollPre.style.outline = style.outline;
                scrollPre.style.overflow = 'scroll';
                scrollPre.style.letterSpacing = style.letterSpacing;
                try { scrollPre.style.whiteSpace = "-moz-pre-wrap"; } catch (e) {}
                try { scrollPre.style.whiteSpace = "-o-pre-wrap"; } catch (e) {}
                try { scrollPre.style.whiteSpace = "-pre-wrap"; } catch (e) {}
                try { scrollPre.style.whiteSpace = "pre-wrap"; } catch (e) {}
                scrollPre.textContent = $(input).val().substring(0, selectionStart - 100);
                input.scrollTop = scrollPre.scrollHeight;
                scrollPre.parentNode.removeChild(scrollPre);
            }
        } else {
            if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        }
    };
    kvUnescape = function (s) {
        return s.replace(/%([0-9A-F]{2})/ig, function (x, n) {
            return String.fromCharCode(parseInt(n, 16));
        });
    };
    handler = function (event, callback) {
        if (event && event.isDefaultPrevented()) {
            return;
        }
        callback();
    };
    delay = (function () {
        var timer = 0;
        return function (callback, duration) {
            clearTimeout(timer);
            timer = setTimeout(callback, duration || 250);
        };
    })();
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
            setSelectionRange(el, self.oldPos[0], self.oldPos[1]);
        },
        redo: function () {
            var self = this, $el = self.textarea, el = $el[0];
            $el.val(self.newValue);
            setSelectionRange(el, self.newPos[0], self.newPos[1]);
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
            if (!$el.attr('id')) {
                $el.attr('id', uniqueId());
            }
            self.$form = self.initForm();
            self.$element.attr('rows', self.rows);
            self.buttonIcons = $.extend(true, {}, defaultButtonIcons, self.buttonIcons);
            self.buttonTitles = $.extend(true, {}, defaultButtonTitles, self.buttonTitles);
            self.buttonLabels = $.extend(true, {}, defaultButtonLabels, self.buttonLabels);
            self.buttonPrompts = $.extend(true, {}, defaultButtonPrompts, self.buttonPrompts);
            self.buttonAccessKeys = $.extend(true, {}, defaultButtonAccessKeys, self.buttonAccessKeys);
            self.buttonActions = $.extend(true, {}, defaultButtonActions, self.buttonActions);
            console.log(self.buttonActions);
            self.exportConfig = $.extend(true, {}, defaultExportConfig, self.exportConfig);
            self.defaultInputHeight = self.$element.height();
            if (isEmpty(self.parserUrl) && self.parserMethod === undefined && window.markdownit) {
                self.parserMethod = function (data) {
                    var md = window.markdownit(self.markdownItOptions);
                    if (!isEmpty(self.markdownItDisabledRules)) {
                        md.disable(self.markdownItDisabledRules);
                    }
                    $.each(self.markdownItPlugins, function (plugin, opts) {
                        md.use(window[plugin], opts);
                    });
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
            if (self.enableSplitMode && self.enableLivePreview === undefined) {
                self.enableLivePreview = true;
            }
            self.render();
            self.$preview.height(self.defaultInputHeight);
            if (self.startFullScreen) {
                self.toggleFullScreen();
            }
            self.reset();
            self.listen();
        },
        handleEvent: function ($element, event, method) {
            var self = this;
            $element.off(event).on(event, $.proxy(self[method], self));
        },
        listen: function () {
            var self = this, $cont = self.$container, $el = self.$element, $preview = self.$preview,
                $form = $el.closest('form'), eResize = events.resize, eReset = events.reset, eKeyup = events.keyup,
                eBtnPress = events.buttonPress, eFocus = events.focus, eBlur = events.blur, eChange = events.change,
                eClick = events.click, eTouchMouse = events.touchstart + ' ' + events.mouseover,
                $search = self.$editor.find('.md-emoji-search'), eKeydown = events.keydown;
            self.parseButtons();
            $cont.find('.dropdown-toggle').dropdown();
            self.handleEvent(self.$dialogInput, eKeydown, 'keydownDialog');
            self.handleEvent($el, eFocus, 'focus');
            self.handleEvent($preview, eFocus, 'focus');
            self.handleEvent($el, eBlur, 'blur');
            self.handleEvent($preview, eBlur, 'blur');
            self.handleEvent(self.$editor, eFocus, 'focusContainer');
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
            self.handleEvent(self.$modeInput, eChange, 'modeChange');
            if ($search.length) {
                self.handleEvent($search.find('input'), eKeyup, 'emojiSearch');
                self.handleEvent($search.find('.md-close'), eClick, 'emojiSearchClose');
            }
        },
        resizeWindow: function (event) {
            var self = this, $msg, w, $cont = self.$container, $preview = self.$preview;
            handler(event, function () {
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
            handler(event, function () {
                delay(function () {
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
            handler(event, function () {
                event.stopPropagation();
                $search.closest('ul').find('li').show();
                $search.find('input').val('');
            });
        },
        focusContainer: function (event) {
            var self = this;
            handler(event, function () {
                self.$element.focus();
            });
        },
        focus: function (event) {
            var self = this;
            handler(event, function () {
                addCss(self.$editor, 'active');
            });
        },
        blur: function (event) {
            var self = this;
            handler(event, function () {
                self.$editor.removeClass('active');
            });
        },
        clickButton: function (event, $btn) {
            var self = this, ttl, key = $btn.data('key'), txt, isHeading = $btn.hasClass('md-btn-heading'),
                isExport = $btn.hasClass('md-btn-export'), isEmoji = $btn.hasClass('md-btn-emoji');
            handler(event, function () {
                if (isHeading || isExport || isEmoji) {
                    event.preventDefault();
                    if (isExport) {
                        self.export(key);
                        return;
                    }
                    if (isEmoji) {
                        self.replaceSelected(':' + key + ':');
                        return;
                    }
                }
                switch (key) {
                    case 'fullscreen':
                        self.toggleFullScreen();
                        break;
                    case 'hint':
                        ttl = self.getTitle(key) + ' <small>' + CREDITS + '</small>';
                        self.showPopup(ttl, self.renderHint());
                        break;
                    default:
                        txt = self.process(key);
                        if (!isEmpty(txt)) {
                            self.replaceSelected(txt);
                        }
                }
            });
        },
        modeChange: function (event) {
            var self = this, val;
            handler(event, function () {
                val = self.$mode.find('input:radio[name="mdMode"]:checked').val() || 'modeEditor';
                self.toggleMode(val);
                self.currentMode = val.substr(4).toLowerCase();
            });
        },
        reset: function (event) {
            var self = this, $el = self.$element, el = $el[0];
            handler(event, function () {
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
            if (!self.enableUndoRedo) {
                return;
            }
            handler(event, function () {
                self.undoStack.undo();
                self.scrollMap = null;
                if (self.enableLivePreview) {
                    self.generatePreview();
                }
            });
        },
        redo: function (event) {
            var self = this;
            if (!self.enableUndoRedo) {
                return;
            }
            handler(event, function () {
                self.undoStack.redo();
                self.scrollMap = null;
                if (self.enableLivePreview) {
                    self.generatePreview();
                }
            });
        },
        keyup: function (event) {
            var self = this, $el = self.$element, el = $el[0], stack = self.undoStack;
            handler(event, function () {
                if (self.enableLivePreview && self.$preview.is(':visible')) {
                    delay(self.generatePreview());
                }
                if (self.enableUndoRedo) {
                    delay(function () {
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
            handler(event, function () {
                if (event.keyCode === 13) {
                    self.$dialogOk.trigger('click');
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        },
        buttonPress: function (event, oldPos, newPos) {
            var self = this, $el = self.$element, newValue;
            handler(event, function () {
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
            var self = this, $el = self.$element, $preview = self.$preview, eScroll = events.scroll;
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
            handler(event, function () {
                self._mouseover(event, 'editor');
            });
        },
        mouseoverPreview: function (event) {
            var self = this;
            handler(event, function () {
                self._mouseover(event, 'preview');
            });
        },
        buildScrollMap: function () {
            var self = this, i, offset, pos, a, b, linesCount, $el = self.$element, $elCopy, $preview = self.$preview,
                acc = 0, lineHeightMap = [], nonEmptyList = [], _scrollMap = [];
            if (!self.enableScrollSync) {
                return '';
            }
            $elCopy = getEl('div').css({
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
                if (t === '') { return; }
                t = lineHeightMap[t];
                if (t !== 0) { nonEmptyList.push(t); }
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
            var self = this, $cont = self.$container, eClick = events.click;
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
            var self = this, $el = self.$element, val = $el.val(), el = $el[0], fm = el.selectionStart, len = txt.length,
                to = el.selectionEnd, out = val.substring(0, fm) + txt + val.substring(to), newPos = fm + len;
            $el.val(out).trigger(events.buttonPress, [[fm, to], [fm, newPos]]);
            setSelectionRange(el, fm, newPos);
        },
        destroy: function () {
            var self = this, $el = self.$element, $cont = self.$container, css = self.inputCss;
            $el.insertBefore($cont).off(NAMESPACE);
            $(window).off(NAMESPACE);
            if (css) {
                $el.removeClass(css).show();
            }
            $cont.remove();
        },
        getLayout: function (template) {
            return this.templates[template] || EMPTY;
        },
        initForm: function () {
            var self = this, $form = $('#' + self.exportFormId), $filetype, $filename, $content;
            if (!self.exportFormId || !$form.length) {
                $form = getEl('form');
            }
            $form.attr({action: self.exportUrl, method: 'post', target: '_blank'});
            $filetype = getEl('input').attr({type: 'hidden', name: 'export_type'});
            $filename = getEl('input').attr({type: 'hidden', name: 'export_filename', value: self.exportFileName});
            $content = getEl('textarea').attr({name: 'export_content'}).val(self.noDataMsg);
            return $form.append($filetype, $filename, $content).hide();
        },
        showPopup: function (title, content) {
            var self = this, ev = events.modalShown;
            self.$dialogTitle.html(title);
            self.$dialogContent.html(content).show();
            self.$dialogInput.hide();
            self.$dialogClose.show();
            self.$dialogHeader.show();
            self.$dialogFooter.hide();
            self.$dialogOk.off(events.click);
            self.$dialog.modal('show');
            self.$dialog.off(ev).on(ev, function () {
                self.$dialogClose.focus();
                self.$dialog.off(ev);
            });
        },
        showDialog: function (key, callback) {
            var self = this, prompts = self.buttonPrompts[key], ttl = (prompts.title || EMPTY), str,
                icon = self.renderIcon(key), plc = prompts.placeholder || EMPTY, ev = events.modalShown;
            self.$dialogTitle.html(icon ? icon + ' ' + ttl : ttl);
            self.$dialogContent.hide();
            self.$dialogClose.show();
            self.$dialogHeader.show();
            self.$dialogFooter.show();
            self.$dialogInput.show().val(EMPTY).attr('placeholder', plc);
            self.$dialogOk.off(events.click).on(events.click, function () {
                str = callback(self.$dialogInput.val());
                if (!isEmpty(str)) {
                    self.replaceSelected(str);
                }
            });
            self.$dialog.modal('show');
            self.$dialog.off(ev).on(ev, function () {
                self.$dialogInput.focus();
                self.$dialog.off(ev);
            });
        },
        raise: function (event, params, $el) {
            var self = this, ev = $.Event(event + NAMESPACE);
            $el = $el || self.$element;
            if (params) {
                $el.trigger(ev, params);
            } else {
                $el.trigger(ev);
            }
            return !ev.isDefaultPrevented();
        },
        showPreviewMsg: function (msg) {
            var self = this, $preview = self.$preview, alert = self.getAlert(msg, self.previewErrorTitle);
            $preview.html('<div class="md-preview-message">' + alert + '</div>');
            $preview.find('.md-preview-message').width(0.5 * $preview.width());
            $preview.find('.md-alert').hide().fadeIn('slow');
        },
        disableButton: function ($btn, attr) {
            $btn.attr('disabled', (attr || false));
        },
        hasInvalidConfig: function (type) {
            var self = this, urlProp = self[type + 'Url'], methodProp = self[type + 'Method'], noUrl = isEmpty(urlProp),
                noMethod = isEmpty(methodProp), methodType = typeof methodProp;
            if (type === 'export' && self.enableExportDataUri) {
                return false;
            }
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
                            data = data.split(key).join(val);
                        });
                    }
                }
            }
            return data;
        },
        generatePreview: function (val, ignorePreviewUpdate) {
            var self = this, $el = self.$element, $preview = self.$preview, url = self.parserUrl,
                parser = self.parserMethod, progress = self.getProgress(self.previewProgressMsg);
            if (val === undefined) {
                val = $el.val();
            }
            if (!isEmpty(url)) {
                $.ajax({
                    type: "POST",
                    url: url,
                    dataType: "json",
                    data: {source: val},
                    beforeSend: function (jQXhr) {
                        if (self.raise('beforePreview', [jQXhr])) {
                            $preview.html(progress);
                        }
                    },
                    success: function (data, textStatus, jQXhr) {
                        var isValid = !isEmpty(data, true);
                        if (isValid && self.raise('successPreview', [data, textStatus, jQXhr])) {
                            data = self.parseOutput(data);
                            $preview.html(data);
                        }
                        if (!isValid && self.raise('emptyPreview', [data, textStatus, jQXhr])) {
                            self.showPreviewMsg(self.emptyPreviewMsg);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (self.raise('errorPreview', [jqXHR, textStatus, errorThrown])) {
                            self.showPreviewMsg(self.errorPreviewMsg);
                        }
                    }
                });
                return null;
            }
            val = typeof parser === "function" ? parser(val) : new parser(val); // jshint ignore:line
            val = self.parseOutput(val);
            if (!ignorePreviewUpdate) {
                $preview.html(val);
            } else {
                return val;
            }
        },
        output: function () {
            var self = this, $el = self.$element, $preview = self.$preview, val = $el.val(), isLoad = true, elapsed = 0,
                out, eSuccess = events.successPreview, eEmptyError = events.emptyPreview + ' ' + events.errorPreview;
            if (isEmpty(val) || self.hasInvalidConfig('parser')) {
                return EMPTY;
            }
            out = self.generatePreview(val, true);
            if (isEmpty(self.parserUrl)) {
                return out;
            }
            while (isLoad && elapsed < self.outputParseTimeout) {
                delay(function () {
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
            var self = this, $el = self.$element, val = $el.val(), $cont = self.$container,
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
            if (isEmpty(val) || self.hasInvalidConfig('parser')) {
                self.showPopupAlert(self.getTitle('mode'), isEmpty(val) ? self.noDataMsg : self.noPreviewUrlMsg);
                return;
            }
            $cont.removeClass('md-only-preview');
            $tbl.removeClass('md-editor-mode md-preview-mode md-split-mode');
            switch (mode) {
                case 'modeEditor':
                    addCss($tbl, 'md-editor-mode');
                    break;
                case 'modePreview':
                    addCss($tbl, 'md-preview-mode');
                    addCss($cont, 'md-only-preview');
                    initPreview();
                    break;
                case 'modeSplit':
                    addCss($tbl, 'md-split-mode');
                    initPreview();
                    break;
            }
        },
        toggleFullScreen: function () {
            var self = this, $cont = self.$container, $el = self.$element, $preview = self.$preview;
            if ($cont.hasClass('md-fullscreen-overlay')) {
                $cont.removeClass('md-fullscreen-overlay');
                $el.height(self.defaultInputHeight);
                $preview.height(self.defaultInputHeight);
            } else {
                $cont.addClass('md-fullscreen-overlay');
                self.resizeFullScreen();
            }
            if (!$preview.is(':visible')) {
                $el.focus();
            } else {
                $preview.focus();
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
                action = self.buttonActions[key];
            $el.focus();
            if (key === 'undo' || key === 'redo') {
                return '';
            }
            if (!action) {
                return EMPTY;
            }
            if (typeof action === "function") {
                out = action(str);
                if (typeof out === "function") {
                    self.showDialog(key, out);
                    return EMPTY;
                }
                return out;
            }
            if (typeof action === "object" && (action.before !== undefined || action.after !== undefined)) {
                bef = isEmpty(action.before) ? EMPTY : action.before;
                aft = isEmpty(action.after) ? EMPTY : action.after;
                def = action.default;
                out = action.inline ? getMarkUp(str, bef, aft) : getBlockMarkUp(str, bef, aft);
                return def ? (len > 0 ? out : def) : out;
            }
            return EMPTY;
        },
        download: function (key, content) {
            var self = this, $form = self.$form, config = self.exportConfig[key], $a = getEl('a'),
                ext = config.ext || '', uri = config.uri || '';
            if (!isEmpty(self.exportUrl)) {
                $form.find('[name="export_type"]').val(ext);
                $form.find('[name="export_content"]').val(content);
                $form.submit();
                return;
            }
            uri = uri + window.btoa(content);
            $a.attr({
                'href': uri,
                'target': '_blank',
                'download': self.getFileName(key)
            }).insertAfter($form);
            $a[0].click();
            $a.remove();
        },
        getLabel: function (key) {
            var self = this;
            return self.renderIcon(key) + ' ' + (self.buttonLabels[key] || EMPTY);
        },
        getTitle: function (key) {
            var self = this;
            return self.renderIcon(key) + ' ' + (self.buttonTitles[key] || EMPTY);
        },
        getProgress: function (msg) {
            return '<div class="md-loading">' + msg + '</div>';
        },
        getAlert: function (msg, head, hideIcon) {
            var self = this;
            head = head ? '<h4>' + (hideIcon ? '' : self.alertMsgIcon) + head + '</h4>' : '';
            return '<div class="' + self.alertMsgCss + ' md-alert">' + head + msg + '</div>';
        },
        showPopupAlert: function (heading, content) {
            var self = this, $body = self.$dialog.find('.modal-body'), time = self.alertFadeDuration,
                evS = events.modalShown, evH = events.modalHidden;
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

        },
        getHtmlContent: function (data) {
            var self = this, preCss = self.exportPrependCssJs;
            return '<html><head>' + self.getLayout('htmlMeta') +
                self.getLayout('exportCssJs').replace('{exportPrependCssJs}', preCss) + '</head>' + '<body>' +
                data + '</body></html>';
        },
        export: function (key) {
            var self = this, source = self.$element.val(), tTxt = self.getTitle('exportText'), out,
                tHtm = self.getTitle('exportHtml'), noDataMsg = self.noDataMsg, errorMsg = self.exportErrorMsg,
                noUrlMsg = self.noExportUrlMsg, today = self.today || new Date();
            if (isEmpty(source) || self.hasInvalidConfig('parser') || self.hasInvalidConfig('export')) {
                self.showPopupAlert(key === 'exportText' ? tTxt : tHtm, isEmpty(source) ? noDataMsg : noUrlMsg);
                return;
            }
            source = self.getLayout('exportHeader').replace('{today}', today).replace('{credits}', CREDITS_MD) + source;
            if (key !== 'exportHtml') {
                self.download('exportText', source);
                return;
            }
            if (isEmpty(self.parserUrl)) {
                out = parseHtml(self.generatePreview(source, true));
                self.download('exportHtml', self.getHtmlContent(out));
                return;
            }
            $.ajax({
                type: "POST",
                url: self.parserUrl,
                dataType: "json",
                data: {source: source},
                beforeSend: function (jQXhr) {
                    if (self.raise('beforeExportHtm', [jQXhr])) {
                        self.showPopup(tHtm, self.getProgress(self.exportProgressMsg));
                    }
                },
                success: function (data, textStatus, jQXhr) {
                    if (self.raise('successExportHtm', [data, textStatus, jQXhr])) {
                        self.$dialog.modal('hide');
                        if (data) {
                            self.download(key, self.getHtmlContent(data));
                        } else {
                            self.showPopupAlert(tHtm, errorMsg);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (self.raise('errorExportHtm', [jqXHR, textStatus, errorThrown])) {
                        self.showPopupAlert(tHtm, errorMsg);
                    }
                }
            });
        },
        renderIcon: function (key) {
            var self = this, icon = key && self.buttonIcons[key] || EMPTY;
            if (icon) {
                return '<span class="' + self.buttonIconCssPrefix + icon + '"></span>';
            }
            return EMPTY;
        },
        render: function () {
            var self = this, $el = self.$element, $container = getEl('div').addClass('md-container'), $temp, out,
                main = self.getLayout('main'), TEMP_CSS = 'md-editor-input-temporary', $form, $target,
                contId = $el.attr('id') + '-container', theme = self.theme || 'krajee';
            if (!main) {
                return EMPTY;
            }
            addCss($container, 'md-' + theme);
            out = main.replace('{input}', '<div class="' + TEMP_CSS + '"></div>')
                .replace('{header}', self.renderHeader())
                .replace('{footer}', self.renderFooter())
                .replace('{preview}', self.getLayout('preview'))
                .replace('{dialog}', self.getLayout('dialog'));
            $container.attr('id', contId).insertBefore($el).html(out);
            $temp = $container.find('.' + TEMP_CSS);
            $el.insertBefore($temp);
            addCss($el, self.inputCss);
            $temp.remove();
            self.$container = $container;
            self.$editor = $container.find('.md-editor');
            self.$preview = $container.find('.md-preview');
            self.$btnPreview = $container.find('.md-btn-preview');
            self.$btnUndo = $container.find('.md-btn-undo');
            self.$btnRedo = $container.find('.md-btn-redo');
            self.$dialog = $container.find('.md-dialog');
            self.$dialogTitle = self.$dialog.find('.md-dialog-title');
            self.$dialogInput = self.$dialog.find('.md-dialog-input');
            self.$dialogContent = self.$dialog.find('.md-dialog-content');
            self.$dialogCancel = self.$dialog.find('.md-dialog-cancel').append(self.dialogCancelText);
            self.$dialogOk = self.$dialog.find('.md-dialog-ok').append(self.dialogOkText);
            self.$dialogClose = self.$dialog.find('.close');
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
            addCss(self.$inputPreview, 'md-' + self.defaultMode + '-mode');
            $.each(self.dropUp, function (key, val) {
                if (val) {
                    //noinspection JSValidateTypes
                    $container.find('button[data-key="' + key + '"]').parent().addClass('dropup');
                }
            });
            $form = $el.closest('form');
            $target = $form.length ? $form : $container;
            self.$form.insertAfter($target);
        },
        _toolbar: function (type) {
            var self = this, btns = [];
            $.each(self[type], function (i, row) {
                var btn = $.isArray(row) ? row : [row];
                $.merge(btns, btn);
            });
            return btns;
        },
        getValidButtons: function () {
            var self = this, btns = self._toolbar('toolbarHeaderL');
            $.merge(btns, self._toolbar('toolbarHeaderR'));
            $.merge(btns, self._toolbar('toolbarFooterL'));
            $.merge(btns, self._toolbar('toolbarFooterR'));
            return btns;
        },
        renderHint: function () {
            var self = this, txt = self.hintText, keys, icon, ttl, i, isHeading, css, tag = '{accessKeys}', btns;
            if (txt.indexOf(tag) === -1) {
                return txt;
            }
            keys = '<div class="md-hint-access-keys"><ul>';
            btns = self.getValidButtons();
            $.each(self.buttonAccessKeys, function (btn, key) {
                isHeading = btn.length === 8 && btn.substring(0, 7) === 'heading';
                if (btns.indexOf(btn) === -1 && !isHeading && btn.substring(0, 4) !== 'mode' &&
                    btn.substring(0, 6) !== 'export') {
                    return;
                }
                if (isHeading) {
                    i = btn.substring(7);
                    icon = self.renderIcon('heading') + i;
                    ttl = self.buttonTitles.heading + ' ' + i;
                } else {
                    icon = self.renderIcon(btn);
                    ttl = self.buttonTitles[btn];
                }
                css = self.buttonCss[btn] || self.defaultButtonCss;
                keys += '<li title="' + ttl + '"><p>' + '<span class="' + css + '">' + icon +
                    '</span></p><p><kbd>ALT</kbd> + <code>' + key + '</code></p></li>';
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
            var self = this, tag = '{' + type + '}', out = EMPTY;
            if (layout.indexOf(tag) === -1) {
                return layout;
            }
            $.each(self[type], function (k, v) {
                if (!$.isArray(v)) {
                    v = [v];
                }
                out += '<div class="btn-group" role="group">\n';
                $.each(v, function (grp, key) {
                    out += self.renderButton(key) + '\n';
                });
                out += '</div>\n';
            });
            return layout.replace('{' + type + '}', out);
        },
        getFileName: function (key) {
            var self = this, name = self.exportFileName,
                ext = self.exportConfig[key] && self.exportConfig[key].ext || '';
            return ext ? name + '.' + ext : name;
        },
        renderMenuItem: function (type, btn) {
            var self = this, $a = getEl('a'), $div = getEl('div'), key = type + btn, title, out;
            if (type === 'export') {
                title = self.buttonTitles[key];
                out = self.getLabel(key);
            } else {
                title = self.buttonTitles[type];
                out = title + ' ' + btn;
            }
            $a.attr({
                'href': '#',
                'class': 'md-btn-' + type + ' md-btn-' + key,
                'title': title,
                'accesskey': self.buttonAccessKeys[key],
                'data-key': key
            }).html(out);
            out = $div.append($a).html();
            $div.remove();
            return out;
        },
        getEmojies: function () {
            var self = this, out = '';
            if (isEmpty(self.markdownItEmojies)) {
                return '';
            }
            out = '<li class="md-emoji-search"><span class="md-close">&times;</span>' +
                '<input type="text" class="form-control input-sm" placeholder="' + self.emojiSearchHint + '"></li>';
            $.each(window.mdEmojies, function (key, value) {
                var ttl = ':' + htmlEncode(key) + ':', shortcuts = window.mdEmojiesShortcuts[key] || '', i, lbl;
                if (shortcuts) {
                    ttl += ' or ';
                    for (i = 0; i < shortcuts.length; i++) {
                        lbl = htmlEncode(shortcuts[i]);
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
            var self = this, css = self.buttonCss[type] || self.defaultButtonCss || '', checked = '',
                mode = type.substr(4).toLowerCase(), key = self.buttonAccessKeys[type] || '';
            if (self.defaultMode === mode) {
                css += ' active';
                checked = ' checked';
            }
            return '<label class="' + css + '" title="' + self.buttonTitles[type] + '">' +
                '<input type="radio" value="' + type + '" name="mdMode" autocomplete="off" accesskey="' + key +
                '"' + checked + '>' + self.renderIcon(type) + '</label>';
        },
        renderButton: function (key) {
            var self = this, $btn, $div, icon, title, label, editor, t, i, out, titles = self.buttonTitles, btnCss,
                isValid = key === 'mode' || self.buttonIcons[key] !== undefined || self.buttonActions[key] !== undefined,
                labels = self.buttonLabels, dropCss, css = 'md-btn-' + key, accKeys = self.buttonAccessKeys;
            if (!isValid || (!self.enableUndoRedo && (key === 'undo' || key === 'redo' || key === 'editor'))) {
                return EMPTY;
            }
            btnCss = self.buttonCss[key] || self.defaultButtonCss;
            $div = getEl('div');
            $btn = getEl('button').attr({type: 'button', 'data-key': key});
            icon = self.renderIcon(key);
            title = titles[key] || EMPTY;
            label = labels[key] || EMPTY;
            if (title) {
                $btn.attr('title', title);
            }
            if (key === 'fullscreen' || key === 'hint' || key === 'mode') {
                css += ' md-btn-special';
            }
            if (key === 'fullscreen') {
                icon = '<span class="md-max-icon">' + icon + '</span>' +
                    '<span class="md-min-icon">' + self.fullScreenMinimizeIcon + '</span>';
            }
            label = (icon && label) ? icon + ' ' + label : icon + label;
            $div.append($btn);
            switch (key) {
                case 'heading':
                case 'export':
                case 'emoji':
                    $btn.html(label + ' ').attr({'data-toggle': 'dropdown'}).append('<span class="caret"></span>');
                    dropCss = self.dropdownCss[key] ? 'dropdown-menu ' + self.dropdownCss[key] : 'dropdown-menu';
                    out = '<ul class="' + dropCss + '">\n';
                    switch (key) {
                        case 'heading':
                        case 'emoji':
                            $btn.addClass(btnCss + ' dropdown-toggle md-btn-other');
                            if (key === 'emoji') {
                                out += self.getEmojies();
                                break;
                            }
                            for (i = 1; i < 7; i++) {
                                t = title + ' ' + i;
                                out += '<li>' + self.renderMenuItem('heading', i) + '</li>';
                            }
                            break;
                        case 'export':
                            $btn.addClass(btnCss + ' dropdown-toggle');
                            out += '<li>' + self.renderMenuItem(key, 'Html') + '</li>' +
                                '<li>' + self.renderMenuItem(key, 'Text') + '</li>';
                            break;
                    }
                    out += '</ul>';
                    $div.append(out).attr({'class': 'btn-group', 'role': 'group'});
                    $div = getEl('div').append($div);
                    out = $div.html();
                    $div.remove();
                    return out;
                case 'mode':
                    return '<div class="btn-group md-btn-mode" data-toggle="buttons">' +
                        self.getModeButton('modeEditor') + self.getModeButton('modePreview') +
                        (self.enableSplitMode ? self.getModeButton('modeSplit') : '') + '</div>';
                default:
                    $btn.attr('accesskey', accKeys[key]).html(label).addClass(btnCss + ' ' + css + ' md-btn');
                    return $div.html();
            }
        }
    };

    $.fn.markdownEditor = function (option) {
        var args = Array.apply(null, arguments), retvals = [];
        args.shift();
        this.each(function () {
            var self = $(this), data = self.data('markdownEditor'), options = typeof option === 'object' && option,
                lang = options.language || self.data('language') || 'en', config = $.fn.markdownEditor.defaults;

            if (!data) {
                if (lang !== 'en' && !isEmpty($.fn.markdownEditorLocales[lang])) {
                    $.extend(true, config, $.fn.markdownEditorLocales[lang]);
                }
                data = new MarkdownEditor(this, $.extend(true, config, options, self.data()));
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
        theme: 'krajee',
        rows: 15,
        defaultMode: 'editor',
        enableUndoRedo: true,
        enableExportDataUri: true,
        enableSplitMode: true,
        enableLivePreview: undefined,
        enableScrollSync: true,
        startFullScreen: false,
        templates: {
            main: T_MAIN,
            header: T_HEADER,
            preview: T_PREVIEW,
            footer: T_FOOTER,
            dialog: T_DIALOG,
            exportHeader: T_EXP_HEADER,
            htmlMeta: T_HTM_META,
            exportCssJs: T_EXP_CSS
        },
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
        ],
        exportPrependCssJs: T_PREPEND_CSS,
        inputCss: 'md-input',
        defaultButtonCss: 'btn btn-default',
        buttonCss: {
            hint: 'btn btn-info'
        },
        dropdownCss: {
            emoji: 'md-emojies-list pull-right'
        },
        dropUp: {
            export: true
        },
        buttonIconCssPrefix: 'fa fa-',
        buttonIcons: {},
        buttonAccessKeys: {},
        parserUrl: EMPTY,
        parserMethod: undefined,
        markdownItOptions: {
            html: false,
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
                divClass: 'checkbox',
                idPrefix: 'cbx_'
            }
        },
        markdownItEmojies: window.mdEmojies || {},
        useTwemoji: false,
        exportUrl: EMPTY,
        exportMethod: EMPTY,
        exportFormId: EMPTY,
        today: EMPTY,
        alertMsgIcon: '<i class="fa fa-exclamation-circle"></i> ',
        alertMsgCss: 'alert alert-danger',
        alertFadeDuration: 2000,
        outputParseTimeout: 1800000,
        exportConfig: defaultExportConfig,
        fullScreenMinimizeIcon: '<i class="fa fa-compress"></i>',
        postProcess: {
            '<table>': '<table class="table table-bordered table-striped">'
        }
    };

    $.fn.markdownEditorLocales.en = {
        noDataMsg: 'No valid source data found!',
        exportFileName: 'export',
        buttonTitles: {},
        buttonLabels: {},
        buttonPrompts: {},
        buttonActions: {},
        hintText: DEFAULT_HINT,
        dialogCancelText: 'Cancel',
        dialogOkText: 'Ok',
        previewErrorTitle: 'Preview Error',
        previewModeTitle: 'Preview Mode',
        noPreviewUrlMsg: 'Markdown preview processor unavailable. Please contact the system administrator.',
        emptyPreviewMsg: 'No formatted content available for preview.',
        errorPreviewMsg: 'Error generating preview. Please try again later.',
        previewProgressMsg: 'Generating preview ...',
        noExportUrlMsg: 'Export processor unavailable. Please contact the system administrator.',
        exportProgressMsg: 'Generating export file for download ...',
        exportErrorMsg: 'Error generating export. Please try again later.',
        emojiSearchHint: 'Search emojis ...',
        loadingMsg: 'Loading ...'
    };

    $.extend(true, $.fn.markdownEditor.defaults, $.fn.markdownEditorLocales.en);

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