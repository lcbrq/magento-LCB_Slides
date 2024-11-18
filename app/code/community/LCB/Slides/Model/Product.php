<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Product extends Mage_Core_Model_Abstract {

    protected function _construct()
    {
        $this->_init("slides/product");
    }
}
