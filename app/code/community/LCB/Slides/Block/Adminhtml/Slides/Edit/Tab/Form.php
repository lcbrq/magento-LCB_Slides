<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Edit_Tab_Form extends Mage_Adminhtml_Block_Widget_Form {

    protected function _prepareForm()
    {

        $form = new Varien_Data_Form();
        $this->setForm($form);
        $fieldset = $form->addFieldset("slides_form", array("legend" => Mage::helper("slides")->__("Item information")));

        $fieldset->addField("name", "text", array(
            "label" => Mage::helper("slides")->__("Name"),
            "name" => "name",
        ));

        $fieldset->addField("text", "textarea", array(
            "label" => Mage::helper("slides")->__("Text"),
            "name" => "text",
        ));

        $fieldset->addField("link", "text", array(
            "label" => Mage::helper("slides")->__("Link"),
            "name" => "link",
        ));

        $fieldset->addField('image', 'image', array(
            'label' => Mage::helper('slides')->__('Image'),
            'name' => 'image',
            'note' => '(*.jpg, *.png, *.gif)',
        ));

        $data = Mage::getModel('slides/areas')->getCollection()->getData();
        foreach ($data as $area) {
            $areas[$area['id']] = $area['name'];
        }

        $fieldset->addField("area", "select", array(
            "label" => Mage::helper("slides")->__("Area"),
            "name" => "area",
            'value' => '4',
            'values' => $areas,
            'after_element_html' => '<small>Assign slide to </small>',
        ));

        if (!Mage::app()->isSingleStoreMode()) {
            $fieldset->addField('store_id', 'multiselect', array(
                'name' => 'stores[]',
                'label' => Mage::helper('slides')->__('Store View'),
                'title' => Mage::helper('slides')->__('Store View'),
                'required' => true,
                'values' => Mage::getSingleton('adminhtml/system_store')->getStoreValuesForForm(false, true),
            ));
        } else {
            $fieldset->addField('store_id', 'hidden', array(
                'name' => 'stores[]',
                'value' => Mage::app()->getStore(true)->getId(),
            ));
        }

        if (Mage::getSingleton("adminhtml/session")->getSlidesData()) {
            $form->setValues(Mage::getSingleton("adminhtml/session")->getSlidesData());
            Mage::getSingleton("adminhtml/session")->setSlidesData(null);
        } elseif (Mage::registry("slides_data")) {
            $form->setValues(Mage::registry("slides_data")->getData());
        }
        
        if ($this->getRequest()->getParam('category')) {
            $fieldset->addField("category", "hidden", array(
                "name" => "category",
                "value" => $this->getRequest()->getParam('category')
            ));
        }
        
        return parent::_prepareForm();
    }

}
