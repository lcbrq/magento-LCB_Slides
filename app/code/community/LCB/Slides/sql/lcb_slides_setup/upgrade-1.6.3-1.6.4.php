<?php

$installer = $this;
$installer->startSetup();

$areasTableName = $installer->getTable('slides/areas');

$connection = $installer->getConnection();

if (!$connection->tableColumnExists($areasTableName, 'transition_time')) {
    $connection->addColumn(
        $areasTableName,
        'transition_time',
        'INT(10) DEFAULT 4000 COMMENT "Transition Time"'
    );
}

$installer->endSetup();