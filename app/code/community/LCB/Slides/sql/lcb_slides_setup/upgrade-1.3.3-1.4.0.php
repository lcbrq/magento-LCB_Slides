<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT

DROP TABLE IF EXISTS {$this->getTable('lcb_slides_product')};

CREATE TABLE {$this->getTable('lcb_slides_product')}(
      id int NOT NULL auto_increment,
      product_id int(10) UNSIGNED NOT NULL,
      area_id int NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SQLTEXT;

$installer->run($sql);
$installer->endSetup();
