# Peer Review #
Peer reviewing can now be done without any hassle with paper. Submit, review and get feedback for your course, all within one app! 

## Build Instructions
1. Run a Postgres database on `localhost:5432` with password `password`
2. Create 2 databases called `peer_development` and `peer_test`
3. Run `npm install` in root
4. Run `npm run start_newdata` in the root to start with initializing sample data OR Run `npm start` in the root to start without initializing sample data
5. Access the site through [http://localhost:3000](http://localhost:3000)

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
