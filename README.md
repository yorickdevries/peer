# Peer Review #

## Documents
| Reports & Documentation                                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Final Report Link (DRAFT)](https://drive.google.com/open?id=16AVe3_VqWfTnAQskc1eGn4TGT9LVbEyuI4RCZUbzGe0)                                                             |
| [Product Vision](https://drive.google.com/open?id=13TeAu7Lhos5RLsbUAnmqIi6I5HRaUFbZ)                                                                                   |
|  [Product Planning](https://drive.google.com/open?id=1pL6k2WVDsA8SeSgM6skcqGuZ2jaL2CDn)                                                                                |
| [Architecture Design](https://drive.google.com/open?id=1h1dirajEcvkcRcdFhfo3CgOzBTrAspKalOY-8s0Ieu0)                                                                   |
| API documentation can be found in architecture design appendix B                                                                                                       |
| [Test documentation **(new)**](https://drive.google.com/open?id=1-MGFOcitYra8o5OZkXA85P8LIJjs8Tb7WbK2KXl74Wc)                                                          |

| Sprint Documents & Meetings                                                                                                                                            |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Scrum Board](https://gitlab.ewi.tudelft.nl/TI2806/2017-2018/ED/ed3/ed3/boards)                                                                                        |
| [Sprint Backlogs](https://drive.google.com/drive/folders/1kS_IHHDY4CqKE_MdchDL0R154ksvGw92?usp=sharing)                                                                |
| [Sprint Retrospectives](https://drive.google.com/open?id=1jiZvA1J_0j9eG9N1UwBpg7VX3x0uERFe)                                                                            |
| [Meeting Notes](https://drive.google.com/drive/folders/18Ue9durm2Rlb11G2k1Eguk-3tjCSaxhM?usp=sharing)                                                                  |
| [Guideline Documents](https://drive.google.com/drive/folders/18bxNphp1rjMX1WRGwLL45RZbZiS-jO3W?usp=sharing)                                                            |

## Build Instructions
1. Run a Postgres database on localhost:5432 with password 'password'
2. Create a database called 'peer_database'
3. Run 'npm install' in both './client' and './server'
4. Run 'npm run start_newdata' in the root to start with initializing sample data OR Run 'npm start' in the root to start without initializing sample data
5. Access the site through [http://localhost:3000](http://localhost:3000)

- On the site you can mock a SSO login login using http://localhost:3000/api/mocklogin/[netid]/[affiliation]
- Affiliation can be: "student" or "employee"

## Original Developers in the ED3 context project of 2017/2018
| Name               | NetID          | Student Mail                        |
|--------------------|----------------|-------------------------------------|
| Henk-Jan Wermelink | hwermelink     | j.a.h.wermelink@student.tudelft.nl  |
| Pravesh Moelchand  | pmoelchand     | p.p.a.moelchand@student.tudelft.nl  |
| Paul van der Laan  | paulvanderlaan | p.j.vanderlaan-1@student.tudelft.nl |
| Brian Planje       | bplanje        | b.o.s.planje@student.tudelft.nl     |
| Yorick de Vries    | yorickdevries  | y.c.devries-1@student.tudelft.nl    |




