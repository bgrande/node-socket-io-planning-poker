# About
* single session scrum poker tool
* first user to connect becomes admin
* admin is able to reset the table (while open and closed)
* admin can edit current ticket topic
* if all users voted the table is closed and all votes are shown

# Run
* npm install
* node app
* http://localhost:3000

# Authors & Contributors
* Benedikt Grande
* Diana Hartmann
* Michael Kleinschnitz

# TODO
0) separate jquery and logic usage from socket.io usage
1) modularize and refactor (code duplicates) using objects
2) better cards
3) administration (close round, kick (inactive) users)
4) allow visitors or enable roles (like Scrum Master, ...)
6) tests
7) error handling right

Later:
* enable multiple sessions
* mark highest and lowest vote
* test angular.js