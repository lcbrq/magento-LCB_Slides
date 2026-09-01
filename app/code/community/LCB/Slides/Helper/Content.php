<?php

class LCB_Slides_Helper_Content extends Mage_Core_Helper_Abstract
{
    /**
     * @param string $html
     * @return string
     */
    public function sanitizeHtml($html)
    {
        $dangerousTags = array('script', 'iframe', 'object', 'embed', 'form', 'button');

        if (!is_string($html) || $html === '') {
            return '';
        }

        foreach ($dangerousTags as $dangerousTag) {
            $pattern = '#<' . $dangerousTag . '\b[^>]*>.*?</' . $dangerousTag . '>#is';
            $html = preg_replace($pattern, '', $html);
        }

        $html = preg_replace('#<input\b[^>]*>#is', '', $html);
        $html = preg_replace('/\son[a-z0-9_-]+\s*=\s*("|\').*?\\1/isu', '', $html);
        $html = preg_replace('/href\s*=\s*("|\')\s*javascript:.*?\\1/isu', 'href="#"', $html);

        return $html;
    }

    /**
     * @param string $css
     * @param string $wrapperSelector
     * @return string
     */
    public function prepareScopedCss($css, $wrapperSelector)
    {
        if (!is_string($css) || $css === '') {
            return '';
        }

        $css = str_replace('{{wrapper}}', $wrapperSelector, $css);

        return $this->_scopeCss($css, $wrapperSelector);
    }

    /**
     * @param string $css
     * @param string $wrapperSelector
     * @return string
     */
    protected function _scopeCss($css, $wrapperSelector)
    {
        $result = '';
        $position = 0;
        $length = strlen($css);

        while ($position < $length) {
            $atIndex = strpos($css, '@', $position);

            if ($atIndex === false) {
                $result .= $this->_scopeCssBlock(substr($css, $position), $wrapperSelector);
                break;
            }

            $result .= $this->_scopeCssBlock(substr($css, $position, $atIndex - $position), $wrapperSelector);

            $openBraceIndex = strpos($css, '{', $atIndex);
            $semicolonIndex = strpos($css, ';', $atIndex);

            if ($openBraceIndex === false || ($semicolonIndex !== false && $semicolonIndex < $openBraceIndex)) {
                if ($semicolonIndex === false) {
                    $result .= substr($css, $atIndex);
                    break;
                }

                $result .= substr($css, $atIndex, $semicolonIndex - $atIndex + 1);
                $position = $semicolonIndex + 1;
                continue;
            }

            $closeBraceIndex = $this->_findMatchingBrace($css, $openBraceIndex);

            if ($closeBraceIndex === -1) {
                $result .= substr($css, $atIndex);
                break;
            }

            $header = substr($css, $atIndex, $openBraceIndex - $atIndex + 1);
            $content = substr($css, $openBraceIndex + 1, $closeBraceIndex - $openBraceIndex - 1);

            if (preg_match('/^@media\b/i', trim($header))) {
                $result .= $header . $this->_scopeCssBlock($content, $wrapperSelector) . '}';
            } else {
                $result .= substr($css, $atIndex, $closeBraceIndex - $atIndex + 1);
            }

            $position = $closeBraceIndex + 1;
        }

        return trim($result);
    }

    /**
     * @param string $css
     * @param string $wrapperSelector
     * @return string
     */
    protected function _scopeCssBlock($css, $wrapperSelector)
    {
        return preg_replace_callback('/([^{}@]+)\{([^{}]*)\}/', function ($matches) use ($wrapperSelector) {
            $selector = $this->_scopeSelectorList($matches[1], $wrapperSelector);

            if ($selector === '') {
                return '';
            }

            return $selector . '{' . $matches[2] . '}';
        }, $css);
    }

    /**
     * @param string $selectorList
     * @param string $wrapperSelector
     * @return string
     */
    protected function _scopeSelectorList($selectorList, $wrapperSelector)
    {
        $selectors = explode(',', $selectorList);
        $scopedSelectors = array();

        foreach ($selectors as $selector) {
            $selector = trim($selector);

            if ($selector === '') {
                continue;
            }

            if (strpos($selector, $wrapperSelector) === 0) {
                $scopedSelectors[] = $selector;
            } else {
                $scopedSelectors[] = $wrapperSelector . ' ' . $selector;
            }
        }

        return implode(',', $scopedSelectors);
    }

    /**
     * @param string $css
     * @param int $openBraceIndex
     * @return int
     */
    protected function _findMatchingBrace($css, $openBraceIndex)
    {
        $depth = 0;
        $length = strlen($css);

        for ($i = $openBraceIndex; $i < $length; $i++) {
            if ($css[$i] === '{') {
                $depth++;
            } elseif ($css[$i] === '}') {
                $depth--;

                if ($depth === 0) {
                    return $i;
                }
            }
        }

        return -1;
    }
}
