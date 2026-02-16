<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_System_Config_Source_Area
{
    /**
     * @return array
     */
    public function toOptionArray()
    {
        $array = array(
            '' => __('None'),
            'all' => __('All')
        );
        $collection = Mage::getResourceModel('slides/areas_collection');
        foreach ($collection as $area) {
            $array[$area->getId()] = $area->getName();
        }
        return $array;
    }
}
