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

# Bugs
* Fix Table closing

# TODO
1. refactor module methods
2. separate html from js
3. administration (close round, kick (inactive) users)
4. allow visitors or enable roles (like Scrum Master, ...)
5. tests
6. error handling nice
7. allow different kinds of poker measurement

Later:
* enable multiple sessions
* mark highest and lowest vote
* test angular.js
* maybe create a jquery socket.io extension
* Use camera for card recognizing (qr-code?)
