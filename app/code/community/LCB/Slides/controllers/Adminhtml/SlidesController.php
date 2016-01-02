<?php

/**
 * LCB_Slides Adminhtml controller
 *
 * @category   LCB
 * @package    LCB_Slides
 * @author     Silpion Tomasz Gregorczyk <tom@leftcurlybracket.com>
 */
class LCB_Slides_Adminhtml_SlidesController extends Mage_Adminhtml_Controller_Action {

    protected function _initAction()
    {
        $this->loadLayout()->_setActiveMenu("slides/slides")->_addBreadcrumb(Mage::helper("adminhtml")->__("Slides  Manager"), Mage::helper("adminhtml")->__("Slides Manager"));
        return $this;
    }

    public function indexAction()
    {
        $this->_title($this->__("Slides"));
        $this->_title($this->__("Manager Slides"));

        $this->_initAction();
        $this->renderLayout();
    }

    public function editAction()
    {
        $this->_title($this->__("Slides"));
        $this->_title($this->__("Slides"));
        $this->_title($this->__("Edit Item"));

        $id = $this->getRequest()->getParam("id");
        $model = Mage::getModel("slides/slides")->load($id);
        if ($model->getId()) {
            Mage::register("slides_data", $model);
            $this->loadLayout();
            $this->_setActiveMenu("slides/slides");
            $this->_addBreadcrumb(Mage::helper("adminhtml")->__("Slides Manager"), Mage::helper("adminhtml")->__("Slides Manager"));
            $this->_addBreadcrumb(Mage::helper("adminhtml")->__("Slides Description"), Mage::helper("adminhtml")->__("Slides Description"));
            $this->getLayout()->getBlock("head")->setCanLoadExtJs(true);
            $this->_addContent($this->getLayout()->createBlock("slides/adminhtml_slides_edit"))->_addLeft($this->getLayout()->createBlock("slides/adminhtml_slides_edit_tabs"));
            $this->renderLayout();
        } else {
            Mage::getSingleton("adminhtml/session")->addError(Mage::helper("slides")->__("Item does not exist."));
            $this->_redirect("*/*/");
        }
    }

    public function newAction()
    {

        $this->_title($this->__("Slides"));
        $this->_title($this->__("Slides"));
        $this->_title($this->__("New Item"));

        $id = $this->getRequest()->getParam("id");
        $model = Mage::getModel("slides/slides")->load($id);

        $data = Mage::getSingleton("adminhtml/session")->getFormData(true);
        if (!empty($data)) {
            $model->setData($data);
        }

        Mage::register("slides_data", $model);

        $this->loadLayout();
        $this->_setActiveMenu("slides/slides");

        $this->getLayout()->getBlock("head")->setCanLoadExtJs(true);

        $this->_addBreadcrumb(Mage::helper("adminhtml")->__("Slides Manager"), Mage::helper("adminhtml")->__("Slides Manager"));
        $this->_addBreadcrumb(Mage::helper("adminhtml")->__("Slides Description"), Mage::helper("adminhtml")->__("Slides Description"));


        $this->_addContent($this->getLayout()->createBlock("slides/adminhtml_slides_edit"))->_addLeft($this->getLayout()->createBlock("slides/adminhtml_slides_edit_tabs"));

        $this->renderLayout();
    }

