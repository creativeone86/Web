import { client } from "../graphql";
import gql from "graphql-tag";

export function isLoggedIn() {
	return client
		.query({
			query: gql`
				{
					me {
						id
					}
				}
			`
		})
		.then(({ data: { me } }) => me !== null);
}

export function exchangeSSOToken(token) {
	return fetch(`${process.env.AUTH_URL}/ssoExchange`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			token
		}),
		credentials: "include"
	})
		.then(res => res.json())
		.then(({ csrf }) => localStorage.setItem("csrf", csrf));
}

export function login(username, password) {
	return fetch(`${process.env.AUTH_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username,
			password
		}),
		credentials: "include"
	})
		.then(res => {
			if (res.status === 200) return res.json();
			else return res.json().then(alert => Promise.reject({ alert }));
		})
		.then(({ csrf }) => localStorage.setItem("csrf", csrf));
}

export function logout() {
	localStorage.removeItem("csrf");
	return Promise.resolve();
}

export function signup(login, email, password, newsletter) {
	return fetch(`${process.env.AUTH_URL}/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			login,
			email,
			password,
			newsletter
		}),
		credentials: "include"
	})
		.then(res => res.json())
		.then(({ csrf }) => localStorage.setItem("csrf", csrf));
}
