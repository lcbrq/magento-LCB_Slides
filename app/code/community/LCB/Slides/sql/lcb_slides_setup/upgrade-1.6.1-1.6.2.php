<?php

$installer = $this;
$installer->startSetup();

$slidesTableName = $installer->getTable('slides/slides');

$connection = $installer->getConnection();

if (!$connection->tableColumnExists($slidesTableName, 'content_html')) {
    $connection->addColumn(
        $slidesTableName,
        'content_html',
        'TEXT NULL COMMENT "Slide Content HTML"'
    );
}

$installer->endSetup();