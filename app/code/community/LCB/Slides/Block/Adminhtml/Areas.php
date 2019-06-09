<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Areas extends Mage_Adminhtml_Block_Widget_Grid_Container {

    public function __construct()
    {
        $this->_controller = "adminhtml_areas";
        $this->_blockGroup = "slides";
        $this->_headerText = Mage::helper("slides")->__("Manage Areas");
        $this->_addButtonLabel = Mage::helper("slides")->__("Define New Area");
        parent::__construct();
    }

}
