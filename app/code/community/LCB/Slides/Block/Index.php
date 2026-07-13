<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Index extends Mage_Core_Block_Template
{
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
     * @return LCB_Slides_Model_Resource_Slides_Collection
     */
    public function getSlides()
    {
        $collection = Mage::getModel('slides/slides')->getAreaSlides($this->getNameInLayout());
        return $collection;
    }

    /**
     * @return int
     */
    public function getTransitionTime()
    {
        $areaModel = Mage::getModel('slides/areas')->load($this->getNameInLayout(), 'name');

        if (!$areaModel->getId()) {
            return 4000;
        }

        return (int) $areaModel->getTransitionTime();
    }

    /**
     * Return media URL only for an existing image file.
     *
     * @param string $imagePath
     * @return string
     */
    public function getSlideMediaImageUrl($imagePath)
    {
        $imagePath = ltrim(trim((string) $imagePath), '/');

        if ($imagePath === '') {
            return '';
        }

        $filePath = Mage::getBaseDir('media') . DS . str_replace('/', DS, $imagePath);

        if (!is_file($filePath)) {
            return '';
        }

        return Mage::getBaseUrl('media') . $imagePath;
    }
}
