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
}