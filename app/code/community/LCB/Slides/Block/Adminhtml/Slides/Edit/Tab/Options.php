<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Edit_Tab_Options extends Mage_Adminhtml_Block_Widget_Form {

    protected function _prepareForm()
    {

        $form = new Varien_Data_Form();
        $this->setForm($form);
        $fieldset = $form->addFieldset("slide_options", array("legend" => Mage::helper("slides")->__("Additional options")));

        $fieldset->addField('transition_time', 'text', array(
            'label' => Mage::helper('slides')->__('Transition time'),
            'name' => 'options[transition_time]',
            'note' => Mage::helper('slides')->__('In miliseconds e.g. 1s = 1000'),
            'class' => 'validate-digits'
        ));

        if (Mage::registry("slides_data")) {
            $form->setValues(Mage::registry("slides_data")->getOptions());
        }

        return parent::_prepareForm();
    }

}