    public function saveAction()
    {

        $post_data = $this->getRequest()->getPost();


        if ($post_data) {

            try {

                if (isset($post_data['stores'])) {
                    if (in_array('0', $post_data['stores'])) {
                        $post_data['store_id'] = '0';
                    } else {
                        $post_data['store_id'] = join(",", $post_data['stores']);
                    }
                    unset($post_data['stores']);
                }
                
                if ($post_data['category']) {
                    $post_data['type'] = LCB_Slides_Model_Mysql4_Slides::TYPE_CATEGORY;
                } else {
                    $post_data['type'] = LCB_Slides_Model_Mysql4_Slides::TYPE_GENERAL;
                }


                //save image
                try {

                    if ((bool) $post_data['image']['delete'] == 1) {
                        $post_data['image'] = '';
                    } else {

                        unset($post_data['image']);

                        if (isset($_FILES)) {

                            if ($_FILES['image']['name']) {

                                if ($this->getRequest()->getParam("id")) {
                                    $model = Mage::getModel("slides/slides")->load($this->getRequest()->getParam("id"));
                                    if ($model->getData('image')) {
                                        $io = new Varien_Io_File();
                                        $io->rm(Mage::getBaseDir('media') . DS . implode(DS, explode('/', $model->getData('image'))));
                                    }
                                }
                                $path = Mage::getBaseDir('media') . DS . 'slides' . DS;
                                $uploader = new Varien_File_Uploader('image');
                                $uploader->setAllowedExtensions(array('jpg', 'jpeg', 'png', 'gif'));
                                $uploader->setAllowRenameFiles(false);
                                $uploader->setFilesDispersion(false);
                                $destFile = $path . $_FILES['image']['name'];
                                $filename = $uploader->getNewFileName($destFile);
                                $uploader->save($path, $filename);

                                $post_data['image'] = 'slides/' . $filename;
                            }
                        }
                    }
                } catch (Exception $e) {
                    Mage::getSingleton('adminhtml/session')->addError($e->getMessage());
                    $this->_redirect('*/*/edit', array('id' => $this->getRequest()->getParam('id')));
                    return;
                }
//save image


                $model = Mage::getModel("slides/slides")
                        ->addData($post_data)
                        ->setId($this->getRequest()->getParam("id"))
                        ->save();

                Mage::getSingleton("adminhtml/session")->addSuccess(Mage::helper("adminhtml")->__("Slide was successfully saved"));
                Mage::getSingleton("adminhtml/session")->setSlidesData(false);
                
                if ($post_data['category']) {
                    $category = Mage::getModel('slides/category')->load($this->getRequest()->getParam("id"), 'slide_id');
                    $category->setCategoryId($post_data['category']);
                    $category->setSlideId($model->getId());
                    $category->save();
                }

                if ($this->getRequest()->getParam("back")) {
                    $this->_redirect("*/*/edit", array("id" => $model->getId()));
                    return;
                }
                $this->_redirect("*/*/");
                return;
            } catch (Exception $e) {
                Mage::getSingleton("adminhtml/session")->addError($e->getMessage());
                Mage::getSingleton("adminhtml/session")->setSlidesData($this->getRequest()->getPost());
                $this->_redirect("*/*/edit", array("id" => $this->getRequest()->getParam("id")));
                return;
            }
        }
        $this->_redirect("*/*/");
    }

    public function deleteAction()
    {
        if ($this->getRequest()->getParam("id") > 0) {
            try {
                $model = Mage::getModel("slides/slides");
                $model->setId($this->getRequest()->getParam("id"))->delete();
                Mage::getSingleton("adminhtml/session")->addSuccess(Mage::helper("adminhtml")->__("Item was successfully deleted"));
                $this->_redirect("*/*/");
            } catch (Exception $e) {
                Mage::getSingleton("adminhtml/session")->addError($e->getMessage());
                $this->_redirect("*/*/edit", array("id" => $this->getRequest()->getParam("id")));
            }
        }
        $this->_redirect("*/*/");
    }

    public function massRemoveAction()
    {
        try {
            $ids = $this->getRequest()->getPost('ids', array());
            foreach ($ids as $id) {
                $model = Mage::getModel("slides/slides");
                $model->setId($id)->delete();
            }
            Mage::getSingleton("adminhtml/session")->addSuccess(Mage::helper("adminhtml")->__("Item(s) was successfully removed"));
        } catch (Exception $e) {
            Mage::getSingleton("adminhtml/session")->addError($e->getMessage());
        }
        $this->_redirect('*/*/');
    }

    /**
     * Export order grid to CSV format
     */
    public function exportCsvAction()
    {
        $fileName = 'slides.csv';
        $grid = $this->getLayout()->createBlock('slides/adminhtml_slides_grid');
        $this->_prepareDownloadResponse($fileName, $grid->getCsvFile());
    }

    /**
     *  Export order grid to Excel XML format
     */
    public function exportExcelAction()
    {
        $fileName = 'slides.xml';
        $grid = $this->getLayout()->createBlock('slides/adminhtml_slides_grid');
        $this->_prepareDownloadResponse($fileName, $grid->getExcelFile($fileName));
    }

}
