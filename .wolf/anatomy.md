# anatomy.md

> Session additions: `preview.out` (Vite preview stdout log), `preview.err` (Vite preview stderr log), `backend.out` (backend stdout log), `backend.err` (backend stderr log), `server/services/chartDataService.js` (Yahoo chart point normalizer and timeframe mapper), `server/services/commentBindingService.js` (price/time/session comment binding and deterministic pulse scoring), `src/test/commentBindingService.test.ts` (unit coverage for exact price/time/session binding)

> Auto-maintained by OpenWolf. Last scanned: 2026-04-10T23:45:47.944Z
> Files: 524 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~31 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `components.json` (~124 tok)
- `eslint.config.js` — ESLint flat configuration (~226 tok)
- `index.html` — Market Pulse (~525 tok)
- `package-lock.json` — npm lock file (~110012 tok)
- `package.json` — Node.js package manifest (~992 tok)
- `playwright-fixture.ts` — Re-export the base fixture from the package (~49 tok)
- `playwright.config.ts` — Playwright test configuration (~82 tok)
- `postcss.config.js` — PostCSS configuration (~25 tok)
- `README.md` — Project documentation (~158 tok)
- `server.js` — API routes: GET (4 endpoints) (~1129 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~857 tok)
- `tsconfig.app.json` (~204 tok)
- `tsconfig.json` — TypeScript configuration (~120 tok)
- `tsconfig.node.json` (~144 tok)
- `vercel.json` (~90 tok)
- `vite.config.ts` — Vite build configuration (~449 tok)
- `vitest.config.ts` — Vitest test configuration (~118 tok)

## .claude/

