<?php

$installer = $this;
$installer->startSetup();

$slidesTableName = $installer->getTable('slides/slides');

$connection = $installer->getConnection();

if (!$connection->tableColumnExists($slidesTableName, 'content_css')) {
    $connection->addColumn(
        $slidesTableName,
        'content_css',
        'TEXT NULL COMMENT "Slide Content CSS"'
    );
}

$installer->endSetup();
