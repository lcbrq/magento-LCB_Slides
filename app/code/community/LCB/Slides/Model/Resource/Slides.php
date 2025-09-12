<?php

/**
 * Banners management
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Model_Resource_Slides extends Mage_Core_Model_Resource_Db_Abstract
{
    public const TYPE_GENERAL = 1;
    public const TYPE_CATEGORY = 2;

    protected function _construct()
    {
        $this->_init("slides/slides", "id");
    }

}
