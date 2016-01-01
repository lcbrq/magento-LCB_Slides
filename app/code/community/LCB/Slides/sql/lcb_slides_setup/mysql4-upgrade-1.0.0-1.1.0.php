<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT

DROP TABLE IF EXISTS {$this->getTable('lcb_slides_category')};

CREATE TABLE {$this->getTable('lcb_slides_category')}(
      id int NOT NULL auto_increment,
      category_id int(10) UNSIGNED NOT NULL,
      slide_id int NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

UPDATE `{$this->getTable('lcb_slides')}` SET `type` = 1;

ALTER TABLE `{$this->getTable('lcb_slides_category')}` ADD INDEX(`category_id`);
ALTER TABLE `{$this->getTable('lcb_slides_category')}` ADD INDEX(`slide_id`);

ALTER TABLE `{$this->getTable('lcb_slides_category')}` ADD FOREIGN KEY (`category_id`) REFERENCES `{$this->getTable('catalog/category')}`(`entity_id`) ON DELETE CASCADE ON UPDATE CASCADE; 
ALTER TABLE `{$this->getTable('lcb_slides_category')}` ADD FOREIGN KEY (`slide_id`) REFERENCES `{$this->getTable('lcb_slides')}`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SQLTEXT;

$installer->run($sql);
$installer->endSetup();
