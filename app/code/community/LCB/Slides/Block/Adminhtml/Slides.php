<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides extends Mage_Adminhtml_Block_Widget_Grid_Container
{
    public function __construct()
    {
        $this->_controller = "adminhtml_slides";
        $this->_blockGroup = "slides";
        $this->_headerText = Mage::helper("slides")->__("Slides");
        $this->_addButtonLabel = Mage::helper("slides")->__("Add");
        parent::__construct();
    }

    public function getCreateUrl()
    {
        if ($this->getRequest()->getParam('id')) {
            $categoryId = $this->getRequest()->getParam('id');
            return $this->getUrl("admin_slides/adminhtml_slides/new/category/$categoryId");
        } else {
            return parent::getCreateUrl();
        }
    }

}
