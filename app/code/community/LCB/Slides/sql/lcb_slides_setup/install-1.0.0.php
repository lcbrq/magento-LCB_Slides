<?php

$installer = $this;
$installer->startSetup();

$sql = <<<SQLTEXT
        
DROP TABLE IF EXISTS {$this->getTable('lcb_slides')};

CREATE TABLE {$this->getTable('lcb_slides')}( 
      id int NOT NULL auto_increment,
      name varchar(255),
      text text,
      url varchar(255),
      image varchar(255),
      area varchar(255),
      type int NOT NULL,
      store_id varchar(255),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS {$this->getTable('lcb_areas')};

CREATE TABLE {$this->getTable('lcb_areas')}( 
      id int not null auto_increment,
      name varchar(255),
      position varchar(255),
      PRIMARY KEY  (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
        
SQLTEXT;

$installer->run($sql);
$installer->endSetup();
