<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Slides extends Mage_Core_Model_Abstract
{
    public const TARGET_SELF = 0;
    public const TARGET_NEW_WINDOW = 1;

    public const DEFAULT_TRANSITION_TIME = 2000;

    protected function _construct()
    {
        $this->_init("slides/slides");
    }

    /**
     * Get full image url
     *
     * @return string
     */
    public function getImageUrl()
    {

        if ($this->getImageMobile() && Mage::helper('slides')->getIsMobileDevice()) {
            return Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . $this->getImageMobile();
        }

        return Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_MEDIA) . $this->getImage();
    }

    /**
     * Alias for getText() adjusted with template filter
     */
    public function getContent()
    {
        $text = $this->getText();
        return Mage::getSingleton('widget/template_filter')->filter($text);
    }

    /**
     * Get slide url open in self or new window
     *
     * @return string
     */
    public function getTarget()
    {
        $target = "";

        switch (parent::getTarget()) {
            case self::TARGET_SELF:
                $target = "_self";
                break;
            case self::TARGET_NEW_WINDOW:
                $target = "_blank";
                break;
            default:
                break;
        }

        return $target;
    }

    public function getTargetOptions()
    {
        return array(
            array('value' => self::TARGET_SELF, 'label' => Mage::helper('slides')->__("Same window")),
            array('value' => self::TARGET_NEW_WINDOW, 'label' => Mage::helper('slides')->__("New window"))
        );
    }

    /**
     * Get ordered slides for target area
     *
     * @param string area name
     * @return LCB_Slides_Model_Mysql4_Slides_Collection
     */
    public function getAreaSlides($area)
    {
        $area = Mage::getModel('slides/areas')->load($area, 'name');
        $slides = Mage::getModel('slides/slides')
                ->getCollection()
                ->addFieldToFilter('area', $area->getId())
                ->addFieldToFilter('enabled', 1)
                ->setOrder('position', 'ASC');
        return $slides;
    }

    /**
     * Get json encoded additional slide options as array
     *
     * @return array
     */
    public function getOptions()
    {
        $options = json_decode($this->getData('options'), true);
        if (!isset($options['transition_time']) || !$options['transition_time']) {
            $options['transition_time'] = self::DEFAULT_TRANSITION_TIME;
        }
        return $options;
    }

}
