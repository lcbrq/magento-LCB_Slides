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

        return str_replace('{{wrapper}}', $wrapperSelector, $css);
    }
}