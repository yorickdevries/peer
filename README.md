# Peer Review #
Peer reviewing can now be done without any hassle with paper. Submit, review and get feedback for your course, all within one app! 

This application uses Node 14.x

## Build Instructions
1. Run a MariaDB server on `localhost:3306` with user `peer` and password `password`
2. Create a MariaDB database called `peer`
3. Run `npm install` in root
4. Run `npm run typeorm:migration:run` in ./server to run migrations.
5. Run `npm run build` in root to build the application.
6. Run `npm run initdata` in ./server to initialize basic database elements like faculties and academic years.
7. Run `npm run start` in root to start the server.
8. Access the site through [http://localhost:3000](http://localhost:3000)

## Dev Instructions
1. Complete steps 1 and 2 of `Build Instructions`
2. Run `npm run seed` in ./server to reset the database, run migrations, and add seed data.
3. Run `npm run watch:dev_server` in root to start a local dev server.
4. Run `npm run watch:dev_client` in root to start a local dev client.
5. Access the site through [http://localhost:8080](http://localhost:8080)

- On the site you can mock a SSO-login login using http://localhost:3000/api/login
- Only users with the affiliation `employee` can create courses

## Original Developers in the ED3 context project of 2017/2018
| Name               | NetID          | Student Mail                        |
|--------------------|----------------|-------------------------------------|
| Henk-Jan Wermelink | hwermelink     | j.a.h.wermelink@student.tudelft.nl  |
| Pravesh Moelchand  | pmoelchand     | p.p.a.moelchand@student.tudelft.nl  |
| Paul van der Laan  | paulvanderlaan | p.j.vanderlaan-1@student.tudelft.nl |
| Brian Planje       | bplanje        | b.o.s.planje@student.tudelft.nl     |
| Yorick de Vries    | yorickdevries  | y.c.devries-1@student.tudelft.nl    |
