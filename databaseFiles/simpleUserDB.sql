-- Default database dump file.
-- WARNING: overwrites existing tables. 

DROP TABLE IF EXISTS "group", "groupusers", "user";

-- tables
-- Table: group
CREATE TABLE "group" (
    groupid int  NOT NULL,
    CONSTRAINT group_pk PRIMARY KEY (groupid)
);

-- Table: groupusers
CREATE TABLE groupusers (
    user_netid varchar(256)  NOT NULL,
    group_groupid int  NOT NULL,
    CONSTRAINT groupusers_pk PRIMARY KEY (user_netid,group_groupid)
);

-- Table: user
CREATE TABLE "user" (
    netid varchar(256)  NOT NULL,
    email varchar(256)  NOT NULL,
    CONSTRAINT user_pk PRIMARY KEY (netid)
);

-- foreign keys
-- Reference: groupusers_group (table: groupusers)
ALTER TABLE groupusers ADD CONSTRAINT groupusers_group
    FOREIGN KEY (group_groupid)
    REFERENCES "group" (groupid)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: groupusers_user (table: groupusers)
ALTER TABLE groupusers ADD CONSTRAINT groupusers_user
    FOREIGN KEY (user_netid)
    REFERENCES "user" (netid)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Insert some default data in the database
INSERT INTO "user" ("netid", "email") VALUES ('Bob', 'bob@student.tudelft.nl'), 
('Henk', 'henk@student.tudelft.nl'), 
('Boef', 'bangbang@student.tudelft.nl'),
('Brian', 'huh@student.tudelft.nl'), 
('Pussy', 'bplanje@student.tudelft.nl'),
('Yorick', 'pussydestroyer@secondlove.nl'), 
('Pravesh', 'bangbangbang@student.tudelft.nl');

INSERT INTO "group" ("groupid") VALUES (2), (3), (4);

INSERT INTO "groupusers" ("user_netid", "group_groupid") VALUES ('Bob', 2), 
('Henk', 3), 
('Boef', 4),
('Brian', 4), 
('Pussy', 4),
('Yorick', 3), 
('Pravesh', 2);


-- End of file.




