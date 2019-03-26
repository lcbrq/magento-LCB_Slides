<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Helper_Data extends Mage_Core_Helper_Abstract {

    /**
     * @var boolean
     */
    public $isMobile;

    /**
     * Check if we are on mobile browser
     *
     * @return boolean
     */
    public function getIsMobileDevice()
    {

        if (!is_bool($this->isMobile)) {

            try {
                $this->isMobile = Zend_Http_UserAgent_Mobile::match(
                    Mage::helper('core/http')->getHttpUserAgent(), $_SERVER
                );
                if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', strtolower($_SERVER['HTTP_USER_AGENT']))) {
                    $this->isMobile = false;
                }
            } catch (Exception $e) {

            }
        }

        return $this->isMobile;
    }

    /**
     * Get slides for target category id
     * 
     * @param int $categoryId
     * @return array
     */
    public function getCategorySlides($categoryId)
    {
        $slides = array();
        $categorySlides = Mage::getModel('slides/category')->getCollection()->addFieldToFilter('category_id', $categoryId);
        foreach ($categorySlides as $categorySlide) {
            $categorySlide->getSlideId();
            $slides[] = Mage::getModel('slides/slides')->load($categorySlide->getSlideId());
        }
        return $slides;
    }
    
    /**
     * Get slides for target area
     * 
     * @param string $code
     * @return LCB_Slides_Model_Mysql4_Areas_Collection
     */
    public function getAreaSlides($code)
    {
         $area = Mage::getModel('slides/areas')->load($code, 'name');
         $collection = Mage::getModel('slides/slides')->getCollection()->addFieldToFilter('area', $area->getId());
         $collection->addFieldToFilter('enabled', true);
         $collection->getSelect()->order('position');
         return $collection;
    }

}
