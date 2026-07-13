<?php

class LCB_Slides_Block_Adminhtml_Slides_FreeVisualEditor extends Mage_Adminhtml_Block_Template
{
    /**
     * @return LCB_Slides_Model_Slides|false
     */
    public function getSlide()
    {
        $slideModel = Mage::registry('current_slide');

        if (!$slideModel || !$slideModel->getId()) {
            return false;
        }

        return $slideModel;
    }

    /**
     * @return string
     */
    public function getBackUrl()
    {
        return $this->getUrl(
            '*/adminhtml_slides/edit',
            array('id' => $this->getRequest()->getParam('id'))
        );
    }

    /**
     * @return string
     */
    protected function _toHtml()
    {
        $this->setTemplate('lcb/slides/free-visual-editor.phtml');

        return parent::_toHtml();
    }

    /**
     * @return LCB_Slides_Block_Adminhtml_Slides_FreeVisualEditor
     */
    protected function _prepareLayout()
    {
        $headBlock = $this->getLayout()->getBlock('head');

        if ($headBlock) {
            $headBlock->addCss('lcb/grapesjs/grapes.min.css');
            $headBlock->addCss('lcb/grapesjs/visual-editor-free.css');

            $headBlock->addJs('lcb/grapesjs/grapes.min.js');
            $headBlock->addJs('lcb/grapesjs/visual-editor-free.js');
        }

        return parent::_prepareLayout();
    }

    /**
     * @return string
     */
    public function getSaveVisualContentUrl()
    {
        return $this->getUrl(
            '*/adminhtml_slides/saveVisualContent',
            array('id' => $this->getRequest()->getParam('id'))
        );
    }

    /**
     * @return string
     */
    public function getUploadFreeImageUrl()
    {
        return $this->getUrl('*/adminhtml_slides/uploadFreeImage');
    }

    /**
     * @return string
     */
    public function getSlideContentHtml()
    {
        $slide = $this->getSlide();

        if (!$slide) {
            return '';
        }

        return (string) $slide->getContentHtml();
    }

    /**
     * @return string
     */
    public function getSlideContentCss()
    {
        $slide = $this->getSlide();

        if (!$slide) {
            return '';
        }

        return (string) $slide->getContentCss();
    }

    /**
     * @return string
     */
    public function getSlideImageUrl()
    {
        $slide = $this->getSlide();

        if (!$slide || !$slide->getImage()) {
            return '';
        }

        return $this->getMediaImageUrl($slide->getImage());
    }

    /**
     * @return string
     */
    public function getSlideTabletImageUrl()
    {
        $slide = $this->getSlide();

        if (!$slide) {
            return '';
        }

        $tabletImage = '';

        if ($slide->getData('tablet_image')) {
            $tabletImage = $slide->getData('tablet_image');
        } elseif ($slide->getData('image_tablet')) {
            $tabletImage = $slide->getData('image_tablet');
        } elseif ($slide->getTabletImage()) {
            $tabletImage = $slide->getTabletImage();
        }

        if (!$tabletImage) {
            return '';
        }

        return $this->getMediaImageUrl($tabletImage);
    }

    /**
     * @return string
     */
    public function getSlideMobileImageUrl()
    {
        $slide = $this->getSlide();

        if (!$slide) {
            return '';
        }

        $mobileImage = '';

        if ($slide->getData('mobile_image')) {
            $mobileImage = $slide->getData('mobile_image');
        } elseif ($slide->getData('image_mobile')) {
            $mobileImage = $slide->getData('image_mobile');
        } elseif ($slide->getMobileImage()) {
            $mobileImage = $slide->getMobileImage();
        }

        if (!$mobileImage) {
            return '';
        }

        return $this->getMediaImageUrl($mobileImage);
    }

    /**
     * @return string
     */
    public function getSlideMobileSmallImageUrl()
    {
        $slide = $this->getSlide();

        if (!$slide) {
            return '';
        }

        $mobileSmallImage = '';

        if ($slide->getData('mobile_small_image')) {
            $mobileSmallImage = $slide->getData('mobile_small_image');
        } elseif ($slide->getData('image_mobile_small')) {
            $mobileSmallImage = $slide->getData('image_mobile_small');
        } elseif ($slide->getMobileSmallImage()) {
            $mobileSmallImage = $slide->getMobileSmallImage();
        }

        if (!$mobileSmallImage) {
            return '';
        }

        return $this->getMediaImageUrl($mobileSmallImage);
    }

    /**
     * @param string $imagePath
     * @return string
     */
    protected function getMediaImageUrl($imagePath)
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
