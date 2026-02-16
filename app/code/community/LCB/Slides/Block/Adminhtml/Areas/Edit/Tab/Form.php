<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Areas_Edit_Tab_Form extends Mage_Adminhtml_Block_Widget_Form
{
    protected function _prepareForm()
    {
        $form = new Varien_Data_Form();
        $this->setForm($form);
        $fieldset = $form->addFieldset("slides_form", array("legend" => Mage::helper("slides")->__("Item information")));

        $fieldset->addField("name", "text", array(
            "label" => Mage::helper("slides")->__("Name"),
            "name" => "name",
        ));

        $fieldset->addField("description", "text", array(
            "label" => Mage::helper("slides")->__("Description"),
            "name" => "description",
        ));

        $fieldset->addField("position", "text", array(
            "label" => Mage::helper("slides")->__("Position"),
            "name" => "position",
        ));


        if (Mage::getSingleton("adminhtml/session")->getAreasData()) {
            $form->setValues(Mage::getSingleton("adminhtml/session")->getAreasData());
            Mage::getSingleton("adminhtml/session")->setAreasData(null);
        } elseif (Mage::registry("areas_data")) {
            $form->setValues(Mage::registry("areas_data")->getData());
        }
        return parent::_prepareForm();
    }
}
