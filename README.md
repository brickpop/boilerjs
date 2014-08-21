BoilerJS
========

This project is a boilerplate of a web site built on AngularJS, Node/Express, MongoDB and Gulp.

## Get Started
Clone the project into your computer:

	$ git clone https://github.com/jmoraleda/boilerjs.git .
	$ cd boilerjs

Next, install the Node dependencies:

	$ npm install

## Managing the app
The application can be managed with Gulp. To get the available actions, just run gulp:

	$ gulp
	Available actions:

	   $ gulp dev            Start the app locally and reload with Nodemon
	   $ gulp test           Run the test suite located on test/index.js
	
	   $ gulp start          Start the server as a daemon
	   $ gulp restart        Start the server
	   $ gulp stop           Stop the server

The first two of them are intended for use on your development computer.

The rest of them are bound to be used on your production server. For them to work, you will need to install ```forever``` as a system module:

	$ sudo npm install -g forever
	$ gulp start



