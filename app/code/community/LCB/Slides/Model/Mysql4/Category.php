<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Mysql4_Category extends Mage_Core_Model_Mysql4_Abstract {

    protected function _construct()
    {
        $this->_init("slides/category", "id");
    }

}
