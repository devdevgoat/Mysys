/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `mysys`.`users` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');
console.log('Success: Created users!');

connection.query('\
  CREATE TABLE `mysys`.`user_has_player` ( \
  `user_id` INT NOT NULL,\
  `player_id` INT NOT NULL,\
  `in_play` NVARCHAR(1) NOT NULL,\
  `session` NVARCHAR(500),\
  `level` int(11) DEFAULT \'1\',\
  `BASE_PE` int(11) DEFAULT \'0\',\
  `BASE_ME` int(11) DEFAULT \'0\',\
  `BASE_SE` int(11) DEFAULT \'0\',\
  PRIMARY KEY (`user_id`, `player_id`))'
  );
console.log('Success: Created user_has_player!');

connection.query('\
CREATE TABLE  `mysys`.`players` (\
  `player_id` int(11) NOT NULL AUTO_INCREMENT,\
  `player_name` varchar(50) DEFAULT NULL,\
  `PE` int(11) DEFAULT \'0\',\
  `ME` int(11) DEFAULT \'0\',\
  `SE` int(11) DEFAULT \'0\',\
  `PM` int(11) DEFAULT \'0\',\
  `MM` int(11) DEFAULT \'0\',\
  `SM` int(11) DEFAULT \'0\',\
  `LE` int(11) DEFAULT \'100\',\
  `img` varchar(250) DEFAULT \'unknown.svg\',\
  `info` varchar(2000) DEFAULT \'No Back Story\',\
  `status` varchar(50) DEFAULT \'Normal\',\
  PRIMARY KEY (`player_id`)\
)\
');
console.log('Success: Created players!');
//durattion below is number of uses a item has
connection.query('\
CREATE TABLE `mysys`.`items` (\
  `item_id` int(11) unsigned NOT NULL AUTO_INCREMENT,\
  `item_name` varchar(250) CHARACTER SET utf8 NOT NULL DEFAULT \'no name provided\',\
  `item_desc` varchar(500) NOT NULL DEFAULT \'missing description\',\
  `mod_type` varchar(2) NOT NULL DEFAULT \'PE\',\
  `mod_value` int(11) NOT NULL DEFAULT \'0\',\
  `img` varchar(250) NOT NULL DEFAULT \'unknown.png\',\
  `duration` int(11) NOT NULL DEFAULT \'9999\',\ 
  `item_type` varchar(50) NOT NULL DEFAULT \'ITEM\',\
  `consume_word` varchar(45) NOT NULL DEFAULT \'used\',\
  `min_level` int(11) NOT NULL DEFAULT \'1\',\  
  `number_of_targets` int(11) NOT NULL DEFAULT \'1\',\
  PRIMARY KEY (`item_id`)\
) \
');
console.log('Success: Created items!');

connection.query('\
CREATE TABLE `mysys`.`player_items` (\
  `trx_id` int(11) NOT NULL AUTO_INCREMENT,\
  `player_id` int(11) unsigned NOT NULL AUTO_INCREMENT,\
  `item_id` int(11) DEFAULT NULL,\
  `received_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\
  `reason` varchar(250) NOT NULL DEFAULT \'Unknown\',\
  `reliquished_at` timestamp NULL DEFAULT NULL,\
  `status` varchar(50) NOT NULL DEFAULT \'Normal\',\
  `times_used` INT NOT NULL DEFAULT \'0\', \
  PRIMARY KEY (`player_id`, `item_id` )\
) \
');
console.log('Success: Created player_items!');

console.log('Success: Database Created!');

connection.end();

/*


INSERT INTO `mysys`.`player_items` (`player_id`, `item_id`, `received_at`, `reason`, `status`, `times_used`) VALUES ('1', '2', NOW(), 'GIFT', 'NORMAL', '1');
INSERT INTO `mysys`.`player_items` (`player_id`, `item_id`, `received_at`, `reason`, `status`, `times_used`) VALUES ('1', '3', NOW(), 'GIFT', 'NORMAL', '3');
INSERT INTO `mysys`.`player_items` (`player_id`, `item_id`, `received_at`, `reason`, `status`, `times_used`) VALUES ('1', '4', NOW(), 'GIFT', 'NORMAL', '0');
*/