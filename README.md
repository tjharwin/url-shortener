# URL Shortener App

This is a simple URL shortening app that uses an SQLite database to store URLs.

URLs are encoded using a SHA-256 hash to ensure uniqueness of the short URL and
a check is made on the database for existing URLs so that we don't store the same
URL more than once.

# Setup

## Install root dependancies

`bun install`

## Install client dependencies

```
cd client
bun install
cd ..
```

## Install server dependencies

```
cd server
bun install
cd ..
```

# Running the app

To run, use `bun run dev` which will run the client and server concurrently.

-Visit http://localhost:5173 in your browser to use the app.
-Enter a URL → click Shorten → short URL appears.
-Clicking the short URL redirects via the Bun backend.
-Invalid or empty URLs show proper error messages.

# Screenshot

<img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/5379e93a-0758-4c3c-a5bf-9550dfbb9c85" />
