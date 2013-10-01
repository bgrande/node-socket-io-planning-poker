# About
* single session scrum poker tool
* first user to connect becomes admin
* right now the admin is able to reset the table (while open and closed)
* if all users voted the table is closed and all votes are shown

# Run
* npm install
* node app
* http://localhost:3000

# TODO
* tests
* modularize and refactor using objects
* allow visitors or enable roles (like Scrum Master, ...)
* administration (close round, set (ticket) topic, kick (inactive) users)
* enable multiple tables
* enable multiple voting rounds per table
* set ticket topic for current table
* enable multiple sessions
* mark highest and lowest vote
* separate jquery usage from socket.io usage
* refactor code duplicates
* test angular.js