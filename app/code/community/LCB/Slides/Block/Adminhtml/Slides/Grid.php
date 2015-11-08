<?php

/**
 * Adminhtml slides grid block
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Block_Adminhtml_Slides_Grid extends Mage_Adminhtml_Block_Widget_Grid {

    public function __construct()
    {
        parent::__construct();
        $this->setId("slidesGrid");
        $this->setDefaultSort("id");
        $this->setDefaultDir("DESC");
        $this->setSaveParametersInSession(true);
    }

    protected function _prepareCollection()
    {
        $collection = Mage::getModel("slides/slides")->getCollection();
        $this->setCollection($collection);
        parent::_prepareCollection();
        foreach ($collection as $slide) {
            if ($slide->getStoreId() && $slide->getStoreId() != 0) {
                $slide->setStoreId(explode(',', $slide->getStoreId()));
            } else {
                $slide->setStoreId(array('0'));
            }
        }
        return $this;
    }

    protected function _prepareColumns()
    {
        $this->addColumn("id", array(
            "header" => Mage::helper("slides")->__("ID"),
            "align" => "right",
            "width" => "50px",
            "type" => "number",
            "index" => "id",
        ));

        $this->addColumn("name", array(
            "header" => Mage::helper("slides")->__("Name"),
            "index" => "name",
        ));

        $this->addColumn("image", array(
            "header" => Mage::helper("slides")->__("Image"),
            "index" => "image",
            'renderer' => 'LCB_Slides_Block_Adminhtml_Slides_Render_Image',
            'filter' => false
        ));

        $this->addColumn("area", array(
            "header" => Mage::helper("slides")->__("Area"),
            "index" => "area",
            'renderer' => 'LCB_Slides_Block_Adminhtml_Slides_Render_Area',
            'filter' => false
        ));

        if (!Mage::app()->isSingleStoreMode()) {
            $this->addColumn('store_id', array(
                'header' => Mage::helper('slides')->__('Store View'),
                'index' => 'store_id',
                'type' => 'store',
                'store_all' => true,
                'store_view' => true,
                'sortable' => true,
                'filter_condition_callback' => array($this, '_filterStoreCondition'),
            ));
        }


        $this->addExportType('*/*/exportCsv', Mage::helper('sales')->__('CSV'));
        $this->addExportType('*/*/exportExcel', Mage::helper('sales')->__('Excel'));

        return parent::_prepareColumns();
    }

    public function getRowUrl($row)
    {
        return $this->getUrl("*/*/edit", array("id" => $row->getId()));
    }

    protected function _prepareMassaction()
    {
        $this->setMassactionIdField('id');
        $this->getMassactionBlock()->setFormFieldName('ids');
        $this->getMassactionBlock()->setUseSelectAll(true);
        $this->getMassactionBlock()->addItem('remove_slides', array(
            'label' => Mage::helper('slides')->__('Remove Slides'),
            'url' => $this->getUrl('*/adminhtml_slides/massRemove'),
            'confirm' => Mage::helper('slides')->__('Are you sure?')
        ));
        return $this;
    }

    protected function _filterStoreCondition($collection, $column)
    {
        if (!$value = $column->getFilter()->getValue()) {
            return;
        }
        $this->getCollection()->addStoreFilter($value);
    }

}
