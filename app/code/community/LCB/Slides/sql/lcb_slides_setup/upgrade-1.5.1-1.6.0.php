<?php

/** @var Mage_Core_Model_Resource_Setup $installer */
$installer = $this;
$installer->startSetup();

$connection = $installer->getConnection();

$connection->addColumn($installer->getTable('slides/areas'), 'description', array(
    'type'     => Varien_Db_Ddl_Table::TYPE_TEXT,
    'nullable' => true,
    'comment'  => 'Description',
    'after'    => 'name',
));

$installer->endSetup();
