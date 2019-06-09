<?php

/**
 * Banners management 
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Catalog_Product_Edit_Tab extends Mage_Adminhtml_Block_Widget implements Mage_Adminhtml_Block_Widget_Tab_Interface {

    /**
     * Get current product id
     *
     * @return int
     */
    public function getProductId() {
        return (int) $this->getRequest()->getParam('id');
    }

    /**
     * @return boolean
     */
    public function canShowTab()
    {
        return Mage::getStoreConfigFlag('lcb_slides/general/enable_product_slides');
    }

    /**
     * @return string
     */
    public function getTabLabel()
    {
        return $this->__('Slides');
    }

    /**
     * @return string
     */
    public function getTabTitle()
    {
        return $this->__('Slides');
    }

    /**
     * @return boolean
     */
    public function isHidden()
    {
        return false;
    }

    /**
     * @return string
     */
    public function getTabUrl()
    {
        return $this->getUrl('admin_slides/adminhtml_slides/producttab', array('_current' => true));
    }

    /**
     * @return string
     */
    public function getTabClass()
    {
        return 'ajax';
    }
    
    /**
     * @return int
     */
    public function getSelectedAreaId()
    {
        $productId = $this->getProductId();
        if ($productId) {
            return Mage::getModel('slides/product')->getCollection()->addFieldToFilter('product_id', $productId)->getFirstItem()->getAreaId();
        }
    }

}
