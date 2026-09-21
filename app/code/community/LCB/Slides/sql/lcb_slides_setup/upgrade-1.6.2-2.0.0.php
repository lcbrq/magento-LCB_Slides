<?php

$installer = $this;
$installer->startSetup();

$slidesTableName = $installer->getTable('slides/slides');
$areasTableName = $installer->getTable('slides/areas');

$connection = $installer->getConnection();

if (!$connection->tableColumnExists($slidesTableName, 'content_html')) {
    $connection->addColumn(
        $slidesTableName,
        'content_html',
        'TEXT NULL COMMENT "Slide Content HTML"'
    );
}

if (!$connection->tableColumnExists($slidesTableName, 'content_css')) {
    $connection->addColumn(
        $slidesTableName,
        'content_css',
        'TEXT NULL COMMENT "Slide Content CSS"'
    );
}

if (!$connection->tableColumnExists($areasTableName, 'transition_time')) {
    $connection->addColumn(
        $areasTableName,
        'transition_time',
        'INT(10) DEFAULT 4000 COMMENT "Transition Time"'
    );
}

if (!$connection->tableColumnExists($slidesTableName, 'image_tablet')) {
    $connection->addColumn(
        $slidesTableName,
        'image_tablet',
        'VARCHAR(255) NULL COMMENT "Image Tablet"'
    );
}

if (!$connection->tableColumnExists($slidesTableName, 'image_mobile_small')) {
    $connection->addColumn(
        $slidesTableName,
        'image_mobile_small',
        'VARCHAR(255) NULL COMMENT "Image Mobile"'
    );
}

$installer->endSetup();
