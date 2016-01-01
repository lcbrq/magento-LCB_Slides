<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Observer {

    /**
     * Adds a custom tab to adminhtml category page
     * 
     * @param   Varien_Event_Observer $observer
     */
    public function addCategoryTab($observer)
    {
        $tabs = $observer->getEvent()->getTabs();
        $categoryId = Mage::app()->getRequest()->getParam('id');
        if ($categoryId) {
            $tabs->addTab('features', array(
                'label' => Mage::helper('catalog')->__('Slides'),
                'content' => Mage::app()->getLayout()->createBlock('slides/adminhtml_slides')->toHtml()
            ));
        }
    }

}
