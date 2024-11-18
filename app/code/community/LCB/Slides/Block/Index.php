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
     * Get cache key informative items
     *
     * @return array
     */
    public function getCacheKeyInfo()
    {
        return array(
            'BLOCK_TPL',
            Mage::app()->getStore()->getCode(),
            $this->getTemplateFile(),
            'template' => $this->getTemplate(),
            'mobile' => (int) Mage::helper('slides')->getIsMobileDevice()
        );
    }

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
