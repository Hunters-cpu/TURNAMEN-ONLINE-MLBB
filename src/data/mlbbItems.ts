export interface MlbbItem {
  id: string;
  name: string;
  category: 'PHYSICAL' | 'MAGIC' | 'DEFENSE' | 'BOOTS' | 'JUNGLE' | 'ROAMING';
  categoryEmoji: string;
  s41Note?: string;
  description: string;
  counters: {
    counterItemId: string;
    counterItemName: string;
    reason: string;
  }[];
}

export const MLBB_ITEMS: MlbbItem[] = [
  // ================= ⚔️ ITEM SERANGAN FISIK =================
  {
    id: 'blade-of-despair',
    name: 'Blade of Despair',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan Physical Attack terbesar (+160). Pasif meningkatkan Physical Attack saat menyerang lawan dengan HP di bawah 50%.',
    counters: [
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Mengurangi Physical Attack musuh sebesar 6% setiap kali terkena skill (hingga 3 stack).' },
      { counterItemId: 'wind-of-nature', counterItemName: 'Wind of Nature', reason: 'Memberikan imunitas total dari semua Damage Fisik selama 2 detik.' },
      { counterItemId: 'blade-armor', counterItemName: 'Blade Armor', reason: 'Memantulkan sebagian Damage Fisik kembali ke penyerang dan mengurangi Critical Damage.' }
    ]
  },
  {
    id: 'berserkers-fury',
    name: "Berserker's Fury",
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    s41Note: 'Penyesuaian Season 41: Critical Damage kini dikonversi menjadi True Damage!',
    description: 'Item core Critical. Di Season 41, bonus Crit Damage dikonversi menjadi True Damage yang menembus armor.',
    counters: [
      { counterItemId: 'twilight-armor', counterItemName: 'Twilight Armor', reason: 'Membatasi burst damage instan yang diterima dan memberikan shield penahan True Damage.' },
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Mengurangi base Physical Attack pemegang Berserker\'s Fury.' },
      { counterItemId: 'immortality', counterItemName: 'Immortality', reason: 'Memberikan kesempatan kedua hidup kembali setelah terkena burst critical.' }
    ]
  },
  {
    id: 'endless-battle',
    name: 'Endless Battle',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item lifesteal & True Damage setelah menggunakan skill. Memberikan tambahan Movement Speed dan Mana Regen.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Aura S41 mengurangi efek Lifesteal & Shield pemegang Endless Battle hingga 50%.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Pasif Life Drain mengurangi lifesteal & regen HP target saat terkena physical damage.' }
    ]
  },
  {
    id: 'demon-hunter-sword',
    name: 'Demon Hunter Sword (DHS)',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Penghancur Tank! Basic Attack memberikan ekstra damage berdasarkan % HP saat ini milik musuh.',
    counters: [
      { counterItemId: 'blade-armor', counterItemName: 'Blade Armor', reason: 'Memantulkan physical damage basic attack berkecepatan tinggi.' },
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Menurunkan physical attack penyerang sehingga % HP damage DHS berkurang.' }
    ]
  },
  {
    id: 'malefic-roar',
    name: 'Malefic Roar',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan Penetrasi Fisik persentase tinggi yang bertambah semakin tebal Physical Defense lawan.',
    counters: [
      { counterItemId: 'guardian-helmet', counterItemName: 'Guardian Helmet', reason: 'Menambah regresi HP murni yang sangat besar ketimbang hanya mengandalkan armor.' },
      { counterItemId: 'wind-of-nature', counterItemName: 'Wind of Nature', reason: 'Memberikan 2 detik kekebalan fisik tanpa terpengaruh penetrasi armor.' }
    ]
  },
  {
    id: 'hunter-strike',
    name: 'Hunter Strike',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan Physical Penetration & CD Reduction. Pasif memberikan lonjakan Movement Speed setelah menyerang 5 kali.',
    counters: [
      { counterItemId: 'ice-queen-wand', counterItemName: 'Ice Queen Wand', reason: 'Slow bertubi-tubi membatalkan bonus movement speed dari Hunter Strike.' },
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Menahan damage physical skill pemicu Hunter Strike.' }
    ]
  },
  {
    id: 'haass-claws',
    name: "Haas's Claws",
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item Physical Lifesteal & Critical Chance tinggi. Memberikan bonus lifesteal ekstra saat HP di bawah 50%.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi lifesteal Haas\'s Claws hingga 50%.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Memotong regenerasi darah instan saat bertarung 1v1.' }
    ]
  },
  {
    id: 'scarlet-phantom',
    name: 'Scarlet Phantom',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Meningkatkan Attack Speed & Critical Chance. Critical strike meningkatkan Attack Speed dan Critical Rate pengguna.',
    counters: [
      { counterItemId: 'blade-armor', counterItemName: 'Blade Armor', reason: 'Memantulkan damage crit instan kembali ke Marksman.' },
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Aura S41 mengurangi Attack Speed musuh di sekitar sebesar 70% dari nilai normal.' }
    ]
  },
  {
    id: 'windtalker',
    name: 'Windtalker',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Meningkatkan Attack Speed, Movement Speed, & Crit Chance. Basic Attack menghasilkan Magic Damage Typhoon.',
    counters: [
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Menahan Magic Damage beruntun dari pasif Typhoon Windtalker.' },
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memperlambat Attack Speed pemicu pasif Typhoon.' }
    ]
  },
  {
    id: 'corrosion-scythe',
    name: 'Corrosion Scythe',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Basic Attack menyebabkan efek Slow pada musuh dan meningkatkan Attack Speed pengguna secara bertumpuk (stack).',
    counters: [
      { counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Mengurangi durasi efek Slow pemicu Corrosion Scythe sebesar 30%.' },
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Menetralkan tumpukan bonus Attack Speed lawan.' }
    ]
  },
  {
    id: 'blade-of-the-heptaseas',
    name: 'Blade of the Heptaseas',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item favorit Assassin/Pick-off. Jika tidak menerima/memberikan damage selama 5 detik, Basic Attack berikutnya memberikan ekstra Physical Damage besar.',
    counters: [
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Meredam Physical Burst Damage dari serangan pertama Heptaseas.' },
      { counterItemId: 'immortality', counterItemName: 'Immortality', reason: 'Menyelamatkan hero dari kematian mendadak akibat combo ambush.' }
    ]
  },
  {
    id: 'sea-halberd',
    name: 'Sea Halberd',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item Anti-Regen Physical. Mengurangi Shield & HP Regen lawan sebesar 50% serta memberikan ekstra damage pada musuh dengan HP lebih tinggi.',
    counters: [
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Memperkuat ketahanan tanpa bergantung pada lifesteal.' },
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Menembus armor pembawa Sea Halberd.' }
    ]
  },
  {
    id: 'golden-staff',
    name: 'Golden Staff',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Mengonversi Critical Chance menjadi Attack Speed dan memicu efek pemicu Basic Attack (DHS/Corrosion) 3 kali berturut-turut.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Sangat efektif memangkas Attack Speed tinggi Golden Staff.' },
      { counterItemId: 'blade-armor', counterItemName: 'Blade Armor', reason: 'Memantulkan deretan serangan cepat kembali ke penyerang.' }
    ]
  },
  {
    id: 'rose-gold-meteor',
    name: 'Rose Gold Meteor',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan Physical Attack, Magic Defense, & Lifesteal. Menciptakan Magic Shield instan saat HP turun di bawah 30%.',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Magic Penetration menembus Magic Defense & Shield Rose Gold.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Memotong kekuatan Shield dan Lifesteal Rose Gold.' }
    ]
  },
  {
    id: 'wind-of-nature',
    name: 'Wind of Nature (WON)',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item aktif terpenting Marksman. Mengaktifkan imunitas total terhadap seluruh Physical Damage selama 2 detik.',
    counters: [
      { counterItemId: 'holy-crystal', counterItemName: 'Holy Crystal / Item Magic', reason: 'WON sama sekali tidak menahan Magic Damage dari Mage!' },
      { counterItemId: 'winter-crown', counterItemName: 'Winter Crown / Winter Truncheon', reason: 'Membekukan diri selama 2 detik untuk menunggu durasi aktif WON musuh habis.' }
    ]
  },
  {
    id: 'bloodlust-axe',
    name: 'Bloodlust Axe',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan +20% Spell Vamp. Mengubah damage dari skill menjadi pemulihan HP.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi pemulihan Spell Vamp Bloodlust Axe sebesar 50%.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Memotong regen HP dari penggunaan skill secara drastis.' }
    ]
  },
  {
    id: 'great-dragon-spear',
    name: 'Great Dragon Spear',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Memberikan CD Reduction & Crit Chance. Setelah menggunakan Ultimate, memberikan lonjakan Movement Speed 30% selama 7 detik.',
    counters: [
      { counterItemId: 'ice-queen-wand', counterItemName: 'Ice Queen Wand', reason: 'Memberikan efek slow yang membatalkan larian kencang pasif speare.' },
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Menahan Physical Damage tinggi dari combo Ultimate.' }
    ]
  },
  {
    id: 'starlium-scythe',
    name: 'Starlium Scythe',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    s41Note: 'Penyesuaian Season 41: Cooldown pasif True Damage dikurangi drastis!',
    description: 'Memberikan Hybrid Lifesteal, Mana Regen, & True Damage setelah memakai skill. S41 CD dikurangi drastis pemicu True Damage.',
    counters: [
      { counterItemId: 'twilight-armor', counterItemName: 'Twilight Armor', reason: 'Meredam burst True Damage singkat.' },
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi efek Hybrid Lifesteal pasif Starlium Scythe.' }
    ]
  },
  {
    id: 'sky-piercer',
    name: 'Sky Piercer',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    s41Note: 'Item Adaptif Sangat Populer Season 41!',
    description: 'Item eksekusi instan S41! Mengeliminasi musuh secara otomatis jika HP musuh turun di bawah 6% (stack hingga 12%).',
    counters: [
      { counterItemId: 'immortality', counterItemName: 'Immortality', reason: 'Bangkit kembali setelah dieksekusi pasif Sky Piercer.' },
      { counterItemId: 'rose-gold-meteor', counterItemName: 'Rose Gold Meteor', reason: 'Memicu shield sebelum HP menyentuh ambang batas eksekusi.' },
      { counterItemId: 'winter-crown', counterItemName: 'Winter Crown', reason: 'Membeku saat HP sekarat untuk menghindari eksekusi.' }
    ]
  },
  {
    id: 'war-axe',
    name: 'War Axe',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    s41Note: 'Item Wajib Fighter Season 41!',
    description: 'Memberikan Physical Attack, HP, CD Reduction, & Spell Vamp. Serangan beruntun menumpuk Fighting Spirit hingga 12 stack pemicu True Damage!',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi Spell Vamp dan Attack Speed pemicu stack Fighting Spirit.' },
      { counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Meredam akumulasi Physical Attack dari stack War Axe.' }
    ]
  },
  {
    id: 'magic-blade',
    name: 'Magic Blade',
    category: 'PHYSICAL',
    categoryEmoji: '⚔️',
    description: 'Item komponen awal Rose Gold Meteor. Memberikan Physical Attack, Magic Defense, & Shield kecil saat sekarat.',
    counters: [
      { counterItemId: 'genius-wand', counterItemName: 'Genius Wand', reason: 'Mengurangi Magic Defense awal dari Magic Blade.' }
    ]
  },

  // ================= 🔮 ITEM MAGIC =================
  {
    id: 'holy-crystal',
    name: 'Holy Crystal',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan +100 Magic Power dan pasif peningkatan persentase Magic Power bertumpuk seiring level.',
    counters: [
      { counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Mengurangi Magic Damage burst raksasa hingga 25% selama 3 detik.' },
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Menyerap akumulasi Magic Power beruntun.' }
    ]
  },
  {
    id: 'divine-glaive',
    name: 'Divine Glaive',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Penembus Magic Defense terkuat (+40% Magic Penetration). Semakin tebal Magic Defense lawan, semakin tinggi penetrasinya.',
    counters: [
      { counterItemId: 'guardian-helmet', counterItemName: 'Guardian Helmet', reason: 'Menambah regresi HP tanpa mengandalkan Magic Defense yang bisa ditembus Divine Glaive.' },
      { counterItemId: 'winter-crown', counterItemName: 'Winter Crown', reason: 'Membeku selama 2 detik menghindari burst skill magic.' }
    ]
  },
  {
    id: 'lightning-truncheon',
    name: 'Lightning Truncheon',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan Magic Burst ke hingga 3 musuh terdekat berdasarkan jumlah Max Mana pengguna.',
    counters: [
      { counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Secara instan memicu pengurangan 25% damage dari pantulan petir.' },
      { counterItemId: 'oracle', counterItemName: 'Oracle', reason: 'Memberikan Magic Defense dan meningkatkan Shield penahan petir.' }
    ]
  },
  {
    id: 'clock-of-destiny',
    name: 'Clock of Destiny (COD)',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item scaling Magic, Mana, & HP bertahap setiap 20 detik (stack hingga 12 kali) memberikan stats tebal di late game.',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Menembus Magic Defense akumulasi COD.' },
      { counterItemId: 'demon-hunter-sword', counterItemName: 'Demon Hunter Sword', reason: 'Menghancurkan akumulasi HP ekstra tebal dari COD.' }
    ]
  },
  {
    id: 'concentrated-energy',
    name: 'Concentrated Energy',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item Magic Vamp & HP Regen. Mengeliminasi hero memulihkan 10% Max HP secara instan.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong efek Magic Vamp & HP regen Concentrated Energy hingga 50%.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Mengurangi efek lifesteal magic saat bertarung.' }
    ]
  },
  {
    id: 'enchanted-talisman',
    name: 'Enchanted Talisman (Buku Mana)',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan +20% Cooldown Reduction & memulihkan 15% Max Mana setiap 10 detik tanpa henti.',
    counters: [
      { counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Meredam spam skill terus menerus dari pemegang Buku Mana.' },
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Menumpuk Magic Defense terhadap skill DPS yang di-spam.' }
    ]
  },
  {
    id: 'fleeting-time',
    name: 'Fleeting Time',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Mengurangi Cooldown Ultimate sebesar 30% secara instan setiap kali mendapatkan Kill atau Assist.',
    counters: [
      { counterItemId: 'immortality', counterItemName: 'Immortality', reason: 'Mencegah terjadinya kill cepat yang memicu pasif reset ulti Fleeting Time.' }
    ]
  },
  {
    id: 'calamity-reaper',
    name: 'Calamity Reaper',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan True Damage berbasis Magic Power setelah mengunakan skill pada Basic Attack berikutnya.',
    counters: [
      { counterItemId: 'twilight-armor', counterItemName: 'Twilight Armor', reason: 'Menahan lonjakan True Damage instan.' }
    ]
  },
  {
    id: 'ice-queen-wand',
    name: 'Ice Queen Wand',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Skill damage memberikan efek Slow 15% pada musuh (stack hingga 2 kali, total 30% slow) selama 3 detik.',
    counters: [
      { counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Mengurangi durasi efek slow Ice Queen Wand sebesar 30%.' },
      { counterItemId: 'sprint-purify', counterItemName: 'Sprint / Purify / Rapid Boots', reason: 'Menghapus dan kebal efek slow.' }
    ]
  },
  {
    id: 'glowing-wand',
    name: 'Glowing Wand',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan efek terbakar (Burn) pada musuh selama 3 detik berdasarkan % Max HP target.',
    counters: [
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Counter sempurna! Setiap tik damage terbakar menambah Magic Defense Radiant Armor hingga 6 stack.' },
      { counterItemId: 'oracle', counterItemName: 'Oracle', reason: 'Meningkatkan regen HP penawar efek burn.' }
    ]
  },
  {
    id: 'necklace-of-durance',
    name: 'Necklace of Durance (NOD)',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item Anti-Regen Magic. Skill damage mengurangi Shield & HP Regen musuh sebesar 50%.',
    counters: [
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Mempertahankan daya tahan tanpa bergantung penuh pada healing.' }
    ]
  },
  {
    id: 'feather-of-heaven',
    name: 'Feather of Heaven',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Mengubah Basic Attack Mage menjadi serangan berkecepatan tinggi dengan ekstra Magic Damage.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong Attack Speed pemakai Feather of Heaven.' },
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Menahan serangan Magic Basic Attack cepat beruntun.' }
    ]
  },
  {
    id: 'winter-truncheon',
    name: 'Winter Truncheon / Winter Crown',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item aktif beku! Membukukan diri selama 2 detik: kebal seluruh damage dan efek CC namun tidak bisa bergerak.',
    counters: [
      { counterItemId: 'fleeting-time', counterItemName: 'Fleeting Time / Skill Cooldown Tracking', reason: 'Menunggu 2 detik masa beku berakhir lalu melancarkan combo susulan.' }
    ]
  },
  {
    id: 'twilight-orb',
    name: 'Twilight Orb',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan HP, Mana, & pengurangan damage fisik instan saat menerima hit besar.',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Menembus ketahanan magic yang disediakan Twilight Orb.' }
    ]
  },
  {
    id: 'blood-wings',
    name: 'Blood Wings',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item Magic termahal (+175 Magic Power). Memberikan Shield raksasa berdasarkan persentase Magic Power.',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Magic Penetration menembus Shield tebal Blood Wings.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Mengurangi kekuatan Shield sebesar 50%.' }
    ]
  },
  {
    id: 'genius-wand',
    name: 'Genius Wand',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Memberikan Magic Penetration murni dan mengurangi Magic Defense musuh setiap kali memberikan damage.',
    counters: [
      { counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Meredam pengurangan Magic Defense awal dengan shield penahan burst.' }
    ]
  },
  {
    id: 'wishing-lantern',
    name: 'Wishing Lantern',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    s41Note: 'Item Magic Anti-HP Tank Season 41!',
    description: 'Item baru S41! Setiap kali memberikan 800 Magic Damage, melontarkan proyektil kupu-kupu yang memberikan ekstra Magic Damage setara % Max HP musuh.',
    counters: [
      { counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Mengurangi Magic Damage proyektil komet Wishing Lantern sebesar 25%.' },
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Menyerap proc burst beruntun Wishing Lantern.' }
    ]
  },
  {
    id: 'flask-of-the-oasis',
    name: 'Flask of the Oasis',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    s41Note: 'Item Wajib Support Healing Season 41!',
    description: 'Memberikan Magic Power, CD Reduction, & Cooldown Regen. Saat memberikan Healing/Shield pada teman ber-HP di bawah 30%, memberikan Shield darurat masif.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong daya pemulihan dan shield pemicu Flask of Oasis sebesar 50%.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Penghancur shield dan pemotong lifesteal/heal.' }
    ]
  },
  {
    id: 'tome-of-evil',
    name: 'Tome of Evil',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item komponen pertengahan Magic Power & Mana Regen.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Memberikan Magic Defense awal.' }]
  },
  {
    id: 'book-of-sages',
    name: 'Book of Sages',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item komponen awal Cooldown Reduction.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Menahan damage magic awal.' }]
  },
  {
    id: 'magic-wand',
    name: 'Magic Wand',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item komponen dasar +45 Magic Power.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Menahan magic damage dasar.' }]
  },
  {
    id: 'mystery-codex',
    name: 'Mystery Codex',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item dasar +15 Magic Power.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Magic Defense tier 1.' }]
  },
  {
    id: 'power-crystal',
    name: 'Power Crystal',
    category: 'MAGIC',
    categoryEmoji: '🔮',
    description: 'Item dasar +280 Mana.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Menahan lane pressure early.' }]
  },

  // ================= 🛡️ ITEM PERTAHANAN =================
  {
    id: 'immortality',
    name: 'Immortality',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Item nyawa kedua! Bangkit kembali 2.5 detik setelah tereliminasi dengan 16% HP dan Shield penahan damage.',
    counters: [
      { counterItemId: 'sky-piercer', counterItemName: 'Sky Piercer', reason: 'Dapat dieksekusi kembali jika HP hasil bangkit di bawah ambang batas eksekusi.' },
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Menunggu di atas jasad bangkit dengan aura pemotong HP regen.' }
    ]
  },
  {
    id: 'athenas-shield',
    name: "Athena's Shield",
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Penangkal Magic Burst! Saat menerima Magic Damage, mengurangi seluruh Magic Damage sebesar 25% selama 3 detik.',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Magic Penetration 40% menembus Magic Defense dari Athena\'s Shield.' },
      { counterItemId: 'glowing-wand', counterItemName: 'Glowing Wand', reason: 'Memicu Athena pasif lebih awal dengan poke kecil lalu melakukan burst setelah 3 detik Athena habis.' }
    ]
  },
  {
    id: 'antique-cuirass',
    name: 'Antique Cuirass',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Penangkal Skill Fisik! Saat terkena skill fisik musuh, mengurangi Physical Attack musuh sebesar 6% selama 2 detik (stack hingga 3x).',
    counters: [
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Penetrasi fisik menembus armor tebal Antique Cuirass.' },
      { counterItemId: 'demon-hunter-sword', counterItemName: 'Demon Hunter Sword', reason: 'Menyerang berbasis % HP bukan berbasis skill fisik.' }
    ]
  },
  {
    id: 'guardian-helmet',
    name: 'Guardian Helmet',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Item penambah HP terbanyak (+1550 HP). Memulihkan 2.5% HP per detik di luar pertempuran.',
    counters: [
      { counterItemId: 'demon-hunter-sword', counterItemName: 'Demon Hunter Sword', reason: 'Menghasilkan % HP damage semakin tebal HP Guardian Helmet.' },
      { counterItemId: 'glowing-wand', counterItemName: 'Glowing Wand', reason: 'Burn damage membakar % Max HP Guardian Helmet.' }
    ]
  },
  {
    id: 'blade-armor',
    name: 'Blade Armor',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Memberikan Physical Defense tertinggi (+90). Memantulkan 20% Physical Damage Basic Attack kembali ke musuh dan mengurangi Crit Damage 20%.',
    counters: [
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Menembus 90 Physical Defense Blade Armor.' },
      { counterItemId: 'lifesteal-item', counterItemName: 'Endless Battle / Haas Claws', reason: 'Lifesteal menetralkan damage pantulan Blade Armor.' }
    ]
  },
  {
    id: 'dominance-ice',
    name: 'Dominance Ice',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    s41Note: 'Penyesuaian Season 41: Jangkauan Aura Anti-Regen diperluas signifikan!',
    description: 'Item wajib Roamer/Tank! Aura S41 diperluas mengurangi HP Regen & Shield musuh sebesar 50% dan Attack Speed musuh 70%.',
    counters: [
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Physical Penetration menembus Physical Defense Dominance Ice.' },
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Dominance Ice tidak memiliki Magic Defense, mudah dihancurkan Mage.' }
    ]
  },
  {
    id: 'oracle',
    name: 'Oracle',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Meningkatkan efek Shield & HP Regen yang diterima pengguna sebesar 30% serta memberikan Magic Defense.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong bonus regen 30% dari Oracle.' },
      { counterItemId: 'sea-halberd', counterItemName: 'Sea Halberd', reason: 'Anti-regen membatalkan boost pasif Oracle.' }
    ]
  },
  {
    id: 'cursed-helmet',
    name: 'Cursed Helmet',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Memberikan HP & Magic Defense. Membakar musuh dan minion di sekitar dengan Magic Damage per detik.',
    counters: [
      { counterItemId: 'radiant-armor', counterItemName: 'Radiant Armor', reason: 'Bakaran Cursed Helmet justru menumpuk stack Magic Defense Radiant Armor hingga maksimal!' }
    ]
  },
  {
    id: 'thunder-belt',
    name: 'Thunder Belt',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Setelah memakai skill, Basic Attack berikutnya memberikan True Damage & efek Slow pada musuh serta menumpuk Defense permanen.',
    counters: [
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Menembus pertahanan armor yang ditumpuk Thunder Belt.' }
    ]
  },
  {
    id: 'queens-wings',
    name: "Queen's Wings",
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Item penyelamat HP kritis! Saat HP di bawah 40%, mengurangi damage yang diterima sebesar 20% & meningkatkan Spell Vamp.',
    counters: [
      { counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong Spell Vamp penyelamat Queen\'s Wings.' },
      { counterItemId: 'sky-piercer', counterItemName: 'Sky Piercer', reason: 'Mengeksekusi langsung sebelum pengurangan damage sempat bekerja.' }
    ]
  },
  {
    id: 'twilight-armor',
    name: 'Twilight Armor',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Mengurangi damage instan besar yang melebihi 600 damage sebesar 20% + persentase Max HP.',
    counters: [
      { counterItemId: 'demon-hunter-sword', counterItemName: 'Demon Hunter Sword', reason: 'Memberikan damage terus menerus secara konsisten.' }
    ]
  },
  {
    id: 'radiant-armor',
    name: 'Radiant Armor',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Penangkal Magic Continuous/DPS! Setiap kali menerima Magic Damage, meningkatkan Magic Defense selama 3 detik (stack hingga 6x).',
    counters: [
      { counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: '40% Magic Penetration menembus akumulasi stack Radiant Armor.' },
      { counterItemId: 'holy-crystal', counterItemName: 'Holy Crystal (Burst)', reason: 'Serangan burst instan satu kali hit tidak memberi waktu Radiant menumpuk stack.' }
    ]
  },
  {
    id: 'brute-force-breastplate',
    name: 'Brute Force Breastplate',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Menggunakan skill/basic attack menambah Movement Speed & Defense bertumpuk hingga 5 stack.',
    counters: [
      { counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Menembus bonus defense Brute Force.' }
    ]
  },
  {
    id: 'chastise-pauldrone',
    name: 'Chastise Pauldrone',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Item pertahanan fisik pelapis shoulder pad mengurangi burst physical skill.',
    counters: [{ counterItemId: 'malefic-roar', counterItemName: 'Malefic Roar', reason: 'Menembus armor.' }]
  },
  {
    id: 'winter-crown-def',
    name: 'Winter Crown (Defense)',
    category: 'DEFENSE',
    categoryEmoji: '🛡️',
    description: 'Versi pertahanan aktif membeku 2 detik untuk menghindari pertempuran krusial.',
    counters: [{ counterItemId: 'fleeting-time', counterItemName: 'Fleeting Time', reason: 'Menunggu masa beku habis.' }]
  },

  // ================= 👟 ITEM SEPATU / PERGERAKAN =================
  {
    id: 'warrior-boots',
    name: 'Warrior Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Memberikan +40 Movement Speed & +22 Physical Defense. Menerima Basic Attack menambah Physical Defense (stack hingga 25).',
    counters: [{ counterItemId: 'arcane-boots', counterItemName: 'Arcane Boots / Penetration Item', reason: 'Penetrasi menembus Physical Defense awal.' }]
  },
  {
    id: 'tough-boots',
    name: 'Tough Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu Anti-CC! Memberikan +22 Magic Defense dan mengurangi durasi efek Crowd Control & Slow sebesar 30%.',
    counters: [{ counterItemId: 'genius-wand', counterItemName: 'Genius Wand', reason: 'Mengurangi Magic Defense yang diberikan Tough Boots.' }]
  },
  {
    id: 'swift-boots',
    name: 'Swift Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu favorit Marksman (+15% Attack Speed & +40 Movement Speed).',
    counters: [{ counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi Attack Speed pemakai Swift Boots.' }]
  },
  {
    id: 'arcane-boots',
    name: 'Arcane Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu favorit Mage (+10 Magic Penetration & +40 Movement Speed).',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Magic Defense Tough Boots menetralkan penetrasi Arcane Boots.' }]
  },
  {
    id: 'magic-boots',
    name: 'Magic Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu favorit Support/Mage (+10% Cooldown Reduction & +40 Movement Speed).',
    counters: [{ counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Meredam spam skill pemicu Cooldown Reduction.' }]
  },
  {
    id: 'demon-boots',
    name: 'Demon Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu pemulih Mana! Mengeliminasi minion memulihkan 4% Mana, mengeliminasi hero memulihkan 10% Mana.',
    counters: [{ counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi efisiensi lane sustainability.' }]
  },
  {
    id: 'rapid-boots',
    name: 'Rapid Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    s41Note: 'Penyesuaian Season 41: Bonus kecepatan luar tempur dihapus, diganti Movement Speed stabil (+65)!',
    description: 'Sepatu rotasi tercepat! Di Season 41, bonus speed luar tempur dihapus dan diganti dengan base Movement Speed +65 stabil.',
    counters: [{ counterItemId: 'ice-queen-wand', counterItemName: 'Ice Queen Wand', reason: 'Efek slow membatalkan rotasi kencang Rapid Boots.' }]
  },
  {
    id: 'lightning-boots',
    name: 'Lightning Boots',
    category: 'BOOTS',
    categoryEmoji: '👟',
    description: 'Sepatu khusus percepatan akselerasi gerakan kilat.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Menahan akselerasi.' }]
  },

  // ================= 🌿 ITEM JUNGLE =================
  {
    id: 'flame-retribution',
    name: 'Flame Retribution',
    category: 'JUNGLE',
    categoryEmoji: '🌿',
    s41Note: 'Penyesuaian Season 41: Kerusakan awal terhadap monster & hero ditingkatkan signifikan!',
    description: 'Retribution Merah! Mencuri Physical/Magic Attack musuh saat digunakan pada hero musuh.',
    counters: [{ counterItemId: 'antique-cuirass', counterItemName: 'Antique Cuirass', reason: 'Menahan Physical Attack curian.' }]
  },
  {
    id: 'ice-retribution',
    name: 'Ice Retribution',
    category: 'JUNGLE',
    categoryEmoji: '🌿',
    description: 'Retribution Biru! Mencuri Movement Speed musuh saat digunakan pada hero musuh.',
    counters: [{ counterItemId: 'rapid-boots', counterItemName: 'Rapid Boots / Purify', reason: 'Mengembalikan rotasi kecepatan.' }]
  },
  {
    id: 'bloody-retribution',
    name: 'Bloody Retribution',
    category: 'JUNGLE',
    categoryEmoji: '🌿',
    description: 'Retribution Ungu/Tank! Mencuri Max HP musuh bertahap selama 3 detik.',
    counters: [{ counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Mengurangi HP regen curian.' }]
  },
  {
    id: 'wind-retribution',
    name: 'Wind Retribution',
    category: 'JUNGLE',
    categoryEmoji: '🌿',
    description: 'Retribution Hijau! Memberikan efek kekebalan damage kecil singkat.',
    counters: [{ counterItemId: 'divine-glaive', counterItemName: 'Divine Glaive', reason: 'Magic Penetration menembus shield Retri.' }]
  },
  {
    id: 'thunder-retribution',
    name: 'Thunder Retribution',
    category: 'JUNGLE',
    categoryEmoji: '🌿',
    description: 'Retribution Kuning Petir! Memberikan efek kejutan damage listrik pada target.',
    counters: [{ counterItemId: 'athenas-shield', counterItemName: "Athena's Shield", reason: 'Meredam kejutan petir.' }]
  },

  // ================= 🤝 ITEM ROAMING / BERKAT =================
  {
    id: 'conceal-roam',
    name: 'Conceal — Berkat Bayangan',
    category: 'ROAMING',
    categoryEmoji: '🤝',
    s41Note: 'Sistem Roaming Season 41: Pasif dapat Gold & EXP dari memberikan kerusakan / membuka vision!',
    description: 'Item aktif menghilang! Menyembunyikan pengguna & teman sekitar dalam mode kamuflase serta menambah Movement Speed.',
    counters: [{ counterItemId: 'cursed-helmet', counterItemName: 'Cursed Helmet / Vision Skill', reason: 'Aura bakar Cursed Helmet atau skill membuka peta membuka mode kamuflase Conceal.' }]
  },
  {
    id: 'encourage-roam',
    name: 'Encourage — Berkat Semangat',
    category: 'ROAMING',
    categoryEmoji: '🤝',
    description: 'Aura pasif menambah Physical Attack, Magic Power, & Attack Speed seluruh teman di sekitar.',
    counters: [{ counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Aura Dominance menetralkan bonus Attack Speed Encourage.' }]
  },
  {
    id: 'favor-roam',
    name: 'Favor — Berkat Kasih',
    category: 'ROAMING',
    categoryEmoji: '🤝',
    description: 'Saat menggunakan skill heal/shield, memberikan heal HP tambahan berlebih untuk teman terdekat yang sekarat.',
    counters: [{ counterItemId: 'dominance-ice', counterItemName: 'Dominance Ice', reason: 'Memotong pemulihan HP Favor sebesar 50%.' }]
  },
  {
    id: 'dire-hit-roam',
    name: 'Dire Hit — Berkat Serangan Langsung',
    category: 'ROAMING',
    categoryEmoji: '🤝',
    description: 'Menyerang musuh dengan HP di bawah 35% memberikan ekstra Damage setara % Max HP target.',
    counters: [{ counterItemId: 'rose-gold-meteor', counterItemName: 'Rose Gold Meteor', reason: 'Shield aktif sebelum HP menyentuh 35%.' }]
  },
  {
    id: 'pull-roam',
    name: 'Pull — Berkat Tarikan',
    category: 'ROAMING',
    categoryEmoji: '🤝',
    description: 'Berkat roaming tarikan magnetik membuka inisiasi kawan.',
    counters: [{ counterItemId: 'tough-boots', counterItemName: 'Tough Boots', reason: 'Mengurangi durasi tarikan.' }]
  }
];
