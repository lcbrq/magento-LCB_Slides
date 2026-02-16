<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Edit extends Mage_Adminhtml_Block_Widget_Form_Container
{
    public function __construct()
    {
        parent::__construct();
        $this->_objectId = "id";
        $this->_blockGroup = "slides";
        $this->_controller = "adminhtml_slides";
        $this->_updateButton("save", "label", Mage::helper("slides")->__("Save"));
        $this->_updateButton("delete", "label", Mage::helper("slides")->__("Delete"));

        $this->_addButton("saveandcontinue", array(
            "label" => Mage::helper("slides")->__("Save And Continue Edit"),
            "onclick" => "saveAndContinueEdit()",
            "class" => "save",
                ), -100);

        $this->_formScripts[] = "
            function saveAndContinueEdit(){
                    editForm.submit($('edit_form').action+'back/edit/');
            }";
    }

    public function getHeaderText()
    {
        if (Mage::registry("slides_data") && Mage::registry("slides_data")->getId()) {
            return Mage::helper("slides")->__("Edit", $this->htmlEscape(Mage::registry("slides_data")->getName()));
        } else {
            return Mage::helper("slides")->__("Add");
        }
    }

    /**
     * Get URL for back (reset) button
     *
     * @return string
     */
    public function getBackUrl()
    {
        if ($this->getRequest()->getParam('category')) {
            return $this->getUrl("adminhtml/catalog_category/");
        } else {
            return $this->getUrl('*/*/');
        }
    }
}
