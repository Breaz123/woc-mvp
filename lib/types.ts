// Database types
export enum Role {
	Admin = "Admin",
	Kernlid = "Kernlid",
	Vrijwilliger = "Vrijwilliger",
}

export interface Team {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface Werkgroep {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	email: string;
	role: Role;
	team_id?: string;
	team?: Team;
	name?: string;
	avatar_url?: string;
	created_at: string;
	werkgroepen?: Werkgroep[];
}

export interface Event {
	id: string;
	title: string;
	description?: string;
	date: string;
	location?: string;
	image_url?: string;
	created_at: string;
	updated_at: string;
}

export interface Shift {
	id: string;
	event_id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	max_slots: number;
	created_at: string;
	updated_at: string;
	event?: Event;
}

export interface Signup {
	id: string;
	shift_id: string;
	user_id: string;
	created_at: string;
	shift?: Shift;
	user?: User;
}

export interface News {
	id: string;
	title: string;
	content: string;
	image_url?: string;
	author_id: string;
	created_at: string;
	updated_at: string;
	author?: User;
}

export interface NewsComment {
	id: string;
	news_id: string;
	user_id: string;
	content: string;
	created_at: string;
	updated_at: string;
	user?: User;
}

export interface Sponsor {
	id: string;
	name: string;
	logo_url?: string;
	website_url?: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface Page {
	id: string;
	slug: string;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
}

export interface PasswordVault {
	id: string;
	platform: string;
	username?: string;
	password: string;
	url?: string;
	notes?: string;
	visibility_admin: boolean;
	visibility_kernlid: boolean;
	visibility_custom: boolean;
	created_at: string;
	updated_at: string;
	allowed_users?: { user_id: string }[]; // For custom visibility
}

