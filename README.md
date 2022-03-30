# StratWidget (ALPHA)
interact with all contracts using javascript

Select strategies on the landing page.

First, choose your vault, and vault ID

Provide an allowance for the nft (vault) to perform the action on

If you aim to lever a vault, provide an allowance for the contract to use

Select Your action (Repay, Lever, Liquidate)
(All strategies use flashloans where possible) 
(WAIT ... )

Withdraw your NFT 

(All these are done before you execute, or you might lose your VAULT)

Finally EXECUTE.

e.g

to leverage this vault up using flashloans
![vault 1215 camaave](https://i.imgur.com/74OFmub.jpeg)

provide mai allowance for camvault 1215
![provide mai allowance](https://i.imgur.com/nEQEc0R.jpg)

allow the worker contract to take vault 1215
![allow nft](https://i.imgur.com/vU4EkuB.jpg)

select lever MAI vault (CAM)
![select lever mai vault (cam)](https://i.imgur.com/XHyRWiJ.jpg)

enter details
![enter details](https://i.imgur.com/114twK5.jpg)

ensure the vault is returned
![withdrw nft](https://i.imgur.com/fGxk7t6.jpg)

this is the transaction list
![transactions](https://i.imgur.com/LqNBfSk.jpg)

execute
![execute](https://i.imgur.com/HTsAxUQ.jpg)

this is the transaction on polygonscan
![polygonscan transaction](https://polygonscan.com/tx/0xaf529d27b462e6bc1d59add3a8de57235680406b87d827f59198adfaeea6b8ce)

the results
![results](https://i.imgur.com/BsVhB8E.jpg)

please do not use large token amounts, the slippage and buffers are still being calibrated i.e we asked for a 161 cdr and ended up with 156 (adjust up 5%?)

contracts are in ```/contracts ```

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
