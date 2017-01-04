<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT

ALTER TABLE `{$this->getTable('lcb_slides')}` ADD COLUMN `options` TEXT NULL AFTER `image`;

SQLTEXT;

$installer->run($sql);
$installer->endSetup();
