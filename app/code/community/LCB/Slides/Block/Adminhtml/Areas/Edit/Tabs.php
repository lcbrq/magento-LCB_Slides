<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Areas_Edit_Tabs extends Mage_Adminhtml_Block_Widget_Tabs
{
    public function __construct()
    {
        parent::__construct();
        $this->setId("areas_tabs");
        $this->setDestElementId("edit_form");
        $this->setTitle(Mage::helper("slides")->__("Item Information"));
    }

    protected function _beforeToHtml()
    {
        $this->addTab("form_section", array(
            "label" => Mage::helper("slides")->__("Item Information"),
            "title" => Mage::helper("slides")->__("Item Information"),
            "content" => $this->getLayout()->createBlock("slides/adminhtml_areas_edit_tab_form")->toHtml(),
        ));
        return parent::_beforeToHtml();
    }

}
