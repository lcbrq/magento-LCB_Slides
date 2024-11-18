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

    /**
     * Save product slides
     *
     * @param   Varien_Event_Observer $observer
     */
    public function saveProductSlides($observer){
        $product = $observer->getProduct();
        $areas = Mage::app()->getRequest()->getParam('lcb_product_slide_area');
        if ($areas && $product && $product->getId()){
            foreach ($areas as $areaId) {
                $model = Mage::getModel('slides/product');
                $model->load($product->getId(), 'product_id');
                $model->setProductId($product->getId());
                $model->setAreaId($areaId);
                $model->save();
            }
        }
    }

}
