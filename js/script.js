;(function (window, document, undefined) {
	'use strict';

	var app = document.querySelector('#app');
	if (!app) return;

	/**
	 * Dynamically vary the API endpoint
	 * @return {String} The API endpoint
	 */
	var getEndpoint = function () {
		var endpoint = 'https://vanillajsacademy.com/api/';
		var random = Math.random();
		if (random < 0.3) return endpoint + 'pirates.json';
		if (random < 0.6) return endpoint + 'pirates2.json';
		return endpoint + 'fail.json';
	};

	/**
	 * Sanitize and encode all HTML in a user-submitted string
	 * @param  {String} str  The user-submitted string
	 * @return {String} str  The sanitized string
	 */
	var sanitizeHTML = function (str) {
		var temp = document.createElement('div');
		temp.textContent = str;
		return temp.innerHTML;
	};

	/**
	 * Check data validity based on timestamp and current time
	 * @param  {Object}  saved The data object
	 * @return {Boolean} Data validity
	 */
	var isDataValid = function (saved) {

		// Check that there's data, and a timestamp key
		if (!saved || !saved.data || !saved.timestamp) return false;

		// Get the difference between the timestamp and current time
		var difference = new Date().getTime() - saved.timestamp;

		// Convert the difference into hours
		var oneHour = 1000 * 60 * 60;
		var convertedTime = difference / oneHour;

		// Check if it's been less than an hour
		if (convertedTime < 1) return true;
	};

	/**
	 * Make XHR request to get news magazine
	 */
	var getAPIData = function (success, failure) {
		var data;
		// Set up our HTTP Request
		var xhr = new XMLHttpRequest();

		// Set up listener to process request state changes
		xhr.onreadystatechange = function () {

			// Only run if the request is complete
			if (xhr.readyState !== 4) return;

			// Process our return data
			if (xhr.status >= 200 && xhr.status < 300) {
				var data = JSON.parse(xhr.responseText);
				success(data);
			} else {
				failure();
			}
		};

		// Create and send a GET request
		xhr.open('GET', getEndpoint());
		xhr.send();
	};

	/**
	 * Render the app
	 */
	var renderApp = function () {

		// Get data from localStorage
		var data = JSON.parse(localStorage.getItem('magazine'));

		// If there is no data
		if (!data) {

			// Make an API call
			// If API call successes, render and save data to localStorage
			// It not, render error message
			getAPIData(function (data) {
				renderNews(data);
				saveLocalData(data);
			}, renderErrorMessage);
			return;
		}

		// If data is expired
		if (!isDataValid(data)) {

			// Make an API call
			getAPIData(function(data) {

				// If API call successes, render and save data to localStorage
				renderNews(data);
				saveLocalData(data);
			}, function () {
				// If API call fails, fall back to cached data
				renderNews(data.data);
			});
			return;
		}

		renderNews(data.data);
	};

	/**
	 * Save data to localStorage
	 * @param {Object} data Data from API response
	 */
	var saveLocalData = function (data) {
		var saved = {
			data: data,
			timestamp: new Date().getTime(),
		};
		localStorage.setItem('magazine', JSON.stringify(saved));
	};

	/**
	 * Render articles from data response
	 * @param {Object} data Data from API response
	 */
	var renderNews = function (data) {

		// Bail if there is no data
		if (!data) {
			renderErrorMessage();
			return;
		}

		var content = '<p>' + sanitizeHTML(data.tagline) + '</p>';

		data.articles.forEach(function (article) {
			content +=
				'<article class="entry">' +
					'<time class="entry-date">' + sanitizeHTML(article.pubdate) + '</time>' +
					'<h2 class="entry-title">' + sanitizeHTML(article.title) + '</h2>' +
					'<span class="entry-meta">By ' + sanitizeHTML(article.author) + ' in ' + sanitizeHTML(article.category) + '</span>' +
					'<div class="entry-content">' + sanitizeHTML(article.article) + '</div>' +
				'</article>';
		});

		app.innerHTML = content;
	};

	/**
	 * Render error message if there is no data or API call fails
	 */
	var renderErrorMessage = function () {
		var content =
			'<img src="images/oops.gif" alt="Photo of error message">' +
			'<p>Opps. There is something unexpected happened. Please refresh the page or try again later.</p>';

		app.innerHTML = content;

	};

	renderApp();

})(window, document);
