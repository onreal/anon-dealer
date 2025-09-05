# Anon dealer
Anon Dealers introduces a cutting-edge profit manager PWA application, 
securing all data through encryption on local indexedDB storage for heightened confidentiality.

There are a lot of things to be done, but the main goal is to create a simple decentralized application 
that can be used by anyone to manage their profits.

The main idea:

Anonymity: You are a seller, but you don't want to share your sales data (inventory ? what you sell ? who you sell ? profits ? )
with anyone, even if your device is taken by force unlocked, your data will still be safe, 
since everything will be stored encrypted on your device.

Business: You are a seller, you want to know how much you have sold, 
how much you have earned and how much you have spent for a particular item.

Management: You are a seller, you want to track your sales, clients, inventories, profits, and expenses. Import/Export data.

Intelligence: You want to know which item is the most profitable, forecasting, reports, analytics, etc.

Communication: P2P communication with WebRTC for seller and buyer to communicate without sharing personal data.

Orders: P2P Decentralized orders, no middleman, no fees, no restrictions, no censorship.

Payments: Support for cryptocurrencies real-time purchase and sale.

How to arrive at the main idea:
Anonimity is on it's core, the first step have been done, a white canvas to start painting on those ideas is born.
Right now, anonimity is achieved by encrypting all data on the client side, 
the data are encrypted on insert update and decrypted on the fly with jjstore.js.
I use typescript and vue3 with vite, and the structure follows the vuex store pattern.
1. Create a new inventory
2. Add/Edit/Delete items to the inventory
3. Add/Edit/Delete clients
4. Add/Edit/Delete sales

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
