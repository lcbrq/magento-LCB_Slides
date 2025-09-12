<?php

/**
 * Slides model, prepares slide collection
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Resource_Product_Collection extends Mage_Core_Model_Resource_Db_Collection_Abstract
{
    public function _construct()
    {
        $this->_init("slides/product");
    }

    public function addStoreFilter($id)
    {

        $filter = $this->addFieldToFilter('store_id', array(
            array('regexp' => $id),
            array('eq' => '0')
        ));

        return $filter;
    }

}
