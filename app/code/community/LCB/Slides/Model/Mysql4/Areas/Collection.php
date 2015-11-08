<?php

/**
 * Slides model, prepares areas collection
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Mysql4_Areas_Collection extends Mage_Core_Model_Mysql4_Collection_Abstract {

    public function _construct()
    {
        $this->_init("slides/areas");
    }

}
