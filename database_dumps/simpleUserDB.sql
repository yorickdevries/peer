-- Default database dump file.
-- WARNING: overwrites existing tables. 

-- HOW TO USE:
--  1. Download postgresql and pgadmin
--  2. Create a new database (Servers -> PostgreSQL -> Databases -> right mouse -> create database "peer_database")
--  3. Open query window (DB_NAME -> schemas -> public -> right mouse -> Query Tool...)
--      If something does not show: right click -> refresh
--  4. Copy paste THIS WHOLE FILE into the query tool and execute (F5 or click on thunder button)
--  5. Refresh to see tables

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
INSERT INTO "user" ("netid", "email") VALUES ('bob', 'bob@tudelft.nl'), 
('henk', 'henk@tudelft.nl'), 
('boef', 'boef@tudelft.nl'),
('brian', 'brian@tudelft.nl'), 
('paul', 'paul@tudelft.nl'),
('yorick', 'yorick@tudelft.nl'), 
('pravesh', 'pravesh@tudelft.nl');

INSERT INTO "group" ("groupid") VALUES (2), (3), (4);

INSERT INTO "groupusers" ("user_netid", "group_groupid") VALUES ('bob', 1), 
('henk', 1), 
('boef', 2),
('brian', 2), 
('paul', 1),
('yorick', 2), 
('pravesh', 1);


-- End of file.




