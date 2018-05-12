-- Default database dump file.
-- WARNING: overwrites existing tables. 

-- HOW TO USE:
--  1. Download postgresql and pgadmin
--  2. Create a new database (Servers -> PostgreSQL -> Databases -> right mouse -> create database "postgres")
--  3. Open query window (DB_NAME -> schemas -> public -> right mouse -> Query Tool...)
--      If something does not show: right click -> refresh
--  4. Copy paste THIS WHOLE FILE into the query tool and execute (F5 or click on thunder button)
--  5. Refresh to see tables

DROP TABLE IF EXISTS "groupcollection", "groupusers", "usercollection";

-- tables
-- Table: groupcollection
CREATE TABLE "groupcollection" (
    groupid int  NOT NULL,
    CONSTRAINT groupcollection_pk PRIMARY KEY (groupid)
);

-- Table: groupusers
CREATE TABLE groupusers (
    usercollection_netid varchar(256)  NOT NULL,
    groupcollection_groupid int  NOT NULL,
    CONSTRAINT groupusers_pk PRIMARY KEY (usercollection_netid,groupcollection_groupid)
);

-- Table: usercollection
CREATE TABLE "usercollection" (
    netid varchar(256)  NOT NULL,
    email varchar(256)  NOT NULL,
    CONSTRAINT usercollection_pk PRIMARY KEY (netid)
);

-- foreign keys
-- Reference: groupusers_groupcollection (table: groupusers)
ALTER TABLE groupusers ADD CONSTRAINT groupusers_groupcollection
    FOREIGN KEY (groupcollection_groupid)
    REFERENCES "groupcollection" (groupid)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: groupusers_usercollection (table: groupusers)
ALTER TABLE groupusers ADD CONSTRAINT groupusers_usercollection
    FOREIGN KEY (usercollection_netid)
    REFERENCES "usercollection" (netid)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Insert some default data in the database
INSERT INTO "usercollection" ("netid", "email") VALUES ('bob', 'bob@tudelft.nl'), 
('henk', 'henk@tudelft.nl'), 
('boef', 'boef@tudelft.nl'),
('brian', 'brian@tudelft.nl'), 
('paul', 'paul@tudelft.nl'),
('yorick', 'yorick@tudelft.nl'), 
('pravesh', 'pravesh@tudelft.nl');

INSERT INTO "groupcollection" ("groupid") VALUES (1), (2), (4);

INSERT INTO "groupusers" ("usercollection_netid", "groupcollection_groupid") VALUES ('bob', 1), 
('henk', 1), 
('boef', 2),
('brian', 2), 
('paul', 1),
('yorick', 2), 
('pravesh', 1);


-- End of file.




