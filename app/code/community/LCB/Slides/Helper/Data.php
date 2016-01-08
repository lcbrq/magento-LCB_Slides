<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Helper_Data extends Mage_Core_Helper_Abstract {

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

}
