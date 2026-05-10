document.observe('dom:loaded', function () {
    var editorContainer = $('lcb-grapes-visual-editor'),
        saveButton = $('lcb-grapes-save-button'),
        htmlField = $('lcb-grapes-html'),
        cssField = $('lcb-grapes-css'),
        initialHtmlField = $('lcb-grapes-initial-html'),
        initialCssField = $('lcb-grapes-initial-css');

    if (!editorContainer || typeof grapesjs === 'undefined') {
        return;
    }

    function trimValue(value) {
        if (typeof value !== 'string') {
            return '';
        }

        return typeof value.strip === 'function'
            ? value.strip()
            : value.replace(/^\s+|\s+$/g, '');
    }

    function cleanHtml(html) {
        return (html || '')
            .replace(/<\/?body[^>]*>/gi, '')
            .replace(/<\/?html[^>]*>/gi, '');
    }

    function cleanCss(css) {
        css = css || '';

        css = css
            .replace(/\*\s*\{\s*box-sizing\s*:\s*border-box\s*;\s*\}/gi, '')
            .replace(/body\s*\{\s*margin\s*:\s*0\s*;\s*\}/gi, '')
            .replace(/body\s*\{\s*margin-top\s*:\s*0px\s*;\s*margin-right\s*:\s*0px\s*;\s*margin-bottom\s*:\s*0px\s*;\s*margin-left\s*:\s*0px\s*;\s*\}/gi, '');

        return css.replace(/^\s+|\s+$/g, '');
    }

    function addComponentType(editor, type, className, defaults) {
        editor.DomComponents.addType(type, {
            isComponent: function (el) {
                if (el && el.classList && el.classList.contains(className)) {
                    return { type: type };
                }
            },
            model: {
                defaults: defaults
            }
        });
    }

    var initialHtml = initialHtmlField ? initialHtmlField.getValue() : '',
        initialCss = initialCssField ? initialCssField.getValue() : '';

    if (!initialHtml || trimValue(initialHtml) === '') {
        initialHtml = '<section class="lcb-banner-root"><div class="lcb-banner-content"></div></section>';
    }

    initialCss = cleanCss(initialCss);

    var positionOptions = [
        { id: 'default', name: 'Domyślna' },
        { id: 'top-left', name: 'Góra lewo' },
        { id: 'top-center', name: 'Góra środek' },
        { id: 'top-right', name: 'Góra prawo' },
        { id: 'center-left', name: 'Środek lewo' },
        { id: 'center-center', name: 'Środek' },
        { id: 'center-right', name: 'Środek prawo' },
        { id: 'bottom-left', name: 'Dół lewo' },
        { id: 'bottom-center', name: 'Dół środek' },
        { id: 'bottom-right', name: 'Dół prawo' }
    ];

    function createPositionTrait(label, name) {
        return {
            type: 'select',
            label: label,
            name: name,
            options: positionOptions
        };
    }

    function createPositionRules(attributeName, topValue, bottomValue, sideValue) {
        var selector = '.banner-box[' + attributeName + '="',
            side = sideValue,
            fullWidth = '100%';

        return [
            selector + 'top-left"]{position:absolute;top:' + topValue + ';left:' + side + ';right:auto;bottom:auto;transform:none;}',
            selector + 'top-center"]{position:absolute;top:' + topValue + ';left:50%;right:auto;bottom:auto;width:' + fullWidth + ';max-width:' + fullWidth + ';transform:translateX(-50%);}',
            selector + 'top-right"]{position:absolute;top:' + topValue + ';right:' + side + ';left:auto;bottom:auto;transform:none;}',

            selector + 'center-left"]{position:absolute;top:50%;left:' + side + ';right:auto;bottom:auto;transform:translateY(-50%);}',
            selector + 'center-center"]{position:absolute;top:50%;left:50%;right:auto;bottom:auto;width:' + fullWidth + ';max-width:' + fullWidth + ';transform:translate(-50%,-50%);}',
            selector + 'center-right"]{position:absolute;top:50%;right:' + side + ';left:auto;bottom:auto;transform:translateY(-50%);}',

            selector + 'bottom-left"]{position:absolute;bottom:' + bottomValue + ';left:' + side + ';right:auto;top:auto;transform:none;}',
            selector + 'bottom-center"]{position:absolute;bottom:' + bottomValue + ';left:50%;right:auto;top:auto;width:' + fullWidth + ';max-width:' + fullWidth + ';transform:translateX(-50%);}',
            selector + 'bottom-right"]{position:absolute;bottom:' + bottomValue + ';right:' + side + ';left:auto;top:auto;transform:none;}'
        ].join('');
    }

    /*
     * CSS bazowy modułu.
     * Nie zapisujemy go do bazy.
     * Jest wstrzykiwany tylko do podglądu edytora GrapesJS.
     */
    var baseCss = [
        '.lcb-banner-root,.lcb-banner-root *{box-sizing:border-box;}',
        '.lcb-banner-root{position:relative;display:block;width:100%;max-width:100%;min-height:100%;overflow:hidden;}',
        '.lcb-banner-content{position:relative;display:block;width:100%;max-width:100%;min-height:400px;padding:24px;overflow:visible;}',

        '.banner-heading,.banner-text{margin:0;text-transform:none!important;overflow-wrap:anywhere;word-break:normal;}',

        '.banner-button{display:inline-flex;align-items:center;justify-content:center;max-width:100%;text-decoration:none;box-sizing:border-box;line-height:1.2;text-align:center;white-space:normal;}',
        '.banner-button:link,.banner-button:visited,.banner-button:hover,.banner-button:focus,.banner-button:active{text-decoration:none;}',

        '.banner-button-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;max-width:100%;}',

        '.banner-image{display:block;max-width:100%;height:auto;}',

        '.banner-box{display:block;width:auto;max-width:100%;min-height:80px;padding:18px;background:rgba(0,0,0,.35);border-radius:18px;box-sizing:border-box;}',

        '.banner-link{display:inline-block;max-width:100%;text-decoration:none;overflow-wrap:anywhere;}',
        '.banner-link:link,.banner-link:visited,.banner-link:hover,.banner-link:focus,.banner-link:active{text-decoration:none;}',

        '@media (max-width:1024px){',
            '.lcb-banner-content{min-height:470px;padding:8px;overflow:visible;}',
        '}',

        '@media (max-width:480px){',
            '.lcb-banner-content{min-height:500px;padding:10px;overflow:visible;}',
            '.banner-button-row{display:flex;flex-direction:column;align-items:stretch;gap:8px;width:100%;max-width:100%;}',
            '.banner-button,.banner-button-secondary{display:flex;width:100%;max-width:100%;padding:10px 12px;line-height:1.2;text-align:center;}',
            '.banner-image{max-width:100%;height:auto;display:block;}',
        '}',

        '@media (max-width:390px){',
            '.lcb-banner-content{min-height:520px;padding:8px;overflow:visible;}',
        '}'
    ].join('');

    var positionCss = [
        '.lcb-banner-content{position:relative;}',

        createPositionRules('data-box-position-desktop', '4px', '10px', '0'),

        '@media (max-width:1024px){',
            createPositionRules('data-box-position-tablet', '4px', '0', '0'),
        '}',

        '@media (max-width:480px){',
            createPositionRules('data-box-position-mobile-large', '3px', '6px', '0'),
        '}',

        '@media (max-width:390px){',
            createPositionRules('data-box-position-mobile-small', '2px', '4px', '0'),
        '}'
    ].join('');

    function bannerPlugin(editor) {
        addComponentType(editor, 'lcb-banner-root', 'lcb-banner-root', {
            selectable: true,
            hoverable: true,
            draggable: false,
            droppable: '.lcb-banner-content',
            removable: false,
            copyable: false,
            highlightable: true,
            layerable: false
        });

        addComponentType(editor, 'lcb-banner-content', 'lcb-banner-content', {
            selectable: true,
            hoverable: true,
            draggable: false,
            droppable: true,
            removable: false,
            copyable: false,
            highlightable: true,
            layerable: true
        });

        addComponentType(editor, 'banner-box', 'banner-box', {
            selectable: true,
            hoverable: true,
            draggable: true,
            droppable: true,
            removable: true,
            copyable: true,
            highlightable: true,
            layerable: true,
            traits: [
                createPositionTrait('Pozycja Desktop', 'data-box-position-desktop'),
                createPositionTrait('Pozycja Tablet', 'data-box-position-tablet'),
                createPositionTrait('Pozycja Mobile Large', 'data-box-position-mobile-large'),
                createPositionTrait('Pozycja Mobile Small', 'data-box-position-mobile-small')
            ]
        });
    }

    var editor = grapesjs.init({
        container: '#lcb-grapes-visual-editor',
        height: '700px',
        width: 'auto',
        storageManager: false,
        fromElement: false,
        components: initialHtml,
        style: initialCss,
        mediaCondition: 'max-width',

        deviceManager: {
            devices: [
                { id: 'Desktop', name: 'Desktop', width: '' },
                { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '1024px' },
                { id: 'Mobile Large', name: 'Mobile Large', width: '430px', widthMedia: '480px' },
                { id: 'Mobile Small', name: 'Mobile Small', width: '390px', widthMedia: '390px' }
            ]
        },

        selectorManager: {
            componentFirst: true
        },

        plugins: [
            bannerPlugin
        ],

        blockManager: {
            blocks: [
                {
                    id: 'heading',
                    label: 'Heading',
                    content: '<h2 class="banner-heading">New heading</h2>'
                },
                {
                    id: 'text',
                    label: 'Text',
                    content: '<p class="banner-text">New text</p>'
                },
                {
                    id: 'button',
                    label: 'Button',
                    content: '<a href="#" class="banner-button">Button</a>'
                },
                {
                    id: 'image',
                    label: 'Image',
                    content: '<img src="" alt="" class="banner-image" />'
                },
                {
                    id: 'box',
                    label: 'Box',
                    content: '<div class="banner-box"></div>'
                },
                {
                    id: 'link',
                    label: 'Link',
                    content: '<a href="#" class="banner-link">Link</a>'
                },
                {
                    id: 'button-row',
                    label: 'Button Row',
                    content: '<div class="banner-button-row"><a href="#" class="banner-button">Primary</a><a href="#" class="banner-button banner-button-secondary">Secondary</a></div>'
                }
            ]
        }
    });

    function setDevice(name) {
        if (editor.setDevice) {
            editor.setDevice(name);
        } else if (editor.Devices && editor.Devices.select) {
            editor.Devices.select(name);
        }
    }

    function getDevice() {
        var device = editor.Devices && editor.Devices.getSelected
            ? editor.Devices.getSelected()
            : null;

        if (!device) {
            return 'Desktop';
        }

        return device.get
            ? device.get('id') || device.get('name') || 'Desktop'
            : device.id || device.name || 'Desktop';
    }

    function injectBaseCssToCanvas() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null;

        if (!frame || !frame.contentDocument) {
            return;
        }

        var doc = frame.contentDocument;

        if (doc.getElementById('lcb-editor-base-css')) {
            return;
        }

        var style = doc.createElement('style');
        style.id = 'lcb-editor-base-css';
        style.type = 'text/css';
        style.appendChild(doc.createTextNode(baseCss + positionCss));

        doc.head.appendChild(style);
    }

    function selectBannerContent() {
        var content = editor.getWrapper().find('.lcb-banner-content')[0];

        if (content) {
            editor.select(content);
        }
    }

    if (editor.Panels) {
        editor.Panels.removeButton('views', 'open-layers');
    }

    var wrapper = editor.getWrapper();

    if (wrapper) {
        wrapper.set({
            selectable: false,
            hoverable: false,
            badgable: false,
            highlightable: false,
            editable: false,
            draggable: false,
            droppable: false,
            copyable: false,
            removable: false,
            layerable: false
        });
    }

    editor.on('load', function () {
        injectBaseCssToCanvas();
        selectBannerContent();
    });

    editor.on('component:add', function () {
        injectBaseCssToCanvas();
    });

    selectBannerContent();

    if (saveButton && htmlField && cssField) {
        saveButton.observe('click', function () {
            var selectedDevice = getDevice();

            setDevice('Desktop');

            htmlField.value = cleanHtml(editor.getHtml());
            cssField.value = cleanCss(editor.getCss());

            setDevice(selectedDevice);

            $('lcb-grapes-save-form').submit();
        });
    }
});