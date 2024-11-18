<?php

/**
 * Slides model, prepares slide collection
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Mysql4_Slides_Collection extends Mage_Core_Model_Mysql4_Collection_Abstract {

    public function _construct()
    {
        $this->_init("slides/slides");
    }

    /**
     * Filter collection by store id
     * 
     * @param int $id
     * @return $filter
     */
    public function addStoreFilter($id)
    {

        $filter = $this->addFieldToFilter('store_id', array(
            array('regexp' => $id),
            array('eq' => '0')
        ));

        return $filter;
    }

    /**
     * Get slide options by key
     * 
     * @param string $key
     * @return array
     */
    public function getOptionsByKey($key)
    {
        $options = array();
        foreach ($this as $slide) {
            $data = $slide->getOptions();
            $options[$slide->getId()] = $data[$key];
        }
        return $options;
    }

}
