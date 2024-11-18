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

    /**
     * Get area slides
     *
     * @return LCB_Slides_Model_Mysql4_Slides_Collection
     */
    public function getSlides(){
        return Mage::getModel('slides/slides')->getCollection()->addFieldToFilter('area', $this->getId());
    }

    /**
     * @return array
     */
    public function toOptionArray()
    {
        $array = array();
        foreach ($this->getCollection() as $area) {
            $array[$area->getId()] = $area->getName();
        }
        return $array;
    }

}
