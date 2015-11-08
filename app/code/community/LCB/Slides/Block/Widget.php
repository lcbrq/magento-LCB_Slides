<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Widget extends Mage_Core_Block_Template implements Mage_Widget_Block_Interface {

    /**
     * 
     * @return string
     */
    protected function _toHtml()
    {
        return Mage::getSingleton('core/layout')
                        ->createBlock('core/template')
                        ->setTemplate($this->getData('template'))
                        ->setLimit($this->getData('limit'))
                        ->toHtml();
    }

}
