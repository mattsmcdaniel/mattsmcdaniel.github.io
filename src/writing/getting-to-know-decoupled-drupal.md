---
title: "Getting to know decoupled Drupal"
pubDate: 2025-11-30
---

The last time I stood up a new Drupal project, Drupal 9 was still in beta and
headless content management systems were still a relatively niche solution.
Since then, Drupal has added support for serving structured content via REST
APIs. I've been curious: what is it like to stand up a headless Drupal 11
project in 2025? After installing the demo site in a container and poking
around, I concluded that the core product is solid, but you have to contend with
patchy documentation.

## Installing Drupal with the official container image

I started by looking up
[the official Drupal container image on Docker Hub](https://hub.docker.com/_/drupal/).
At the time of recording (version `10.5.4-php8.3-\*`), the image is configured
to use a simple, file-based SQLite database by default, so spinning up a new
container was a short one-liner:

```bash
podman run --name headless-drupal-test -p 8080:80 -d drupal
```

After the brief download, I navigated to `localhost:8080` in my browser and
found the standard Drupal installation wizard.

I selected the demo installation profile (a faux food magazine website) and
SQLite as the database, filled in some account credentials, and it finished
installing in seconds. I was then able to navigate to the home page of the
active website.

I have to pause here. The last time I did this (circa 2019?), I was wrestling
with virtual machines, Vagrant, installing PHP, shared volumes and file
permissions, Composer... Standing up a new environment was painful and slooooow.
Being able to grab an official container image and be done in about a minute
fills me with both joy and grief, as I ponder those many lost hours. Weeks spent
fighting with Ansible, like tears in rain. Anyway.

## Going headless with the JSON:API module

With Drupal 11 installed, I was ready to test out its headless or "decoupled"
features. The
[documentation for these features](https://www.drupal.org/docs/develop/decoupled-drupal)
is disorganized at best (and incomplete at worst), but I eventually found what I
needed.

Drupal offers two options in its core module suite for serving content via a
REST API,
[RESTful Web Services](https://www.drupal.org/docs/8/core/modules/rest) and
[JSON:API](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module).
The RESTful Web Services module is relatively unopinionated, flexible, and
setup-intensive, while the JSON:API module is more opinionated, limited to
Drupal entities, and "batteries included". The docs offer a
<a href="https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/jsonapi-vs-cores-rest-module">feature
comparison table</a>.

For the purposes of this test, I went with JSON:API.

### Getting a response

Both RESTful Web Services and JSON:API are modules and disabled by default, so I
had to enable one before proceeding. (It took me a minute to figure that out.)

After enabling the JSON:API module, I made a cURL request for the _recipe_
content type included in the demo:

```bash
curl --header 'Accept: application/vnd.api+json' localhost:8080/jsonapi/node/recipe
```

And we're done! I immediately received a chunk of structured content in a JSON
object in response. Pagination, filtering, sorting, and including related
entities all worked out of the box. Very satisfying.

```bash
{"jsonapi":{"version":"1.1","meta":{"links":{"self":{"href":"http:\/\/jsonapi.org\/format\/1.1\/"}}}},"data":[{"type":"node--recipe","id":"993bf7a7-60a2-48e9-8f58-563338b8c1b8"...
```

### Navigation menus are enabled separately

If you only intend to use Drupal as a structured content platform with a
relatively flat relationship- or taxonomy-driven information architecture, you
may not need to worry about navigation menus. If you do still need a more
traditional page-based architecture, Drupal can serve its user-configured menus
as JSON, too. Setting up the menu or "linkset" API looks a little different,
though.

The linkset API is managed with a configuration setting rather than a separate
module, so I browsed to `localhost:8080/admin/config/services/linkset` and
checked the box to enable the API endpoint.

The endpoint for the linkset API is also different:

```bash
curl --header 'Accept: application/linkset+json' localhost:8080/system/menu/main/linkset
```

where `main` is the machine name of the desired menu.

Here's the response for the demo's main menu:

```bash
{"linkset":[{"anchor":"\/system\/menu\/main\/linkset","item":[{"href":"\/en","title":"Home","hierarchy":["0"],"machine-name":["main"]},{"href":"\/en\/articles","title":"Articles","hierarchy":["1"],"machine-name":["main"]},{"href":"\/en\/recipes","title":"Recipes","hierarchy":["2"],"machine-name":["main"]}]}]}
```

Note that even though this menu has several nested levels, the linkset format is
a flat array. Your client would use the `drupal-menu-hierarchy` properties to
reconstruct the menu tree.

## Building a frontend

Were I then going to build a frontend for this demo site, I would reach for the
[Drupal API Client project](https://project.pages.drupalcode.org/api_client/),
which offers a few helper JS packages for consuming the Drupal JSON:API
endpoints and supporting traditional page routing. The docs include plenty of
live examples that use the default Drupal demo, so I won't bother recreating
them here.

## Closing thoughts

So what did I learn? It took a little investigation to find the correct way to
get a headless Drupal site up and running, but the process itself was simple. It
was also just nice to revisit Drupal after a few years and find it much easier
to work with.

I'm curious about how steep the learning curve for the RESTful Web Services
module is by comparison. The convenience of the JSON:API is nice, but I suspect
that it would quickly prove too restrictive, especially if you have an existing
API spec you need to match.
