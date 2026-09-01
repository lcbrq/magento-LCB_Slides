(function () {
    var BASE_GRID_WIDTH = 1152;
    var BASE_GRID_HEIGHT = 352;
    var RESIZE_OBSERVERS_STARTED = false;
    var DEVICE_LAYOUTS = {
        desktop: {
            key: 'desktop',
            attrKey: 'desktop',
            width: BASE_GRID_WIDTH,
            height: BASE_GRID_HEIGHT,
            maxWidth: null
        },
        tablet: {
            key: 'tablet',
            attrKey: 'tablet',
            width: 948,
            height: 454,
            maxWidth: 1024
        },
        mobileLarge: {
            key: 'mobileLarge',
            attrKey: 'mobile-large',
            width: 480,
            height: 912,
            maxWidth: 480
        },
        mobileSmall: {
            key: 'mobileSmall',
            attrKey: 'mobile-small',
            width: 274,
            height: 520,
            maxWidth: 390
        }
    };
    var DEVICE_LAYOUT_ORDER = ['desktop', 'tablet', 'mobileLarge', 'mobileSmall'];

    function normalizeNumber(value) {
        return Number(value).toFixed(4).replace(/\.?0+$/, '');
    }

    function setStyle(element, propertyName, value, priority) {
        if (!element || !element.style) {
            return;
        }

        if (element.style.setProperty) {
            element.style.setProperty(propertyName, value, priority || '');
            return;
        }

        element.style[propertyName] = value;
    }

    function getRect(element) {
        if (!element || !element.getBoundingClientRect) {
            return { width: 0, height: 0 };
        }

        return element.getBoundingClientRect();
    }

    function getRectWidth(element) {
        var rect = getRect(element);
        return rect && rect.width ? rect.width : 0;
    }

    function getRectHeight(element) {
        var rect = getRect(element);
        return rect && rect.height ? rect.height : 0;
    }

    function parsePixelValue(value) {
        var numberValue = parseFloat(value);
        return isNaN(numberValue) ? null : numberValue;
    }

    function getComputedPixel(element, propertyName) {
        var value = null,
            computed;

        if (!element) {
            return null;
        }

        if (element.style && element.style[propertyName]) {
            value = parsePixelValue(element.style[propertyName]);
        }

        if (value !== null) {
            return value;
        }

        if (window.getComputedStyle) {
            computed = window.getComputedStyle(element);

            if (computed) {
                value = parsePixelValue(computed.getPropertyValue(propertyName));
            }
        }

        return value;
    }

    function getAvailableWidth(root) {
        var parent = root ? root.parentNode : null,
            width = 0,
            style,
            paddingLeft = 0,
            paddingRight = 0;

        if (parent && parent.nodeType === 1) {
            width = getRectWidth(parent);

            if (window.getComputedStyle) {
                style = window.getComputedStyle(parent);

                if (style) {
                    paddingLeft = parseFloat(style.paddingLeft) || 0;
                    paddingRight = parseFloat(style.paddingRight) || 0;
                    width = width - paddingLeft - paddingRight;
                }
            }
        }

        if (!width || width <= 0) {
            width = getRectWidth(root);
        }

        if (!width || width <= 0) {
            width = window.innerWidth || document.documentElement.clientWidth || BASE_GRID_WIDTH;
        }

        return Math.max(1, width);
    }

    function getAvailableHeight(root, fallbackWidth, fallbackGridWidth, fallbackGridHeight) {
        var parent = root ? root.parentNode : null,
            height = 0,
            style,
            paddingTop = 0,
            paddingBottom = 0,
            gridWidth = fallbackGridWidth || BASE_GRID_WIDTH,
            gridHeight = fallbackGridHeight || BASE_GRID_HEIGHT;

        if (parent && parent.nodeType === 1) {
            height = getRectHeight(parent);

            if (window.getComputedStyle) {
                style = window.getComputedStyle(parent);

                if (style) {
                    paddingTop = parseFloat(style.paddingTop) || 0;
                    paddingBottom = parseFloat(style.paddingBottom) || 0;
                    height = height - paddingTop - paddingBottom;
                }
            }
        }

        if (!height || height <= 0) {
            height = getRectHeight(root);
        }

        if (!height || height <= 0) {
            height = fallbackWidth * (gridHeight / gridWidth);
        }

        return Math.max(1, height);
    }

    function getLayoutAttributeName(deviceKey, propertyName) {
        return 'data-lcb-layout-' + DEVICE_LAYOUTS[deviceKey].attrKey + '-' + propertyName;
    }

    function getLayoutEditedAttributeName(deviceKey) {
        return 'data-lcb-layout-' + DEVICE_LAYOUTS[deviceKey].attrKey + '-edited';
    }

    function getLayerLayoutNumber(layer, deviceKey, propertyName) {
        var value;

        if (!layer || !layer.getAttribute || !DEVICE_LAYOUTS[deviceKey]) {
            return null;
        }

        value = parseFloat(layer.getAttribute(getLayoutAttributeName(deviceKey, propertyName)));

        return isNaN(value) ? null : value;
    }

    function isLayerLayoutEdited(layer, deviceKey) {
        if (!layer || !layer.getAttribute || !DEVICE_LAYOUTS[deviceKey]) {
            return false;
        }

        return layer.getAttribute(getLayoutEditedAttributeName(deviceKey)) === '1';
    }

    function setLayerLayoutNumber(layer, deviceKey, propertyName, value) {
        if (!layer || !layer.setAttribute || !DEVICE_LAYOUTS[deviceKey]) {
            return;
        }

        layer.setAttribute(getLayoutAttributeName(deviceKey, propertyName), normalizeNumber(value || 0));
    }

    function getResponsiveDevice(availableWidth) {
        if (availableWidth <= DEVICE_LAYOUTS.mobileSmall.maxWidth) {
            return DEVICE_LAYOUTS.mobileSmall;
        }

        if (availableWidth <= DEVICE_LAYOUTS.mobileLarge.maxWidth) {
            return DEVICE_LAYOUTS.mobileLarge;
        }

        if (availableWidth <= DEVICE_LAYOUTS.tablet.maxWidth) {
            return DEVICE_LAYOUTS.tablet;
        }

        return DEVICE_LAYOUTS.desktop;
    }

    function hasNonZeroPosition(left, top) {
        return Math.abs(left || 0) > 0.01 || Math.abs(top || 0) > 0.01;
    }

    function ensureStage(root) {
        var stage,
            children,
            layers,
            i;

        if (!root) {
            return null;
        }

        stage = root.querySelector('.lcb-free-banner-stage');

        if (!stage) {
            stage = document.createElement('div');
            stage.className = 'lcb-free-banner-stage';

            children = [];

            for (i = 0; i < root.childNodes.length; i++) {
                children.push(root.childNodes[i]);
            }

            for (i = 0; i < children.length; i++) {
                stage.appendChild(children[i]);
            }

            root.appendChild(stage);
        }

        layers = root.querySelectorAll('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            if (layers[i].parentNode !== stage) {
                stage.appendChild(layers[i]);
            }
        }

        return stage;
    }

    function rememberBaseLayerState(layer) {
        var left,
            top,
            width,
            height,
            rect;

        if (!layer || !layer.getAttribute) {
            return;
        }

        if (!layer.getAttribute('data-lcb-base-left')) {
            left = getComputedPixel(layer, 'left');
            layer.setAttribute('data-lcb-base-left', normalizeNumber(left === null ? 0 : left));
        }

        if (!layer.getAttribute('data-lcb-base-top')) {
            top = getComputedPixel(layer, 'top');
            layer.setAttribute('data-lcb-base-top', normalizeNumber(top === null ? 0 : top));
        }

        rect = getRect(layer);

        if (!layer.getAttribute('data-lcb-base-width')) {
            width = rect && rect.width ? rect.width : layer.offsetWidth;
            layer.setAttribute('data-lcb-base-width', normalizeNumber(width || 0));
        }

        if (!layer.getAttribute('data-lcb-base-height')) {
            height = rect && rect.height ? rect.height : layer.offsetHeight;
            layer.setAttribute('data-lcb-base-height', normalizeNumber(height || 0));
        }

        left = parseFloat(layer.getAttribute('data-lcb-base-left')) || 0;
        top = parseFloat(layer.getAttribute('data-lcb-base-top')) || 0;

        if (
            getLayerLayoutNumber(layer, 'desktop', 'left') === null ||
            (
                !isLayerLayoutEdited(layer, 'desktop') &&
                !hasNonZeroPosition(
                    getLayerLayoutNumber(layer, 'desktop', 'left'),
                    getLayerLayoutNumber(layer, 'desktop', 'top')
                ) &&
                hasNonZeroPosition(left, top)
            )
        ) {
            setLayerLayoutNumber(layer, 'desktop', 'left', parseFloat(layer.getAttribute('data-lcb-base-left')) || 0);
            setLayerLayoutNumber(layer, 'desktop', 'top', parseFloat(layer.getAttribute('data-lcb-base-top')) || 0);
            setLayerLayoutNumber(layer, 'desktop', 'width', parseFloat(layer.getAttribute('data-lcb-base-width')) || 0);
            setLayerLayoutNumber(layer, 'desktop', 'height', parseFloat(layer.getAttribute('data-lcb-base-height')) || 0);
        }
    }

    function deriveLayerLayout(layer, sourceDeviceKey, targetDeviceKey) {
        var sourceLayout = DEVICE_LAYOUTS[sourceDeviceKey],
            targetLayout = DEVICE_LAYOUTS[targetDeviceKey],
            sourceLeft = getLayerLayoutNumber(layer, sourceDeviceKey, 'left') || 0,
            sourceTop = getLayerLayoutNumber(layer, sourceDeviceKey, 'top') || 0,
            sourceWidth = getLayerLayoutNumber(layer, sourceDeviceKey, 'width') || 0,
            sourceHeight = getLayerLayoutNumber(layer, sourceDeviceKey, 'height') || 0,
            targetLeft,
            targetTop;

        targetLeft = projectPosition(
            sourceLeft,
            sourceLayout.width,
            targetLayout.width,
            sourceWidth,
            sourceWidth
        );

        targetTop = projectPosition(
            sourceTop,
            sourceLayout.height,
            targetLayout.height,
            sourceHeight,
            sourceHeight
        );

        setLayerLayoutNumber(layer, targetDeviceKey, 'left', targetLeft);
        setLayerLayoutNumber(layer, targetDeviceKey, 'top', targetTop);
        setLayerLayoutNumber(layer, targetDeviceKey, 'width', sourceWidth);
        setLayerLayoutNumber(layer, targetDeviceKey, 'height', sourceHeight);
    }

    function ensureLayerLayoutState(layer) {
        var i,
            deviceKey;

        rememberBaseLayerState(layer);

        for (i = 0; i < DEVICE_LAYOUT_ORDER.length; i++) {
            deviceKey = DEVICE_LAYOUT_ORDER[i];

            if (
                getLayerLayoutNumber(layer, deviceKey, 'left') === null ||
                (
                    deviceKey !== 'desktop' &&
                    !isLayerLayoutEdited(layer, deviceKey)
                )
            ) {
                deriveLayerLayout(layer, 'desktop', deviceKey);
            }
        }
    }

    function projectPosition(basePosition, baseStageSize, currentStageSize, baseLayerSize, currentLayerSize) {
        var baseRange = baseStageSize - baseLayerSize,
            currentRange = currentStageSize - currentLayerSize;

        if (baseRange <= 0) {
            return 0;
        }

        if (currentRange < 0) {
            currentRange = 0;
        }

        return (basePosition / baseRange) * currentRange;
    }

    function adaptLayer(layer, layout) {
        var baseLeft,
            baseTop;

        ensureLayerLayoutState(layer);

        baseLeft = getLayerLayoutNumber(layer, layout.key, 'left');
        baseTop = getLayerLayoutNumber(layer, layout.key, 'top');
        if (baseLeft === null) {
            baseLeft = getLayerLayoutNumber(layer, 'desktop', 'left') || 0;
        }

        if (baseTop === null) {
            baseTop = getLayerLayoutNumber(layer, 'desktop', 'top') || 0;
        }

        setStyle(layer, 'position', 'absolute', 'important');
        setStyle(layer, 'left', normalizeNumber(baseLeft) + 'px', 'important');
        setStyle(layer, 'top', normalizeNumber(baseTop) + 'px', 'important');
        setStyle(layer, 'box-sizing', 'border-box', 'important');
    }

    function prepareRoot(root, visualHeight) {
        setStyle(root, 'position', 'relative', 'important');
        setStyle(root, 'display', 'block', 'important');
        setStyle(root, 'width', '100%', 'important');
        setStyle(root, 'max-width', '100%', 'important');
        setStyle(root, 'height', normalizeNumber(visualHeight) + 'px', 'important');
        setStyle(root, 'min-height', normalizeNumber(visualHeight) + 'px', 'important');
        setStyle(root, 'margin-left', 'auto', 'important');
        setStyle(root, 'margin-right', 'auto', 'important');
        setStyle(root, 'overflow', 'hidden', 'important');
        setStyle(root, 'box-sizing', 'border-box', 'important');
        setStyle(root, 'transform', 'none', 'important');
    }

    function prepareStage(stage, layout, visualScale) {
        setStyle(stage, 'position', 'relative', 'important');
        setStyle(stage, 'left', '0', 'important');
        setStyle(stage, 'top', '0', 'important');
        setStyle(stage, 'display', 'block', 'important');
        setStyle(stage, 'width', normalizeNumber(layout.width) + 'px', 'important');
        setStyle(stage, 'height', normalizeNumber(layout.height) + 'px', 'important');
        setStyle(stage, 'min-height', normalizeNumber(layout.height) + 'px', 'important');
        setStyle(stage, 'max-width', 'none', 'important');
        setStyle(stage, 'overflow', 'hidden', 'important');
        setStyle(stage, 'box-sizing', 'border-box', 'important');
        setStyle(stage, 'transform', 'scale(' + normalizeNumber(visualScale) + ')', 'important');
        setStyle(stage, 'transform-origin', '0 0', 'important');
    }

    function scaleFreeBanner(root) {
        var stage,
            availableWidth,
            layout,
            visualScale,
            visualHeight,
            layers,
            i;

        if (!root) {
            return;
        }

        stage = ensureStage(root);

        if (!stage) {
            return;
        }

        setStyle(root, 'width', '100%', 'important');
        setStyle(root, 'max-width', '100%', 'important');

        availableWidth = getAvailableWidth(root);
        layout = getResponsiveDevice(availableWidth);
        visualScale = availableWidth / layout.width;
        visualHeight = layout.height * visualScale;

        prepareRoot(root, visualHeight);
        prepareStage(stage, layout, visualScale);

        layers = stage.querySelectorAll('.lcb-free-layer');

        for (i = 0; i < layers.length; i++) {
            adaptLayer(layers[i], layout);
        }

        root.setAttribute('data-lcb-grid-name', layout.key);
        root.setAttribute('data-lcb-grid-width', layout.width);
        root.setAttribute('data-lcb-grid-height', layout.height);
        root.setAttribute('data-lcb-available-width', normalizeNumber(availableWidth));
        root.setAttribute('data-lcb-scale', normalizeNumber(visualScale));
        root.setAttribute('data-lcb-position-scale-x', normalizeNumber(visualScale));
        root.setAttribute('data-lcb-position-scale-y', normalizeNumber(visualScale));
        root.setAttribute('data-lcb-visual-height', normalizeNumber(visualHeight));
    }

    function scaleAllFreeBanners() {
        var roots = document.querySelectorAll('.lcb-free-banner-root'),
            i;

        for (i = 0; i < roots.length; i++) {
            scaleFreeBanner(roots[i]);
        }
    }

    function findCopyTextElement(node) {
        var className;

        while (node && node !== document) {
            className = node.nodeType === 1 && node.getAttribute ? node.getAttribute('class') : '';

            if ((' ' + (className || '') + ' ').indexOf(' lcb-free-copy-text ') !== -1) {
                return node;
            }

            node = node.parentNode;
        }

        return null;
    }

    function copyTextFallback(value) {
        var textarea = document.createElement('textarea');

        textarea.value = value;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
        } catch (ignore) {
        }

        document.body.removeChild(textarea);
    }

    function copyText(value) {
        if (window.navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(null, function () {
                copyTextFallback(value);
            });
            return;
        }

        copyTextFallback(value);
    }

    function handleCopyText(event) {
        var currentEvent = event || window.event,
            element = findCopyTextElement(currentEvent.target || currentEvent.srcElement),
            value;

        if (!element) {
            return;
        }

        value = (element.textContent || element.innerText || '').replace(/^\s+|\s+$/g, '');

        if (value) {
            copyText(value);
        }
    }

    function runScale() {
        scaleAllFreeBanners();
        window.setTimeout(scaleAllFreeBanners, 50);
        window.setTimeout(scaleAllFreeBanners, 150);
        window.setTimeout(scaleAllFreeBanners, 300);
        window.setTimeout(scaleAllFreeBanners, 800);
    }

    function observeResize() {
        var roots,
            i;

        if (RESIZE_OBSERVERS_STARTED || typeof ResizeObserver === 'undefined') {
            return;
        }

        RESIZE_OBSERVERS_STARTED = true;
        roots = document.querySelectorAll('.lcb-free-banner-root');

        for (i = 0; i < roots.length; i++) {
            (function (root) {
                var scheduled = false,
                    observer = new ResizeObserver(function () {
                        if (scheduled) {
                            return;
                        }

                        scheduled = true;

                        window.requestAnimationFrame(function () {
                            scheduled = false;
                            scaleFreeBanner(root);
                        });
                    });

                observer.observe(root);

                if (root.parentNode && root.parentNode.nodeType === 1) {
                    observer.observe(root.parentNode);
                }
            })(roots[i]);
        }
    }

    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function () {
            runScale();
            observeResize();
        });

        window.addEventListener('load', runScale);
        window.addEventListener('resize', runScale);
        window.addEventListener('orientationchange', runScale);
        document.addEventListener('click', handleCopyText);
    } else if (window.attachEvent) {
        window.attachEvent('onload', runScale);
        window.attachEvent('onresize', runScale);
        document.attachEvent('onclick', handleCopyText);
    }
})();
