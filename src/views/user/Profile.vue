<template>
	<v-container class="profile-container" fluid grid-list-md>
		<v-layout row wrap>
			<v-flex md3 xs12>
				<div class="infos elevation-3">
					<h3 class="text-xs-center" v-t="{ path: 'profile.about', args: { user: user.login } }"></h3>
					<v-divider></v-divider>
					<v-icon>cake</v-icon>
					<p>Date of Birth Bla bla bla</p>
					<v-divider></v-divider>
					<v-icon>subject</v-icon>
					<p>Eddy Malou dont la signification est imposer la force vers le valium, c'est à dire l'estime du savoir, est le premier savant de toute la République Démocratique du Congo.</p>
				</div>
			</v-flex>
			<v-flex md9 xs12>
				<v-layout row wrap v-if="isMe">
					<v-flex xs12>
						<v-toolbar dense>
							<v-text-field
								v-model="message"
								solo
								prepend-icon="message"
								clear-icon="close"
								clearable
								label="Message"
								type="text"
								hide-details
							></v-text-field>
							<v-btn fab flat small>
								<v-icon>send</v-icon>
							</v-btn>
						</v-toolbar>
					</v-flex>
				</v-layout>
				<p v-t="'profile.empty_events'" v-if="events.length === 0"></p>
				<div class="timeline">
					<div class="line"></div>
					<div v-for="(day, k) in timeline" :key="k" class="timeline-elem">
						<div class="date-content">
							<div 
								v-for="event in day" 
								:key="event.id"
								:class="{ 
									content: true, 
									'elevation-1': true,
									'content-img': event.type == 'USER_FOLLOW' || event.type == 'ANIME_FOLLOW'
								}"
							>
								<p v-if="event.type == 'MESSAGE' ">{{ event.message }}</p>
								<div v-if="event.type == 'ANIME_FOLLOW'">
									<img class="elevation-5" :src="event.anime.cover.normal">
									<p v-t="{ path: 'profile.anime_follow_event', args: { user: event.user.login, anime: event.anime.names[0] } }"></p>
								</div>
								<div v-if="event.type == 'USER_FOLLOW'">
									<img class="elevation-5" :src="event.follow.avatar">
									<p v-t="{ path: 'profile.user_follow_event', args: { user: event.user.login, friend: event.follow.login } }"></p>
								</div>
							</div>
						</div>
						<div class="meta-date">
							<span :class="key" v-for="(v, key) in dateFormat(k)" :key="key">{{ v }}</span>
						</div>
					</div>
				</div>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import {
	VExpansionPanel,
	VBtn,
	VIcon,
	VTextField,
	VDivider,
	VToolbar
} from "vuetify";
import VExpansionPanelContent from "vuetify/es5/components/VExpansionPanel/VExpansionPanelContent";
import { VContainer, VFlex, VLayout } from "vuetify/es5/components/VGrid";
import gql from "graphql-tag";
import dateformat from "dateformat";

