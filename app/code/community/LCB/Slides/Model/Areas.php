<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Areas extends Mage_Core_Model_Abstract {

    protected function _construct()
    {
        $this->_init("slides/areas");
    }

    public function toOptionArray()
    {
        $array = array();
        foreach ($this->getCollection() as $area) {
            $array[$area->getId()] = $area->getName();
        }
        return $array;
    }

}
