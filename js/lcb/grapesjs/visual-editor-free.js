document.observe('dom:loaded', function () {
    var editorContainer = $('lcb-free-grapes-editor'),
        backButton = $('lcb-free-grapes-back-button'),
        saveButton = $('lcb-free-grapes-save-button'),
        saveContinueButton = $('lcb-free-grapes-save-continue-button'),
        saveForm = $('lcb-free-grapes-save-form'),
        backField = $('lcb-free-grapes-back'),
        htmlField = $('lcb-free-grapes-html'),
        cssField = $('lcb-free-grapes-css'),
        initialHtmlField = $('lcb-free-grapes-initial-html'),
        initialCssField = $('lcb-free-grapes-initial-css'),
        imageUrlField = $('lcb-free-grapes-image-url'),
        tabletImageUrlField = $('lcb-free-grapes-tablet-image-url'),
        mobileImageUrlField = $('lcb-free-grapes-mobile-image-url'),
        mobileSmallImageUrlField = $('lcb-free-grapes-mobile-small-image-url'),
        freeImageUploadUrlField = $('lcb-free-grapes-free-image-upload-url'),
        isNormalizing = false,
        isEditorBooting = true,
        isSyncingStyleManagerDefaults = false,
        isSubmittingFreeVisualContent = false,
        isFreeBlockDragging = false,
        pendingFreeBlockDropPoint = null,
        currentDeviceKey = 'desktop';

    var FREE_IMAGE_PLACEHOLDER_SRC = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22160%22%20height=%2290%22%20viewBox=%220%200%20160%2090%22%3E%3Crect%20width=%22160%22%20height=%2290%22%20fill=%22%23f2f2f2%22/%3E%3Cpath%20d=%22M18%2066l31-28%2022%2020%2018-16%2053%2024%22%20fill=%22none%22%20stroke=%22%23999%22%20stroke-width=%225%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3Ccircle%20cx=%22112%22%20cy=%2229%22%20r=%2210%22%20fill=%22%23ccc%22/%3E%3Ctext%20x=%2280%22%20y=%2280%22%20font-family=%22Arial,Helvetica,sans-serif%22%20font-size=%2212%22%20fill=%22%23777%22%20text-anchor=%22middle%22%3EImage%3C/text%3E%3C/svg%3E';

    if (backButton) {
        backButton.observe('click', function () {
            var backUrl = backButton.getAttribute('data-back-url');

            if (!backUrl) {
                return;
            }

            if (typeof setLocation === 'function') {
                setLocation(backUrl);
                return;
            }

            window.location.href = backUrl;
        });
    }

    if (!editorContainer || typeof grapesjs === 'undefined') {
        return;
    }

    var deviceLayouts = {
        desktop: {
            attrKey: 'desktop',
            width: 1152,
            height: 352,
            maxWidth: null
        },
        tablet: {
            attrKey: 'tablet',
            width: 948,
            height: 454,
            maxWidth: 1024
        },
        mobileLarge: {
            attrKey: 'mobile-large',
            width: 480,
            height: 912,
            maxWidth: 480
        },
        mobileSmall: {
            attrKey: 'mobile-small',
            width: 274,
            height: 520,
            maxWidth: 390
        }
    };

    var layoutDevices = ['desktop', 'tablet', 'mobileLarge', 'mobileSmall'],
        layoutAttributeKeys = {},
        gridSizes = {},
        deviceViewports = {},
        layoutDeviceIndex,
        layoutDeviceKey,
        layoutDevice;

    for (layoutDeviceIndex = 0; layoutDeviceIndex < layoutDevices.length; layoutDeviceIndex++) {
        layoutDeviceKey = layoutDevices[layoutDeviceIndex];
        layoutDevice = deviceLayouts[layoutDeviceKey];

        layoutAttributeKeys[layoutDeviceKey] = layoutDevice.attrKey;
        gridSizes[layoutDeviceKey] = {
            width: layoutDevice.width,
            height: layoutDevice.height
        };
        deviceViewports[layoutDeviceKey] = {
            width: layoutDevice.width,
            height: layoutDevice.height
        };
    }

    var desktopBackgroundPreviewUrl = imageUrlField && imageUrlField.getValue
            ? imageUrlField.getValue()
            : (imageUrlField ? imageUrlField.value : ''),
        tabletBackgroundPreviewUrl = tabletImageUrlField && tabletImageUrlField.getValue
            ? tabletImageUrlField.getValue()
            : (tabletImageUrlField ? tabletImageUrlField.value : ''),
        mobileBackgroundPreviewUrl = mobileImageUrlField && mobileImageUrlField.getValue
            ? mobileImageUrlField.getValue()
            : (mobileImageUrlField ? mobileImageUrlField.value : ''),
        mobileSmallBackgroundPreviewUrl = mobileSmallImageUrlField && mobileSmallImageUrlField.getValue
            ? mobileSmallImageUrlField.getValue()
            : (mobileSmallImageUrlField ? mobileSmallImageUrlField.value : ''),
        freeImageUploadUrl = freeImageUploadUrlField && freeImageUploadUrlField.getValue
            ? freeImageUploadUrlField.getValue()
            : (freeImageUploadUrlField ? freeImageUploadUrlField.value : '');

    function trimValue(value) {
        if (typeof value !== 'string') {
            return '';
        }

        return typeof value.strip === 'function'
            ? value.strip()
            : value.replace(/^\s+|\s+$/g, '');
    }

    function escapeCssUrl(value) {
        return String(value || '')
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\r?\n/g, '');
    }

    function getBackgroundPreviewUrlForDevice(deviceKey) {
        var desktopUrl = trimValue(desktopBackgroundPreviewUrl),
            tabletUrl = trimValue(tabletBackgroundPreviewUrl),
            mobileUrl = trimValue(mobileBackgroundPreviewUrl),
            mobileSmallUrl = trimValue(mobileSmallBackgroundPreviewUrl);

        if (deviceKey === 'tablet') {
            return tabletUrl || desktopUrl;
        }

        if (deviceKey === 'mobileSmall') {
            return mobileSmallUrl || mobileUrl || tabletUrl || desktopUrl;
        }

        if (deviceKey === 'mobileLarge') {
            return mobileUrl || mobileSmallUrl || tabletUrl || desktopUrl;
        }

        return desktopUrl;
    }

    function getBackgroundPreviewSizeForDevice(deviceKey) {
        return deviceKey === 'tablet' && !trimValue(tabletBackgroundPreviewUrl) ? '100% 100%' : 'cover';
    }

    function applyBackgroundPreviewStyle(element, backgroundUrl, deviceKey) {
        if (!element || !element.style) {
            return;
        }

        if (backgroundUrl) {
            element.style.setProperty('background-image', 'url("' + escapeCssUrl(backgroundUrl) + '")', 'important');
            element.style.setProperty('background-position', 'center center', 'important');
            element.style.setProperty('background-repeat', 'no-repeat', 'important');
            element.style.setProperty('background-size', getBackgroundPreviewSizeForDevice(deviceKey), 'important');
            return;
        }

        element.style.removeProperty('background-image');
        element.style.removeProperty('background-position');
        element.style.removeProperty('background-repeat');
        element.style.removeProperty('background-size');
    }

    function applyEditorBackgroundPreviewToCanvasDom(doc, backgroundUrl, deviceKey) {
        if (!doc || !doc.querySelector) {
            return;
        }

        applyBackgroundPreviewStyle(doc.querySelector('.lcb-free-banner-root'), backgroundUrl, deviceKey);
        applyBackgroundPreviewStyle(doc.querySelector('.lcb-free-banner-stage'), backgroundUrl, deviceKey);
    }

    function clearEditorBackgroundPreviewFromCanvasDom() {
        var frame = editor && editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null;

        if (frame && frame.contentDocument) {
            applyEditorBackgroundPreviewToCanvasDom(frame.contentDocument, '', currentDeviceKey);
        }
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

        css = stripEditorLayoutStylesFromMediaBlocks(css);
        css = css.replace(/#([a-zA-Z0-9_-]+)\s*\{\s*position\s*:\s*absolute\s*;\s*\}/g, '');

        return css.replace(/^\s+|\s+$/g, '');
    }

    function normalizeCssNumber(value) {
        return Number(value).toFixed(3).replace(/\.?0+$/, '');
    }

    function parseCssNumber(value) {
        var numberValue = parseFloat(value);

        return isNaN(numberValue) ? null : numberValue;
    }

    function percentToPx(value, base) {
        var numberValue = parseCssNumber(value);

        if (numberValue === null || !base) {
            return null;
        }

        return normalizeCssNumber((numberValue / 100) * base) + 'px';
    }

    function getDeviceSizeForMedia(maxWidth) {
        maxWidth = parseInt(maxWidth, 10);

        if (maxWidth === deviceLayouts.tablet.maxWidth) {
            return gridSizes.tablet;
        }

        if (maxWidth === deviceLayouts.mobileLarge.maxWidth) {
            return gridSizes.mobileLarge;
        }

        if (maxWidth === deviceLayouts.mobileSmall.maxWidth) {
            return gridSizes.mobileSmall;
        }

        return gridSizes.desktop;
    }

    function findMatchingBrace(css, openBraceIndex) {
        var depth = 0,
            i;

        for (i = openBraceIndex; i < css.length; i++) {
            if (css.charAt(i) === '{') {
                depth++;
            }

            if (css.charAt(i) === '}') {
                depth--;

                if (depth === 0) {
                    return i;
                }
            }
        }

        return -1;
    }

    function isEditorLayoutCssProperty(propertyName) {
        propertyName = trimValue(propertyName || '').toLowerCase();

        return propertyName === 'position' ||
            propertyName === 'left' ||
            propertyName === 'top' ||
            propertyName === 'right' ||
            propertyName === 'bottom' ||
            propertyName === 'transform' ||
            propertyName === 'transform-origin';
    }

    function stripEditorLayoutDeclarations(declarationBlock) {
        var declarations = (declarationBlock || '').split(';'),
            cleaned = [],
            declaration,
            colonIndex,
            propertyName,
            value,
            i;

        for (i = 0; i < declarations.length; i++) {
            declaration = trimValue(declarations[i]);

            if (!declaration) {
                continue;
            }

            colonIndex = declaration.indexOf(':');

            if (colonIndex === -1) {
                cleaned.push(declaration);
                continue;
            }

            propertyName = trimValue(declaration.slice(0, colonIndex));
            value = trimValue(declaration.slice(colonIndex + 1));

            if (!isEditorLayoutCssProperty(propertyName)) {
                cleaned.push(propertyName + ':' + value);
            }
        }

        return cleaned.length ? cleaned.join(';') + ';' : '';
    }

    function stripEditorLayoutStylesFromCssBlock(css) {
        return (css || '').replace(/([^{}@]+)\{([^{}]*)\}/g, function (match, selector, declarationBlock) {
            var cleanedBlock = stripEditorLayoutDeclarations(declarationBlock);

            return cleanedBlock ? selector + '{' + cleanedBlock + '}' : '';
        });
    }

    function stripEditorLayoutStylesFromMediaBlocks(css) {
        var result = '',
            position = 0,
            mediaIndex,
            openBraceIndex,
            closeBraceIndex,
            mediaHeader,
            mediaContent,
            cleanedContent;

        css = css || '';

        while (position < css.length) {
            mediaIndex = css.indexOf('@media', position);

            if (mediaIndex === -1) {
                result += css.slice(position);
                break;
            }

            result += css.slice(position, mediaIndex);
            openBraceIndex = css.indexOf('{', mediaIndex);

            if (openBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            closeBraceIndex = findMatchingBrace(css, openBraceIndex);

            if (closeBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            mediaHeader = css.slice(mediaIndex, openBraceIndex + 1);
            mediaContent = css.slice(openBraceIndex + 1, closeBraceIndex);
            cleanedContent = stripEditorLayoutStylesFromCssBlock(mediaContent);

            if (trimValue(cleanedContent)) {
                result += mediaHeader + cleanedContent + '}';
            }

            position = closeBraceIndex + 1;
        }

        return result;
    }

    function convertCssBlockPercentPositionsToPx(css, width, height) {
        css = css.replace(/(left\s*:\s*)(-?\d+(?:\.\d+)?)%/gi, function (match, prefix, value) {
            return prefix + percentToPx(value + '%', width);
        });

        css = css.replace(/(top\s*:\s*)(-?\d+(?:\.\d+)?)%/gi, function (match, prefix, value) {
            return prefix + percentToPx(value + '%', height);
        });

        return css;
    }

    function convertLegacyPercentPositionsToPxForEditor(css) {
        var result = '',
            position = 0,
            mediaIndex,
            openBraceIndex,
            closeBraceIndex,
            mediaHeader,
            mediaContent,
            mediaMatch,
            deviceSize;

        css = css || '';

        while (position < css.length) {
            mediaIndex = css.indexOf('@media', position);

            if (mediaIndex === -1) {
                result += convertCssBlockPercentPositionsToPx(
                    css.slice(position),
                    gridSizes.desktop.width,
                    gridSizes.desktop.height
                );
                break;
            }

            result += convertCssBlockPercentPositionsToPx(
                css.slice(position, mediaIndex),
                gridSizes.desktop.width,
                gridSizes.desktop.height
            );

            openBraceIndex = css.indexOf('{', mediaIndex);

            if (openBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            closeBraceIndex = findMatchingBrace(css, openBraceIndex);

            if (closeBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            mediaHeader = css.slice(mediaIndex, openBraceIndex + 1);
            mediaContent = css.slice(openBraceIndex + 1, closeBraceIndex);

            mediaMatch = mediaHeader.match(/max-width\s*:\s*(\d+)px/i);
            deviceSize = mediaMatch
                ? getDeviceSizeForMedia(mediaMatch[1])
                : gridSizes.desktop;

            result += mediaHeader;
            result += convertCssBlockPercentPositionsToPx(
                mediaContent,
                deviceSize.width,
                deviceSize.height
            );
            result += '}';

            position = closeBraceIndex + 1;
        }

        return result;
    }

    function normalizeFreeBannerHtml(html) {
        var wrapper,
            root,
            stage,
            rootChildren,
            buttons,
            replacement,
            attribute,
            buttonUrl,
            imageSource,
            layers,
            i;

        html = cleanHtml(html || '');

        wrapper = document.createElement('div');
        wrapper.innerHTML = html;

        root = wrapper.querySelector('.lcb-free-banner-root');

        if (!root) {
            root = document.createElement('section');
            root.className = 'lcb-free-banner-root';

            stage = document.createElement('div');
            stage.className = 'lcb-free-banner-stage';

            while (wrapper.firstChild) {
                stage.appendChild(wrapper.firstChild);
            }

            root.appendChild(stage);
            wrapper.appendChild(root);
        }

        stage = root.querySelector('.lcb-free-banner-stage');

        if (!stage) {
            stage = document.createElement('div');
            stage.className = 'lcb-free-banner-stage';

            rootChildren = [];

            for (i = 0; i < root.childNodes.length; i++) {
                rootChildren.push(root.childNodes[i]);
            }

            for (i = 0; i < rootChildren.length; i++) {
                stage.appendChild(rootChildren[i]);
            }

            root.appendChild(stage);
        }

        buttons = root.querySelectorAll('.lcb-free-button');

        for (i = 0; i < buttons.length; i++) {
            replacement = buttons[i];

            if (buttons[i].tagName.toLowerCase() !== 'a') {
                replacement = document.createElement('a');

                while (buttons[i].firstChild) {
                    replacement.appendChild(buttons[i].firstChild);
                }

                for (attribute = 0; attribute < buttons[i].attributes.length; attribute++) {
                    replacement.setAttribute(
                        buttons[i].attributes[attribute].name,
                        buttons[i].attributes[attribute].value
                    );
                }

                buttons[i].parentNode.replaceChild(replacement, buttons[i]);
            }

            buttonUrl = replacement.getAttribute('href') || replacement.getAttribute('data-lcb-button-url') || '#';

            replacement.setAttribute('href', buttonUrl);
            replacement.setAttribute('data-gjs-type', 'lcb-free-button');
        }

        layers = root.querySelectorAll('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            if (layers[i].classList.contains('lcb-free-heading')) {
                layers[i].setAttribute('data-gjs-type', 'lcb-free-heading');
            } else if (layers[i].classList.contains('lcb-free-text')) {
                layers[i].setAttribute('data-gjs-type', 'lcb-free-text');
            } else if (layers[i].classList.contains('lcb-free-button')) {
                layers[i].setAttribute('data-gjs-type', 'lcb-free-button');
            } else if (layers[i].classList.contains('lcb-free-image')) {
                layers[i].setAttribute('data-gjs-type', 'lcb-free-image');

                imageSource = layers[i].getAttribute('src') || '';

                if (isFreeImagePlaceholderSource(imageSource)) {
                    imageSource = layers[i].getAttribute('data-lcb-free-image-src') || imageSource;
                }

                if (!imageSource) {
                    imageSource = FREE_IMAGE_PLACEHOLDER_SRC;
                }

                layers[i].setAttribute('src', imageSource);

                if (imageSource !== FREE_IMAGE_PLACEHOLDER_SRC) {
                    layers[i].setAttribute('data-lcb-free-image-src', imageSource);
                }
            }

            if (layers[i].parentNode !== stage) {
                stage.appendChild(layers[i]);
            }
        }

        return wrapper.innerHTML;
    }

    function getInitialFreeHtml() {
        return '<section class="lcb-free-banner-root">' +
            '<div class="lcb-free-banner-stage">' +
                '<div data-gjs-type="lcb-free-heading" class="lcb-free-layer lcb-free-heading" style="left:465px;top:86px;position:absolute;">Nagłówek</div>' +
                '<div data-gjs-type="lcb-free-text" class="lcb-free-layer lcb-free-text" style="left:516px;top:162px;position:absolute;">Tekst banera</div>' +
                '<a data-gjs-type="lcb-free-button" href="#" class="lcb-free-layer lcb-free-button" style="left:526px;top:212px;position:absolute;">Button</a>' +
            '</div>' +
        '</section>';
    }

    function hasClass(component, className) {
        var classes,
            i;

        if (!component || !component.getClasses) {
            return false;
        }

        classes = component.getClasses();

        for (i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                return true;
            }
        }

        return false;
    }

    function getFreeElementKindFromDomElement(element) {
        if (!element || !element.classList) {
            return '';
        }

        if (element.classList.contains('lcb-free-heading')) {
            return 'heading';
        }

        if (element.classList.contains('lcb-free-text')) {
            return 'text';
        }

        if (element.classList.contains('lcb-free-button')) {
            return 'button';
        }

        if (element.classList.contains('lcb-free-image')) {
            return 'image';
        }

        if (element.classList.contains('lcb-free-banner-stage')) {
            return 'stage';
        }

        if (element.classList.contains('lcb-free-banner-root')) {
            return 'root';
        }

        if (element.classList.contains('lcb-free-layer')) {
            return 'layer';
        }

        return '';
    }

    function getFreeElementKindFromComponent(component) {
        if (!component) {
            return '';
        }

        if (hasClass(component, 'lcb-free-heading')) {
            return 'heading';
        }

        if (hasClass(component, 'lcb-free-text')) {
            return 'text';
        }

        if (hasClass(component, 'lcb-free-button')) {
            return 'button';
        }

        if (hasClass(component, 'lcb-free-image')) {
            return 'image';
        }

        if (hasClass(component, 'lcb-free-banner-stage')) {
            return 'stage';
        }

        if (hasClass(component, 'lcb-free-banner-root')) {
            return 'root';
        }

        if (hasClass(component, 'lcb-free-layer')) {
            return 'layer';
        }

        return '';
    }

    function getFreeElementKindByIdFromHtml(html, id) {
        var wrapper,
            elements,
            i;

        if (!html || !id) {
            return '';
        }

        wrapper = document.createElement('div');
        wrapper.innerHTML = cleanHtml(html);
        elements = wrapper.querySelectorAll('.lcb-free-banner-root, .lcb-free-banner-stage, .lcb-free-layer');

        for (i = 0; i < elements.length; i++) {
            if (elements[i].getAttribute('id') === id) {
                return getFreeElementKindFromDomElement(elements[i]);
            }
        }

        return '';
    }

    function normalizeComparableCssColor(value) {
        value = value.replace(/\s+/g, '').toLowerCase();

        if (value === '#111' || value === '#111111') {
            return 'rgb(17,17,17)';
        }

        if (value === '#fff' || value === '#ffffff' || value === 'white') {
            return 'rgb(255,255,255)';
        }

        if (value === '#000' || value === '#000000' || value === 'black') {
            return 'rgb(0,0,0)';
        }

        return value;
    }

    function normalizeComparableCssValue(propertyName, value) {
        value = trimValue(value || '')
            .replace(/\s*!important\s*$/i, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();

        if (propertyName === 'font-family') {
            value = trimValue(value.split(',')[0]).replace(/^['"]|['"]$/g, '');
        }

        if (
            propertyName === 'color' ||
            propertyName === 'background' ||
            propertyName === 'background-color'
        ) {
            value = normalizeComparableCssColor(value);
        }

        if (propertyName === 'font-weight' && value === '700') {
            return 'bold';
        }

        if (value === '0') {
            return '0px';
        }

        return value;
    }

    function cssValueMatches(value, allowedValues) {
        var i;

        for (i = 0; i < allowedValues.length; i++) {
            if (value === allowedValues[i]) {
                return true;
            }
        }

        return false;
    }

    function isDefaultTextBaseStyle(propertyName, value) {
        if ((propertyName === 'margin' || propertyName.indexOf('margin-') === 0) && cssValueMatches(value, ['0px'])) {
            return true;
        }

        if ((propertyName === 'padding' || propertyName.indexOf('padding-') === 0) && cssValueMatches(value, ['0px'])) {
            return true;
        }

        if (propertyName === 'color' && cssValueMatches(value, ['rgb(17,17,17)'])) {
            return true;
        }

        if (propertyName === 'font-family' && cssValueMatches(value, ['arial'])) {
            return true;
        }

        if (propertyName === 'overflow-wrap' && value === 'anywhere') {
            return true;
        }

        if (propertyName === 'word-break' && value === 'normal') {
            return true;
        }

        return false;
    }

    function isDefaultFreeElementStyle(kind, propertyName, value) {
        propertyName = trimValue(propertyName || '').toLowerCase();
        value = normalizeComparableCssValue(propertyName, value);

        if (!kind || !propertyName || !value) {
            return false;
        }

        if (propertyName === 'box-sizing' && value === 'border-box') {
            return true;
        }

        if (propertyName === 'position' && (kind === 'layer' || kind === 'heading' || kind === 'text' || kind === 'button' || kind === 'image') && value === 'absolute') {
            return true;
        }

        if ((kind === 'heading' || kind === 'text') && isDefaultTextBaseStyle(propertyName, value)) {
            return true;
        }

        if (kind === 'heading') {
            if (propertyName === 'font-size' && cssValueMatches(value, ['48px', '42px', '34px', '30px'])) {
                return true;
            }

            if (propertyName === 'font-weight' && cssValueMatches(value, ['bold'])) {
                return true;
            }

            if (propertyName === 'line-height' && cssValueMatches(value, ['1.1', '52.8px', '46.2px', '37.4px', '33px'])) {
                return true;
            }
        }

        if (kind === 'text') {
            if (propertyName === 'font-size' && cssValueMatches(value, ['20px', '19px', '18px', '16px'])) {
                return true;
            }

            if (propertyName === 'font-weight' && cssValueMatches(value, ['400', 'normal'])) {
                return true;
            }

            if (propertyName === 'line-height' && cssValueMatches(value, ['1.4', '28px', '26.6px', '25.2px', '22.4px'])) {
                return true;
            }
        }

        if (kind === 'button') {
            if (propertyName === 'display' && value === 'inline-flex') {
                return true;
            }

            if ((propertyName === 'align-items' || propertyName === 'justify-content' || propertyName === 'text-align') && value === 'center') {
                return true;
            }

            if (propertyName === 'font-family' && cssValueMatches(value, ['arial'])) {
                return true;
            }

            if (propertyName === 'font-size' && cssValueMatches(value, ['16px', '15px'])) {
                return true;
            }

            if (propertyName === 'font-weight' && cssValueMatches(value, ['bold'])) {
                return true;
            }

            if (propertyName === 'line-height' && cssValueMatches(value, ['1.2', '19.2px', '18px'])) {
                return true;
            }

            if (propertyName === 'color' && cssValueMatches(value, ['rgb(255,255,255)'])) {
                return true;
            }

            if ((propertyName === 'background' || propertyName === 'background-color') && cssValueMatches(value, ['rgb(17,17,17)'])) {
                return true;
            }

            if (propertyName === 'border-radius' && cssValueMatches(value, ['999px'])) {
                return true;
            }

            if (propertyName.indexOf('border-') === 0 && propertyName.indexOf('-radius') !== -1 && cssValueMatches(value, ['999px'])) {
                return true;
            }

            if (propertyName === 'padding' && cssValueMatches(value, ['12px 22px', '10px 16px'])) {
                return true;
            }

            if ((propertyName === 'padding-top' || propertyName === 'padding-bottom') && cssValueMatches(value, ['12px', '10px'])) {
                return true;
            }

            if ((propertyName === 'padding-right' || propertyName === 'padding-left') && cssValueMatches(value, ['22px', '16px'])) {
                return true;
            }

            if (propertyName === 'text-decoration' && value === 'none') {
                return true;
            }

            if (propertyName === 'white-space' && value === 'normal') {
                return true;
            }
        }

        if (kind === 'image') {
            if (propertyName === 'display' && value === 'block') {
                return true;
            }

            if (propertyName === 'max-width' && value === '100%') {
                return true;
            }

            if (propertyName === 'height' && value === 'auto') {
                return true;
            }
        }

        return false;
    }

    function stripDefaultFreeStylesFromDeclarationBlock(kind, declarationBlock) {
        var declarations = (declarationBlock || '').split(';'),
            cleaned = [],
            declaration,
            colonIndex,
            propertyName,
            value,
            i;

        for (i = 0; i < declarations.length; i++) {
            declaration = trimValue(declarations[i]);

            if (!declaration) {
                continue;
            }

            colonIndex = declaration.indexOf(':');

            if (colonIndex === -1) {
                cleaned.push(declaration);
                continue;
            }

            propertyName = trimValue(declaration.slice(0, colonIndex));
            value = trimValue(declaration.slice(colonIndex + 1));

            if (!isDefaultFreeElementStyle(kind, propertyName, value)) {
                cleaned.push(propertyName + ':' + value);
            }
        }

        return cleaned.length ? cleaned.join(';') + ';' : '';
    }

    function stripDefaultFreeStylesFromHtml(html) {
        var wrapper,
            elements,
            element,
            kind,
            cleanedStyle,
            i;

        html = cleanHtml(html || '');

        if (!html) {
            return html;
        }

        wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        elements = wrapper.querySelectorAll('.lcb-free-banner-root, .lcb-free-banner-stage, .lcb-free-layer');

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            kind = getFreeElementKindFromDomElement(element);

            if (!kind || !element.getAttribute('style')) {
                continue;
            }

            cleanedStyle = stripDefaultFreeStylesFromDeclarationBlock(kind, element.getAttribute('style'));

            if (cleanedStyle) {
                element.setAttribute('style', cleanedStyle);
            } else {
                element.removeAttribute('style');
            }
        }

        return wrapper.innerHTML;
    }

    function stripDefaultFreeStylesFromCssBlock(css, getKindById) {
        return (css || '').replace(/#([a-zA-Z0-9_-]+)\s*\{([^{}]*)\}/g, function (match, id, declarationBlock) {
            var kind = getKindById ? getKindById(id) : '',
                cleanedBlock;

            if (!kind) {
                return match;
            }

            cleanedBlock = stripDefaultFreeStylesFromDeclarationBlock(kind, declarationBlock);

            return cleanedBlock ? '#' + id + '{' + cleanedBlock + '}' : '';
        });
    }

    function stripDefaultFreeStylesFromCss(css, getKindById) {
        var result = '',
            position = 0,
            mediaIndex,
            openBraceIndex,
            closeBraceIndex;

        css = css || '';

        while (position < css.length) {
            mediaIndex = css.indexOf('@media', position);

            if (mediaIndex === -1) {
                result += stripDefaultFreeStylesFromCssBlock(css.slice(position), getKindById);
                break;
            }

            result += stripDefaultFreeStylesFromCssBlock(css.slice(position, mediaIndex), getKindById);
            openBraceIndex = css.indexOf('{', mediaIndex);

            if (openBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            closeBraceIndex = findMatchingBrace(css, openBraceIndex);

            if (closeBraceIndex === -1) {
                result += css.slice(mediaIndex);
                break;
            }

            result += css.slice(mediaIndex, closeBraceIndex + 1);
            position = closeBraceIndex + 1;
        }

        return result;
    }

    function addComponentType(editor, type, className, defaults) {
        editor.DomComponents.addType(type, {
            isComponent: function (el) {
                if (el && el.classList && el.classList.contains(className)) {
                    return { type: type };
                }

                return false;
            },
            model: {
                defaults: defaults
            }
        });
    }

    function isFreeTextLayerElement(el) {
        if (!el || !el.classList) {
            return false;
        }

        return el.classList.contains('lcb-free-heading') ||
            el.classList.contains('lcb-free-text') ||
            el.classList.contains('lcb-free-button');
    }

    function isFreeTextLayerComponent(component) {
        return hasClass(component, 'lcb-free-heading') ||
            hasClass(component, 'lcb-free-text') ||
            hasClass(component, 'lcb-free-button');
    }

    function addFreeLayerComponentType(editor) {
        editor.DomComponents.addType('lcb-free-layer', {
            isComponent: function (el) {
                if (
                    el &&
                    el.classList &&
                    el.classList.contains('lcb-free-layer') &&
                    !isFreeTextLayerElement(el) &&
                    !el.classList.contains('lcb-free-image')
                ) {
                    return { type: 'lcb-free-layer' };
                }

                return false;
            },

            model: {
                defaults: {
                    selectable: true,
                    hoverable: true,
                    draggable: '.lcb-free-banner-stage',
                    droppable: false,
                    removable: true,
                    copyable: true,
                    highlightable: true,
                    layerable: true,
                    editable: false,
                    style: {
                        position: 'absolute'
                    }
                }
            }
        });
    }

    function getFreeVisualFormKey() {
        var formKeyInput;

        if (!saveForm || !saveForm.querySelector) {
            return '';
        }

        formKeyInput = saveForm.querySelector('input[name="form_key"]');

        return formKeyInput ? formKeyInput.value : '';
    }

    function uploadFreeImageFile(file, onSuccess, onError) {
        var formData,
            request,
            formKey;

        if (!freeImageUploadUrl) {
            onError('Upload URL is missing.');
            return;
        }

        if (!file) {
            onError('Please choose an image file.');
            return;
        }

        if (!window.FormData || !window.XMLHttpRequest) {
            onError('Your browser does not support file upload in this editor.');
            return;
        }

        formData = new window.FormData();
        formData.append('image', file);

        formKey = getFreeVisualFormKey();

        if (formKey) {
            formData.append('form_key', formKey);
        }

        request = new window.XMLHttpRequest();
        request.open('POST', freeImageUploadUrl, true);

        request.onreadystatechange = function () {
            var response;

            if (request.readyState !== 4) {
                return;
            }

            try {
                response = JSON.parse(request.responseText || '{}');
            } catch (e) {
                onError('Image upload failed.');
                return;
            }

            if (request.status >= 200 && request.status < 300 && response && response.success && response.url) {
                onSuccess(response.url);
                return;
            }

            onError(response && response.message ? response.message : 'Image upload failed.');
        };

        request.send(formData);
    }

    function isFreeImagePlaceholderSource(imageUrl) {
        return !imageUrl || imageUrl === FREE_IMAGE_PLACEHOLDER_SRC;
    }

    function getFreeImageSourceFromComponent(component) {
        var attributes,
            element,
            imageUrl;

        if (!component || !hasClass(component, 'lcb-free-image')) {
            return '';
        }

        element = component.view && component.view.el ? component.view.el : null;

        if (element) {
            imageUrl = element.getAttribute('src') || '';

            if (!isFreeImagePlaceholderSource(imageUrl)) {
                return imageUrl;
            }
        }

        attributes = getComponentAttributes(component);
        imageUrl = attributes['data-lcb-free-image-src'] || attributes.src || '';

        if (!isFreeImagePlaceholderSource(imageUrl)) {
            return imageUrl;
        }

        if (component.get) {
            imageUrl = component.get('src') || '';
        }

        return isFreeImagePlaceholderSource(imageUrl) ? '' : imageUrl;
    }

    function setFreeImageSourceOnComponent(component, imageUrl) {
        var element;

        if (!component || !hasClass(component, 'lcb-free-image') || !imageUrl) {
            return;
        }

        setComponentAttributes(component, {
            src: imageUrl,
            'data-lcb-free-image-src': imageUrl
        });

        if (component.set) {
            component.set('src', imageUrl);
        }

        element = component.view && component.view.el ? component.view.el : null;

        if (element) {
            element.setAttribute('src', imageUrl);
            element.setAttribute('data-lcb-free-image-src', imageUrl);
        }
    }

    function syncFreeImageSourcesForSave() {
        var stage = getStageComponent(),
            images,
            imageUrl,
            i;

        if (!stage || !stage.find) {
            return;
        }

        images = stage.find('.lcb-free-image');

        for (i = 0; i < images.length; i++) {
            imageUrl = getFreeImageSourceFromComponent(images[i]);

            if (imageUrl) {
                setFreeImageSourceOnComponent(images[i], imageUrl);
            }
        }
    }

    function applyUploadedFreeImage(component, imageUrl) {
        setFreeImageSourceOnComponent(component, imageUrl);
        storeLayerLayoutForDevice(component, currentDeviceKey, true);
        normalizeFreeBannerComponentsTree();
        setFreeImageSourceOnComponent(component, imageUrl);
        repairAllLayerLayouts();
        ensureAllLayerLayouts(true);
        updateEditorDevicePreviewFrame();
    }

    function chooseFreeImageFileForComponent(component, button) {
        var input = document.createElement('input'),
            originalText = button ? button.innerHTML : '';

        if (!component || !hasClass(component, 'lcb-free-image')) {
            window.alert('Select a Free Image element first.');
            return;
        }

        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif';
        input.style.display = 'none';

        input.onchange = function () {
            var file = input.files && input.files.length ? input.files[0] : null;

            if (!file) {
                document.body.removeChild(input);
                return;
            }

            if (button) {
                button.disabled = true;
                button.innerHTML = 'Uploading...';
            }

            uploadFreeImageFile(file, function (imageUrl) {
                applyUploadedFreeImage(component, imageUrl);

                if (button) {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }

                document.body.removeChild(input);
            }, function (message) {
                if (button) {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }

                document.body.removeChild(input);
                window.alert(message);
            });
        };

        document.body.appendChild(input);
        input.click();
    }

    function addFreeImageUploadTraitType(editor) {
        if (!editor || !editor.TraitManager || !editor.TraitManager.addType) {
            return;
        }

        editor.TraitManager.addType('lcb-free-image-upload', {
            createInput: function () {
                var wrapper = document.createElement('div'),
                    button = document.createElement('button');

                button.type = 'button';
                button.className = 'lcb-free-image-upload-button';
                button.innerHTML = 'Dodaj';

                button.onclick = function (event) {
                    var selected = editor.getSelected ? editor.getSelected() : null;

                    if (event && event.preventDefault) {
                        event.preventDefault();
                    }

                    chooseFreeImageFileForComponent(selected, button);
                };

                wrapper.appendChild(button);

                return wrapper;
            }
        });
    }

    function addFreeImageComponentType(editor) {
        editor.DomComponents.addType('lcb-free-image', {
            extend: 'image',

            isComponent: function (el) {
                if (el && el.classList && el.classList.contains('lcb-free-image')) {
                    return { type: 'lcb-free-image' };
                }

                return false;
            },

            model: {
                defaults: {
                    name: 'Lcb-free-image',
                    tagName: 'img',
                    selectable: true,
                    hoverable: true,
                    draggable: '.lcb-free-banner-stage',
                    droppable: false,
                    removable: true,
                    copyable: true,
                    highlightable: true,
                    layerable: true,
                    editable: true,
                    attributes: {
                        src: FREE_IMAGE_PLACEHOLDER_SRC,
                        alt: ''
                    },
                    style: {
                        position: 'absolute',
                        width: '160px',
                        height: '90px',
                        'object-fit': 'contain'
                    },
                    traits: [
                        {
                            type: 'lcb-free-image-upload',
                            name: 'free-image-upload',
                            label: 'Image file'
                        },
                        {
                            type: 'text',
                            name: 'src',
                            label: 'Image URL'
                        },
                        {
                            type: 'text',
                            name: 'alt',
                            label: 'Alt'
                        }
                    ]
                }
            }
        });
    }

    function addFreeTextComponentType(editor, type, className) {
        var defaults = {
            name: className.charAt(0).toUpperCase() + className.slice(1),
            selectable: true,
            hoverable: true,
            draggable: '.lcb-free-banner-stage',
            droppable: false,
            removable: true,
            copyable: true,
            highlightable: true,
            layerable: true,
            editable: true,
            textable: true,
            style: {
                position: 'absolute'
            }
        };

        if (className === 'lcb-free-button') {
            defaults.tagName = 'a';
            defaults.attributes = {
                href: '#'
            };
            defaults.traits = [
                {
                    type: 'text',
                    name: 'href',
                    label: 'URL',
                    placeholder: 'https://example.com'
                },
                {
                    type: 'select',
                    name: 'target',
                    label: 'Open in',
                    options: [
                        { id: '', name: 'Same window', label: 'Same window' },
                        { id: '_blank', name: 'New window', label: 'New window' }
                    ]
                },
                {
                    type: 'text',
                    name: 'title',
                    label: 'Title'
                }
            ];
        }

        editor.DomComponents.addType(type, {
            extend: 'text',

            isComponent: function (el) {
                if (el && el.classList && el.classList.contains(className)) {
                    return { type: type };
                }

                return false;
            },

            model: {
                defaults: defaults
            }
        });
    }

    var initialHtml = initialHtmlField ? initialHtmlField.getValue() : '',
        initialCss = initialCssField ? initialCssField.getValue() : '';

    if (!initialHtml || trimValue(initialHtml) === '') {
        initialHtml = getInitialFreeHtml();
    }

    initialHtml = normalizeFreeBannerHtml(initialHtml);
    initialHtml = stripDefaultFreeStylesFromHtml(initialHtml);
    initialCss = stripDefaultFreeStylesFromCss(initialCss, function (id) {
        return getFreeElementKindByIdFromHtml(initialHtml, id);
    });
    initialCss = convertLegacyPercentPositionsToPxForEditor(cleanCss(initialCss));

    var initialLayoutCss = initialCss;
    var previewCss = [
        '.lcb-free-banner-root,.lcb-free-banner-root *{box-sizing:border-box;}',

        '.lcb-free-banner-root{position:relative;display:block;width:' + gridSizes.desktop.width + 'px;height:' +
            gridSizes.desktop.height + 'px;min-height:' + gridSizes.desktop.height + 'px;overflow:hidden;background:rgba(0,0,0,.08);margin:0 auto;}',
        '.lcb-free-banner-stage{position:absolute;left:0;top:0;display:block;width:' + gridSizes.desktop.width + 'px;height:' +
            gridSizes.desktop.height + 'px;min-height:' + gridSizes.desktop.height + 'px;overflow:hidden;}',
        '.lcb-free-layer{position:absolute;box-sizing:border-box;}',

        '.lcb-free-heading,.lcb-free-text{margin:0;padding:0;color:#111;font-family:Arial,Helvetica,sans-serif;overflow-wrap:anywhere;word-break:normal;}',
        '.lcb-free-heading{font-size:48px;font-weight:700;line-height:1.1;}',
        '.lcb-free-text{font-size:20px;font-weight:400;line-height:1.4;}',
        '.lcb-free-copy-text{cursor:pointer;}',

        '.lcb-free-button,.lcb-free-button:link,.lcb-free-button:visited,.lcb-free-button:hover,.lcb-free-button:focus,.lcb-free-button:active{display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border-radius:999px;background:#111;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:normal;box-sizing:border-box;}',

        '.lcb-free-image{display:block;max-width:100%;height:auto;}',

        '@media (max-width:1024px){.lcb-free-heading{font-size:42px;}.lcb-free-text{font-size:19px;}}',
        '@media (max-width:480px){.lcb-free-heading{font-size:34px;}.lcb-free-text{font-size:18px;}.lcb-free-button,.lcb-free-button:link,.lcb-free-button:visited,.lcb-free-button:hover,.lcb-free-button:focus,.lcb-free-button:active{padding:10px 16px;font-size:15px;}}',
        '@media (max-width:390px){.lcb-free-heading{font-size:30px;}.lcb-free-text{font-size:16px;}}'
    ];

    function freeBannerPlugin(editor) {
        addComponentType(editor, 'lcb-free-banner-root', 'lcb-free-banner-root', {
            selectable: true,
            hoverable: true,
            draggable: false,
            droppable: false,
            removable: false,
            copyable: false,
            highlightable: true,
            layerable: true
        });

        addComponentType(editor, 'lcb-free-banner-stage', 'lcb-free-banner-stage', {
            selectable: true,
            hoverable: true,
            draggable: false,
            droppable: '.lcb-free-layer',
            removable: false,
            copyable: false,
            highlightable: true,
            layerable: true
        });

        addFreeLayerComponentType(editor);
        addFreeImageUploadTraitType(editor);
        addFreeImageComponentType(editor);

        addFreeTextComponentType(editor, 'lcb-free-heading', 'lcb-free-heading');
        addFreeTextComponentType(editor, 'lcb-free-text', 'lcb-free-text');
        addFreeTextComponentType(editor, 'lcb-free-button', 'lcb-free-button');
    }

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
                {
                    id: 'Desktop',
                    name: 'Desktop',
                    width: deviceViewports.desktop.width + 'px',
                    height: deviceViewports.desktop.height + 'px',
                    widthMedia: ''
                },
                {
                    id: 'Tablet',
                    name: 'Tablet',
                    width: deviceViewports.tablet.width + 'px',
                    height: deviceViewports.tablet.height + 'px',
                    widthMedia: deviceLayouts.tablet.maxWidth + 'px'
                },
                {
                    id: 'Mobile Large',
                    name: 'Mobile Large',
                    width: deviceViewports.mobileLarge.width + 'px',
                    height: deviceViewports.mobileLarge.height + 'px',
                    widthMedia: deviceLayouts.mobileLarge.maxWidth + 'px'
                },
                {
                    id: 'Mobile Small',
                    name: 'Mobile Small',
                    width: deviceViewports.mobileSmall.width + 'px',
                    height: deviceViewports.mobileSmall.height + 'px',
                    widthMedia: deviceLayouts.mobileSmall.maxWidth + 'px'
                }
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
                    content: '<div data-gjs-type="lcb-free-heading" class="lcb-free-layer lcb-free-heading" style="left:120px;top:80px;position:absolute;">Nagłówek</div>'
                },
                {
                    id: 'lcb-free-text',
                    label: 'Free Text',
                    content: '<div data-gjs-type="lcb-free-text" class="lcb-free-layer lcb-free-text" style="left:120px;top:150px;position:absolute;">Tekst banera</div>'
                },
                {
                    id: 'lcb-free-copy-text',
                    label: 'Copy Text',
                    content: '<div data-gjs-type="lcb-free-text" class="lcb-free-layer lcb-free-text lcb-free-copy-text" style="left:120px;top:150px;position:absolute;">Kod promocyjny</div>'
                },
                {
                    id: 'lcb-free-button',
                    label: 'Free Button',
                    content: '<a data-gjs-type="lcb-free-button" href="#" class="lcb-free-layer lcb-free-button" style="left:120px;top:220px;position:absolute;">Button</a>'
                },
                {
                    id: 'lcb-free-image',
                    label: 'Free Image',
                    content: '<img data-gjs-type="lcb-free-image" src="' + FREE_IMAGE_PLACEHOLDER_SRC + '" alt="" class="lcb-free-layer lcb-free-image" style="left:120px;top:280px;width:160px;height:90px;object-fit:contain;position:absolute;" />'
                }
            ]
        }
    });

    function enableFreeDragMode() {
        if (editor.setDragMode) {
            editor.setDragMode('absolute');
        }
    }

    function getSelectedDeviceKey() {
        var device = editor.DeviceManager && editor.DeviceManager.getSelected
            ? editor.DeviceManager.getSelected()
            : null;

        var deviceId = device && device.id ? device.id : 'Desktop';

        if (deviceId === 'Tablet') {
            return 'tablet';
        }

        if (deviceId === 'Mobile Large') {
            return 'mobileLarge';
        }

        if (deviceId === 'Mobile Small') {
            return 'mobileSmall';
        }

        return 'desktop';
    }

    function getDeviceNameForKey(deviceKey) {
        if (deviceKey === 'tablet') {
            return 'Tablet';
        }

        if (deviceKey === 'mobileLarge') {
            return 'Mobile Large';
        }

        if (deviceKey === 'mobileSmall') {
            return 'Mobile Small';
        }

        return 'Desktop';
    }

    function normalizeDeviceKey(deviceKey) {
        return gridSizes[deviceKey] ? deviceKey : 'desktop';
    }

    function getCurrentDeviceKey() {
        return currentDeviceKey;
    }

    function getCurrentDeviceGridSize() {
        return gridSizes[getCurrentDeviceKey()] || gridSizes.desktop;
    }

    function getCurrentDeviceViewportSize() {
        return deviceViewports[getCurrentDeviceKey()] || getCurrentDeviceGridSize();
    }

    function getLayoutAttributeName(deviceKey, propertyName) {
        return 'data-lcb-layout-' + layoutAttributeKeys[deviceKey] + '-' + propertyName;
    }

    function getLayoutEditedAttributeName(deviceKey) {
        return 'data-lcb-layout-' + layoutAttributeKeys[deviceKey] + '-edited';
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getComponentAttributes(component) {
        if (!component) {
            return {};
        }

        if (component.getAttributes) {
            return component.getAttributes() || {};
        }

        if (component.get) {
            return component.get('attributes') || {};
        }

        return {};
    }

    function setComponentAttributes(component, attributes) {
        var currentAttributes,
            nextAttributes,
            key;

        if (!component || !attributes) {
            return;
        }

        if (component.addAttributes) {
            component.addAttributes(attributes);
            return;
        }

        if (component.set) {
            currentAttributes = getComponentAttributes(component);
            nextAttributes = {};

            for (key in currentAttributes) {
                if (Object.prototype.hasOwnProperty.call(currentAttributes, key)) {
                    nextAttributes[key] = currentAttributes[key];
                }
            }

            for (key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    nextAttributes[key] = attributes[key];
                }
            }

            component.set('attributes', nextAttributes);
        }
    }

    function getLayerLayoutNumber(layer, deviceKey, propertyName) {
        var attributes = getComponentAttributes(layer),
            value = attributes[getLayoutAttributeName(deviceKey, propertyName)];

        value = parseFloat(value);

        return isNaN(value) ? null : value;
    }

    function isLayerLayoutEdited(layer, deviceKey) {
        var attributes = getComponentAttributes(layer);

        return attributes[getLayoutEditedAttributeName(deviceKey)] === '1';
    }

    function setLayerLayoutNumbers(layer, deviceKey, values, markEdited) {
        var attributes = {},
            key;

        for (key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                attributes[getLayoutAttributeName(deviceKey, key)] = normalizeCssNumber(values[key]);
            }
        }

        if (markEdited) {
            attributes[getLayoutEditedAttributeName(deviceKey)] = '1';
        }

        setComponentAttributes(layer, attributes);
    }

    function projectLayoutPosition(basePosition, baseStageSize, targetStageSize, baseLayerSize, targetLayerSize) {
        var baseRange = baseStageSize - baseLayerSize,
            targetRange = targetStageSize - targetLayerSize;

        if (baseRange <= 0) {
            return 0;
        }

        if (targetRange < 0) {
            targetRange = 0;
        }

        return (basePosition / baseRange) * targetRange;
    }

    function storeLayerLayoutForDevice(layer, deviceKey, markEdited) {
        var renderedSize,
            existingLeft,
            existingTop,
            existingWidth,
            existingHeight,
            left,
            top,
            styleWidth,
            styleHeight,
            width,
            height;

        if (!layer || !hasClass(layer, 'lcb-free-layer')) {
            return;
        }

        renderedSize = getLayerRenderedSize(layer);
        existingLeft = getLayerLayoutNumber(layer, deviceKey, 'left');
        existingTop = getLayerLayoutNumber(layer, deviceKey, 'top');
        existingWidth = getLayerLayoutNumber(layer, deviceKey, 'width');
        existingHeight = getLayerLayoutNumber(layer, deviceKey, 'height');

        left = getLayerNumberStyle(layer, 'left');
        top = getLayerNumberStyle(layer, 'top');

        if (left === null) {
            left = existingLeft !== null ? existingLeft : 0;
        }

        if (top === null) {
            top = existingTop !== null ? existingTop : 0;
        }

        styleWidth = getLayerNumberStyle(layer, 'width');
        styleHeight = getLayerNumberStyle(layer, 'height');

        width = styleWidth !== null
            ? styleWidth
            : (existingWidth !== null ? existingWidth : renderedSize.width);
        height = styleHeight !== null
            ? styleHeight
            : (existingHeight !== null ? existingHeight : renderedSize.height);

        width = width || 0;
        height = height || 0;

        setLayerLayoutNumbers(layer, deviceKey, {
            left: left,
            top: top,
            width: width,
            height: height
        }, markEdited);
    }

    function storeAllLayerLayoutsForDevice(deviceKey, markEdited) {
        var stage = getStageComponent(),
            layers,
            i;

        if (!stage) {
            return;
        }

        layers = stage.find('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            storeLayerLayoutForDevice(layers[i], deviceKey, markEdited);
        }
    }

    function deriveLayerLayout(layer, sourceDeviceKey, targetDeviceKey) {
        var sourceGrid = gridSizes[sourceDeviceKey] || gridSizes.desktop,
            targetGrid = gridSizes[targetDeviceKey] || gridSizes.desktop,
            sourceLeft = getLayerLayoutNumber(layer, sourceDeviceKey, 'left'),
            sourceTop = getLayerLayoutNumber(layer, sourceDeviceKey, 'top'),
            sourceWidth = getLayerLayoutNumber(layer, sourceDeviceKey, 'width'),
            sourceHeight = getLayerLayoutNumber(layer, sourceDeviceKey, 'height'),
            targetLeft,
            targetTop;

        if (sourceLeft === null) {
            sourceLeft = 0;
        }

        if (sourceTop === null) {
            sourceTop = 0;
        }

        if (sourceWidth === null) {
            sourceWidth = 0;
        }

        if (sourceHeight === null) {
            sourceHeight = 0;
        }

        targetLeft = projectLayoutPosition(
            sourceLeft,
            sourceGrid.width,
            targetGrid.width,
            sourceWidth,
            sourceWidth
        );

        targetTop = projectLayoutPosition(
            sourceTop,
            sourceGrid.height,
            targetGrid.height,
            sourceHeight,
            sourceHeight
        );

        setLayerLayoutNumbers(layer, targetDeviceKey, {
            left: targetLeft,
            top: targetTop,
            width: sourceWidth,
            height: sourceHeight
        }, false);
    }

    function hasNonZeroPosition(left, top) {
        return Math.abs(left || 0) > 0.01 || Math.abs(top || 0) > 0.01;
    }

    function repairDesktopLayoutFromCss(layer) {
        var cssLeft,
            cssTop,
            desktopLeft,
            desktopTop,
            renderedSize,
            width,
            height;

        if (!layer || !hasClass(layer, 'lcb-free-layer')) {
            return;
        }

        cssLeft = getLayerCssRuleNumberStyle(initialLayoutCss, layer, 'left');
        cssTop = getLayerCssRuleNumberStyle(initialLayoutCss, layer, 'top');

        if (cssLeft === null && cssTop === null) {
            return;
        }

        if (cssLeft === null) {
            cssLeft = 0;
        }

        if (cssTop === null) {
            cssTop = 0;
        }

        desktopLeft = getLayerLayoutNumber(layer, 'desktop', 'left');
        desktopTop = getLayerLayoutNumber(layer, 'desktop', 'top');

        if (
            desktopLeft !== null &&
            desktopTop !== null &&
            (!hasNonZeroPosition(cssLeft, cssTop) || hasNonZeroPosition(desktopLeft, desktopTop))
        ) {
            return;
        }

        renderedSize = getLayerRenderedSize(layer);
        width = getLayerLayoutNumber(layer, 'desktop', 'width');
        height = getLayerLayoutNumber(layer, 'desktop', 'height');

        if (!width) {
            width = renderedSize.width || getLayerCssRuleNumberStyle(initialLayoutCss, layer, 'width') || 0;
        }

        if (!height) {
            height = renderedSize.height || getLayerCssRuleNumberStyle(initialLayoutCss, layer, 'height') || 0;
        }

        setLayerLayoutNumbers(layer, 'desktop', {
            left: cssLeft,
            top: cssTop,
            width: width,
            height: height
        }, false);
    }

    function repairInheritedLayoutFromDesktop(layer, deviceKey) {
        if (deviceKey === 'desktop' || isLayerLayoutEdited(layer, deviceKey)) {
            return;
        }

        deriveLayerLayout(layer, 'desktop', deviceKey);
    }

    function repairLayerLayouts(layer) {
        var i,
            deviceKey;

        repairDesktopLayoutFromCss(layer);

        for (i = 0; i < layoutDevices.length; i++) {
            deviceKey = layoutDevices[i];
            repairInheritedLayoutFromDesktop(layer, deviceKey);
        }
    }

    function repairAllLayerLayouts() {
        var stage = getStageComponent(),
            layers,
            i;

        if (!stage) {
            return;
        }

        layers = stage.find('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            repairLayerLayouts(layers[i]);
        }
    }

    function ensureLayerLayouts(layer, seedCurrentLayout) {
        var deviceKey,
            i;

        if (!layer || !hasClass(layer, 'lcb-free-layer')) {
            return;
        }

        if (seedCurrentLayout && getLayerLayoutNumber(layer, currentDeviceKey, 'left') === null) {
            storeLayerLayoutForDevice(layer, currentDeviceKey);
        }

        if (getLayerLayoutNumber(layer, 'desktop', 'left') === null) {
            if (currentDeviceKey !== 'desktop' && getLayerLayoutNumber(layer, currentDeviceKey, 'left') !== null) {
                deriveLayerLayout(layer, currentDeviceKey, 'desktop');
            } else {
                storeLayerLayoutForDevice(layer, 'desktop');
            }
        }

        for (i = 0; i < layoutDevices.length; i++) {
            deviceKey = layoutDevices[i];

            if (getLayerLayoutNumber(layer, deviceKey, 'left') === null) {
                deriveLayerLayout(layer, 'desktop', deviceKey);
            }
        }
    }

    function ensureAllLayerLayouts(seedCurrentLayout) {
        var stage = getStageComponent(),
            layers,
            i;

        if (!stage) {
            return;
        }

        layers = stage.find('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            ensureLayerLayouts(layers[i], seedCurrentLayout);
        }
    }

    function applyLayerLayoutForDevice(layer, deviceKey) {
        var left,
            top,
            width,
            height,
            style;

        if (!layer || !hasClass(layer, 'lcb-free-layer')) {
            return;
        }

        ensureLayerLayouts(layer, false);

        left = getLayerLayoutNumber(layer, deviceKey, 'left');
        top = getLayerLayoutNumber(layer, deviceKey, 'top');

        if (left === null) {
            left = 0;
        }

        if (top === null) {
            top = 0;
        }

        style = {
            left: normalizeCssNumber(left) + 'px',
            top: normalizeCssNumber(top) + 'px',
            position: 'absolute'
        };

        if (hasClass(layer, 'lcb-free-image')) {
            width = getLayerLayoutNumber(layer, deviceKey, 'width');
            height = getLayerLayoutNumber(layer, deviceKey, 'height');

            if (width !== null && width > 0) {
                style.width = normalizeCssNumber(width) + 'px';
            }

            if (height !== null && height > 0) {
                style.height = normalizeCssNumber(height) + 'px';
            }

            style['object-fit'] = 'contain';
        }

        layer.addStyle(style);
    }

    function applyAllLayerLayoutsForDevice(deviceKey) {
        var stage = getStageComponent(),
            layers,
            i;

        if (!stage) {
            return;
        }

        layers = stage.find('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            applyLayerLayoutForDevice(layers[i], deviceKey);
        }
    }

    function setEditorElementSize(element, width, height) {
        if (!element || !element.style) {
            return;
        }

        element.style.width = normalizeCssNumber(width) + 'px';
        element.style.height = normalizeCssNumber(height) + 'px';
        element.style.minHeight = normalizeCssNumber(height) + 'px';
    }

    function syncEditorDeviceFrameSize() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
                ? editor.Canvas.getFrameEl()
                : null,
            wrapper,
            gridSize = getCurrentDeviceGridSize();

        if (!frame || !gridSize) {
            return;
        }

        setEditorElementSize(frame, gridSize.width, gridSize.height);

        wrapper = frame.parentNode;

        if (wrapper && wrapper.className && String(wrapper.className).indexOf('gjs-frame-wrapper') !== -1) {
            setEditorElementSize(wrapper, gridSize.width, gridSize.height);
        }
    }

    function updateEditorDevicePreviewFrame() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null,
            doc,
            style,
            backgroundUrl,
            gridSize = getCurrentDeviceGridSize();

        if (!frame || !frame.contentDocument) {
            return;
        }

        doc = frame.contentDocument;
        syncEditorDeviceFrameSize();
        style = doc.getElementById('lcb-free-editor-device-preview-css');

        if (!style) {
            style = doc.createElement('style');
            style.id = 'lcb-free-editor-device-preview-css';
            style.type = 'text/css';
            doc.head.appendChild(style);
        }

        backgroundUrl = getBackgroundPreviewUrlForDevice(currentDeviceKey);

        style.innerHTML = '';
        style.appendChild(doc.createTextNode(
            'html,body{' +
                'margin:0!important;' +
                'width:' + gridSize.width + 'px!important;' +
                'height:' + gridSize.height + 'px!important;' +
                'min-height:' + gridSize.height + 'px!important;' +
                'overflow:hidden!important;' +
            '}' +
            '.lcb-free-banner-root{' +
                'width:' + gridSize.width + 'px!important;' +
                'height:' + gridSize.height + 'px!important;' +
                'min-height:' + gridSize.height + 'px!important;' +
                'max-width:none!important;' +
            '}' +
            '.lcb-free-banner-stage{' +
                'width:' + gridSize.width + 'px!important;' +
                'height:' + gridSize.height + 'px!important;' +
                'min-height:' + gridSize.height + 'px!important;' +
                'max-width:none!important;' +
            '}'
        ));

        applyEditorBackgroundPreviewToCanvasDom(doc, backgroundUrl, currentDeviceKey);

        window.setTimeout(function () {
            applyEditorBackgroundPreviewToCanvasDom(doc, backgroundUrl, currentDeviceKey);
        }, 50);
    }

    function switchFreeEditorDevice(nextDeviceKey) {
        if (!nextDeviceKey) {
            nextDeviceKey = 'desktop';
        }

        repairAllLayerLayouts();
        currentDeviceKey = normalizeDeviceKey(nextDeviceKey);
        setRootEditorDeviceKey(currentDeviceKey);
        ensureAllLayerLayouts(false);
        applyAllLayerLayoutsForDevice(currentDeviceKey);
        updateEditorDevicePreviewFrame();
    }

    function setFreeEditorDefaultZoom() {
        var canvasElement,
            canvasRect,
            gridSize,
            availableWidth,
            availableHeight,
            widthZoom,
            heightZoom,
            zoom;

        if (!editor.Canvas || !editor.Canvas.setZoom || !editor.Canvas.getElement) {
            return;
        }

        canvasElement = editor.Canvas.getElement();

        if (!canvasElement) {
            return;
        }

        canvasRect = canvasElement.getBoundingClientRect();
        gridSize = getCurrentDeviceGridSize();

        availableWidth = canvasRect.width - 120;
        availableHeight = canvasRect.height - 120;

        if (!availableWidth || availableWidth <= 0 || !gridSize.width) {
            editor.Canvas.setZoom(70);
            return;
        }

        widthZoom = (availableWidth / gridSize.width) * 100;
        heightZoom = availableHeight > 0 && gridSize.height
            ? (availableHeight / gridSize.height) * 100
            : widthZoom;

        zoom = Math.floor(Math.min(widthZoom, heightZoom));

        if (zoom > 80) {
            zoom = 80;
        }

        if (zoom < 35) {
            zoom = 35;
        }

        editor.Canvas.setZoom(zoom);
    }

    function centerFreeEditorCanvas() {
        var canvasElement,
            frameElement,
            canvasRect,
            frameRect,
            currentCoords,
            targetLeft,
            targetTop,
            deltaX,
            deltaY;

        if (!editor.Canvas || !editor.Canvas.getElement || !editor.Canvas.getFrameEl || !editor.Canvas.setCoords) {
            return;
        }

        canvasElement = editor.Canvas.getElement();
        frameElement = editor.Canvas.getFrameEl();

        if (!canvasElement || !frameElement) {
            return;
        }

        canvasRect = canvasElement.getBoundingClientRect();
        frameRect = frameElement.getBoundingClientRect();

        currentCoords = editor.Canvas.getCoords
            ? editor.Canvas.getCoords()
            : { x: 0, y: 0 };

        targetLeft = canvasRect.left + ((canvasRect.width - frameRect.width) / 2);
        targetTop = canvasRect.top + 30;

        deltaX = targetLeft - frameRect.left;
        deltaY = targetTop - frameRect.top;

        editor.Canvas.setCoords(
            currentCoords.x + deltaX,
            currentCoords.y + deltaY
        );
    }

    function injectPreviewCssToCanvas() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null,
            doc,
            style;

        if (!frame || !frame.contentDocument) {
            return;
        }

        doc = frame.contentDocument;
        style = doc.getElementById('lcb-free-editor-preview-css');

        if (!style) {
            style = doc.createElement('style');
            style.id = 'lcb-free-editor-preview-css';
            doc.head.appendChild(style);
        }

        style.innerHTML = previewCss.join('\n');
    }

    function getRootComponent() {
        var wrapper = editor.getWrapper();

        return wrapper ? wrapper.find('.lcb-free-banner-root')[0] : null;
    }

    function getSavedEditorDeviceKey() {
        var root = getRootComponent(),
            attributes = getComponentAttributes(root),
            deviceKey = attributes['data-lcb-editor-device'];

        return deviceKey && gridSizes[deviceKey] ? deviceKey : '';
    }

    function setRootEditorDeviceKey(deviceKey) {
        var root = getRootComponent(),
            attributes = {};

        if (!root) {
            return;
        }

        attributes['data-lcb-editor-device'] = normalizeDeviceKey(deviceKey);
        setComponentAttributes(root, attributes);
    }

    function getStageComponent() {
        var root = getRootComponent(),
            stage;

        if (!root) {
            return null;
        }

        stage = root.find('.lcb-free-banner-stage')[0];

        if (!stage) {
            stage = root.components().add({
                tagName: 'div',
                type: 'lcb-free-banner-stage',
                classes: ['lcb-free-banner-stage'],
                selectable: true,
                hoverable: true,
                draggable: false,
                droppable: '.lcb-free-layer',
                removable: false,
                copyable: false,
                highlightable: true,
                layerable: true
            });
        }

        return stage;
    }

    function forceLayerOptions(layer) {
        var textLayer;

        if (!layer) {
            return;
        }

        textLayer = isFreeTextLayerComponent(layer);

        layer.set({
            draggable: '.lcb-free-banner-stage',
            droppable: false,
            removable: true,
            copyable: true,
            layerable: true,
            selectable: true,
            hoverable: true,
            editable: textLayer,
            textable: textLayer
        });

        if (layer.addStyle) {
            layer.addStyle({
                position: 'absolute'
            });
        }
    }

    function getLayerId(layer) {
        var attributes;

        if (!layer) {
            return '';
        }

        if (layer.getId) {
            return layer.getId();
        }

        attributes = getComponentAttributes(layer);

        return attributes.id || '';
    }

    function findComponentById(component, id) {
        var children,
            child,
            found,
            i;

        if (!component || !id) {
            return null;
        }

        if (getLayerId(component) === id) {
            return component;
        }

        children = component.components ? component.components() : null;

        if (!children) {
            return null;
        }

        for (i = 0; i < children.length; i++) {
            child = children.at ? children.at(i) : children[i];
            found = findComponentById(child, id);

            if (found) {
                return found;
            }
        }

        return null;
    }

    function getFreeElementKindByCurrentComponentId(id) {
        var wrapper = editor.getWrapper ? editor.getWrapper() : null,
            component = findComponentById(wrapper, id);

        return getFreeElementKindFromComponent(component);
    }

    function findClosestFreeTextLayerElement(element, stopElement) {
        while (element && element !== stopElement) {
            if (
                element.classList &&
                element.classList.contains('lcb-free-layer') &&
                isFreeTextLayerElement(element)
            ) {
                return element;
            }

            element = element.parentNode;
        }

        return null;
    }

    function beginTextLayerEditing(layer) {
        var element;

        if (!layer || !isFreeTextLayerComponent(layer)) {
            return;
        }

        forceLayerOptions(layer);

        if (editor.select) {
            editor.select(layer);
        }

        if (layer.trigger) {
            layer.trigger('focus');
        }

        element = layer.view && layer.view.el ? layer.view.el : null;

        if (element && element.focus) {
            window.setTimeout(function () {
                element.focus();
            }, 0);
        }
    }

    function bindFreeTextEditingToCanvas() {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
            ? editor.Canvas.getFrameEl()
            : null,
            doc;

        if (!frame || !frame.contentDocument) {
            return;
        }

        doc = frame.contentDocument;

        if (doc.lcbFreeTextEditingBound) {
            return;
        }

        doc.lcbFreeTextEditingBound = true;

        doc.addEventListener('dragover', rememberFreeBlockDropPoint, true);
        doc.addEventListener('drop', rememberFreeBlockDropPoint, true);

        doc.addEventListener('click', function (event) {
            var element = event.target;

            while (element && element !== doc.body) {
                if (
                    element.tagName &&
                    element.tagName.toLowerCase() === 'a' &&
                    element.classList &&
                    element.classList.contains('lcb-free-button')
                ) {
                    event.preventDefault();
                    return;
                }

                element = element.parentNode;
            }
        }, true);

        doc.addEventListener('dblclick', function (event) {
            var element = findClosestFreeTextLayerElement(event.target, doc.body),
                wrapper,
                component;

            if (!element) {
                return;
            }

            if (element.getAttribute('contenteditable') === 'true') {
                return;
            }

            event.preventDefault();

            wrapper = editor.getWrapper ? editor.getWrapper() : null;
            component = findComponentById(wrapper, element.id);

            beginTextLayerEditing(component);
        }, true);
    }

    function isFreeManagedComponent(component) {
        return hasClass(component, 'lcb-free-banner-root') ||
            hasClass(component, 'lcb-free-banner-stage') ||
            hasClass(component, 'lcb-free-layer') ||
            hasClass(component, 'lcb-free-heading') ||
            hasClass(component, 'lcb-free-text') ||
            hasClass(component, 'lcb-free-button') ||
            hasClass(component, 'lcb-free-image');
    }

    function eachCollectionItem(collection, callback) {
        var i,
            item,
            items;

        if (!collection || !callback) {
            return;
        }

        if (collection.each) {
            collection.each(callback);
            return;
        }

        items = collection.models || collection;

        for (i = 0; i < items.length; i++) {
            item = collection.at ? collection.at(i) : items[i];
            callback(item);
        }
    }

    function walkStyleManagerProperties(callback) {
        var styleManager = editor.StyleManager,
            sectors;

        function walk(properties) {
            eachCollectionItem(properties, function (property) {
                var nested;

                if (!property) {
                    return;
                }

                callback(property);

                nested = property.getProperties
                    ? property.getProperties()
                    : (property.get ? property.get('properties') : null);

                if (nested) {
                    walk(nested);
                }
            });
        }

        if (!styleManager || !styleManager.getSectors) {
            return;
        }

        sectors = styleManager.getSectors();

        eachCollectionItem(sectors, function (sector) {
            if (sector && sector.getProperties) {
                walk(sector.getProperties());
            }
        });
    }

    function findStyleManagerProperty(propertyName) {
        var found = null;

        walkStyleManagerProperties(function (property) {
            var propertyValue,
                idValue;

            if (found || !property || !property.get) {
                return;
            }

            propertyValue = property.get('property');
            idValue = property.get('id');

            if (propertyValue === propertyName || idValue === propertyName) {
                found = property;
            }
        });

        return found;
    }

    function normalizeComputedFontFamily(value) {
        var family = trimValue((value || '').split(',')[0]);

        return family.replace(/^['"]|['"]$/g, '');
    }

    function isLengthLikeStyleProperty(propertyName) {
        return propertyName === 'left' ||
            propertyName === 'top' ||
            propertyName === 'right' ||
            propertyName === 'bottom' ||
            propertyName === 'width' ||
            propertyName === 'height' ||
            propertyName === 'min-width' ||
            propertyName === 'max-width' ||
            propertyName === 'min-height' ||
            propertyName === 'max-height' ||
            propertyName.indexOf('margin-') === 0 ||
            propertyName.indexOf('padding-') === 0 ||
            propertyName.indexOf('border-radius') !== -1 ||
            propertyName.indexOf('-radius') !== -1 ||
            propertyName === 'font-size' ||
            propertyName === 'letter-spacing' ||
            propertyName === 'line-height';
    }

    function normalizeComputedStyleManagerValue(propertyName, value) {
        var numberValue;

        value = trimValue(value || '');

        if (!value) {
            return '';
        }

        if (
            isLengthLikeStyleProperty(propertyName) &&
            (value === 'auto' || value === 'none' || value === 'normal' || value === 'medium')
        ) {
            return '';
        }

        if (propertyName === 'font-family') {
            return normalizeComputedFontFamily(value);
        }

        if (propertyName === 'font-weight') {
            numberValue = parseInt(value, 10);

            if (!isNaN(numberValue)) {
                return numberValue >= 600 ? 'bold' : 'normal';
            }
        }

        if (propertyName === 'letter-spacing' && value === 'normal') {
            return '0px';
        }

        if (propertyName === 'line-height' && value === 'normal') {
            return '';
        }

        if (propertyName === 'text-decoration') {
            return value.split(' ')[0] || value;
        }

        return value;
    }

    function getStyleManagerPropertyElement(property) {
        var view;

        if (!property) {
            return null;
        }

        view = property.view || (property.get ? property.get('view') : null);

        return view && view.el ? view.el : null;
    }

    function normalizeStyleManagerChoiceValue(value) {
        return trimValue(String(value || ''))
            .replace(/^['"]|['"]$/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }

    function getStyleManagerLengthParts(value) {
        var match = trimValue(value || '').match(/^(-?\d+(?:\.\d+)?)([a-z%]*)$/i);

        if (!match) {
            return null;
        }

        return {
            number: normalizeCssNumber(match[1]),
            unit: match[2] || ''
        };
    }

    function findStyleManagerSelectOptionValue(select, value, propertyName) {
        var normalizedValue = normalizeStyleManagerChoiceValue(value),
            normalizedFirstFamily = normalizeComputedFontFamily(value).toLowerCase(),
            options,
            option,
            optionValue,
            optionText,
            i;

        if (!select) {
            return null;
        }

        options = select.options || [];

        if (!normalizedValue) {
            for (i = 0; i < options.length; i++) {
                option = options[i];
                optionValue = normalizeStyleManagerChoiceValue(option.value);
                optionText = normalizeStyleManagerChoiceValue(option.text || option.textContent);

                if (!optionValue || optionText === '-') {
                    return option.value;
                }
            }

            return null;
        }

        for (i = 0; i < options.length; i++) {
            option = options[i];
            optionValue = normalizeStyleManagerChoiceValue(option.value);
            optionText = normalizeStyleManagerChoiceValue(option.text || option.textContent);

            if (optionValue === normalizedValue || optionText === normalizedValue) {
                return option.value;
            }

            if (
                propertyName === 'font-family' &&
                normalizedFirstFamily &&
                (
                    normalizeComputedFontFamily(option.value).toLowerCase() === normalizedFirstFamily ||
                    normalizeComputedFontFamily(option.text || option.textContent).toLowerCase() === normalizedFirstFamily
                )
            ) {
                return option.value;
            }
        }

        return null;
    }

    function setStyleManagerSelectValue(select, value, propertyName) {
        var optionValue,
            option;

        if (!select || select === document.activeElement) {
            return;
        }

        optionValue = findStyleManagerSelectOptionValue(select, value, propertyName);

        if (!optionValue && propertyName === 'font-family' && value) {
            option = document.createElement('option');
            option.value = value;
            option.text = value;
            select.appendChild(option);
            optionValue = value;
        }

        if (optionValue !== null && select.value !== optionValue) {
            select.value = optionValue;
        }
    }

    function setStyleManagerInputValue(input, value) {
        if (!input || input === document.activeElement) {
            return;
        }

        if (input.value !== value) {
            input.value = value;
        }
    }

    function syncStyleManagerFieldControl(property, propertyName, value) {
        var element = getStyleManagerPropertyElement(property),
            input,
            select,
            parts;

        if (!element || !element.querySelector) {
            return;
        }

        input = element.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
        select = element.querySelector('select');

        if (isLengthLikeStyleProperty(propertyName)) {
            parts = getStyleManagerLengthParts(value);

            if (parts) {
                setStyleManagerInputValue(input, parts.number);

                if (select) {
                    setStyleManagerSelectValue(select, parts.unit, propertyName);
                }

                return;
            }
        }

        if (select) {
            setStyleManagerSelectValue(select, value, propertyName);
            return;
        }

        setStyleManagerInputValue(input, value);
    }

    function setStyleManagerComputedDefault(propertyName, value) {
        var property;

        value = normalizeComputedStyleManagerValue(propertyName, value);

        if (!value) {
            return;
        }

        property = findStyleManagerProperty(propertyName);

        if (!property || !property.set) {
            return;
        }

        property.set('default', value, { silent: true });

        if (property.view && property.view.render) {
            property.view.render();
        }

        syncStyleManagerFieldControl(property, propertyName, value);
    }

    function clonePlainObject(object) {
        var clone = {},
            key;

        object = object || {};

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                clone[key] = object[key];
            }
        }

        return clone;
    }

    function arePlainObjectsEqual(first, second) {
        return JSON.stringify(first || {}) === JSON.stringify(second || {});
    }

    function syncSelectedStyleManagerComputedDefaults() {
        var component = editor.getSelected ? editor.getSelected() : null,
            element,
            view,
            computed,
            componentStyleBefore,
            componentStyleAfter,
            properties = [
                'display',
                'position',
                'left',
                'top',
                'right',
                'bottom',
                'width',
                'height',
                'min-width',
                'max-width',
                'min-height',
                'max-height',
                'margin-top',
                'margin-right',
                'margin-bottom',
                'margin-left',
                'padding-top',
                'padding-right',
                'padding-bottom',
                'padding-left',
                'font-family',
                'font-size',
                'font-weight',
                'letter-spacing',
                'color',
                'line-height',
                'text-align',
                'text-decoration',
                'background-color',
                'border-radius',
                'border-top-left-radius',
                'border-top-right-radius',
                'border-bottom-right-radius',
                'border-bottom-left-radius'
            ],
            i;

        if (isSyncingStyleManagerDefaults) {
            return;
        }

        if (!component || !isFreeManagedComponent(component)) {
            return;
        }

        element = component.view && component.view.el ? component.view.el : null;

        if (!element || !element.ownerDocument || !element.ownerDocument.defaultView) {
            return;
        }

        view = element.ownerDocument.defaultView;

        if (!view.getComputedStyle) {
            return;
        }

        computed = view.getComputedStyle(element);

        if (!computed) {
            return;
        }

        isSyncingStyleManagerDefaults = true;
        componentStyleBefore = component.getStyle ? clonePlainObject(component.getStyle()) : null;

        try {
            for (i = 0; i < properties.length; i++) {
                setStyleManagerComputedDefault(properties[i], computed.getPropertyValue(properties[i]));
            }

            if (componentStyleBefore && component.getStyle && component.setStyle) {
                componentStyleAfter = component.getStyle();

                if (!arePlainObjectsEqual(componentStyleBefore, componentStyleAfter)) {
                    component.setStyle(componentStyleBefore);
                }
            }
        } finally {
            isSyncingStyleManagerDefaults = false;
        }
    }

    function syncSelectedStyleManagerComputedDefaultsSoon(delay) {
        window.setTimeout(syncSelectedStyleManagerComputedDefaults, delay || 0);
    }

    function getNumberFromCssValue(value) {
        value = parseCssNumber(value);

        return value === null ? null : value;
    }

    function getLayerCssRuleNumberStyle(css, layer, propertyName) {
        var id = getLayerId(layer),
            ruleRegex,
            propertyRegex,
            match,
            propertyMatch,
            value = null;

        if (!css || !id) {
            return null;
        }

        ruleRegex = new RegExp('#' + escapeRegExp(id) + '\\s*\\{([^}]*)\\}', 'g');
        propertyRegex = new RegExp('(?:^|;)\\s*' + escapeRegExp(propertyName) + '\\s*:\\s*([^;]+)', 'i');

        while ((match = ruleRegex.exec(css)) !== null) {
            propertyMatch = match[1].match(propertyRegex);

            if (propertyMatch) {
                value = getNumberFromCssValue(propertyMatch[1]);
            }
        }

        return value;
    }

    function getLayerElementNumberStyle(layer, propertyName) {
        var element,
            value,
            view,
            computed;

        if (!layer || !layer.view || !layer.view.el) {
            return null;
        }

        element = layer.view.el;

        if (element.style) {
            value = element.style[propertyName] || (
                element.style.getPropertyValue
                    ? element.style.getPropertyValue(propertyName)
                    : ''
            );

            value = getNumberFromCssValue(value);

            if (value !== null) {
                return value;
            }
        }

        view = element.ownerDocument && element.ownerDocument.defaultView
            ? element.ownerDocument.defaultView
            : window;

        if (view && view.getComputedStyle) {
            computed = view.getComputedStyle(element);

            if (computed) {
                value = getNumberFromCssValue(computed.getPropertyValue(propertyName));

                if (value !== null) {
                    return value;
                }
            }
        }

        return null;
    }

    function getLayerNumberStyle(layer, propertyName) {
        var style,
            value;

        if (!layer) {
            return null;
        }

        if (layer.getStyle) {
            style = layer.getStyle();
            value = style[propertyName];

            if (typeof value !== 'undefined' && value !== null && value !== '') {
                value = getNumberFromCssValue(value);

                if (value !== null) {
                    return value;
                }
            }
        }

        value = getLayerElementNumberStyle(layer, propertyName);

        if (value !== null) {
            return value;
        }

        return getLayerCssRuleNumberStyle(initialLayoutCss, layer, propertyName);
    }

    function getLayerRenderedSize(layer) {
        var element,
            rect;

        if (!layer || !layer.view || !layer.view.el) {
            return {
                width: 0,
                height: 0
            };
        }

        element = layer.view.el;

        if (!element || !element.getBoundingClientRect) {
            return {
                width: 0,
                height: 0
            };
        }

        rect = element.getBoundingClientRect();

        return {
            width: rect.width || 0,
            height: rect.height || 0
        };
    }

    function getStageDropPointFromEvent(event) {
        var frame = editor.Canvas && editor.Canvas.getFrameEl
                ? editor.Canvas.getFrameEl()
                : null,
            doc,
            stageElement,
            rect;

        if (!isFreeBlockDragging || !event || !frame || !frame.contentDocument) {
            return null;
        }

        doc = frame.contentDocument;
        stageElement = doc.querySelector('.lcb-free-banner-stage');

        if (!stageElement || !stageElement.getBoundingClientRect) {
            return null;
        }

        rect = stageElement.getBoundingClientRect();

        return {
            left: event.clientX - rect.left,
            top: event.clientY - rect.top
        };
    }

    function rememberFreeBlockDropPoint(event) {
        var point = getStageDropPointFromEvent(event);

        if (point) {
            pendingFreeBlockDropPoint = point;
        }
    }

    function applyPendingFreeBlockDropPoint(layer) {
        var gridSize,
            renderedSize,
            point,
            maxLeft,
            maxTop,
            left,
            top;

        if (!pendingFreeBlockDropPoint || !layer || !hasClass(layer, 'lcb-free-layer')) {
            return false;
        }

        gridSize = getCurrentDeviceGridSize();
        renderedSize = getLayerRenderedSize(layer);
        point = pendingFreeBlockDropPoint;

        maxLeft = gridSize.width - renderedSize.width;
        maxTop = gridSize.height - renderedSize.height;

        if (maxLeft < 0) {
            maxLeft = 0;
        }

        if (maxTop < 0) {
            maxTop = 0;
        }

        left = Math.max(0, Math.min(point.left, maxLeft));
        top = Math.max(0, Math.min(point.top, maxTop));

        layer.addStyle({
            left: normalizeCssNumber(left) + 'px',
            top: normalizeCssNumber(top) + 'px',
            position: 'absolute'
        });

        setLayerLayoutNumbers(layer, currentDeviceKey, {
            left: left,
            top: top,
            width: renderedSize.width || 0,
            height: renderedSize.height || 0
        }, true);

        pendingFreeBlockDropPoint = null;

        return true;
    }

    function clampLayerToCurrentStage(layer) {
        var gridSize,
            renderedSize,
            left,
            top,
            maxLeft,
            maxTop,
            newLeft,
            newTop;

        if (!layer || !hasClass(layer, 'lcb-free-layer')) {
            return;
        }

        gridSize = getCurrentDeviceGridSize();
        renderedSize = getLayerRenderedSize(layer);

        left = getLayerNumberStyle(layer, 'left');
        top = getLayerNumberStyle(layer, 'top');

        if (left === null) {
            left = 0;
        }

        if (top === null) {
            top = 0;
        }

        maxLeft = gridSize.width - renderedSize.width;
        maxTop = gridSize.height - renderedSize.height;

        if (maxLeft < 0) {
            maxLeft = 0;
        }

        if (maxTop < 0) {
            maxTop = 0;
        }

        newLeft = Math.max(0, Math.min(left, maxLeft));
        newTop = Math.max(0, Math.min(top, maxTop));

        if (newLeft !== left || newTop !== top) {
            layer.addStyle({
                left: normalizeCssNumber(newLeft) + 'px',
                top: normalizeCssNumber(newTop) + 'px',
                position: 'absolute'
            });
        }
    }

    function clampAllLayersToCurrentStage() {
        var stage,
            layers,
            i;

        stage = getStageComponent();

        if (!stage) {
            return;
        }

        layers = stage.find('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            clampLayerToCurrentStage(layers[i]);
        }
    }

    function moveLayerToStage(layer, stage) {
        var parent;

        if (!layer || !stage) {
            return layer;
        }

        if (!hasClass(layer, 'lcb-free-layer')) {
            return layer;
        }

        forceLayerOptions(layer);

        if (layer.parent && layer.parent() === stage) {
            return layer;
        }

        parent = layer.parent ? layer.parent() : null;

        if (typeof layer.move === 'function') {
            try {
                layer.move(stage, {
                    at: stage.components().length
                });

                forceLayerOptions(layer);

                return layer;
            } catch (e) {
                /*
                 * Fallback niżej.
                 */
            }
        }

        try {
            stage.components().add(layer, {
                at: stage.components().length
            });

            forceLayerOptions(layer);

            return layer;
        } catch (e2) {
            return layer;
        }
    }

    function normalizeFreeBannerComponentsTree() {
        var root,
            stage,
            rootChildren,
            allLayers,
            child,
            layer,
            selected,
            selectedId,
            newSelected,
            i;

        if (isNormalizing) {
            return;
        }

        isNormalizing = true;

        try {
            root = getRootComponent();

            if (!root) {
                return;
            }

            stage = getStageComponent();

            if (!stage) {
                return;
            }

            selected = editor.getSelected ? editor.getSelected() : null;
            selectedId = selected && selected.getId ? selected.getId() : null;

            root.set({
                draggable: false,
                droppable: false,
                removable: false,
                copyable: false,
                layerable: true
            });

            stage.set({
                draggable: false,
                droppable: '.lcb-free-layer',
                removable: false,
                copyable: false,
                layerable: true
            });

            rootChildren = root.components();

            for (i = rootChildren.length - 1; i >= 0; i--) {
                child = rootChildren.at(i);

                if (child === stage) {
                    continue;
                }

                if (hasClass(child, 'lcb-free-layer')) {
                    moveLayerToStage(child, stage);
                }
            }

            allLayers = root.find('.lcb-free-layer');

            for (i = 0; i < allLayers.length; i++) {
                layer = allLayers[i];

                if (layer.parent && layer.parent() !== stage) {
                    moveLayerToStage(layer, stage);
                }
            }

            allLayers = stage.find('.lcb-free-layer');

            for (i = 0; i < allLayers.length; i++) {
                forceLayerOptions(allLayers[i]);
            }

            if (selectedId) {
                newSelected = stage.find('#' + selectedId)[0];

                if (newSelected && editor.select) {
                    editor.select(newSelected);
                }
            }
        } finally {
            isNormalizing = false;
        }
    }

    function normalizeSoon(delay) {
        window.setTimeout(function () {
            normalizeFreeBannerComponentsTree();
        }, delay || 0);
    }

    function normalizeAfterAddOrClone(component) {
        window.setTimeout(function () {
            var stage = getStageComponent();

            if (component && stage && hasClass(component, 'lcb-free-layer')) {
                moveLayerToStage(component, stage);

                if (!applyPendingFreeBlockDropPoint(component)) {
                    clampLayerToCurrentStage(component);
                }
            }

            normalizeFreeBannerComponentsTree();
            repairAllLayerLayouts();
            ensureAllLayerLayouts(true);
            applyAllLayerLayoutsForDevice(currentDeviceKey);
            updateEditorDevicePreviewFrame();
        }, 0);

        window.setTimeout(function () {
            normalizeFreeBannerComponentsTree();
            repairAllLayerLayouts();
            ensureAllLayerLayouts(true);
            applyAllLayerLayoutsForDevice(currentDeviceKey);
            updateEditorDevicePreviewFrame();
        }, 150);
    }

    editor.on('load', function () {
        enableFreeDragMode();
        injectPreviewCssToCanvas();
        bindFreeTextEditingToCanvas();
        syncSelectedStyleManagerComputedDefaultsSoon(0);
        currentDeviceKey = getSavedEditorDeviceKey() || getSelectedDeviceKey();
        currentDeviceKey = normalizeDeviceKey(currentDeviceKey);
        setRootEditorDeviceKey(currentDeviceKey);

        if (editor.setDevice && getSelectedDeviceKey() !== currentDeviceKey) {
            editor.setDevice(getDeviceNameForKey(currentDeviceKey));
        }

        normalizeSoon(0);

        window.setTimeout(function () {
            normalizeFreeBannerComponentsTree();
            repairAllLayerLayouts();
            ensureAllLayerLayouts(true);
            applyAllLayerLayoutsForDevice(currentDeviceKey);
            updateEditorDevicePreviewFrame();
            injectPreviewCssToCanvas();
            bindFreeTextEditingToCanvas();
            setFreeEditorDefaultZoom();
            syncSelectedStyleManagerComputedDefaultsSoon(0);

            window.setTimeout(function () {
                normalizeFreeBannerComponentsTree();
                repairAllLayerLayouts();
                ensureAllLayerLayouts(true);
                applyAllLayerLayoutsForDevice(currentDeviceKey);
                updateEditorDevicePreviewFrame();
                injectPreviewCssToCanvas();
                bindFreeTextEditingToCanvas();
                centerFreeEditorCanvas();
                syncSelectedStyleManagerComputedDefaults();
                isEditorBooting = false;
            }, 150);
        }, 150);
    });

    editor.on('canvas:frame:load', function () {
        injectPreviewCssToCanvas();
        updateEditorDevicePreviewFrame();
        bindFreeTextEditingToCanvas();
        syncSelectedStyleManagerComputedDefaultsSoon(0);
    });

    editor.on('canvas:frame:load:body', function () {
        injectPreviewCssToCanvas();
        updateEditorDevicePreviewFrame();
        bindFreeTextEditingToCanvas();
        syncSelectedStyleManagerComputedDefaultsSoon(0);
    });

    editor.on('component:selected', function () {
        syncSelectedStyleManagerComputedDefaultsSoon(0);
        syncSelectedStyleManagerComputedDefaultsSoon(80);
    });

    editor.on('component:add', function (component) {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        if (component && hasClass(component, 'lcb-free-layer')) {
            return;
        }

        normalizeAfterAddOrClone(component);
    });

    editor.on('component:clone', function (component) {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        normalizeAfterAddOrClone(component);
    });

    editor.on('block:drag:start', function () {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        isFreeBlockDragging = true;
        pendingFreeBlockDropPoint = null;
    });

    editor.on('block:drag:stop', function (component) {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        normalizeAfterAddOrClone(component);

        window.setTimeout(function () {
            isFreeBlockDragging = false;
            pendingFreeBlockDropPoint = null;
        }, 250);
    });

    editor.on('canvas:drop', function () {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        normalizeSoon(0);

        window.setTimeout(function () {
            var selected = editor.getSelected ? editor.getSelected() : null;

            if (selected && hasClass(selected, 'lcb-free-layer')) {
                applyPendingFreeBlockDropPoint(selected);
            }

            clampAllLayersToCurrentStage();
            storeAllLayerLayoutsForDevice(currentDeviceKey, true);
            normalizeFreeBannerComponentsTree();
            repairAllLayerLayouts();
            ensureAllLayerLayouts(true);
            updateEditorDevicePreviewFrame();
            isFreeBlockDragging = false;
            pendingFreeBlockDropPoint = null;
        }, 150);
    });

    editor.on('component:drag:end', function (component) {
        if (isNormalizing || isEditorBooting) {
            return;
        }

        if (component && hasClass(component, 'lcb-free-layer')) {
            clampLayerToCurrentStage(component);
            storeLayerLayoutForDevice(component, currentDeviceKey, true);
        }

        normalizeSoon(0);

        window.setTimeout(function () {
            clampAllLayersToCurrentStage();
            storeAllLayerLayoutsForDevice(currentDeviceKey, true);
            normalizeFreeBannerComponentsTree();
            repairAllLayerLayouts();
            ensureAllLayerLayouts(true);
            updateEditorDevicePreviewFrame();
        }, 150);
    });

    editor.on('device:select', function () {
        switchFreeEditorDevice(getSelectedDeviceKey());
        normalizeSoon(150);
        syncSelectedStyleManagerComputedDefaultsSoon(0);

        window.setTimeout(function () {
            switchFreeEditorDevice(getSelectedDeviceKey());
            setFreeEditorDefaultZoom();
            centerFreeEditorCanvas();
            syncSelectedStyleManagerComputedDefaults();
        }, 200);

        window.setTimeout(function () {
            switchFreeEditorDevice(getSelectedDeviceKey());
            setFreeEditorDefaultZoom();
            centerFreeEditorCanvas();
            syncSelectedStyleManagerComputedDefaults();
        }, 500);
    });

    function setFreeEditorActionButtonsDisabled(disabled) {
        var buttons = [backButton, saveButton, saveContinueButton],
            i;

        for (i = 0; i < buttons.length; i++) {
            if (buttons[i]) {
                buttons[i].disabled = disabled;
            }
        }
    }

    function submitFreeVisualContent(continueEditing) {
        var savedHtml,
            savedCss;

        if (isSubmittingFreeVisualContent || !saveForm || !htmlField || !cssField) {
            return;
        }

        isSubmittingFreeVisualContent = true;
        setFreeEditorActionButtonsDisabled(true);

        if (backField) {
            backField.value = continueEditing ? '1' : '';
        }

        normalizeFreeBannerComponentsTree();
        setRootEditorDeviceKey(currentDeviceKey);
        storeAllLayerLayoutsForDevice(currentDeviceKey, false);
        repairAllLayerLayouts();
        ensureAllLayerLayouts(false);
        updateEditorDevicePreviewFrame();

        window.setTimeout(function () {
            try {
                normalizeFreeBannerComponentsTree();
                setRootEditorDeviceKey(currentDeviceKey);
                storeAllLayerLayoutsForDevice(currentDeviceKey, false);
                repairAllLayerLayouts();
                ensureAllLayerLayouts(false);
                updateEditorDevicePreviewFrame();
                clearEditorBackgroundPreviewFromCanvasDom();
                syncFreeImageSourcesForSave();

                savedHtml = normalizeFreeBannerHtml(cleanHtml(editor.getHtml()));
                savedHtml = stripDefaultFreeStylesFromHtml(savedHtml);
                savedCss = stripDefaultFreeStylesFromCss(editor.getCss(), getFreeElementKindByCurrentComponentId);

                htmlField.value = savedHtml;
                cssField.value = cleanCss(savedCss);

                saveForm.submit();
            } catch (e) {
                isSubmittingFreeVisualContent = false;
                setFreeEditorActionButtonsDisabled(false);
                throw e;
            }
        }, 80);
    }

    if (saveButton) {
        saveButton.observe('click', function () {
            submitFreeVisualContent(false);
        });
    }

    if (saveContinueButton) {
        saveContinueButton.observe('click', function () {
            submitFreeVisualContent(true);
        });
    }
});
