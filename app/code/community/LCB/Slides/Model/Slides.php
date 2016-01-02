<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Slides extends Mage_Core_Model_Abstract {

    protected function _construct()
    {
        $this->_init("slides/slides");
    }

    public function getImageUrl()
    {
        return Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . $this->getImage();
    }

}
