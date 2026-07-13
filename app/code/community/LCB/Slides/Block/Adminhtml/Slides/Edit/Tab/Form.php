<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Edit_Tab_Form extends Mage_Adminhtml_Block_Widget_Form
{
    protected function _prepareForm()
    {
        $form = new Varien_Data_Form();
        $this->setForm($form);
        $fieldset = $form->addFieldset("slide_setting", array("legend" => Mage::helper("slides")->__("Primary settings")));
        $canvasRecommendations = array(
            'desktop' => '1152 x 352 px',
            'tablet' => '948 x 454 px',
            'mobile_large' => '480 x 912 px',
            'mobile_small' => '274 x 520 px',
        );

        $fieldset->addField('enabled', 'select', array(
            'label' => Mage::helper('slides')->__('Enable'),
            'values' => Mage::getSingleton('adminhtml/system_config_source_yesno')->toArray(),
            'name' => 'enabled'
        ));

        $fieldset->addField("name", "text", array(
            "label" => Mage::helper("slides")->__("Name"),
            "name" => "name",
        ));

        // $fieldset->addField("text", "textarea", array(
        //     "label" => Mage::helper("slides")->__("Text"),
        //     "name" => "text",
        // ));

        $fieldset->addField("content_html", "textarea", array(
            'name'     => 'content_html',
            'label'    => Mage::helper('slides')->__('Slide Content HTML'),
            'title'    => Mage::helper('slides')->__('Slide Content HTML'),
            'required' => false,
        ));

        $fieldset->addField("content_css", "textarea", array(
            'name'     => 'content_css',
            'label'    => Mage::helper('slides')->__('Slide Content CSS'),
            'title'    => Mage::helper('slides')->__('Slide Content CSS'),
            'required' => false,
        ));

        // $fieldset->addField("url", "text", array(
        //     "label" => Mage::helper("slides")->__("Link"),
        //     "name" => "url",
        // ));

        // $fieldset->addField('target', 'select', array(
        //     'label' => Mage::helper('slides')->__('Open in'),
        //     'values' => Mage::getModel('slides/slides')->getTargetOptions(),
        //     'name' => 'target'
        // ));

        $fieldset->addField('image', 'image', array(
            'label' => Mage::helper('slides')->__('Image'),
            'name' => 'image',
            'note' => Mage::helper('slides')->__('*.jpg, *.png, *.gif, Zalecany %s', $canvasRecommendations['desktop']),
        ));

        $fieldset->addField('image_tablet', 'image', array(
            'label' => Mage::helper('slides')->__('Image (tablet)'),
            'name' => 'image_tablet',
            'note' => Mage::helper('slides')->__('Zalecany %s', $canvasRecommendations['tablet']),
        ));

        $fieldset->addField('image_mobile', 'image', array(
            'label' => Mage::helper('slides')->__('Image (mobile large)'),
            'name' => 'image_mobile',
            'note' => Mage::helper('slides')->__('Zalecany %s', $canvasRecommendations['mobile_large']),
        ));

        $fieldset->addField('image_mobile_small', 'image', array(
            'label' => Mage::helper('slides')->__('Image (mobile small)'),
            'name' => 'image_mobile_small',
            'note' => Mage::helper('slides')->__('Zalecany %s', $canvasRecommendations['mobile_small']),
        ));

        $fieldset->addField('position', 'text', array(
            'label' => Mage::helper('slides')->__('Position'),
            'name' => 'position',
            'class' => 'validate-digits'
        ));

        $areas = Mage::getModel('slides/areas')->toOptionArray();

        if (!$areas) {
            $areas = array(
                '' => Mage::helper('slides')->__('No areas available')
            );
        }

        if (!$this->getRequest()->getParam('category')) {
            $fieldset->addField("area", "select", array(
                "label" => Mage::helper("slides")->__("Area"),
                "name" => "area",
                'value' => '4',
                'values' => $areas,
                'after_element_html' => '<small>' . $this->__("Slide assignment") . '</small>',
            ));
        }

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
                "name" => "category_id",
                "value" => $this->getRequest()->getParam('category')
            ));
        } else {
            $fieldset->addField("category", "hidden", array(
                "name" => "category_id",
                "value" => Mage::getModel('slides/category')->load($this->getRequest()->getParam('id'), 'slide_id')->getCategoryId()
            ));
        }

        return parent::_prepareForm();
    }
}
