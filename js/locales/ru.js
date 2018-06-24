/*!
 * Russian Translations for krajee-markdown-editor
 *
 * This file must be loaded after 'markdown-editor.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 * 
 * @see http://plugins.krajee.com/markdown-editor
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
$.fn.markdownEditorLocales.ru = {
    ajaxParserErrorMsg: 'Ошибка при анализе текста markdown. Пожалуйста, повторите попытку позже.',
    ajaxParserProgressMsg: 'Разбор текста markdown ...',
    noDataMsg: 'Не найдено достоверных исходных данных!',
    exportFileName: 'экспорт',
    buttonTitles: {
        undo: 'Отменить',
        redo: 'Повторить',
        bold: 'Жирный',
        italic: 'Курсив',
        ins: 'Подчеркнутый / вставленный текст',
        del: 'Strike Through',
        sup: 'Superscript',
        sub: 'Подстрочный индекс',
        mark: 'Выделенный текст',
        paragraph: 'Параграф',
        newline: 'Добавить прерывание строки',
        heading: 'Заголовок',
        link: 'Гиперссылка',
        image: 'Image Link',
        indent: 'Текст отступа',
        outdent: 'Outdent Text',
        ul: 'Неупорядоченный список',
        ol: 'Упорядоченный список',
        dl: 'Список определений',
        footnote: 'Сноска',
        blockquote: 'Block Quote',
        code: 'Встроенный код',
        codeblock: 'Code Block',
        hr: 'Горизонтальная линия',
        emoji: 'Emojis / Emoticons',
        fullscreen: 'Переключить полноэкранный режим',
        hint: 'Советы по использованию',
        modeEditor: 'Режим редактора',
        modePreview: 'Режим предварительного просмотра',
        modeSplit: 'Режим разделения',
        export: 'Экспорт содержимого',
        exportHtml: 'Экспорт как HTML',
        exportText: 'Экспорт как текст'
    },
    buttonLabels: {
        export: 'экспорт',
        exportHtml: 'HTML',
        exportText: 'Текст'
    },
    buttonPrompts: {
        link: {
            header: 'Вставить гиперссылку',
            hintInput: 'Введите адрес гиперссылки...',
            hintTitle: 'Введите текст для ссылки...'
        },
        image: {
            header: 'Вставить ссылку для изображения',
            hintInput: 'Введите адрес ссылки на изображение...',
            hintTitle: 'Введите альтернативный текст для изображения...'
        },
        ol: {
            header: 'Начальный номер списка заказов',
            hintInput: 'Целое число начиная с 1'
        },
        codeblock: {
            header: 'Введите код',
            hintInput: 'например html, php, js'
        }
    },
    buttonActions: {
        bold: {markup: '**(жирный текст здесь)**'},
        italic: {markup: '_(курсивный текст здесь)_'},
        ins: {markup: '_(вставленный текст здесь)_'},
        del: {markup: '_(прочесть текст здесь)_'},
        mark: {markup: '_(отмеченный текст здесь)_'},
        sup: {markup: '_(надстрочный текст здесь)_'},
        sub: {markup: '_(текст подстроки здесь)_'},
        paragraph: {markup: '\n(текст абзаца здесь)\n'},
        heading1: {markup: '# (заголовок 1 текст здесь)'},
        heading2: {markup: '## (заголовок 2 текста здесь)'},
        heading3: {markup: '### (заголовок 3 текста здесь)'},
        heading4: {markup: '#### (заголовок 4 текста здесь)'},
        heading5: {markup: '##### (заголовок 5 текста здесь)'},
        heading6: {markup: '###### (заголовок 6 текста здесь)'}
    },
    templates: {
        exportHeader: '> - - -\n' +
        '> Экспорт Markdown\n' +
        '> ==============\n' +
        '> *Сгенерировано {TODAY} на {CREDITS}*\n' +
        '> - - -\n\n',
        hint: '<ul>\n' +
        '<li><p>Вы можете следовать спецификации {LINK_CM} (сгенерированной с помощью плагина {LINK_MI}) для написания текста уценки.</p></li>\n' +
        '<li><p>Чтобы использовать кнопки форматирования на панели инструментов, вам обычно нужно выделить текст ' +
        'в редакторе, на котором должно применяться форматирование. Вы также можете отменить действие в формате ' +
        'выделенный текст, снова нажав кнопку (для большинства кнопок).</p></li>\n' +
        '<li><p>Клавиши быстрого доступа для кнопок:</p>' +
        '    {ACCESS_KEYS}' +
        '  </li>\n' +
        '</ul>'
    },
    dialogCancelText: 'Отмена',
    dialogSubmitText: 'Отправить',
    previewErrorTitle: 'Ошибка просмотра',
    previewModeTitle: 'Режим предварительного просмотра',
    noPreviewUrlMsg: 'Процессор предварительного просмотра Markdown недоступен. Пожалуйста свяжитесь с системным администратором.',
    previewProgressMsg: 'Генерирование предварительного просмотра ...',
    noExportUrlMsg: 'Экспортный процессор недоступен. Пожалуйста свяжитесь с системным администратором.',
    emojiSearchHint: 'Поиск emojis ...',
    loadingMsg: 'Загрузка ...'
};