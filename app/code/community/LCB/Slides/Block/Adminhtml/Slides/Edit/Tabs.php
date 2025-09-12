<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Edit_Tabs extends Mage_Adminhtml_Block_Widget_Tabs
{
    public function __construct()
    {
        parent::__construct();
        $this->setId("slides_tabs");
        $this->setDestElementId("edit_form");
        $this->setTitle(Mage::helper("slides")->__("Item Information"));
    }

    protected function _beforeToHtml()
    {
        $this->addTab("slide_settings", array(
            "label" => Mage::helper("slides")->__("Settings"),
            "title" => Mage::helper("slides")->__("Settings"),
            "content" => $this->getLayout()->createBlock("slides/adminhtml_slides_edit_tab_form")->toHtml(),
        ));

        $this->addTab("slide_options", array(
            "label" => Mage::helper("slides")->__("Options"),
            "title" => Mage::helper("slides")->__("Options"),
            "content" => $this->getLayout()->createBlock("slides/adminhtml_slides_edit_tab_options")->toHtml(),
        ));
        return parent::_beforeToHtml();
    }

}