export default {
	name: "user-profile",
	props: {
		userId: String
	},
	data() {
		return {
			user: { login: "UNKNOWN" },
			me: {},
			events: [],
			message: ""
		};
	},
	apollo: {
		user: {
			query: gql`
				query userById($id: ID!) {
					userById(id: $id) {
						id
						avatar
						login
					}
				}
			`,
			variables() {
				return {
					id: this.userId
				};
			},
			skip() {
				return !this.userId;
			},
			update: ({ userById }) => userById
		},
		me: {
			query: gql`
				{
					me {
						id
					}
				}
			`,
			update: ({ me }) => me
		},
		events: {
			query: gql`
				query events($user: ID!) {
					events(user: $user) {
						user {
							id
							login
						}
						id
						date
						type
						... on AnimeFollowEvent {
							anime {
								id
								names
								cover {
									normal
								}
							}
						}
						... on MessageEvent {
							message
						}
						... on UserFollowEvent {
							follow {
								id
								login
								avatar
							}
						}
					}
				}
			`,
			variables() {
				return {
					user: this.userId
				};
			},
			skip() {
				return !this.userId;
			},
			update: ({ events }) => events
		}
	},
	i18n: {
		messages: {
			fr: {
				profile: {
					send_message: "Envoyer un message",
					send_message_btn: "Envoyer",
					about: "A propos de {user}",
					empty_events: "Aucuns evènements",
					user_follow_event: "{user} suis maintenant {friend} !",
					anime_follow_event: "{user} suis maintenant {anime} !"
				}
			},
			en: {
				profile: {
					send_message: "Send message",
					send_message_btn: "Send",
					about: "About {user}",
					empty_events: "No events",
					user_follow_event: "{user} now follow {friend} !",
					anime_follow_event: "{user} now follow {anime} !"
				}
			}
		}
	},
	methods: {
		dateFormat(date) {
			return {
				day: dateformat(date, "d"),
				month: dateformat(date, "mmm") + "."
			};
		}
	},
	computed: {
		timeline() {
			const days = [];
			const out = {};
			this.events.forEach(
				({ date }) => days.indexOf(date) === -1 && days.push(date)
			);
			days.forEach(
				d => (out[d] = this.events.filter(({ date }) => date === d))
			);
			return out;
		},
		isMe() {
			return this.me && this.user.id === this.me.id;
		}
	},
	components: {
		VDivider,
		VTextField,
		VExpansionPanel,
		VExpansionPanelContent,
		VBtn,
		VIcon,
		VContainer,
		VFlex,
		VLayout,
		VToolbar
	}
};
</script>


<style lang="stylus">
@import '../../stylus/main.styl';

.profile-container {
	.infos {
		min-height: 120px;
		padding: 15px;

		h6 {
			color: rgba(0, 0, 0, 0.87);
		}

		.icon {
			font-size: 20px;
			padding-top: 10px;
			padding-bottom: 10px;
		}

		p {
			line-height: 20px;
			display: inline-flex;
			width: calc(100% - 34px);
		}
	}

	.timeline {
		position: relative;
		width: 100%;

		.line {
			position: absolute;
			width: 3px;
			height: 100%;
			top: 0;
			left: 50px;
			background: #bcbcbc;
			z-index: 0;
		}

		.timeline-elem {
			width: 100%;
			height: 100%;
			position: relative;
			overflow: hidden;
			margin: 20px 0;

			.date-content {
				max-width: 100%;
				width: auto;
				margin-left: 110px;
				min-height: 53px;
				padding-bottom: 5px;
				padding-right: 3px;

				.content {
					position: relative;
					border-radius: 4px;
					width: auto;
					background-color: #e4e4e4;
					min-height: 62px;
					padding: 15px;
					margin-bottom: 10px;

					img {
						margin-top: -50px;
						border-radius: 50%;
						width: 100px;
						height: 100px;
					}

					p {
						margin-bottom: 0;
					}
				}

				.content-img {
					margin-top: 50px;
					min-height: 80px;

					p {
						padding-left: 115px;
						margin-top: -50px;
					}
				}

				.content:last-child {
					margin-bottom: 0;
				}
			}

			.meta-date {
				position: absolute;
				top: 0;
				left: 20px;
				width: 62px;
				height: 62px;
				color: #bcbcbc;
				background-color: #fafafa;
				border-radius: 100%;
				border: 3px solid #bcbcbc;

				.day, .month {
					display: block;
					text-align: center;
					font-weight: 900;
				}

				.day {
					font-size: 28px;
					line-height: 40px;
				}

				.month {
					font-size: 16px;
					line-height: 5px;
				}
			}
		}
	}
}

.application.theme--dark .profile-container {
	.infos {
		background-color: #363636 !important;
	}

	.meta-date {
		background-color: #181818 !important;
	}

	.timeline-elem {
		.content {
			background-color: #363636 !important;
		}
	}
}
</style>
