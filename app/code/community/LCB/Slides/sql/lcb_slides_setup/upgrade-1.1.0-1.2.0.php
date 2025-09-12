<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT

ALTER TABLE `{$this->getTable('lcb_slides')}` ADD COLUMN `target` INT(1) UNSIGNED NULL DEFAULT 0 AFTER `url`;
ALTER TABLE `{$this->getTable('lcb_slides')}` ADD COLUMN `position` INT(11) UNSIGNED NULL DEFAULT 0 AFTER `type`;
ALTER TABLE `{$this->getTable('lcb_slides')}` ADD COLUMN `enabled` INT(1) UNSIGNED NULL DEFAULT 1 AFTER `position`;

SQLTEXT;

$installer->run($sql);
$installer->endSetup();
