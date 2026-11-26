# Changelog

## [0.8.0](https://github.com/mrghasemi1992/money/compare/v0.7.0...v0.8.0) (2026-11-26)


### Features

* open settings only from the user menu ([#157](https://github.com/mrghasemi1992/money/issues/157)) ([471fda5](https://github.com/mrghasemi1992/money/commit/471fda56711ccc294867d02e0a88acca36bd3714))


### Bug fixes

* allow a bank account to carry account number, card number and Sheba at once ([22fe376](https://github.com/mrghasemi1992/money/commit/22fe376115c04222b469daaa74eb40fc90ea3881))
* call a budget or transaction amount beyond the safe limit too large ([69b01fb](https://github.com/mrghasemi1992/money/commit/69b01fb884e84aa28393a525e449a2e5b62ee865))
* name each option of the export range, the new user's role and language, and the import's amount mode and unit ([090e383](https://github.com/mrghasemi1992/money/commit/090e383644ac231bf887c3a872191daec827cd8b))
* save a non-bank account even when a hidden identifier field is invalid ([41ab630](https://github.com/mrghasemi1992/money/commit/41ab630739751404f1735bd19bb762a06c2a15d3))
* show the «no rows» error of a CSV file with only a header row ([763203c](https://github.com/mrghasemi1992/money/commit/763203cd1c7c484f62763d0c065db2d1ff279b0b))

## [0.7.0](https://github.com/mrghasemi1992/money/compare/v0.6.0...v0.7.0) (2026-11-19)


### Features

* record a transaction's time so a day's order matches the bank ([#128](https://github.com/mrghasemi1992/money/issues/128)) ([#151](https://github.com/mrghasemi1992/money/issues/151)) ([1bb2303](https://github.com/mrghasemi1992/money/commit/1bb230395b9234b0d0afd7081fcc169598c300c2))
* regroup the navigation and move user management into settings ([#67](https://github.com/mrghasemi1992/money/issues/67)) ([#155](https://github.com/mrghasemi1992/money/issues/155)) ([a13001c](https://github.com/mrghasemi1992/money/commit/a13001c0630bea69bdff376f78cb6b8cab5e6144))
* track loans and debts with people and lenders as accounts ([#154](https://github.com/mrghasemi1992/money/issues/154)) ([540c5ac](https://github.com/mrghasemi1992/money/commit/540c5acc93eb28d457f76e538f9b8d94ba06d13c))

## [0.6.0](https://github.com/mrghasemi1992/money/compare/v0.5.0...v0.6.0) (2026-11-18)


### Features

* filter transactions by who added them ([#51](https://github.com/mrghasemi1992/money/issues/51)) ([#106](https://github.com/mrghasemi1992/money/issues/106)) ([09e2172](https://github.com/mrghasemi1992/money/commit/09e2172bf03b88f17606f1e1527c19a7fdd33de0))
* one text field on a transaction instead of description and note ([#137](https://github.com/mrghasemi1992/money/issues/137)) ([1616566](https://github.com/mrghasemi1992/money/commit/16165667401c166222058d5ec3f1fc8f5d2568a2))
* show the logo while the installed app opens, instead of a black screen ([#149](https://github.com/mrghasemi1992/money/issues/149)) ([239c695](https://github.com/mrghasemi1992/money/commit/239c695d4195d5b4aa88e0998c84ff6a064faa45)), closes [#132](https://github.com/mrghasemi1992/money/issues/132)


### Bug fixes

* check the login redirect after normalizing it ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#109](https://github.com/mrghasemi1992/money/issues/109)) ([e56f61f](https://github.com/mrghasemi1992/money/commit/e56f61f4c1a0766229349179861fb73b0565fd8a))
* close the Better Auth endpoints Money doesn't use ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#115](https://github.com/mrghasemi1992/money/issues/115)) ([54bbe25](https://github.com/mrghasemi1992/money/commit/54bbe2536ebe7c1d98d458bd4719d91d501050e2))
* **deps:** upgrade Next.js and Zod past security advisories ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#108](https://github.com/mrghasemi1992/money/issues/108)) ([13c07b4](https://github.com/mrghasemi1992/money/commit/13c07b4464a75b290a5d65a105fde2e368a728a6))
* disconnect apps on a password reset or change ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#110](https://github.com/mrghasemi1992/money/issues/110)) ([5f639dc](https://github.com/mrghasemi1992/money/commit/5f639dcf32aa5ecb69ca73ee9828e0ff8b285f3f))
* give transaction rows on phones room for the title and description ([#147](https://github.com/mrghasemi1992/money/issues/147)) ([5e99311](https://github.com/mrghasemi1992/money/commit/5e993112c2532b44273b8fbd946cdfb24c6e5f05)), closes [#130](https://github.com/mrghasemi1992/money/issues/130)
* keep amounts and controls inside their cards on phones ([#145](https://github.com/mrghasemi1992/money/issues/145)) ([9db408e](https://github.com/mrghasemi1992/money/commit/9db408eefccf54005f7f1c97c471a38e9c7f1313))
* keep the full padding on the widest segment of a segmented control ([#143](https://github.com/mrghasemi1992/money/issues/143)) ([d7fb01e](https://github.com/mrghasemi1992/money/commit/d7fb01e23568c816d721319ebdbcd12885f77930))
* let only Claude and ChatGPT connect ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#111](https://github.com/mrghasemi1992/money/issues/111)) ([75477d5](https://github.com/mrghasemi1992/money/commit/75477d5396a922a87f55cb23edc00435b5d641f4))
* limit attempts to change the password ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#116](https://github.com/mrghasemi1992/money/issues/116)) ([67517ce](https://github.com/mrghasemi1992/money/commit/67517ceef24d383374fb554798d3dbf319028646))
* make the unknown transactions notice one link, with its action under the text on phones ([#148](https://github.com/mrghasemi1992/money/issues/148)) ([ec39ed3](https://github.com/mrghasemi1992/money/commit/ec39ed37b3d5c238bb73066e26e23a6d1d2847de)), closes [#131](https://github.com/mrghasemi1992/money/issues/131)
* name both Claude and ChatGPT in the connector copy ([#141](https://github.com/mrghasemi1992/money/issues/141)) ([d1fd7a9](https://github.com/mrghasemi1992/money/commit/d1fd7a994552a2f7c642cd642b5d83dc012d6297)), closes [#136](https://github.com/mrghasemi1992/money/issues/136)
* name the installed app and color its loading screen by the user's language and theme ([#142](https://github.com/mrghasemi1992/money/issues/142)) ([1e29091](https://github.com/mrghasemi1992/money/commit/1e29091d38cfea146617dc344af6852fb829bbeb)), closes [#134](https://github.com/mrghasemi1992/money/issues/134)
* round the hover of the last settings row ([#138](https://github.com/mrghasemi1992/money/issues/138)) ([bba6492](https://github.com/mrghasemi1992/money/commit/bba6492018d34841a4bbe54cb284a4658e972528)), closes [#19](https://github.com/mrghasemi1992/money/issues/19)
* send security headers ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#114](https://github.com/mrghasemi1992/money/issues/114)) ([20feac2](https://github.com/mrghasemi1992/money/commit/20feac260f6b33c598fb9d7a2d63c9ee50bda026))
* show only the assistant icon on phones, not the badge too ([#146](https://github.com/mrghasemi1992/money/issues/146)) ([6cc69d7](https://github.com/mrghasemi1992/money/commit/6cc69d741982c9cd66927cbc087376112f4a49de))
* show only this month's transactions in the dashboard's recent list ([#139](https://github.com/mrghasemi1992/money/issues/139)) ([eabc8ca](https://github.com/mrghasemi1992/money/commit/eabc8ca1c526d2ebc3bce49f58f50b43835505d5)), closes [#135](https://github.com/mrghasemi1992/money/issues/135)
* span the full table width with the divider above the empty state ([#140](https://github.com/mrghasemi1992/money/issues/140)) ([c694167](https://github.com/mrghasemi1992/money/commit/c694167ebf8e5af11889ea8c0876137788605805)), closes [#16](https://github.com/mrghasemi1992/money/issues/16)
* update Better Auth to 1.7.22 ([#72](https://github.com/mrghasemi1992/money/issues/72)) ([#113](https://github.com/mrghasemi1992/money/issues/113)) ([d80629c](https://github.com/mrghasemi1992/money/commit/d80629c68f81f58e0271c879ca6974c8c811091e))

## [0.5.0](https://github.com/mrghasemi1992/money/compare/v0.4.1...v0.5.0) (2026-11-12)


### Features

* add report insights and split reports into tabs ([#60](https://github.com/mrghasemi1992/money/issues/60)) ([#104](https://github.com/mrghasemi1992/money/issues/104)) ([094745e](https://github.com/mrghasemi1992/money/commit/094745e6d6bf17a487beec0af91e6ccfc8e3b765))
* change the theme only from settings ([#27](https://github.com/mrghasemi1992/money/issues/27)) ([#99](https://github.com/mrghasemi1992/money/issues/99)) ([98f1834](https://github.com/mrghasemi1992/money/commit/98f183445c8113eddc008ade5810cc57508b0b2a))
* icons for categories and subcategories ([#24](https://github.com/mrghasemi1992/money/issues/24)) ([#94](https://github.com/mrghasemi1992/money/issues/94)) ([584febd](https://github.com/mrghasemi1992/money/commit/584febd4d174cd00b6f2ff560416041ae3b2a8e8))
* pending states for navigation and buttons ([#28](https://github.com/mrghasemi1992/money/issues/28)) ([#98](https://github.com/mrghasemi1992/money/issues/98)) ([4494128](https://github.com/mrghasemi1992/money/commit/449412862753ea85dafbc11958ba3604e758b80a))
* redesign the phone tab bar and its More menu ([#21](https://github.com/mrghasemi1992/money/issues/21)) ([#100](https://github.com/mrghasemi1992/money/issues/100)) ([cde3138](https://github.com/mrghasemi1992/money/commit/cde3138c5466c3e5fe48443b93a93dedbdb17b31))
* stack toasts like a deck and always close them ([#14](https://github.com/mrghasemi1992/money/issues/14), [#65](https://github.com/mrghasemi1992/money/issues/65)) ([#97](https://github.com/mrghasemi1992/money/issues/97)) ([d8717c1](https://github.com/mrghasemi1992/money/commit/d8717c1455d66a1c58f81cc2f764389aca5cad26))


### Bug fixes

* align the username with the display name on the OAuth consent page ([#17](https://github.com/mrghasemi1992/money/issues/17)) ([#101](https://github.com/mrghasemi1992/money/issues/101)) ([bca1ef1](https://github.com/mrghasemi1992/money/commit/bca1ef15442073db20e45c8b21de464d26b42add))
* make page skeletons match their pages ([#15](https://github.com/mrghasemi1992/money/issues/15)) ([#103](https://github.com/mrghasemi1992/money/issues/103)) ([fd9bcc6](https://github.com/mrghasemi1992/money/commit/fd9bcc660ef513bf200ec57a24698c1866c04459))
* make Storybook sample data follow the language toolbar ([#32](https://github.com/mrghasemi1992/money/issues/32)) ([#102](https://github.com/mrghasemi1992/money/issues/102)) ([606e908](https://github.com/mrghasemi1992/money/commit/606e90821ff7239dbf89710d67979199109b4222))

## [0.4.1](https://github.com/mrghasemi1992/money/compare/v0.4.0...v0.4.1) (2026-10-22)


### Bug fixes

* make the first deploy of a new copy work ([#91](https://github.com/mrghasemi1992/money/issues/91)) ([384e2ff](https://github.com/mrghasemi1992/money/commit/384e2ff3e55782763eef2dadc3d24790d8671066))

## [0.4.0](https://github.com/mrghasemi1992/money/compare/v0.3.1...v0.4.0) (2026-10-17)


### Features

* switch the English font to Manrope ([#23](https://github.com/mrghasemi1992/money/issues/23)) ([#87](https://github.com/mrghasemi1992/money/issues/87)) ([e2650e9](https://github.com/mrghasemi1992/money/commit/e2650e9f0e0b5597df361d81f7c565c558abe6af))

## [0.3.1](https://github.com/mrghasemi1992/money/compare/v0.3.0...v0.3.1) (2026-10-16)


### Bug fixes

* show chosen transaction filters at once and keep typed search text ([#85](https://github.com/mrghasemi1992/money/issues/85)) ([027a083](https://github.com/mrghasemi1992/money/commit/027a083dd5f2c3c21d20d7bae8f52312e69f0655)), closes [#62](https://github.com/mrghasemi1992/money/issues/62) [#63](https://github.com/mrghasemi1992/money/issues/63)

## [0.3.0](https://github.com/mrghasemi1992/money/compare/v0.2.1...v0.3.0) (2026-10-15)


### Features

* add a back button to settings subpages ([#64](https://github.com/mrghasemi1992/money/issues/64)) ([#82](https://github.com/mrghasemi1992/money/issues/82)) ([e8792fa](https://github.com/mrghasemi1992/money/commit/e8792fa0a82473d09a5a193d5f5b2a5406c9e407))
* add a close button to the unknown transactions notice ([#66](https://github.com/mrghasemi1992/money/issues/66)) ([#77](https://github.com/mrghasemi1992/money/issues/77)) ([ead1b9a](https://github.com/mrghasemi1992/money/commit/ead1b9a2dea35a97a4df39b06dc9bb360df1206e))
* move accounts and categories to the main navigation ([#25](https://github.com/mrghasemi1992/money/issues/25)) ([#81](https://github.com/mrghasemi1992/money/issues/81)) ([1782ff6](https://github.com/mrghasemi1992/money/commit/1782ff67275690ff0058f279757f35b5918e4332))
* redesign the phone navigation in the style of Telegram ([#84](https://github.com/mrghasemi1992/money/issues/84)) ([aa6f65e](https://github.com/mrghasemi1992/money/commit/aa6f65e11f534159bc5110ddf0e9d23e82c3f80c))
* set up a copy without a terminal ([#35](https://github.com/mrghasemi1992/money/issues/35)) ([#80](https://github.com/mrghasemi1992/money/issues/80)) ([31023d0](https://github.com/mrghasemi1992/money/commit/31023d05d3f466354ae90cd6033a56b5317ae4cc))


### Bug fixes

* fill the whole login input on autofill and drop the admin note ([#18](https://github.com/mrghasemi1992/money/issues/18)) ([#79](https://github.com/mrghasemi1992/money/issues/79)) ([62e8546](https://github.com/mrghasemi1992/money/commit/62e85469fa8ec4c2b0f4192cecd617138c8fe22a))

## [0.2.1](https://github.com/mrghasemi1992/money/compare/v0.2.0...v0.2.1) (2026-10-13)


### Bug fixes

* delete an unused subcategory even when its siblings have transactions ([#61](https://github.com/mrghasemi1992/money/issues/61)) ([#74](https://github.com/mrghasemi1992/money/issues/74)) ([7ae40d7](https://github.com/mrghasemi1992/money/commit/7ae40d734359eab10d9ada6bc7cd6441792b8b72))

## [0.2.0](https://github.com/mrghasemi1992/money/compare/v0.1.0...v0.2.0) (2026-10-09)


### Features

* show the app version and newer releases, migrate after building ([#34](https://github.com/mrghasemi1992/money/issues/34)) ([#57](https://github.com/mrghasemi1992/money/issues/57)) ([de8e62a](https://github.com/mrghasemi1992/money/commit/de8e62a98c8ee2c7d2f73a532497e1af6fee6ac6))
