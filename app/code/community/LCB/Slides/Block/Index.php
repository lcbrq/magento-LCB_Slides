<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Index extends Mage_Core_Block_Template {
    
    /**
     * Get slides collection
     * 
     * @return LCB_Slides_Model_Mysql4_Slides_Collection
     */
    public function getSlides()
    {
        $collection = Mage::getModel('slides/slides')->getAreaSlides($this->getNameInLayout());
        return $collection;
    }
    
}
