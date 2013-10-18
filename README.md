# About
* single session scrum poker tool
* first user to connect becomes admin
* right now the admin is able to reset the table (while open and closed)
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
1) modularize and refactor (code duplicates) using objects and separate jquery usage from socket.io usage
2) administration (close round, set (ticket) topic, kick (inactive) users)
3) allow visitors or enable roles (like Scrum Master, ...)
4) set ticket topic for current table
5) tests
Later:
* enable multiple sessions
* mark highest and lowest vote
* test angular.js