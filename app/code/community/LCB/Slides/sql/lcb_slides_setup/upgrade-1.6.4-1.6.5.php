<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT

ALTER TABLE `{$this->getTable('lcb_slides')}` ADD COLUMN `image_tablet` varchar(255) NULL AFTER `image`;

SQLTEXT;

$installer->run($sql);
$installer->endSetup();
