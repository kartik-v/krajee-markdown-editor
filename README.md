bootstrap-markdown-editor
=========================

[![Bower version](https://badge.fury.io/bo/bootstrap-markdown-editor.svg)](http://badge.fury.io/bo/bootstrap-markdown-editor)
[![Latest Stable Version](https://poser.pugx.org/kartik-v/bootstrap-markdown-editor/v/stable)](https://packagist.org/packages/kartik-v/bootstrap-markdown-editor)
[![License](https://poser.pugx.org/kartik-v/bootstrap-markdown-editor/license)](https://packagist.org/packages/kartik-v/bootstrap-markdown-editor)
[![Packagist Downloads](https://poser.pugx.org/kartik-v/bootstrap-markdown-editor/downloads)](https://packagist.org/packages/kartik-v/bootstrap-markdown-editor)
[![Monthly Downloads](https://poser.pugx.org/kartik-v/bootstrap-markdown-editor/d/monthly)](https://packagist.org/packages/kartik-v/bootstrap-markdown-editor)

A Boostrap styled markdown editor that converts a native HTML textarea to an advanced markdown editor. The editor offers live preview, export, full screen mode, and more features. Can support any markdown parser via javascript library / method or even a server based parser via an ajax action. The editor by default is built to support CommonMark spec parsing using [markdown-it JS based parser](https://markdown-it.github.io/). Other markdown parsers are configurable (both as a server call OR a local JS method/library). In addition, the plugin allows custom button actions and properties to be setup.

## Features

- Inbuilt support for advanced markdown syntax editing and formatting via the [markdown-it JS based parser](https://markdown-it.github.io/). The key features of the `markdown-it` parser are:
    - It follows the __[CommonMark spec](http://spec.commonmark.org/)__ and adds syntax extensions & sugar (URL autolinking, typographer).
    - Configurable syntax! You can add new rules and even replace existing ones.
    - High speed.
    - [Safe](https://github.com/markdown-it/markdown-it/tree/master/docs/security.md) by default.
    - Community-written __[plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin)__ and [other packages](https://www.npmjs.org/browse/keyword/markdown-it) on npm.
- In addition to supporting all common markdown syntax formats, this also includes support for various `markdown-it` plugins like emojis, smart arrows, checkboxes, subscript, superscript, definition list, footnote, abbreviation, marked / inserted text etc.
- Advanced additional support for emojis and emoticons to be inserted. The editor also supports using rendering emojis using [twitter emojis {twemoji}](https://github.com/twitter/twemoji). Note that twitter [twemoji graphics](https://github.com/twitter/twemoji) are licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- The editor can be configured to use any markdown based parser OR even use a server based parsing via AJAX action.
- Inbuilt live preview and conversion of the markdown text to HTML formatted text. The editor can be toggled and configured to be set in one of the three modes:
   - Editor Mode: Displays only the editor for editing the markdown text.
   - Preview Mode: Displays only the preview for viewing the HTML formatted text.
   - Split Mode: Shows both the editor and preview modes split side by side.
- One can configure the editor to by default open in one of the above modes.
- Offers live preview and **synchronized scrolling** between editor and preview when typing text OR scrolling in the editor. This is especially useful in the Split Mode.
- The editor also includes inbuilt support for FULL SCREEN mode toggling and editing. One can toggle the editor to FULL screen for any of the above modes. 
- One can also configure the editor to by default open in full screen mode if needed.
- Highly extensible and easily configurable toolbar buttons and actions. Supports 4 different toolbar button locations (Header Left, Header Right, Footer Left, and Footer Right).
- Inbuilt support for unlimited undo and redo of editing actions via an inbuilt UndoStack library.
- Intelligently senses a FORM RESET (if the input is enveloped in a form) and resets the editor to original state on form reset including the undo / redo stack.
- Toolbar buttons use [FontAwesome icons](http://fortawesome.github.io/Font-Awesome/) by default and require the FontAwesome CSS to be loaded. But one can configure the editor to use any icons or CSS styling.
- Offers THEME support for easily styling the editor for one's own theme.
- Advanced styling and configuration available via templates and setting various CSS and layout properties.
- Inbuilt EXPORT feature to allow exporting the editor content as 
   - TEXT
   - HTML
- The editor allows inbuilt support for exported content to be directly downloaded via [Data URIs that is supported by most modern browsers](caniuse.com/datauri). 
- The export download can also be configured to use a server based URL action to download content.
- Offers inbuilt localization and translation support and allows using multiple language markdown editors on the same page.

## Demo

View the [plugin documentation](http://plugins.krajee.com/markdown-editor) and [plugin demos](http://plugins.krajee.com/markdown-editor/demo) at Krajee JQuery plugins. 

## Pre-requisites  

1. [Bootstrap 3.x](http://getbootstrap.com/)
2. Latest [JQuery](http://jquery.com/)
3. Most modern browsers supporting HTML5, CSS3 & JQuery. 
4. If using the default export feature (without ajax), the [browser must support data uri](http://caniuse.com/#feat=datauri).
5. If using the default parser feature (without ajax), the [markdown-it javascript parser](https://markdown-it.github.io/) is required. This library is available in the `plugins` directory of the repo.
6. If using the default code highlighting feature via markdown-it parser, the [highlight.js library](https://highlightjs.org/) is required. This library is available in the `plugins` directory of the repo.
7. Note most formatting buttons have been configured for the markdown-it parser. For rendering the **emojis**, your Markdown parser must support smileys generation. 
8. For rendering emojis using [twitter emojis {twemoji}](https://github.com/twitter/twemoji), you need to load the twitter emojis CSS. Note that twitter [twemoji graphics](https://github.com/twitter/twemoji) are licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Installation

### Using Bower
You can use the `bower` package manager to install. Run:

    bower install bootstrap-markdown-editor

### Using Composer
You can use the `composer` package manager to install. Either run:

    $ php composer.phar require kartik-v/bootstrap-markdown-editor "@dev"

or add:

    "kartik-v/bootstrap-markdown-editor": "@dev"

to your composer.json file

### Manual Install

You can also manually install the plugin easily to your project. Just download the source [ZIP](https://github.com/kartik-v/bootstrap-markdown-editor/zipball/master) or [TAR ball](https://github.com/kartik-v/bootstrap-markdown-editor/tarball/master) and extract the plugin assets (css and js folders) into your project.

## Usage

Step 1: Load the following assets in your header. Please read the accompanying comments to understand optional components. 

```html
<!-- core styling assets -->
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet">
<link href="path/to/css/markdown-editor.min.css" media="all" rel="stylesheet" type="text/css" />

<!-- font awesome is needed for toolbar iconic buttons. In case you wish to override icons you can skip this -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

<!-- load if using code syntax styling via highlight.js -->
<link href="path/to/plugins/highlight/github-gist.min.css" media="all" rel="stylesheet" type="text/css"/>

<!-- core scripts -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="path/to/js/markdown-editor.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js" type="text/javascript"></script>

<!-- if using translations for your language then include locale file as mentioned below after markdown-editor.js -->
<script src="path/to/js/markdown-editor_locale_<lang>.js"></script>

<!-- load if using code syntax styling via highlight.js -->
<script src="path/to/plugins/highlight/highlight.min.js" type="text/javascript"></script>

<!-- the plugin supports markdown-it parser by default and you need to include this if using this default parser -->
<script src="path/to/plugins/markdown-it/markdown-it.min.js" type="text/javascript"></script>

<!-- the markdown-it plugins depending on the functionality used within these plugins -->
<script src="path/to/plugins/markdown-it/markdown-it-deflist.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-footnote.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-abbr.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-sub.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-sup.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-ins.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-mark.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-emoji.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-smartarrows.min.js" type="text/javascript"></script>
<script src="path/to/plugins/markdown-it/markdown-it-checkbox.min.js" type="text/javascript"></script>

<!-- load if using twitter emojis (twemoji) -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/twemoji/1.3.2/twemoji.min.js"></script>
```

If you noticed, you need to load the `jquery.min.js` and `bootstrap.min.css` in addition to the `markdown-editor.min.css` and `markdown-editor.min.js`. The locale file `markdown-editor_locale_<lang>.js` can be optionally included for translating for your language if needed. Most of the other CSS and JS are needed for the functionality provided by the relevant plugins as mentioned in the inline comments.

Step 2: Initialize the plugin on your page. For example, your markup should be a basic textarea:

```
<textarea id="textarea-id"></textarea>
```

Then initialize this javascript below on document ready.

```js
// initialize with defaults
$("#textarea-id").markdownEditor();

// with plugin options
$("#textarea-id").markdownEditor({'startFullScreen': true, 'markdownItOptions': {html: true}});
```

The `#input-id` is the identifier for the input (e.g. `type = file`) on your page, which is hidden automatically by the plugin. 

Alternatively, you can directly call the plugin options by setting data attributes to your input field.

```html
<textarea id="input-id" class="markdown" data-language="ru" data-rows=16>
</textarea>
```

## Translations

As shown in the installation section, translations are now enabled with release 4.1.8. You can load a locale file `/markdown-editor_locale_<lang>.js` after the core `markdown-editor.min.js` file, where `<lang>` is the language code (e.g. `de`, `fr` etc.). If  locale file does not exist, you can submit a translation for the new language via a [new pull request to add to this folder](https://github.com/kartik-v/bootstrap-markdown-editor/tree/master/js). Use the [sample locale file](https://github.com/kartik-v/bootstrap-markdown-editor/tree/master/js/markdown-editor_locale_LANG.js) to copy and create a translation configuration for your own language.

## License

**bootstrap-markdown-editor** is released under the BSD 3-Clause License. See the bundled `LICENSE.md` for details.