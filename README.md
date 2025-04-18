# Frontend

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Prerequisites
* [nvm](https://github.com/nvm-sh/nvm) (optional),
* [node.js:23.7.0](https://nodejs.org/en/blog/release/v23.7.0)

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
> 

## Handling API calls
There is simple middleware implement taking care of all requests to API. 

It's main purpose is control over access token and it's expiration date.

When token is expired request with refresh token is sent to backend to obtain new access token. After this operation completed successfully designated request is sent.

This middleware takes care of throwing errors which is easier to implement new connections and requests to backend.<br>
Additionally there are methods implementing basic HTTP operations which makes implementation of connection easy and quick as the only things which need to be passed are:
endpoint path and body. When url takes parameters(especially GET calls just past params in endpoint path).

There is no need to pass JWT token of the session as middleware takes care of it completely to use correct one.
### Example

```typescript
import { api_middleware } from "$lib/api_middleware"


export async function getUserClassesUsingJwt() {
	try {
		return await api_middleware.get("/api/class_group/list-class-groups");
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function addClassGroup(){
	try{
		return await api_middleware.post(`/api/class_group/`, {
			"name": "test middleware",
			"description": "example usage of middleware"
		});
	} catch (error){
		console.error(error);
		throw error;
	}
}
```