- `launch.json` (~153 tok)
- `settings.json` (~441 tok)
- `settings.local.json` (~393 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .git_dir_old/

- `COMMIT_EDITMSG` (~39 tok)
- `config` (~90 tok)
- `description` (~20 tok)
- `FETCH_HEAD` (~136 tok)
- `HEAD` (~6 tok)
- `index` (~1960 tok)
- `packed-refs` — pack-refs with: peeled fully-peeled sorted (~103 tok)

## .git_dir_old/hooks/

- `applypatch-msg.sample` — An example hook script to check the commit log message taken by (~128 tok)
- `commit-msg.sample` — An example hook script to check the commit log message. (~239 tok)
- `fsmonitor-watchman.sample` — An example hook script to integrate Watchman (~1261 tok)
- `post-update.sample` — An example hook script to prepare a packed repository for use over (~51 tok)
- `pre-applypatch.sample` — An example hook script to verify what is about to be committed (~114 tok)
- `pre-commit.sample` — An example hook script to verify what is about to be committed. (~440 tok)
- `pre-merge-commit.sample` — An example hook script to verify what is about to be committed. (~111 tok)
- `pre-push.sample` — An example hook script to verify what is about to be pushed.  Called by "git (~367 tok)
- `pre-rebase.sample` — The "pre-rebase" hook is run just before "git rebase" starts doing (~1307 tok)
- `pre-receive.sample` — An example hook script to make use of push options. (~146 tok)
- `prepare-commit-msg.sample` — An example hook script to prepare the commit log message. (~398 tok)
- `push-to-checkout.sample` — An example hook script to update a checked-out tree on a git push. (~743 tok)
- `sendemail-validate.sample` — An example hook script to validate a patch (and/or patch series) before (~616 tok)
- `update.sample` — An example hook script to block unannotated tags from entering. (~974 tok)

## .git_dir_old/info/

- `exclude` — git ls-files --others --exclude-from=.git/info/exclude (~64 tok)

## .git_dir_old/logs/

- `HEAD` (~167 tok)

## .git_dir_old/logs/refs/heads/

- `main` (~167 tok)

## .git_dir_old/logs/refs/remotes/origin/

- `HEAD` (~129 tok)
- `main` (~132 tok)

## .git_dir_old/objects/0a/

- `05e4463f65f8cc5637b0ab9196ceb9b407335f` (~18 tok)

## .git_dir_old/objects/11/

- `5e42c0d1e3135f83f3c11f46360c6ddc5e19cf` (~279 tok)

## .git_dir_old/objects/15/

- `34c3b1271873ea89e8eb35eaabc1453bdb9c7a` (~1535 tok)

## .git_dir_old/objects/18/

- `933ec1e32fd828fa14b420859bf791efc7afef` (~21307 tok)

## .git_dir_old/objects/19/

- `fae8d50d5d7efffc67f08f47f6ff30da324806` (~66 tok)

## .git_dir_old/objects/22/

- `4eab7a740a9d2dfc4c686b7c031137b0625693` (~33 tok)

## .git_dir_old/objects/24/

- `62e7f40125368eef338520c2f8cd5d22185509` (~30 tok)

## .git_dir_old/objects/2d/

- `15ef9611eeb6fa7088a87ea7d32f2e76c29bab` (~33 tok)

## .git_dir_old/objects/37/

- `d904cb4071480da4b003570506f86e3195c058` (~198 tok)

## .git_dir_old/objects/38/

- `d7c3a7b6e4edb8e5735e75bbca456def8d1701` (~32 tok)

## .git_dir_old/objects/3c/

- `2024de374cd96824e7bd76e65175a040c5e7d4` (~364 tok)

## .git_dir_old/objects/3f/

- `76b5ca3415e740e2cdf96560ac1bd5f0d15f1b` (~64 tok)

## .git_dir_old/objects/52/

- `b10d067b1a8292d458a4fc1ba5659cd521a7e5` (~67 tok)

## .git_dir_old/objects/56/

- `3c978a7c98e732efc57609fdeb3b0d3de1fa31` (~1024 tok)

## .git_dir_old/objects/57/

- `428eb0b3d97159837b14470b655885f34f1d57` (~3813 tok)

## .git_dir_old/objects/61/

- `88b41ce8b66ce3da543b948323a3afddabfc87` (~33 tok)

## .git_dir_old/objects/6c/

- `f6a8f02ca5ff1d93a5f6f1309ded0575373411` (~120 tok)

## .git_dir_old/objects/74/

- `6131f1f48a4ecf4d9dc083e306fa6812f624ec` (~43 tok)

## .git_dir_old/objects/76/

- `6d2f38cd013e8f72d2c51a02dc5dfcade7037a` (~23 tok)

## .git_dir_old/objects/78/

- `70d234c5aa7e3cf65bbf6504b97ef9a43893a9` (~14 tok)

## .git_dir_old/objects/7c/

- `efa5c148e701b7648dd9375c4999441294f7c5` (~331 tok)

## .git_dir_old/objects/86/

- `602589e72aec2b1093715aa0c157e9f2759db9` (~167 tok)

## .git_dir_old/objects/87/

- `9760215b73b4dec1657b11c81816205b45d996` (~33 tok)
- `ec2dbab2babacbf9896f9319e8a34b6a8b3733` (~63 tok)

## .git_dir_old/objects/88/

- `4ddb1b351f662b74e5d6a597242dce85b70e6e` (~352 tok)

## .git_dir_old/objects/96/

- `5b861cb6eea25378800724fa944379f4d5ad5e` (~1901 tok)

## .git_dir_old/objects/9d/

- `7c767d922c5c5fd6deec5d21a0a2bef147a55c` (~199 tok)

## .git_dir_old/objects/a5/

- `edb28a2e7ca864d1e96d218bf9807942fa4f0c` (~42 tok)

## .git_dir_old/objects/a8/

- `f83a12ef31813769a9eab18155d764e4f32558` (~18 tok)

## .git_dir_old/objects/ab/

- `0e2c748b0c3c768747f83d0cc07f179f900485` (~1299 tok)

## .git_dir_old/objects/b5/

- `1e07cbedfaeb8b8f1b87a6cb7cdadc5681968a` (~191 tok)

## .git_dir_old/objects/b8/

- `7ff57df39c5fdd3253b366fffd40b20f9ecd8e` (~31 tok)

## .git_dir_old/objects/bc/

- `731446be46aede539320c41e45ae26e1ef9991` (~15 tok)

## .git_dir_old/objects/c0/

- `396d7cad497cfe3fc0266bb9cff8f10919f8f0` (~1390 tok)

## .git_dir_old/objects/c7/

- `a1e3ba751a49636650cde6c98f27488dc84136` (~992 tok)

## .git_dir_old/objects/ca/

- `ba246ea3b1377c765f50c761cbf0e996c2e868` (~1531 tok)

## .git_dir_old/objects/cf/

- `a59a64c065e2dfa1bc17e8e54d892f856a9ec2` (~23 tok)

## .git_dir_old/objects/d1/

- `24aeef79e3af414925f888eed900c9e8928d21` (~123 tok)

## .git_dir_old/objects/df/

- `42ea244827343de91fd1fbe28e6f6595e8cefc` (~288 tok)

## .git_dir_old/objects/e7/

- `7fcb49b19074dd6d576eb939216bc57da72c50` (~6778 tok)

## .git_dir_old/objects/ec/

- `ed5ce0d42e97f4d014b2552c1b0ee0ef18b290` (~1406 tok)

## .git_dir_old/objects/ed/

- `9ae0513feaa5fecd2351a39ff86fdca1ec8740` (~155 tok)

## .git_dir_old/objects/ef/

- `f37e777f048e78347e6ab22c1b053435730194` (~9585 tok)

## .git_dir_old/objects/f0/

- `e588f184e3c8fa8e64ee2c69f849258e7c81e0` (~3884 tok)

## .git_dir_old/objects/f6/

- `b6b6ed40392e605b9123f2f189a0c6b764f301` (~1045 tok)

## .git_dir_old/objects/fe/

- `11575ddcc7fd91f5cef2b94f0dfd555a96bf1f` (~380 tok)

## .git_dir_old/objects/pack/

- `pack-19bb231d91e888502badf03071c4a072284e0a13.idx` (~1124 tok)
- `pack-19bb231d91e888502badf03071c4a072284e0a13.rev` (~140 tok)
- `pack-c06d0fae863cb27443533c4c7f8e84185ff62ac5.idx` (~2855 tok)
- `pack-c06d0fae863cb27443533c4c7f8e84185ff62ac5.rev` (~399 tok)

## .git_dir_old/refs/heads/

- `main` (~11 tok)

## .git_dir_old/refs/remotes/origin/

- `HEAD` (~8 tok)
- `main` (~11 tok)

## .git_disabled/

- `COMMIT_EDITMSG` (~20 tok)
- `config` (~90 tok)
- `description` (~20 tok)
- `FETCH_HEAD` (~136 tok)
- `HEAD` (~6 tok)
- `index` (~2171 tok)

## .git_disabled/hooks/

- `applypatch-msg.sample` — An example hook script to check the commit log message taken by (~128 tok)
- `commit-msg.sample` — An example hook script to check the commit log message. (~239 tok)
- `fsmonitor-watchman.sample` — An example hook script to integrate Watchman (~1261 tok)
- `post-update.sample` — An example hook script to prepare a packed repository for use over (~51 tok)
- `pre-applypatch.sample` — An example hook script to verify what is about to be committed (~114 tok)
- `pre-commit.sample` — An example hook script to verify what is about to be committed. (~440 tok)
- `pre-merge-commit.sample` — An example hook script to verify what is about to be committed. (~111 tok)
- `pre-push.sample` — An example hook script to verify what is about to be pushed.  Called by "git (~367 tok)
- `pre-rebase.sample` — The "pre-rebase" hook is run just before "git rebase" starts doing (~1307 tok)
- `pre-receive.sample` — An example hook script to make use of push options. (~146 tok)
- `prepare-commit-msg.sample` — An example hook script to prepare the commit log message. (~398 tok)
- `push-to-checkout.sample` — An example hook script to update a checked-out tree on a git push. (~743 tok)
- `sendemail-validate.sample` — An example hook script to validate a patch (and/or patch series) before (~616 tok)
- `update.sample` — An example hook script to block unannotated tags from entering. (~974 tok)

## .git_disabled/info/

- `exclude` — git ls-files --others --exclude-from=.git/info/exclude (~101 tok)

## .git_disabled/logs/

- `HEAD` (~846 tok)

## .git_disabled/logs/refs/heads/

- `main` (~798 tok)

## .git_disabled/logs/refs/remotes/origin/

- `HEAD` (~3136 tok)
- `main` (~576 tok)

## .git_disabled/logs/refs/remotes/origin/claude/

- `fix-navbar-active-tab-L3ahK` (~166 tok)
- `setup-claude-hud-3ygIR` (~55 tok)
- `ui-improvements` (~55 tok)

## .git_disabled/objects/00/

- `3a9b06617e4fb2715db66f0761ee2a91874a0a` (~122 tok)
- `5b10c370a470981515ddbec477c32f280b9d5c` (~31 tok)
- `c17391af9465bb6ea36caabff186ef45e3833b` (~3241 tok)

## .git_disabled/objects/01/

- `4620f665422c0d9c5d1057a2b7a27984e283b6` (~79 tok)
- `466ecf24c9aa3d9fd334afa25e1702715717e9` (~64 tok)
- `bdbced7592a1449e7603730568f18d7bb815cb` (~296 tok)

## .git_disabled/objects/02/

- `b436537aee3cc6675343fb68cc43c098d32a01` (~13 tok)

## .git_disabled/objects/05/

- `54ec5afdde84800768b75cb135d8a197cc1370` (~319 tok)
- `cccbc433598060d4932e27470af65911d8d45e` (~39 tok)

## .git_disabled/objects/06/

- `99548f55d2b920820a3e19d8b6b4807df8b599` (~362 tok)

## .git_disabled/objects/07/

- `0296dd5ba64405a8d7e3ab8db1c3756681223f` (~16 tok)
- `0390376b2044215f7c176b125fb44d5fafe94c` (~329 tok)
- `24e31f15bd89ed5e8f9e0bace05e5b58c8a9f7` (~2720 tok)
- `c9525c2c7fee08c87b186378d6b91fe55f1c53` (~78 tok)

## .git_disabled/objects/08/

- `58d1f5383bd38c87427410eb64d615780cb400` (~60 tok)

## .git_disabled/objects/09/

- `5edf58f051332353916baec4c4a7d866db941d` (~33 tok)

## .git_disabled/objects/0d/

- `199b2df67dcc25a1e798f499cf2340b034eda4` (~24 tok)
- `f7407684683bfa05027067665902a787ec73e1` (~44 tok)

## .git_disabled/objects/0e/

- `46010c74d63c1da985b868cc77aaa8da24c747` (~122 tok)

## .git_disabled/objects/0f/

- `2fa7823f4a3212a50b70c6a866035b9e7cb9f0` (~4358 tok)

## .git_disabled/objects/11/

- `4759a49f4505429fd70019bdefa3b29cd6a89e` (~2728 tok)
- `56a3307fd04c48b8f524764b348fef2d4bf16c` (~200 tok)
- `f02fe2a0061d6e6e1f271b21da95423b448b32` (~15 tok)

## .git_disabled/objects/15/

- `bc57ece99f8050313f7b7d3ee0b255f767e215` (~87 tok)

## .git_disabled/objects/1a/

- `ead2903b27d35599c58c5d0f17450f8395d578` (~449 tok)

## .git_disabled/objects/23/

- `34c1b5df8237dcf8e99942910d1d6b3e9d221f` (~124 tok)

## .git_disabled/objects/24/

- `a9c75dd93175ed99f7428ca3ab2dd5d143f406` (~527 tok)

## .git_disabled/objects/25/

- `54b43445cd4fa645adbaf7e3a8cec1cb86f544` (~5123 tok)

## .git_disabled/objects/27/

- `56f289de09d70949e9ee40cba1fce9e684f523` (~78 tok)
- `f6cd13882d484c875717db510e2a1bdc87530b` (~60 tok)

## .git_disabled/objects/28/

- `1006521b1d4f179388ec73bb4f6e96f4689b6a` (~4355 tok)

## .git_disabled/objects/29/

- `ca7e9bd050d010949b60d1a31f54b509ce5ed7` (~120 tok)

## .git_disabled/objects/2a/

- `a7205d4b402a1bdfbe07110c61df920b370066` (~23 tok)

## .git_disabled/objects/2c/

- `6ad747f209102fcaac3be0346f089005068998` (~122 tok)
- `6d92c735fba4b605fce0e09f09ab18da50d001` (~207346 tok)
- `ba1c825a884050a4917d1a198726fbd7d888ee` (~85 tok)

## .git_disabled/objects/2d/

- `15ef9611eeb6fa7088a87ea7d32f2e76c29bab` (~33 tok)
- `ece61d05221533410c21ed07bd1fae8e91dbb5` (~132 tok)

## .git_disabled/objects/2f/

- `4502f1eca18d890f18dfd3aa94170f3c5b8aee` (~654 tok)

## .git_disabled/objects/30/

- `7c17402c64be8515aa406ce813f307b5f4a5f3` (~30 tok)
- `9065abee3d3c02d01a4175f464cadcc174f8e5` (~30 tok)

## .git_disabled/objects/31/

- `04663eb5a671dffad9d3928ff2164da26c45a6` (~76 tok)
- `33162c20350e1741b94b8d2ff77b811bec8363` (~73 tok)

## .git_disabled/objects/32/

- `7e74e09a2cbe211a4eae8ef013186bd99d625a` (~30 tok)
- `b8418ab6fb4f65d6c63cdb8b4333d105318f33` (~387 tok)

## .git_disabled/objects/34/

- `014f9b596e9743d89fe0f394760c6d74393e10` (~33 tok)

## .git_disabled/objects/38/

- `dbd3165fdf9fcdace2f2b49a5465c287c762fa` (~99 tok)
- `f9f9c9c6ffe930357a99cc5e7c011c20c771ac` (~3892 tok)

## .git_disabled/objects/3a/

- `13916f8d390770f6a626a985ba5c440441c1fa` (~1367 tok)
- `9bfb381e59707cfe7b02434bd333d8fde50486` (~167 tok)
- `ee744839ab96c8c89fc837b8f35a6979493a7d` (~66 tok)

## .git_disabled/objects/3b/

- `f8dc8078ad5d6df82521f044e0e2d017578793` (~162 tok)

## .git_disabled/objects/3c/

- `2024de374cd96824e7bd76e65175a040c5e7d4` (~364 tok)
- `f1aa8b715ae0c04ad2752032706af98d381c0a` (~201 tok)

## .git_disabled/objects/3d/

- `45825996441eefdb7c2cdebcf096e9a7096d18` (~33 tok)
- `924b99d5cf33060bfaaa46ca54f18e2beee1a1` (~3265 tok)
- `b03871dde328c9095c3a52b5cbdc0be9b34c40` (~123 tok)

## .git_disabled/objects/3e/

- `ddf5758a6529890335bbf17034de660d8be50c` (~79 tok)

## .git_disabled/objects/40/

- `f72cc45a46993d3d02da765842abb2703a64c1` (~94 tok)

## .git_disabled/objects/43/

- `8f667dac9f0a265210cc24a3261a586135ada5` (~218 tok)
- `aefc316ad5769f19e27e5c816662fa45e3c5ae` (~206 tok)

## .git_disabled/objects/44/

- `d3ad252e05e8f2d0467ac922af552f2690c4e5` (~76 tok)

## .git_disabled/objects/45/

- `968c4249860b62722d02e28d667e44e2d55aff` (~267 tok)

## .git_disabled/objects/46/

- `42d5e76c9e18b8bcf25d9b5fda5f21d2dfac9f` (~13 tok)

## .git_disabled/objects/47/

- `02aae45759f49197bc7776b0a63e99a9ddf1d2` (~124 tok)

## .git_disabled/objects/48/

- `0475476f407d621fa8c355ee7e3b6435c9a869` (~31 tok)
- `b814e49e4ffc555bb426d3d96bec1f2c088076` (~184 tok)
- `f81ceb36713d4b5f738389fe3615f74e8ebaa0` (~18717 tok)

## .git_disabled/objects/49/

- `d0cd05eb6f3859adc7d4e6eab70b5e27b88ade` (~21871 tok)

## .git_disabled/objects/4a/

- `698f12e5bc8ef5c954e3daf2312b91b4e0f64c` (~17 tok)

## .git_disabled/objects/4b/

- `445a790c522134e1234de195d9be50f28c8b6a` (~190 tok)
- `50cb96e7bce657a8c040cbbb6304caa2554a28` (~31 tok)

## .git_disabled/objects/4d/

- `516a5c0f692a4c710b09a50bef9dd9be9c17d3` (~3915 tok)
- `e3f500cec6f28c4576086e46e4ce8499b518f7` (~126 tok)

## .git_disabled/objects/4f/

- `777490cca8823913b72ba251bbeace25306727` (~197 tok)

## .git_disabled/objects/50/

- `2fd323934501eab408a396a9ae4a07c0ae3560` (~79 tok)

## .git_disabled/objects/51/

- `bada2a068cf8d66bf3b0c8c70d0509bfd855e9` (~39 tok)
- `f581dd91641b4c1f1219f646788e73cf6bf00c` (~92 tok)

## .git_disabled/objects/52/

- `9f3ea9cbf594f07cc2395846f124e385d22dd2` (~199 tok)
- `e6d2f0ae9e6bc3ac85dbfeee6cd0b3d6e5d1c7` (~32 tok)

## .git_disabled/objects/54/

- `121f31c726c60df07f7f4cb6ba5190915233e1` (~2764 tok)

## .git_disabled/objects/55/

- `e6205d1620e690f72c9183f60f3721181e3551` (~547 tok)

## .git_disabled/objects/56/

- `3c978a7c98e732efc57609fdeb3b0d3de1fa31` (~1024 tok)
- `a894286246bc794d6a1c1b6346f0018ba3625c` (~23 tok)

## .git_disabled/objects/57/

- `1d982f9e6cca6e1bb2d86c9b21bf48e7fdf72b` (~165 tok)
- `24c514624773d150a1b7e633a8ddc46dfd321c` (~76 tok)
- `abb18b917b911527895b7c085fae3f47e8cf8a` (~14 tok)
- `c3d5fccac4c372e492c28f1a8f2e7a8bfa8bc6` (~268 tok)

## .git_disabled/objects/59/

- `0a822430b242e047fcb552752beb62621e229b` (~833 tok)

## .git_disabled/objects/5c/

- `d2cdc7b8665ede290b271d3e5a3c6c2cf3d116` (~218 tok)

## .git_disabled/objects/5e/

- `3d6d407d5570ef42678724bee250a7534d69f4` (~200 tok)
- `a00628fcbf35ecf04bdb30af814a78c9066f51` (~124 tok)

## .git_disabled/objects/60/

- `18e701fc7dd0317cda9eceea390524322e8a05` (~24 tok)
- `94b755de0ff56ee2946fb37fbc939d1843e8bc` (~194 tok)

## .git_disabled/objects/62/

- `622f13e2ed2551381ff5f42a2f13b690459915` (~91 tok)
- `e101166a31ade477811bd31f6be1ae44d45423` (~59 tok)

## .git_disabled/objects/63/

- `f60bd1b0dd6018a42eee3e8576f2c6e26173f5` (~28 tok)

## .git_disabled/objects/65/

- `d8772a4191668d881a873e560f6ab80eea2461` (~14 tok)

## .git_disabled/objects/66/

- `05308dbd12e60e2f864cc8e5cdc87ab78f2e08` (~32 tok)

## .git_disabled/objects/68/

- `176a72f30ae0650f5093c8b6a7b01016acf07a` (~36 tok)
- `ee8247dfc85a4fc8e8ea9e18948d3ce0dae897` (~122 tok)

## .git_disabled/objects/6b/

- `4e34455147c316fec8b95ee407ee9c88ec6e51` (~3916 tok)
- `68d80b7d92d0c4a5d774897f2bedfa95b42669` (~55 tok)
- `f5ac550e076ce76c3d4d969c523d5b96286a57` (~31 tok)

## .git_disabled/objects/6e/

- `4c8b403f3a31be3c4a3e2d5ecaac86c6556140` (~180 tok)

## .git_disabled/objects/6f/

- `8f1024ee962fce390c6e9339b4948d82df1164` (~200 tok)

## .git_disabled/objects/70/

- `33cef8ec5be07307aa744f0f99012ece46a57b` (~467 tok)
- `c628f0d7fc48772c16ee6322e015483ced6a0e` (~24 tok)

## .git_disabled/objects/71/

- `ee765e1c54b43ca2f9b534a81c948a14004714` (~153 tok)

## .git_disabled/objects/72/

- `cf873884a6b95256d39d0b0fd4a3214ce8cfa9` (~1855 tok)

## .git_disabled/objects/73/

- `79ecc8af510a9d387f293c78d0220a1b70dcb1` (~37 tok)

## .git_disabled/objects/75/

- `60283473f656e44230d2fff7d657f9cc532716` (~3897 tok)
- `798aa9e5f1603c9084b2e477af74a86d079d74` (~33 tok)

## .git_disabled/objects/78/

- `70d234c5aa7e3cf65bbf6504b97ef9a43893a9` (~14 tok)
- `9a43d3a7b488a74dbc9f3eadcb41d70d8557e6` (~1112 tok)
- `9b9059e521cd91157d420398d77dbf61f4c0d3` (~123 tok)
- `ee6f17bfd0e01073e22c4f3b0fb76d381fab72` (~163 tok)

## .git_disabled/objects/79/

- `763b5868dd373baf9e3aaa704a28d00764d36d` (~33 tok)

## .git_disabled/objects/7b/

- `c223466c71ffb2ee284f0149a4b4cadfa5ae35` (~104 tok)

## .git_disabled/objects/7c/

- `7a305bfa8f3c7250efd8b73eb9f4e048d48288` (~34 tok)

## .git_disabled/objects/7d/

- `471c19373e904c9c08be4768c94a5746801e9b` (~37 tok)

## .git_disabled/objects/83/

- `0ea477d60b72d2bec7ad083a7bbcec8297870f` (~255 tok)
- `eb04dc8aa07919441f5ce9c7b3f1debb8fd1b8` (~201 tok)

## .git_disabled/objects/84/

- `6af484620cd4f78fb17d7ff4d6b283c2938657` (~53 tok)
- `f3735fd11e747ad911d968e399f9bf8494b837` (~86 tok)

## .git_disabled/objects/85/

- `6cf29af468d1e15a9973f4c96b246a93125912` (~200 tok)

## .git_disabled/objects/86/

- `602589e72aec2b1093715aa0c157e9f2759db9` (~167 tok)

## .git_disabled/objects/87/

- `ec2dbab2babacbf9896f9319e8a34b6a8b3733` (~63 tok)

## .git_disabled/objects/88/

- `9a2afb02194c5b06138c41a54a055e37e1bd5b` (~87 tok)

## .git_disabled/objects/8b/

- `9ed5d805d7f11b3f8840ab5a5268ea40feeb8e` (~226 tok)
- `ceebb5f11bd0b8ada87b8191669726dd57c499` (~55 tok)

## .git_disabled/objects/8c/

- `6eea3a7cc0277523a39857c1f705276cbcc554` (~78 tok)
- `afe3cd4e27585a64d447c28875cd6f2285dc6d` (~58 tok)

## .git_disabled/objects/92/

- `6f973c8a31cc5b30c5943d2ae91c9182e7ee3a` (~1187 tok)
- `bb2c45e5bff0402a1f8d3735d2f1d7cac2b250` (~97 tok)

## .git_disabled/objects/94/

- `48ee4dde20517bcaa625d93fb26bb18a2ddc5e` (~16833 tok)

## .git_disabled/objects/95/

- `14a702187ae91b5ccf3b1171c7792a5a5eb074` (~2707 tok)
- `39c5b070ba37e14a9c05472e4e4fa7bf8ccf0a` (~23 tok)
- `d116121aeabb0906dbc80044825b1a9ad83347` (~1947 tok)

## .git_disabled/objects/96/

- `5b861cb6eea25378800724fa944379f4d5ad5e` (~1901 tok)
- `c99e3356b1a2ac6fb1f60e11375a8bf4acbea5` (~33 tok)

## .git_disabled/objects/97/

- `524cebecc38fd3077e5fd88203af1924ed1d05` (~44 tok)
- `6fe771f293f3bbf4b806b6cb38074bb828b226` (~203 tok)
- `7a0fe725eb773acc3da1a47f0138f22d8fa299` (~119 tok)

## .git_disabled/objects/98/

- `f27cd2b41de0df5abe5a591006e416c0cba512` (~202 tok)

## .git_disabled/objects/9a/

- `7fb68d180af4eec23a2520523311b6595a1ab3` (~13 tok)

## .git_disabled/objects/9b/

- `5c9fec5a85e50b0163e666f3d86a4c556653fb` (~124 tok)

## .git_disabled/objects/9d/

- `f8ed7280e07b45c6b5938e8e76c15717b4370b` (~33 tok)

## .git_disabled/objects/9e/

- `1e9b8772bb3554772cf3d37e8b798445ec967e` (~153 tok)

## .git_disabled/objects/a0/

- `2514f37d590ce5eef43042ea7be487ace34cd0` (~48 tok)

## .git_disabled/objects/a1/

- `11a86d6ce0ab77bf2ebfe5b19c050e4df9fd6e` (~190 tok)

## .git_disabled/objects/a2/

- `b093fb64920d93a3e757296a1c4f0d21e74de4` (~199 tok)

## .git_disabled/objects/a3/

- `6e364da245549cbea63a75af050e3911df6715` (~401 tok)

## .git_disabled/objects/a4/

- `fb7d97053279feeddecceb87300037b42cf2d3` (~1364 tok)

## .git_disabled/objects/a5/

- `61a95f420d2ee6ffb98e12b690f354a7c9c50d` (~92 tok)
- `869cb1521fe9d6a7bd52e4e0774e59246bd931` (~3923 tok)
- `afc1a304367c655afe87d1adb1bfe928ec2daf` (~51 tok)
- `edb28a2e7ca864d1e96d218bf9807942fa4f0c` (~42 tok)
- `ef193506d07d0459fec4f187af08283094d7c8` (~36 tok)

## .git_disabled/objects/ab/

- `ccda30e72820097312464bf35a31c6bd7a0bfc` (~127 tok)

## .git_disabled/objects/ac/

- `30048feeea3f6ef870049cd606bba3917c1eb7` (~656 tok)

## .git_disabled/objects/ae/

- `3e0d26ac400277646cbe442e345dbabe85f9a2` (~30 tok)
- `b9ce08ebe220871472a7bf26c6ca21391d5cd2` (~330 tok)
- `f345ddd171dbbbd95f200d2d39a803302762fb` (~34 tok)

## .git_disabled/objects/b0/

- `aef21be259883fe159d3176ab46c6841c28a07` (~19 tok)

## .git_disabled/objects/b1/

- `754c0234c463db3144d093f5c4eea0979e1c90` (~31 tok)
- `b53cc02a374095425d4028a3eb8059e143c4e2` (~87 tok)

## .git_disabled/objects/b3/

- `0e87ec447eea25c6152627faae0ce35a8343ae` (~506 tok)

## .git_disabled/objects/b5/

- `346a7fd509707505e8d96f2c68c55a0b51d5cd` (~191 tok)
- `36c414e4aca4e49c090c4e10f3e1fe0071a10d` (~38 tok)

## .git_disabled/objects/b7/

- `f198b5928a228fb55ef595e26d9d74ac0241f2` (~99 tok)

## .git_disabled/objects/b9/

- `d355df2a5956b526c004531b7b0ffe412461e0` (~83 tok)

## .git_disabled/objects/bc/

- `731446be46aede539320c41e45ae26e1ef9991` (~15 tok)

## .git_disabled/objects/bd/

- `e3a306ad94b5e9205423a92095c8b1b7e4e49c` (~30 tok)

## .git_disabled/objects/be/

- `487a1081897a875e2149c5354a331036da8583` (~23 tok)
- `a746551bdcec0ac2cda190e026189d52a675a5` (~79 tok)
- `b4f900b3f6ae58e23536fab802a6a3bca5a553` (~447 tok)

## .git_disabled/objects/c5/

- `67a4a7cbc183ead7eb74e54436a5085b9ae522` (~281 tok)

## .git_disabled/objects/c7/

- `98e5fe859711ab8d5831f65e907b8d9982879f` (~87 tok)

## .git_disabled/objects/ca/

- `1316d678d31c11c213ce717c5e064a17e85ecd` (~371 tok)

## .git_disabled/objects/cb/

- `6426373b803057e24a2fa373be89d80bf7258b` (~76 tok)

## .git_disabled/objects/cd/

- `14bbed3f050ceea20a8a06ba8b96fea2a92a4a` (~31 tok)
- `9d2bffa3582df98ab2b87acccebf178cd6dbee` (~30 tok)
- `edd4f43da30732ce09e289a3c373a34c932078` (~206 tok)

## .git_disabled/objects/ce/

- `26122e1fadc54bf0e2a0fcf6182ddffa4bb002` (~587 tok)
- `26b604897ee3f2f592397756305b373ef794d2` (~14 tok)
- `8e679c97b61a6ecd14a1c39a31c959eaa944a8` (~24 tok)

## .git_disabled/objects/cf/

- `1240d7a1cdc68c2597d7cd10202b99667f87f4` (~486 tok)
- `165132353e68082cffbf1abc76ef4efea16a5d` (~30 tok)
- `a59a64c065e2dfa1bc17e8e54d892f856a9ec2` (~23 tok)

## .git_disabled/objects/d1/

- `6c21b45b215fdb68564b5e74381452eec83a04` (~49 tok)

## .git_disabled/objects/d2/

- `a4ac38e9b5e66603ae1b565df987cddea9df57` (~1491 tok)
- `f7eca5dadc5c098ad3d9da6716de5e024fe342` (~30 tok)

## .git_disabled/objects/d4/

- `386fe701c7d75c8ee1a85c3ac9752aec6b6f88` (~946 tok)

## .git_disabled/objects/d6/

- `85475b132181749ecbb93637bdc8397df0aad2` (~202 tok)

## .git_disabled/objects/d7/

- `c3efb5f08732a9b3496c391c7889228a866801` (~17 tok)
- `cce285b88079a5103a3a21c4f88b2bc7dbd6ae` (~1029 tok)
- `d56c46906c28381783c65fa18ca770fc7962c0` (~1114 tok)

## .git_disabled/objects/d8/

- `efe668a3f2d01eb34eb59794b034b44ff5ec5b` (~30 tok)

## .git_disabled/objects/d9/

- `ecbb2b4dbe1b83b6e4686256fec809c010c8ee` (~30 tok)

## .git_disabled/objects/da/

- `5185dbf6971c84bcc110f4f69ef40f28080dac` (~18 tok)

## .git_disabled/objects/dd/

- `9a3d049c89df5b3bbd2cae22e50c94f9776a27` (~206 tok)
- `9abea5bdf095352485fb215c085300dd32384e` (~163 tok)

## .git_disabled/objects/de/

- `e4f30832394bab49d94dbae5d0df43454b096b` (~1298 tok)

## .git_disabled/objects/df/

- `04b012f200c2c0fe514e1fd7d82a3aacf1d006` (~134 tok)
- `42acc17c8a895139df58db478356e26538b541` (~125 tok)

## .git_disabled/objects/e1/

- `ac8a0444f84fbe00eec9b8f6100ae31f879619` (~1088 tok)

## .git_disabled/objects/e3/

- `81e8aa481fd081cc3a24d6a8cbe775693ccdc6` (~120 tok)

## .git_disabled/objects/e5/

- `16e5c1c02255a423a9b5077f5ff66c68a15b2f` (~123 tok)
- `3eb4c244c701699a5458810b42ee0f39463860` (~25 tok)

## .git_disabled/objects/e6/

- `4ac45333e3b448fa95a1a888cdef88e6358000` (~3907 tok)
- `b0eb011a1bc3b2948fa2353c916dfc47eff8d5` (~23 tok)
- `f6fd4987ab139bd7a23a93a8a0512574d17654` (~200 tok)

## .git_disabled/objects/e7/

- `63910b27fdd9ac872f56baede51bc839402347` (~248 tok)
- `6e6aadd4517d157560e6f981acc2ab331adde2` (~80 tok)
- `7fcb49b19074dd6d576eb939216bc57da72c50` (~6778 tok)

## .git_disabled/objects/e9/

- `4a21147a3dbea52b33125aec0f9bb388e2f538` (~123 tok)

## .git_disabled/objects/ea/

- `2341ece0ea1a6b714018ffdaad11ce367f44d1` (~724 tok)

## .git_disabled/objects/ec/

- `19e9596784070e71ed6a3ccb66ce1aae0af37a` (~51 tok)

## .git_disabled/objects/ed/

- `9ae0513feaa5fecd2351a39ff86fdca1ec8740` (~155 tok)

## .git_disabled/objects/ef/

- `487f5ba398fd040841eda870d8a1bcdfa404c2` (~30 tok)
- `f37e777f048e78347e6ab22c1b053435730194` (~9585 tok)

## .git_disabled/objects/f1/

- `bb773a140ee392db8dfc25a235fa95e60019ff` (~4392 tok)

## .git_disabled/objects/f3/

- `61f8e9dc9c81f1818b3fe9df5af36512065cf0` (~203 tok)
- `f342d9e3ac7217b56974392fcc05bc5dc6b36f` (~122 tok)

## .git_disabled/objects/f4/

- `272694b16f5ecbd4b63e5818b99cd1b68e6226` (~45 tok)

## .git_disabled/objects/f5/

- `efb63f08e4677b1d8fa7da4daea549cd306c3f` (~5146 tok)
- `f1716d38bff737579e1eb19b0ad7eeacbd9a36` (~701 tok)

## .git_disabled/objects/f8/

- `4d634cf122e55d97205ddc301aac31ed9abd0f` (~2561 tok)

## .git_disabled/objects/f9/

- `470bb2fdc983fabdf2e3080f11c03b896d4ff8` (~407 tok)

## .git_disabled/objects/fa/

- `2d09628e4a5833207600d9387ff1ff141b2583` (~56 tok)

## .git_disabled/objects/fb/

- `a3e39071e0f6d7dcbe40a68ec4d86a24967bd7` (~1407 tok)

## .git_disabled/objects/fe/

- `7fe19e01ba5dcd1b8fbc9d2c88fb0a5a015276` (~243 tok)
- `fe05a9929f0799cd7ad74081e2d58a1ae464c5` (~65 tok)

## .git_disabled/objects/pack/

- `pack-6062ec865d0ae0e5abfa0f884124bee2f17d256e.idx` (~1848 tok)
- `pack-6062ec865d0ae0e5abfa0f884124bee2f17d256e.rev` (~247 tok)

## .git_disabled/refs/heads/

- `main` (~11 tok)

## .git_disabled/refs/remotes/origin/

- `HEAD` (~8 tok)
- `main` (~11 tok)

## .git_disabled/refs/remotes/origin/claude/

- `fix-navbar-active-tab-L3ahK` (~11 tok)
- `setup-claude-hud-3ygIR` (~11 tok)
- `ui-improvements` (~11 tok)

## .git_readonly_backup/

- `COMMIT_EDITMSG` (~63 tok)
- `config` (~66 tok)
- `description` (~20 tok)
- `FETCH_HEAD` (~139 tok)
- `HEAD` (~6 tok)
- `index` (~2006 tok)

## .git_readonly_backup/hooks/

- `applypatch-msg.sample` — An example hook script to check the commit log message taken by (~128 tok)
- `commit-msg.sample` — An example hook script to check the commit log message. (~239 tok)
- `fsmonitor-watchman.sample` — An example hook script to integrate Watchman (~1261 tok)
- `post-update.sample` — An example hook script to prepare a packed repository for use over (~51 tok)
- `pre-applypatch.sample` — An example hook script to verify what is about to be committed (~114 tok)
- `pre-commit.sample` — An example hook script to verify what is about to be committed. (~440 tok)
- `pre-merge-commit.sample` — An example hook script to verify what is about to be committed. (~111 tok)
- `pre-push.sample` — An example hook script to verify what is about to be pushed.  Called by "git (~367 tok)
- `pre-rebase.sample` — The "pre-rebase" hook is run just before "git rebase" starts doing (~1307 tok)
- `pre-receive.sample` — An example hook script to make use of push options. (~146 tok)
- `prepare-commit-msg.sample` — An example hook script to prepare the commit log message. (~398 tok)
- `push-to-checkout.sample` — An example hook script to update a checked-out tree on a git push. (~743 tok)
- `sendemail-validate.sample` — An example hook script to validate a patch (and/or patch series) before (~616 tok)
- `update.sample` — An example hook script to block unannotated tags from entering. (~974 tok)

## .git_readonly_backup/info/

- `exclude` — git ls-files --others --exclude-from=.git/info/exclude (~64 tok)

## .git_readonly_backup/logs/

- `HEAD` (~306 tok)

## .git_readonly_backup/logs/refs/heads/

- `main` (~257 tok)

## .git_readonly_backup/logs/refs/remotes/origin/

- `HEAD` (~116 tok)
- `main` (~154 tok)

## .git_readonly_backup/logs/refs/remotes/origin/claude/

- `fix-navbar-active-tab-L3ahK` (~55 tok)
- `setup-claude-hud-3ygIR` (~55 tok)
- `ui-improvements` (~55 tok)

## .git_readonly_backup/objects/01/

- `4620f665422c0d9c5d1057a2b7a27984e283b6` (~79 tok)
- `bdbced7592a1449e7603730568f18d7bb815cb` (~296 tok)

## .git_readonly_backup/objects/05/

- `54ec5afdde84800768b75cb135d8a197cc1370` (~319 tok)

## .git_readonly_backup/objects/06/

- `99548f55d2b920820a3e19d8b6b4807df8b599` (~362 tok)

## .git_readonly_backup/objects/0d/

- `199b2df67dcc25a1e798f499cf2340b034eda4` (~24 tok)
- `f7407684683bfa05027067665902a787ec73e1` (~44 tok)

## .git_readonly_backup/objects/11/

- `f02fe2a0061d6e6e1f271b21da95423b448b32` (~15 tok)

## .git_readonly_backup/objects/1a/

- `ead2903b27d35599c58c5d0f17450f8395d578` (~449 tok)

## .git_readonly_backup/objects/24/

- `a9c75dd93175ed99f7428ca3ab2dd5d143f406` (~527 tok)

## .git_readonly_backup/objects/27/

- `56f289de09d70949e9ee40cba1fce9e684f523` (~78 tok)
- `f6cd13882d484c875717db510e2a1bdc87530b` (~60 tok)

## .git_readonly_backup/objects/2a/

- `a7205d4b402a1bdfbe07110c61df920b370066` (~23 tok)

## .git_readonly_backup/objects/2c/

- `6d92c735fba4b605fce0e09f09ab18da50d001` (~207346 tok)
- `ba1c825a884050a4917d1a198726fbd7d888ee` (~85 tok)

## .git_readonly_backup/objects/2d/

- `15ef9611eeb6fa7088a87ea7d32f2e76c29bab` (~33 tok)
- `ece61d05221533410c21ed07bd1fae8e91dbb5` (~132 tok)

## .git_readonly_backup/objects/2f/

- `4502f1eca18d890f18dfd3aa94170f3c5b8aee` (~654 tok)

## .git_readonly_backup/objects/30/

- `7c17402c64be8515aa406ce813f307b5f4a5f3` (~30 tok)

## .git_readonly_backup/objects/31/

- `33162c20350e1741b94b8d2ff77b811bec8363` (~73 tok)

## .git_readonly_backup/objects/32/

- `7e74e09a2cbe211a4eae8ef013186bd99d625a` (~30 tok)
- `b8418ab6fb4f65d6c63cdb8b4333d105318f33` (~387 tok)

## .git_readonly_backup/objects/38/

- `dbd3165fdf9fcdace2f2b49a5465c287c762fa` (~99 tok)
- `f9f9c9c6ffe930357a99cc5e7c011c20c771ac` (~3892 tok)

## .git_readonly_backup/objects/3a/

- `9bfb381e59707cfe7b02434bd333d8fde50486` (~167 tok)

## .git_readonly_backup/objects/3b/

- `f8dc8078ad5d6df82521f044e0e2d017578793` (~162 tok)

## .git_readonly_backup/objects/3c/

- `2024de374cd96824e7bd76e65175a040c5e7d4` (~364 tok)

## .git_readonly_backup/objects/3e/

- `ddf5758a6529890335bbf17034de660d8be50c` (~79 tok)

## .git_readonly_backup/objects/40/

- `f72cc45a46993d3d02da765842abb2703a64c1` (~94 tok)

## .git_readonly_backup/objects/43/

- `8f667dac9f0a265210cc24a3261a586135ada5` (~218 tok)

## .git_readonly_backup/objects/46/

- `42d5e76c9e18b8bcf25d9b5fda5f21d2dfac9f` (~13 tok)

## .git_readonly_backup/objects/47/

- `02aae45759f49197bc7776b0a63e99a9ddf1d2` (~124 tok)

## .git_readonly_backup/objects/48/

- `f81ceb36713d4b5f738389fe3615f74e8ebaa0` (~18717 tok)

## .git_readonly_backup/objects/49/

- `d0cd05eb6f3859adc7d4e6eab70b5e27b88ade` (~21871 tok)

## .git_readonly_backup/objects/4b/

- `445a790c522134e1234de195d9be50f28c8b6a` (~190 tok)

## .git_readonly_backup/objects/50/

- `2fd323934501eab408a396a9ae4a07c0ae3560` (~79 tok)

## .git_readonly_backup/objects/51/

- `f581dd91641b4c1f1219f646788e73cf6bf00c` (~92 tok)

## .git_readonly_backup/objects/52/

- `e6d2f0ae9e6bc3ac85dbfeee6cd0b3d6e5d1c7` (~32 tok)

## .git_readonly_backup/objects/56/

- `3c978a7c98e732efc57609fdeb3b0d3de1fa31` (~1024 tok)
- `a894286246bc794d6a1c1b6346f0018ba3625c` (~23 tok)

## .git_readonly_backup/objects/57/

- `abb18b917b911527895b7c085fae3f47e8cf8a` (~14 tok)

## .git_readonly_backup/objects/5e/

- `a00628fcbf35ecf04bdb30af814a78c9066f51` (~124 tok)

## .git_readonly_backup/objects/60/

- `18e701fc7dd0317cda9eceea390524322e8a05` (~24 tok)
- `94b755de0ff56ee2946fb37fbc939d1843e8bc` (~194 tok)

## .git_readonly_backup/objects/62/

- `622f13e2ed2551381ff5f42a2f13b690459915` (~91 tok)
- `e101166a31ade477811bd31f6be1ae44d45423` (~59 tok)

## .git_readonly_backup/objects/63/

- `f60bd1b0dd6018a42eee3e8576f2c6e26173f5` (~28 tok)

## .git_readonly_backup/objects/65/

- `d8772a4191668d881a873e560f6ab80eea2461` (~14 tok)

## .git_readonly_backup/objects/66/

- `05308dbd12e60e2f864cc8e5cdc87ab78f2e08` (~32 tok)

## .git_readonly_backup/objects/68/

- `176a72f30ae0650f5093c8b6a7b01016acf07a` (~36 tok)

## .git_readonly_backup/objects/6b/

- `68d80b7d92d0c4a5d774897f2bedfa95b42669` (~55 tok)

## .git_readonly_backup/objects/75/

- `60283473f656e44230d2fff7d657f9cc532716` (~3897 tok)

## .git_readonly_backup/objects/78/

- `70d234c5aa7e3cf65bbf6504b97ef9a43893a9` (~14 tok)

## .git_readonly_backup/objects/7b/

- `c223466c71ffb2ee284f0149a4b4cadfa5ae35` (~104 tok)

## .git_readonly_backup/objects/7c/

- `7a305bfa8f3c7250efd8b73eb9f4e048d48288` (~34 tok)

## .git_readonly_backup/objects/7d/

- `471c19373e904c9c08be4768c94a5746801e9b` (~37 tok)

## .git_readonly_backup/objects/84/

- `6af484620cd4f78fb17d7ff4d6b283c2938657` (~53 tok)

## .git_readonly_backup/objects/86/

- `602589e72aec2b1093715aa0c157e9f2759db9` (~167 tok)

## .git_readonly_backup/objects/87/

- `ec2dbab2babacbf9896f9319e8a34b6a8b3733` (~63 tok)

## .git_readonly_backup/objects/8b/

- `9ed5d805d7f11b3f8840ab5a5268ea40feeb8e` (~226 tok)
- `ceebb5f11bd0b8ada87b8191669726dd57c499` (~55 tok)

## .git_readonly_backup/objects/8c/

- `afe3cd4e27585a64d447c28875cd6f2285dc6d` (~58 tok)

## .git_readonly_backup/objects/92/

- `bb2c45e5bff0402a1f8d3735d2f1d7cac2b250` (~97 tok)

## .git_readonly_backup/objects/94/

- `48ee4dde20517bcaa625d93fb26bb18a2ddc5e` (~16833 tok)

## .git_readonly_backup/objects/95/

- `14a702187ae91b5ccf3b1171c7792a5a5eb074` (~2707 tok)
- `d116121aeabb0906dbc80044825b1a9ad83347` (~1947 tok)

## .git_readonly_backup/objects/96/

- `5b861cb6eea25378800724fa944379f4d5ad5e` (~1901 tok)
- `c99e3356b1a2ac6fb1f60e11375a8bf4acbea5` (~33 tok)

## .git_readonly_backup/objects/97/

- `6fe771f293f3bbf4b806b6cb38074bb828b226` (~203 tok)
- `7a0fe725eb773acc3da1a47f0138f22d8fa299` (~119 tok)

## .git_readonly_backup/objects/9a/

- `7fb68d180af4eec23a2520523311b6595a1ab3` (~13 tok)

## .git_readonly_backup/objects/9b/

- `5c9fec5a85e50b0163e666f3d86a4c556653fb` (~124 tok)

## .git_readonly_backup/objects/9d/

- `f8ed7280e07b45c6b5938e8e76c15717b4370b` (~33 tok)

## .git_readonly_backup/objects/a1/

- `11a86d6ce0ab77bf2ebfe5b19c050e4df9fd6e` (~190 tok)

## .git_readonly_backup/objects/a2/

- `b093fb64920d93a3e757296a1c4f0d21e74de4` (~199 tok)

## .git_readonly_backup/objects/a3/

- `6e364da245549cbea63a75af050e3911df6715` (~401 tok)

## .git_readonly_backup/objects/a4/

- `fb7d97053279feeddecceb87300037b42cf2d3` (~1364 tok)

## .git_readonly_backup/objects/a5/

- `61a95f420d2ee6ffb98e12b690f354a7c9c50d` (~92 tok)
- `edb28a2e7ca864d1e96d218bf9807942fa4f0c` (~42 tok)
- `ef193506d07d0459fec4f187af08283094d7c8` (~36 tok)

## .git_readonly_backup/objects/ae/

- `3e0d26ac400277646cbe442e345dbabe85f9a2` (~30 tok)
- `b9ce08ebe220871472a7bf26c6ca21391d5cd2` (~330 tok)

## .git_readonly_backup/objects/b0/

- `aef21be259883fe159d3176ab46c6841c28a07` (~19 tok)

## .git_readonly_backup/objects/b5/

- `346a7fd509707505e8d96f2c68c55a0b51d5cd` (~191 tok)

## .git_readonly_backup/objects/b7/

- `f198b5928a228fb55ef595e26d9d74ac0241f2` (~99 tok)

## .git_readonly_backup/objects/b9/

- `d355df2a5956b526c004531b7b0ffe412461e0` (~83 tok)

## .git_readonly_backup/objects/bc/

- `731446be46aede539320c41e45ae26e1ef9991` (~15 tok)

## .git_readonly_backup/objects/bd/

- `e3a306ad94b5e9205423a92095c8b1b7e4e49c` (~30 tok)

## .git_readonly_backup/objects/be/

- `487a1081897a875e2149c5354a331036da8583` (~23 tok)
- `b4f900b3f6ae58e23536fab802a6a3bca5a553` (~447 tok)

## .git_readonly_backup/objects/ca/

- `1316d678d31c11c213ce717c5e064a17e85ecd` (~371 tok)

## .git_readonly_backup/objects/cd/

- `edd4f43da30732ce09e289a3c373a34c932078` (~206 tok)

## .git_readonly_backup/objects/ce/

- `26b604897ee3f2f592397756305b373ef794d2` (~14 tok)
- `8e679c97b61a6ecd14a1c39a31c959eaa944a8` (~24 tok)

## .git_readonly_backup/objects/cf/

- `a59a64c065e2dfa1bc17e8e54d892f856a9ec2` (~23 tok)

## .git_readonly_backup/objects/d2/

- `a4ac38e9b5e66603ae1b565df987cddea9df57` (~1491 tok)

## .git_readonly_backup/objects/d8/

- `efe668a3f2d01eb34eb59794b034b44ff5ec5b` (~30 tok)

## .git_readonly_backup/objects/da/

- `5185dbf6971c84bcc110f4f69ef40f28080dac` (~18 tok)

## .git_readonly_backup/objects/dd/

- `9abea5bdf095352485fb215c085300dd32384e` (~163 tok)

## .git_readonly_backup/objects/df/

- `04b012f200c2c0fe514e1fd7d82a3aacf1d006` (~134 tok)
- `42acc17c8a895139df58db478356e26538b541` (~125 tok)

## .git_readonly_backup/objects/e1/

- `ac8a0444f84fbe00eec9b8f6100ae31f879619` (~1088 tok)

## .git_readonly_backup/objects/e5/

- `3eb4c244c701699a5458810b42ee0f39463860` (~25 tok)

## .git_readonly_backup/objects/e6/

- `b0eb011a1bc3b2948fa2353c916dfc47eff8d5` (~23 tok)

## .git_readonly_backup/objects/e7/

- `63910b27fdd9ac872f56baede51bc839402347` (~248 tok)
- `6e6aadd4517d157560e6f981acc2ab331adde2` (~80 tok)
- `7fcb49b19074dd6d576eb939216bc57da72c50` (~6778 tok)

## .git_readonly_backup/objects/ec/

- `19e9596784070e71ed6a3ccb66ce1aae0af37a` (~51 tok)

## .git_readonly_backup/objects/ed/

- `9ae0513feaa5fecd2351a39ff86fdca1ec8740` (~155 tok)

## .git_readonly_backup/objects/ef/

- `f37e777f048e78347e6ab22c1b053435730194` (~9585 tok)

## .git_readonly_backup/objects/f3/

- `61f8e9dc9c81f1818b3fe9df5af36512065cf0` (~203 tok)

## .git_readonly_backup/objects/f5/

- `efb63f08e4677b1d8fa7da4daea549cd306c3f` (~5146 tok)

## .git_readonly_backup/objects/f8/

- `4d634cf122e55d97205ddc301aac31ed9abd0f` (~2561 tok)

## .git_readonly_backup/objects/f9/

- `470bb2fdc983fabdf2e3080f11c03b896d4ff8` (~407 tok)

## .git_readonly_backup/objects/fa/

- `2d09628e4a5833207600d9387ff1ff141b2583` (~56 tok)

## .git_readonly_backup/objects/fe/

- `7fe19e01ba5dcd1b8fbc9d2c88fb0a5a015276` (~243 tok)
- `fe05a9929f0799cd7ad74081e2d58a1ae464c5` (~65 tok)

## .git_readonly_backup/objects/pack/

- `pack-6062ec865d0ae0e5abfa0f884124bee2f17d256e.idx` (~1848 tok)
- `pack-6062ec865d0ae0e5abfa0f884124bee2f17d256e.rev` (~247 tok)

## .git_readonly_backup/refs/heads/

- `main` (~11 tok)
