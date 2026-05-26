document.observe('dom:loaded', function () {
    var editorContainer = $('lcb-free-grapes-editor'),
        saveButton = $('lcb-free-grapes-save-button'),
        htmlField = $('lcb-free-grapes-html'),
        cssField = $('lcb-free-grapes-css'),
        initialHtmlField = $('lcb-free-grapes-initial-html'),
        initialCssField = $('lcb-free-grapes-initial-css');

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

    function getInitialFreeHtml() {
        return '<section class="lcb-free-banner-root">' +
            '<div data-gjs-type="text" class="lcb-free-layer lcb-free-heading" style="left:8%;top:12%;">Nagłówek</div>' +
            '<div data-gjs-type="text" class="lcb-free-layer lcb-free-text" style="left:8%;top:28%;">Tekst banera</div>' +
            '<a data-gjs-type="text" href="#" class="lcb-free-layer lcb-free-button" style="left:8%;top:48%;">Button</a>' +
        '</section>';
    }

    var initialHtml = initialHtmlField ? initialHtmlField.getValue() : '',
        initialCss = initialCssField ? initialCssField.getValue() : '';

    if (!initialHtml || trimValue(initialHtml) === '') {
        initialHtml = getInitialFreeHtml();
    }

    initialCss = cleanCss(initialCss);

    var previewCss = [
        '.lcb-free-banner-root,.lcb-free-banner-root *{box-sizing:border-box;}',
        '.lcb-free-banner-root{position:relative;display:block;width:100%;max-width:100%;height:400px;min-height:400px;overflow:hidden;background:rgba(0,0,0,.08);}',
        '.lcb-free-layer{position:absolute;max-width:100%;box-sizing:border-box;}',

        '.lcb-free-heading,.lcb-free-text{margin:0;padding:0;color:#111;font-family:Arial,Helvetica,sans-serif;overflow-wrap:anywhere;word-break:normal;}',
        '.lcb-free-heading{font-size:48px;font-weight:700;line-height:1.1;}',
        '.lcb-free-text{font-size:20px;font-weight:400;line-height:1.4;}',

        '.lcb-free-button,.lcb-free-button:link,.lcb-free-button:visited,.lcb-free-button:hover,.lcb-free-button:focus,.lcb-free-button:active{display:inline-flex;align-items:center;justify-content:center;max-width:100%;padding:12px 22px;border-radius:999px;background:#111;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:normal;box-sizing:border-box;}',

        '.lcb-free-image{display:block;max-width:100%;height:auto;}',

        '@media (max-width:1024px){.lcb-free-banner-root{height:470px;min-height:470px;}.lcb-free-heading{font-size:42px;}.lcb-free-text{font-size:19px;}}',
        '@media (max-width:480px){.lcb-free-banner-root{height:500px;min-height:500px;}.lcb-free-heading{font-size:34px;}.lcb-free-text{font-size:18px;}.lcb-free-button,.lcb-free-button:link,.lcb-free-button:visited,.lcb-free-button:hover,.lcb-free-button:focus,.lcb-free-button:active{padding:10px 16px;font-size:15px;}}',
        '@media (max-width:390px){.lcb-free-banner-root{height:520px;min-height:520px;}.lcb-free-heading{font-size:30px;}.lcb-free-text{font-size:16px;}}'
    ].join('');

    var editor = grapesjs.init({
        container: '#lcb-free-grapes-editor',
        height: '700px',
        width: 'auto',
        storageManager: false,
        fromElement: false,
        components: initialHtml,
        style: initialCss,
        mediaCondition: 'max-width',
        dragMode: 'absolute',

        deviceManager: {
            devices: [
                { id: 'Desktop', name: 'Desktop', width: '1330px', widthMedia: '' },
                { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '1024px' },
                { id: 'Mobile Large', name: 'Mobile Large', width: '430px', widthMedia: '480px' },
                { id: 'Mobile Small', name: 'Mobile Small', width: '390px', widthMedia: '390px' }
            ]
        },

        selectorManager: {
            componentFirst: true
        },

        plugins: [
            freeBannerPlugin
        ],

        blockManager: {
            blocks: [
                {
                    id: 'lcb-free-heading',
                    label: 'Free Heading',
                    content: '<div data-gjs-type="text" class="lcb-free-layer lcb-free-heading" style="left:8%;top:12%;">Nagłówek</div>'
                },
                {
                    id: 'lcb-free-text',
                    label: 'Free Text',
                    content: '<div data-gjs-type="text" class="lcb-free-layer lcb-free-text" style="left:8%;top:28%;">Tekst banera</div>'
                },
                {
                    id: 'lcb-free-button',
                    label: 'Free Button',
                    content: '<a data-gjs-type="text" href="#" class="lcb-free-layer lcb-free-button" style="left:8%;top:48%;">Button</a>'
                },
                {
                    id: 'lcb-free-image',
                    label: 'Free Image',
                    content: '<img src="" alt="" class="lcb-free-layer lcb-free-image" style="left:8%;top:60%;" />'
                }
            ]
        }
    });

    function enableFreeDragMode() {
        if (editor.setDragMode) {
            editor.setDragMode('absolute');
        }
    }

    function injectPreviewCssToCanvas() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null;

        if (!frame || !frame.contentDocument) {
            return;
        }

        var doc = frame.contentDocument;

        if (doc.getElementById('lcb-free-editor-preview-css')) {
            return;
        }

        var style = doc.createElement('style');
        style.id = 'lcb-free-editor-preview-css';
        style.type = 'text/css';
        style.appendChild(doc.createTextNode(previewCss));

        doc.head.appendChild(style);
    }

    editor.on('load', function () {
        enableFreeDragMode();
        injectPreviewCssToCanvas();
    });

    editor.on('component:add', function () {
        injectPreviewCssToCanvas();
    });

    if (saveButton && htmlField && cssField) {
        saveButton.observe('click', function () {
            htmlField.value = cleanHtml(editor.getHtml());
            cssField.value = cleanCss(editor.getCss());

            $('lcb-free-grapes-save-form').submit();
        });
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

    function addFreeTextComponentType(editor, type, className) {
        editor.DomComponents.addType(type, {
            extend: 'text',

            isComponent: function (el) {
                if (el && el.classList && el.classList.contains(className)) {
                    return { type: type };
                }
            },

            model: {
                defaults: {
                    selectable: true,
                    hoverable: true,
                    draggable: '.lcb-free-banner-root',
                    droppable: false,
                    removable: true,
                    copyable: true,
                    highlightable: true,
                    layerable: true,
                    editable: true
                }
            }
        });
    }

    function freeBannerPlugin(editor) {
        addComponentType(editor, 'lcb-free-banner-root', 'lcb-free-banner-root', {
            selectable: true,
            hoverable: true,
            draggable: false,
            droppable: '.lcb-free-layer',
            removable: false,
            copyable: false,
            highlightable: true,
            layerable: true
        });

        addComponentType(editor, 'lcb-free-layer', 'lcb-free-layer', {
            selectable: true,
            hoverable: true,
            draggable: '.lcb-free-banner-root',
            droppable: false,
            removable: true,
            copyable: true,
            highlightable: true,
            layerable: true,
            editable: true
        });

        addFreeTextComponentType(editor, 'lcb-free-heading', 'lcb-free-heading');
        addFreeTextComponentType(editor, 'lcb-free-text', 'lcb-free-text');
        addFreeTextComponentType(editor, 'lcb-free-button', 'lcb-free-button');
    }
});