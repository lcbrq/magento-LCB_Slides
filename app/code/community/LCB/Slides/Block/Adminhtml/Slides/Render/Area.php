<?php

/**
 * Adminhtml slides grid block area (slider position) render
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Render_Area extends Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract {

    public function render(Varien_Object $row)
    {
        $id = $row->getData($this->getColumn()->getIndex());
        $area = Mage::getModel('slides/areas')->load($id);
        return $area->getName();
    }

}
