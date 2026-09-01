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

        $fieldset->addField("transition_time", "text", array(
            'label' => Mage::helper('slides')->__('Transition time'),
            'name'  => 'transition_time',
            'note'  => Mage::helper('slides')->__('In milliseconds, e.g. 1s = 1000'),
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
