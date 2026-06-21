import { Food } from '../types';

export const foods: Food[] = [
  {
    id: "mie_001",
    nama: "MIE GACOAN",
    foto_url: "https://images.pexels.com/photos/37106132/pexels-photo-37106132.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie pedas viral dengan level kepedasan yang menantang. Dilengkapi dengan pangsit goreng renyah dan taburan ayam cincang yang gurih.",
    deskripsi_en: "Viral spicy noodles with challenging spice levels. Equipped with crispy fried wontons and savory minced chicken topping.",
    jenis: ["mie", "pedas", "makanan"],
    cocok_waktu: ["siang", "malam", "tengah_malam"],
    tags: ["pedas", "viral", "hits"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Mie Gacoan Tlogomas",
        alamatLengkap: "Jl. Tlogomas No.55, Tlogomas, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Gacoan Tlogomas",
        jam_buka: "09.00-23.00",
        lat: -7.9275,
        lng: 112.5996
      },
      {
        nama: "Mie Gacoan Soekarno Hatta",
        alamatLengkap: "Jl. Soekarno Hatta No.6, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Gacoan Soekarno Hatta Malang",
        jam_buka: "11.00-01.00",
        lat: -7.9389,
        lng: 112.6178
      },
      {
        nama: "Mie Gacoan Sulfat",
        alamatLengkap: "Jl. Sulfat No.39, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Mie Gacoan Sulfat Malang",
        jam_buka: "11.00-01.00",
        lat: -7.9552,
        lng: 112.6521
      },
      {
        nama: "Mie Gacoan Sawojajar",
        alamatLengkap: "Jl. Danau Toba No.1, Sawojajar, Kec. Kedungkandang, Kota Malang",
        namaPencarian: "Mie Gacoan Sawojajar Malang",
        jam_buka: "11.00-01.00",
        lat: -7.9748,
        lng: 112.6612
      }
    ]
  },
  {
    id: "mie_002",
    nama: "CWIE MIE ORA ONO",
    foto_url: "https://images.pexels.com/photos/33671581/pexels-photo-33671581.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Cwie mie klasik Malang dengan tekstur mie yang kenyal dan gurih. Disajikan dengan taburan ayam halus dan pangsit yang melimpah.",
    deskripsi_en: "Classic Malang cwie mie with chewy and savory noodle texture. Served with fine chicken topping and abundant wontons.",
    jenis: ["mie", "makanan"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["legendaris", "khas-malang", "sarapan"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Cwie Mie Ora Ono Kawi",
        alamatLengkap: "Jl. Kawi No.6, Bareng, Kec. Klojen, Kota Malang",
        namaPencarian: "Cwie Mie Ora Ono Kawi Malang",
        jam_buka: "07.00-16.00",
        lat: -7.9791,
        lng: 112.6217
      },
      {
        nama: "Cwie Mie Ora Ono Semeru",
        alamatLengkap: "Jl. Semeru No.8, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Cwie Mie Malang Ora Ono Semeru",
        jam_buka: "07.00-15.00",
        lat: -7.9812,
        lng: 112.6198
      }
    ]
  },
  {
    id: "mie_003",
    nama: "MIE AYAM PAK NDUT",
    foto_url: "https://images.pexels.com/photos/37106453/pexels-photo-37106453.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie ayam porsi mantap dengan bumbu kecap yang meresap sempurna. Cocok banget buat makan siang yang mengenyangkan di Malang.",
    deskripsi_en: "Solid portion of chicken noodles with perfectly absorbed soy sauce seasoning. Great for a filling lunch in Malang.",
    jenis: ["mie", "makanan"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["porsi-besar", "mengenyangkan", "murah-meriah"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Mie Ayam Pak Ndut Mergan",
        alamatLengkap: "Jl. Mergan Lori No.5, Merjosari, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Ayam Pak Ndut Mergan Malang",
        jam_buka: "07.00-15.00",
        lat: -7.9461,
        lng: 112.6093
      },
      {
        nama: "Mie Ayam Pak Ndut Soehat",
        alamatLengkap: "Jl. Soekarno Hatta, Jatimulyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Ayam Pak Ndut Soehat Malang",
        jam_buka: "07.00-14.00",
        lat: -7.9398,
        lng: 112.6156
      }
    ]
  },
  {
    id: "mie_004",
    nama: "MIE AYAM AREMA 86",
    foto_url: "https://images.pexels.com/photos/36946895/pexels-photo-36946895.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie ayam favorit mahasiswa dengan harga yang ramah di kantong. Porsinya banyak dan rasanya juara buat nemenin nugas.",
    deskripsi_en: "Student favorite chicken noodles with pocket-friendly prices. Large portions and great taste to accompany study sessions.",
    jenis: ["mie", "makanan"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["mahasiswa", "kampus", "terjangkau"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Mie Ayam Arema 86 Veteran",
        alamatLengkap: "Jl. Veteran No.10, Ketawanggede, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Ayam Arema 86 Veteran Malang",
        jam_buka: "07.00-16.00",
        lat: -7.9519,
        lng: 112.6136
      },
      {
        nama: "Mie Ayam Arema 86 Dinoyo",
        alamatLengkap: "Jl. MT. Haryono No.100, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mie Ayam Arema 86 Dinoyo Malang",
        jam_buka: "07.00-15.00",
        lat: -7.9531,
        lng: 112.6148
      }
    ]
  },
  {
    id: "mie_005",
    nama: "MIE KOCOK MALANG",
    foto_url: "https://images.pexels.com/photos/34834553/pexels-photo-34834553.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie kocok dengan kuah kaldu sapi yang kental dan gurih. Kikil sapinya empuk banget, pas buat makan pas lagi hujan.",
    deskripsi_en: "Shaken noodles with thick and savory beef broth. The beef tendons are very tender, perfect for eating when it's raining.",
    jenis: ["mie", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan", "tengah_malam"],
    tags: ["kikil", "berkuah", "hangat"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Mie Kocok Malang Klojen",
        alamatLengkap: "Jl. Zainul Arifin No.12, Kasin, Kec. Klojen, Kota Malang",
        namaPencarian: "Mie Kocok Malang Klojen",
        jam_buka: "08.00-17.00",
        lat: -7.9854,
        lng: 112.6287
      }
    ]
  },
  {
    id: "mie_006",
    nama: "RAMEN SETO MALANG",
    foto_url: "https://images.pexels.com/photos/28701170/pexels-photo-28701170.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Ramen autentik dengan cita rasa lokal yang pas di lidah. Kuahnya gurih dan mienya kenyal, favorit pecinta masakan Jepang di Malang.",
    deskripsi_en: "Authentic ramen with local flavors that suit the palate. The broth is savory and the noodles are chewy, a favorite for Japanese food lovers in Malang.",
    jenis: ["mie", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "tengah_malam"],
    tags: ["ramen", "lokal", "tonkotsu"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Ramen Seto Malang Lowokwaru",
        alamatLengkap: "Jl. Simpang Gajayana No.5, Merjosari, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Ramen Seto Malang",
        jam_buka: "11.00-21.00",
        lat: -7.9441,
        lng: 112.6071
      }
    ]
  },
  {
    id: "mie_007",
    nama: "MIE ACEH MALANG",
    foto_url: "https://images.pexels.com/photos/15355037/pexels-photo-15355037.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie Aceh dengan rempah yang kuat and porsi yang mantap. Pilihan seafoodnya segar, bikin nagih di setiap suapan.",
    deskripsi_en: "Aceh noodles with strong spices and satisfying portions. Fresh seafood options that make you addicted to every bite.",
    jenis: ["mie", "berkuah", "pedas", "makanan", "seafood"],
    cocok_waktu: ["siang", "malam"],
    tags: ["aceh", "rempah", "seafood"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Mie Aceh Malang Klojen",
        alamatLengkap: "Jl. Jaksa Agung Suprapto No.26, Klojen, Kota Malang",
        namaPencarian: "Mie Aceh Malang Klojen",
        jam_buka: "10.00-22.00",
        lat: -7.9832,
        lng: 112.6301
      }
    ]
  },
  {
    id: "bks_008",
    nama: "BAKSO KOTA CAK MAN",
    foto_url: "https://images.pexels.com/photos/37122862/pexels-photo-37122862.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bakso legendaris Malang dengan pilihan isian yang sangat lengkap. Kuahnya bening tapi gurihnya nendang banget.",
    deskripsi_en: "Legendary Malang meatballs with very complete filling options. The broth is clear but the savory taste is very strong.",
    jenis: ["bakso", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan", "tengah_malam"],
    tags: ["legendaris", "wajib-coba", "bakso"],
    rating: 4.8,
    trending: true,
    cabang: [
      {
        nama: "Bakso Kota Cak Man Pusat",
        alamatLengkap: "Jl. Batanghari No.5, Rampalcelaket, Kec. Klojen, Kota Malang",
        namaPencarian: "Bakso Kota Cak Man Batanghari Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9797,
        lng: 112.6304
      },
      {
        nama: "Bakso Cak Man Sawojajar",
        alamatLengkap: "Jl. Danau Ranau No.1, Sawojajar, Kec. Kedungkandang, Kota Malang",
        namaPencarian: "Bakso Kota Cak Man Sawojajar Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9748,
        lng: 112.6601
      },
      {
        nama: "Bakso Cak Man Sulfat",
        alamatLengkap: "Jl. Sulfat No.47, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Bakso Kota Cak Man Sulfat Malang",
        jam_buka: "09.00-20.00",
        lat: -7.9543,
        lng: 112.6518
      }
    ]
  },
  {
    id: "bks_009",
    nama: "BAKSO PRESIDENT MALANG",
    foto_url: "https://images.pexels.com/photos/30335664/pexels-photo-30335664.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Makan bakso di pinggir rel kereta api, pengalaman unik cuma ada di Malang. Baksonya kenyal dan kuahnya segar banget.",
    deskripsi_en: "Eat meatballs by the train tracks, a unique experience only in Malang. The meatballs are chewy and the broth is very fresh.",
    jenis: ["bakso", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan"],
    tags: ["legendaris", "bakso", "gurih"],
    rating: 4.7,
    trending: false,
    cabang: [
      {
        nama: "Bakso President Pusat",
        alamatLengkap: "Jl. Batanghari No.26, Rampalcelaket, Kec. Klojen, Kota Malang",
        namaPencarian: "Bakso President Malang Batanghari",
        jam_buka: "09.00-21.00",
        lat: -7.9801,
        lng: 112.6308
      },
      {
        nama: "Bakso President Cabang Dinoyo",
        alamatLengkap: "Jl. MT. Haryono No.167, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Bakso President Dinoyo Malang",
        jam_buka: "09.00-20.00",
        lat: -7.9527,
        lng: 112.6143
      }
    ]
  },
  {
    id: "bks_010",
    nama: "BAKSO AREMA MALANG",
    foto_url: "https://images.pexels.com/photos/15853315/pexels-photo-15853315.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bakso khas Arema dengan porsi yang bikin puas. Kuahnya kaya rempah, pas banget buat ngangetin badan pas cuaca dingin.",
    deskripsi_en: "Typical Arema meatballs with satisfying portions. The broth is rich in spices, perfect for warming up the body in cold weather.",
    jenis: ["bakso", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan"],
    tags: ["khas-malang", "arema", "porsi-besar"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Bakso Arema Malang Klojen",
        alamatLengkap: "Jl. Majapahit No.4, Klojen, Kota Malang",
        namaPencarian: "Bakso Arema Malang Klojen",
        jam_buka: "08.00-21.00",
        lat: -7.9839,
        lng: 112.6273
      }
    ]
  },
  {
    id: "rwn_011",
    nama: "RAWON NGULING",
    foto_url: "https://images.pexels.com/photos/29060680/pexels-photo-29060680.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Rawon legendaris dengan kuah hitam pekat yang kaya rempah. Daging sapinya empuk banget, disajikan dengan tauge segar dan telur asin.",
    deskripsi_en: "Legendary rawon with thick black soup rich in spices. The beef is very tender, served with fresh bean sprouts and salted egg.",
    jenis: ["rawon", "berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan", "tengah_malam"],
    tags: ["legendaris", "rawon", "khas-jatim"],
    rating: 4.8,
    trending: true,
    cabang: [
      {
        nama: "Rawon Nguling Malang Pusat",
        alamatLengkap: "Jl. Wahid Hasyim No.3, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Rawon Nguling Malang Wahid Hasyim",
        jam_buka: "07.00-21.00",
        lat: -7.9789,
        lng: 112.6221
      },
      {
        nama: "Rawon Nguling Cabang Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.10, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Rawon Nguling Soekarno Hatta Malang",
        jam_buka: "07.00-20.00",
        lat: -7.9384,
        lng: 112.6172
      }
    ]
  },
  {
    id: "rwn_012",
    nama: "RAWON SETAN MALANG",
    foto_url: "https://images.pexels.com/photos/31665127/pexels-photo-31665127.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Rawon dengan rasa yang 'nendang' dan potongan daging yang besar. Kuahnya mantap banget buat dinikmati malam-malam di Malang.",
    deskripsi_en: "Rawon with a 'kick' flavor and large meat pieces. The broth is great to enjoy at night in Malang.",
    jenis: ["rawon", "berkuah", "pedas", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan", "tengah_malam"],
    tags: ["pedas", "rawon", "porsi-jumbo"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Rawon Setan Malang Klojen",
        alamatLengkap: "Jl. Jaksa Agung Suprapto No.18, Rampalcelaket, Kec. Klojen, Kota Malang",
        namaPencarian: "Rawon Setan Malang Klojen",
        jam_buka: "08.00-21.00",
        lat: -7.9821,
        lng: 112.6295
      },
      {
        nama: "Rawon Setan Cabang Sulfat",
        alamatLengkap: "Jl. Sulfat No.22, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Rawon Setan Sulfat Malang",
        jam_buka: "08.00-20.00",
        lat: -7.9549,
        lng: 112.6511
      }
    ]
  },
  {
    id: "sto_013",
    nama: "SOTO LOMBOK PAK SHOLEH",
    foto_url: "https://images.pexels.com/photos/12676932/pexels-photo-12676932.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Soto ayam legendaris dengan kuah santan yang gurih dan koya yang melimpah. Salah satu menu sarapan paling favorit di Malang.",
    jenis: ["soto", "berkuah", "makanan"],
    cocok_waktu: ["pagi", "siang", "tengah_malam"],
    tags: ["legendaris", "soto", "santan"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Soto Lombok Pak Sholeh Pusat",
        alamatLengkap: "Jl. Lombok No.2, Rampalcelaket, Kec. Klojen, Kota Malang",
        namaPencarian: "Soto Lombok Pak Sholeh Malang",
        jam_buka: "06.00-14.00",
        lat: -7.9823,
        lng: 112.6318
      },
      {
        nama: "Soto Lombok Pak Sholeh Cabang Blimbing",
        alamatLengkap: "Jl. Borobudur No.7, Purwodadi, Kec. Blimbing, Kota Malang",
        namaPencarian: "Soto Lombok Pak Sholeh Blimbing Malang",
        jam_buka: "06.00-13.00",
        lat: -7.9498,
        lng: 112.6467
      }
    ]
  },
  {
    id: "sop_014",
    nama: "SOP IGA BU TINI",
    foto_url: "https://images.pexels.com/photos/27420465/pexels-photo-27420465.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Sop iga dengan kuah bening yang segar dan daging yang empuk. Rasanya rumahan banget, bikin kangen masakan ibu.",
    deskripsi_en: "Rib soup with fresh clear broth and tender meat. It tastes very homey, making you miss your mother's cooking.",
    jenis: ["berkuah", "makanan"],
    cocok_waktu: ["siang", "malam", "hujan"],
    tags: ["iga", "sop", "UMKM", "empuk"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Sop Iga Bu Tini Malang",
        alamatLengkap: "Jl. Candi Panggung No.12, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Sop Iga Bu Tini Malang",
        jam_buka: "09.00-20.00",
        lat: -7.9362,
        lng: 112.6143
      }
    ]
  },
  {
    id: "sop_015",
    nama: "SOP BUNTUT PREMIUM MALANG",
    foto_url: "https://images.pexels.com/photos/37106521/pexels-photo-37106521.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Sop buntut dengan kualitas daging premium yang dimasak hingga sangat lembut. Kuahnya gurih dan aromanya sangat menggugah selera.",
    deskripsi_en: "Oxtail soup with premium quality meat cooked until very soft. The broth is savory and the aroma is very appetizing.",
    jenis: ["berkuah", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["buntut", "premium", "sajian-istimewa"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Sop Buntut Waroeng Kita Malang",
        alamatLengkap: "Jl. Simpang Gajayana No.1, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Waroeng Kita Sop Buntut Malang",
        jam_buka: "10.00-21.00",
        lat: -7.9449,
        lng: 112.6079
      },
      {
        nama: "Sop Buntut Kedai Kita Malang",
        alamatLengkap: "Jl. Soekarno Hatta No.3, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Sop Buntut Kedai Kita Soehat Malang",
        jam_buka: "10.00-21.00",
        lat: -7.9392,
        lng: 112.6161
      }
    ]
  },
  {
    id: "nsi_016",
    nama: "NASI PECEL BU BUDI",
    foto_url: "https://images.pexels.com/photos/11013145/pexels-photo-11013145.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Pecel legendaris dengan bumbu kacang yang pas mantapnya. Rempeyeknya renyah banget, cocok buat sarapan pagi di Malang.",
    deskripsi_en: "Legendary pecel with perfectly savory peanut sauce. The peanut crackers are very crispy, suitable for breakfast in Malang.",
    jenis: ["nasi", "makanan"],
    cocok_waktu: ["pagi", "siang", "tengah_malam"],
    tags: ["legendaris", "pecel", "khas-malang"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Nasi Pecel Bu Budi Semeru",
        alamatLengkap: "Jl. Semeru No.15, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Nasi Pecel Bu Budi Semeru Malang",
        jam_buka: "06.00-14.00",
        lat: -7.9812,
        lng: 112.6198
      },
      {
        nama: "Nasi Pecel Bu Budi Cabang Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.77, Jatimulyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Pecel Bu Budi Soehat Malang",
        jam_buka: "06.00-13.00",
        lat: -7.9411,
        lng: 112.6149
      }
    ]
  },
  {
    id: "nsi_017",
    nama: "NASI PECEL BU TINUK",
    foto_url: "https://images.pexels.com/photos/37106991/pexels-photo-37106991.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi pecel dengan porsi yang melimpah dan harga yang terjangkau. Bumbu kacangnya juara, bikin nagih terus.",
    deskripsi_en: "Rice pecel with abundant portions and affordable prices. The peanut sauce is a winner, keeping you coming back for more.",
    jenis: ["nasi", "makanan"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["UMKM", "pecel", "rempeyek"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Nasi Pecel Bu Tinuk Soekarno Hatta",
        alamatLengkap: "Jl. Soekarno Hatta No.39, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Pecel Bu Tinuk Soekarno Hatta Malang",
        jam_buka: "06.00-12.00",
        lat: -7.9388,
        lng: 112.6175
      }
    ]
  },
  {
    id: "nsi_018",
    nama: "NASI BEBEK PAK NDUT",
    foto_url: "https://images.pexels.com/photos/37107155/pexels-photo-37107155.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bebek goreng dengan bumbu yang meresap dan sambal yang pedasnya nampol. Dagingnya empuk dan kulitnya renyah.",
    deskripsi_en: "Fried duck with absorbed seasoning and very spicy chili sauce. The meat is tender and the skin is crispy.",
    jenis: ["nasi", "ayam", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["bebek", "renyah", "ikonik"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Nasi Bebek Pak Ndut Pusat",
        alamatLengkap: "Jl. Candi Mendut No.3, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Bebek Pak Ndut Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9341,
        lng: 112.6121
      },
      {
        nama: "Nasi Bebek Pak Ndut Cabang Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.45, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Bebek Pak Ndut Soehat Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9395,
        lng: 112.6166
      }
    ]
  },
  {
    id: "nsi_019",
    nama: "NASI BEBEK H. SLAMET",
    foto_url: "https://images.pexels.com/photos/37107155/pexels-photo-37107155.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bebek goreng legendaris dengan sambal korek yang super pedas. Dagingnya sangat empuk dan bumbunya meresap sampai ke tulang.",
    deskripsi_en: "Legendary fried duck with super spicy korek chili sauce. The meat is very tender and the seasoning seeps into the bone.",
    jenis: ["nasi", "ayam", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["bebek", "madura", "empuk"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Bebek Goreng H. Slamet Sulfat",
        alamatLengkap: "Jl. Sulfat No.31, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Bebek Goreng H Slamet Sulfat Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9551,
        lng: 112.6514
      },
      {
        nama: "Bebek Goreng H. Slamet Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.55, Jatimulyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Bebek Goreng H Slamet Soehat Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9403,
        lng: 112.6153
      }
    ]
  },
  {
    id: "nsi_020",
    nama: "RICE BOX AYAM GEPREK",
    foto_url: "https://images.pexels.com/photos/28041439/pexels-photo-28041439.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Menu praktis buat kamu yang sibuk. Ayam geprek dengan sambal bawang yang segar dalam kemasan rice box yang kekinian.",
    deskripsi_en: "Practical menu for those who are busy. Smashed chicken with fresh onion chili sauce in a trendy rice box packaging.",
    jenis: ["nasi", "ayam", "pedas", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["geprek", "rice-box", "praktis"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Geprek Bensu Soekarno Hatta Malang",
        alamatLengkap: "Jl. Soekarno Hatta No.6, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Geprek Bensu Soekarno Hatta Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9389,
        lng: 112.6178
      },
      {
        nama: "Geprek Bensu Sulfat Malang",
        alamatLengkap: "Jl. Sulfat No.15, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Geprek Bensu Sulfat Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9547,
        lng: 112.6509
      },
      {
        nama: "Ayam Geprek Bu Rum Malang",
        alamatLengkap: "Jl. Simpang Gajayana No.3, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Ayam Geprek Bu Rum Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9451,
        lng: 112.6083
      }
    ]
  },
  {
    id: "aym_021",
    nama: "AYAM GEPREK BU RUM",
    foto_url: "https://images.pexels.com/photos/28041439/pexels-photo-28041439.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Ayam geprek crispy dengan sambal bawang merah segar yang digeprek langsung. Tersedia berbagai level kepedasan dengan lalapan segar.",
    deskripsi_en: "Crispy smashed chicken with fresh raw onion chili sauce smashed directly. Various spice levels available with fresh vegetables.",
    jenis: ["ayam", "lalapan", "pedas", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["geprek", "crispy", "sambal-bawang"],
    rating: 4.6,
    trending: true,
    cabang: [
      {
        nama: "Ayam Geprek Bu Rum Dinoyo",
        alamatLengkap: "Jl. Simpang Gajayana No.3, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Ayam Geprek Bu Rum Dinoyo Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9451,
        lng: 112.6083
      },
      {
        nama: "Ayam Geprek Bu Rum Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.88, Jatimulyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Ayam Geprek Bu Rum Soehat Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9418,
        lng: 112.6141
      }
    ]
  },
  {
    id: "aym_022",
    nama: "NASI BEBEK SINJAI MALANG",
    foto_url: "https://images.pexels.com/photos/37107155/pexels-photo-37107155.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bebek goreng empuk dengan bumbu rempah khas Sinjai. Bumbu meresap sempurna dengan tekstur luar renyah and dalam yang juicy.",
    deskripsi_en: "Tender fried duck with Sinjai typical spices. Spices perfectly absorbed with crispy outside and juicy inside texture.",
    jenis: ["ayam", "nasi", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["bebek", "sinjai", "rempah"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Bebek Sinjai Malang Lowokwaru",
        alamatLengkap: "Jl. Candi Panggung No.5, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Bebek Sinjai Malang Lowokwaru",
        jam_buka: "10.00-21.00",
        lat: -7.9358,
        lng: 112.6138
      }
    ]
  },
  {
    id: "bkr_023",
    nama: "IGA BAKAR MADU",
    foto_url: "https://images.pexels.com/photos/29850152/pexels-photo-29850152.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Iga sapi premium dibakar dengan olesan madu dan kecap hingga karamelisasi sempurna. Daging juicy dan empuk dengan aroma bakar yang menggugah selera.",
    deskripsi_en: "Premium beef ribs grilled with honey and soy sauce glaze until perfectly caramelized. Juicy and tender meat with appetizing grilled aroma.",
    jenis: ["makanan", "bakar"],
    cocok_waktu: ["siang", "malam"],
    tags: ["iga", "bakar", "madu", "premium"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Iga Bakar Madu Malang Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.11, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Iga Bakar Madu Soehat Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9385,
        lng: 112.6169
      },
      {
        nama: "Iga Bakar Madu Cabang Sulfat",
        alamatLengkap: "Jl. Sulfat No.55, Purwantoro, Kec. Blimbing, Kota Malang",
        namaPencarian: "Iga Bakar Madu Sulfat Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9557,
        lng: 112.6522
      }
    ]
  },
  {
    id: "srp_024",
    nama: "BUBUR AYAM MALANG",
    foto_url: "https://images.pexels.com/photos/36947004/pexels-photo-36947004.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bubur nasi lembut dengan topping ayam suwir, cakwe renyah, kerupuk, dan kuah kaldu ayam panas. Sarapan favorit warga Malang.",
    deskripsi_en: "Soft rice porridge with shredded chicken topping, crispy cakwe, crackers, and hot chicken broth. favorite breakfast for Malang residents.",
    jenis: ["makanan", "sarapan"],
    cocok_waktu: ["pagi"],
    tags: ["bubur", "sarapan", "hangat"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Bubur Ayam Malang Veteran",
        alamatLengkap: "Jl. Veteran No.8, Ketawanggede, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Bubur Ayam Malang Veteran",
        jam_buka: "05.30-11.00",
        lat: -7.9517,
        lng: 112.6131
      },
      {
        nama: "Bubur Ayam Malang Klojen",
        alamatLengkap: "Jl. Zainul Arifin No.3, Kasin, Kec. Klojen, Kota Malang",
        namaPencarian: "Bubur Ayam Malang Klojen",
        jam_buka: "05.30-11.00",
        lat: -7.9851,
        lng: 112.6281
      }
    ]
  },
  {
    id: "srp_025",
    nama: "NASI KUNING PAGI MALANG",
    foto_url: "https://images.pexels.com/photos/37106996/pexels-photo-37106996.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi kuning kunyit yang harum dan gurih dengan lauk lengkap khas Malang. Tersedia berbagai pilihan lauk dari telur balado hingga ayam goreng.",
    deskripsi_en: "Fragrant and savory turmeric rice with complete Malang typical side dishes. Various side dish options from egg balado to fried chicken.",
    jenis: ["nasi", "sarapan", "makanan"],
    cocok_waktu: ["pagi"],
    tags: ["nasi-kuning", "sarapan", "tradisional"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Nasi Kuning Pagi Ibu Sari Malang",
        alamatLengkap: "Jl. Candi Gebang No.4, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Kuning Pagi Ibu Sari Lowokwaru Malang",
        jam_buka: "05.30-10.00",
        lat: -7.9349,
        lng: 112.6127
      },
      {
        nama: "Nasi Kuning Bu Nanik Malang",
        alamatLengkap: "Jl. Simpang Gajayana No.7, Merjosari, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Nasi Kuning Bu Nanik Malang",
        jam_buka: "05.30-10.00",
        lat: -7.9443,
        lng: 112.6069
      }
    ]
  },
  {
    id: "mlm_026",
    nama: "ANGKRINGAN MALANG",
    foto_url: "https://images.pexels.com/photos/36985919/pexels-photo-36985919.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Angkringan khas Malang dengan nasi kucing berbungkus daun pisang, gorengan hangat, dan minuman wedang. Suasana lesehan santai.",
    deskripsi_en: "Malang typical angkringan with rice wrapped in banana leaves, warm fried food, and wedang drinks. Relaxed floor seating atmosphere.",
    jenis: ["makanan", "cemilan", "minuman"],
    cocok_waktu: ["malam", "tengah_malam"],
    tags: ["angkringan", "malam", "nasi-kucing"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Angkringan Mas Bro Malang",
        alamatLengkap: "Jl. Veteran No.22, Ketawanggede, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Angkringan Mas Bro Veteran Malang",
        jam_buka: "17.00-02.00",
        lat: -7.9523,
        lng: 112.6139
      },
      {
        nama: "Angkringan Dinoyo Malang",
        alamatLengkap: "Jl. MT. Haryono No.210, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Angkringan Dinoyo Malang",
        jam_buka: "18.00-02.00",
        lat: -7.9535,
        lng: 112.6151
      },
      {
        nama: "Angkringan Klojen Malang",
        alamatLengkap: "Jl. Semeru No.20, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Angkringan Klojen Semeru Malang",
        jam_buka: "18.00-01.00",
        lat: -7.9815,
        lng: 112.6202
      }
    ]
  },
  {
    id: "mlm_027",
    nama: "WEDANG RONDE MALANG",
    foto_url: "https://images.pexels.com/photos/36039032/pexels-photo-36039032.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Minuman hangat berisi bola-bola ketan isi kacang dalam kuah jahe panas. Sempurna untuk malam dingin di Malang.",
    deskripsi_en: "Warm drink containing bean-filled glutinous rice balls in hot ginger broth. Perfect for cold nights in Malang.",
    jenis: ["minuman", "cemilan"],
    cocok_waktu: ["malam", "hujan"],
    tags: ["wedang", "hangat", "malam-dingin"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Wedang Ronde Pak Mirin Malang",
        alamatLengkap: "Jl. Semeru No.1, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Wedang Ronde Pak Mirin Malang",
        jam_buka: "19.00-23.00",
        lat: -7.9809,
        lng: 112.6195
      },
      {
        nama: "Wedang Ronde Alun-alun Malang",
        alamatLengkap: "Jl. Merdeka Barat, Kauman, Kec. Klojen, Kota Malang",
        namaPencarian: "Wedang Ronde Alun-alun Malang",
        jam_buka: "19.00-24.00",
        lat: -7.9797,
        lng: 112.6282
      }
    ]
  },
  {
    id: "min_028",
    nama: "BOBA MILK TEA MALANG",
    foto_url: "https://images.pexels.com/photos/11160112/pexels-photo-11160112.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Milk tea dengan boba kenyal dalam berbagai rasa pilihan. Boba dimasak fresh setiap hari dengan tekstur kenyal sempurna.",
    deskripsi_en: "Milk tea with chewy boba in various flavor choices. Boba is cooked fresh every day with perfect chewy texture.",
    jenis: ["minuman"],
    cocok_waktu: ["siang", "sore", "malam", "tengah_malam"],
    tags: ["boba", "kekinian", "milk-tea"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Xing Fu Tang Malang Town Square",
        alamatLengkap: "Malang Town Square Lt.1, Jl. Veteran No.2, Penanggungan, Kec. Klojen, Kota Malang",
        namaPencarian: "Xing Fu Tang Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9698,
        lng: 112.6315
      },
      {
        nama: "Chatime Malang Matos",
        alamatLengkap: "Malang Town Square Lt.2, Jl. Veteran No.2, Penanggungan, Kec. Klojen, Kota Malang",
        namaPencarian: "Chatime Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9699,
        lng: 112.6316
      },
      {
        nama: "Mixue Malang Soekarno Hatta",
        alamatLengkap: "Jl. Soekarno Hatta No.9, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Mixue Soekarno Hatta Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9387,
        lng: 112.6176
      }
    ]
  },
  {
    id: "min_029",
    nama: "KOPI MALANG BLEND",
    foto_url: "https://images.pexels.com/photos/4829084/pexels-photo-4829084.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kopi single origin dari perkebunan kopi Malang Raya dengan cita rasa lokal yang khas. Tersedia berbagai metode seduh di kafe-kafe lokal terbaik Malang.",
    deskripsi_en: "Single origin coffee from Malang Raya plantations with typical local taste. Available with various brewing methods in Malang's best local cafes.",
    jenis: ["minuman", "kopi"],
    cocok_waktu: ["pagi", "siang", "sore", "malam"],
    tags: ["kopi", "single-origin", "kafe-lokal"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Kafe Ijen Malang",
        alamatLengkap: "Jl. Ijen No.15, Gading Kasri, Kec. Klojen, Kota Malang",
        namaPencarian: "Kafe Ijen Malang",
        jam_buka: "07.00-22.00",
        lat: -7.9751,
        lng: 112.6143
      },
      {
        nama: "One Eighty Coffee Malang",
        alamatLengkap: "Jl. Gajayana No.4, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "One Eighty Coffee Malang",
        jam_buka: "08.00-23.00",
        lat: -7.9492,
        lng: 112.6108
      }
    ]
  },
  {
    id: "kor_030",
    nama: "KOREAN FRIED CHICKEN MALANG",
    foto_url: "https://images.pexels.com/photos/5774006/pexels-photo-5774006.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Ayam goreng ala Korea dengan tekstur double-fried yang super crispy dibalut saus buldak pedas atau honey garlic manis.",
    deskripsi_en: "Korean style fried chicken with super crispy double-fried texture coated in spicy buldak or sweet honey garlic sauce.",
    jenis: ["ayam", "korean", "makanan"],
    cocok_waktu: ["siang", "malam"],
    tags: ["korean", "crispy", "pedas-manis"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Bonchon Malang Matos",
        alamatLengkap: "Malang Town Square Lt.1, Jl. Veteran No.2, Penanggungan, Kec. Klojen, Kota Malang",
        namaPencarian: "Bonchon Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9697,
        lng: 112.6314
      },
      {
        nama: "KFC Malang Matos",
        alamatLengkap: "Malang Town Square, Jl. Veteran No.2, Kec. Klojen, Kota Malang",
        namaPencarian: "KFC Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9700,
        lng: 112.6317
      }
    ]
  },
  {
    id: "kor_031",
    nama: "TTEOKBOKKI MALANG",
    foto_url: "https://images.pexels.com/photos/12963392/pexels-photo-12963392.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kue beras kenyal dengan saus gochujang pedas manis khas Korea. Tersedia berbagai topping dari telur hingga fish cake.",
    deskripsi_en: "Chewy rice cake with Korean spicy sweet gochujang sauce. Various toppings from egg to fish cake available.",
    jenis: ["korean", "cemilan", "makanan"],
    cocok_waktu: ["sore", "malam"],
    tags: ["korea", "viral", "pedas-manis"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Ttaeng Malang Dinoyo",
        alamatLengkap: "Jl. MT. Haryono No.150, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Ttaeng Tteokbokki Dinoyo Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9529,
        lng: 112.6146
      },
      {
        nama: "Yori Korean Food Malang",
        alamatLengkap: "Jl. Gajayana No.10, Dinoyo, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Yori Korean Food Malang",
        jam_buka: "11.00-21.00",
        lat: -7.9488,
        lng: 112.6112
      }
    ]
  },
  {
    id: "prm_032",
    nama: "STEAK WAGYU LOKAL MALANG",
    foto_url: "https://images.pexels.com/photos/36138049/pexels-photo-36138049.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Wagyu grade lokal dengan marbling sempurna. Pengalaman steak premium dengan harga lebih terjangkau.",
    deskripsi_en: "Local grade Wagyu with perfect marbling. Premium steak experience at a more affordable price.",
    jenis: ["makanan", "western", "premium"],
    cocok_waktu: ["siang", "malam"],
    tags: ["steak", "wagyu", "premium"],
    rating: 4.7,
    trending: false,
    cabang: [
      {
        nama: "Warung Steak Malang",
        alamatLengkap: "Jl. Soekarno Hatta No.15, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Warung Steak Malang Soehat",
        jam_buka: "11.00-22.00",
        lat: -7.9383,
        lng: 112.6170
      },
      {
        nama: "Steak 21 Malang",
        alamatLengkap: "Jl. Kawi No.24, Bareng, Kec. Klojen, Kota Malang",
        namaPencarian: "Steak 21 Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9788,
        lng: 112.6214
      }
    ]
  },
  {
    id: "prm_033",
    nama: "AYCE BBQ KOREA MALANG",
    foto_url: "https://images.pexels.com/photos/18936008/pexels-photo-18936008.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "All you can eat BBQ Korea dengan berbagai pilihan daging premium. Panggang sendiri di atas arang dengan berbagai saus khas Korea.",
    deskripsi_en: "All you can eat Korean BBQ with various premium meat choices. Grill it yourself over charcoal with typical Korean sauces.",
    jenis: ["makanan", "korean", "premium"],
    cocok_waktu: ["siang", "malam"],
    tags: ["all-you-can-eat", "BBQ", "korea"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Gyu-Kaku Malang",
        alamatLengkap: "Jl. Veteran No.2, Penanggungan, Kec. Klojen, Kota Malang",
        namaPencarian: "Gyu-Kaku Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9695,
        lng: 112.6312
      },
      {
        nama: "Pochajjang Korean BBQ Malang",
        alamatLengkap: "Jl. Soekarno Hatta No.1, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Pochajjang Korean BBQ Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9381,
        lng: 112.6167
      }
    ]
  },
  {
    id: "min_034",
    nama: "ES TELER MALANG",
    foto_url: "https://images.pexels.com/photos/37105588/pexels-photo-37105588.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Es teler segar dengan isian alpukat mentega, nangka harum, dan kelapa muda. Pencuci mulut favorit warga Malang.",
    deskripsi_en: "Fresh es teler with creamy avocado, fragrant jackfruit, and young coconut. A favorite dessert for Malang residents.",
    jenis: ["minuman", "cemilan"],
    cocok_waktu: ["siang", "sore"],
    tags: ["segar", "es-teler", "buah"],
    rating: 4.6,
    trending: true,
    cabang: [
      {
        nama: "Es Teler Dempo",
        alamatLengkap: "Jl. Gede No.7, Oro-oro Dowo, Kec. Klojen, Kota Malang",
        namaPencarian: "Es Teler Dempo Malang",
        jam_buka: "09.00-16.00",
        lat: -7.9732,
        lng: 112.6215
      }
    ]
  },
  {
    id: "min_035",
    nama: "JUS BUAH SEGAR",
    foto_url: "https://images.pexels.com/photos/29851973/pexels-photo-29851973.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Berbagai pilihan jus buah segar dari alpukat hingga mangga. Dibuat langsung dari buah pilihan berkualitas.",
    deskripsi_en: "Various choices of fresh fruit juices from avocado to mango. Made directly from high-quality selected fruits.",
    jenis: ["minuman"],
    cocok_waktu: ["pagi", "siang", "sore"],
    tags: ["sehat", "jus", "buah"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Jus Buah Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.12, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Jus Buah Soehat Malang",
        jam_buka: "08.00-22.00",
        lat: -7.9385,
        lng: 112.6172
      }
    ]
  },
  {
    id: "min_036",
    nama: "KOPI KENANGAN MALANG",
    foto_url: "https://images.pexels.com/photos/18626151/pexels-photo-18626151.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kopi susu kekinian dengan gula aren asli yang memberikan rasa manis gurih yang pas.",
    deskripsi_en: "Modern milk coffee with authentic palm sugar that provides a perfect balance of sweet and savory.",
    jenis: ["minuman", "kopi"],
    cocok_waktu: ["pagi", "siang", "sore"],
    tags: ["kopi", "kekinian", "gula-aren"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Kopi Kenangan Matos",
        alamatLengkap: "Malang Town Square Lt. Dasar, Jl. Veteran No.2, Kota Malang",
        namaPencarian: "Kopi Kenangan Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9696,
        lng: 112.6313
      }
    ]
  },
  {
    id: "min_037",
    nama: "ES CAMPUR LEGENDARIS",
    foto_url: "https://images.pexels.com/photos/37105588/pexels-photo-37105588.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Es campur dengan isian komplit dari kolang-kaling hingga cincau. Disiram sirup merah khas dan susu kental manis.",
    deskripsi_en: "Mixed ice with complete fillings from palm fruit to grass jelly. Drizzled with typical red syrup and condensed milk.",
    jenis: ["minuman", "cemilan"],
    cocok_waktu: ["siang", "sore"],
    tags: ["segar", "tradisional", "es-campur"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Es Campur Bunul",
        alamatLengkap: "Jl. Hamid Rusdi No.10, Bunulrejo, Kec. Blimbing, Kota Malang",
        namaPencarian: "Es Campur Bunul Malang",
        jam_buka: "09.00-17.00",
        lat: -7.9612,
        lng: 112.6435
      }
    ]
  },
  {
    id: "min_038",
    nama: "THAI TEA MALANG",
    foto_url: "https://images.pexels.com/photos/33241823/pexels-photo-33241823.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Teh khas Thailand dengan campuran susu yang creamy dan aroma teh yang kuat.",
    deskripsi_en: "Typical Thailand tea with creamy milk blend and strong tea aroma.",
    jenis: ["minuman"],
    cocok_waktu: ["siang", "sore", "malam"],
    tags: ["thai-tea", "segar", "creamy"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Dum Dum Thai Tea Matos",
        alamatLengkap: "Malang Town Square Lt.3, Jl. Veteran No.2, Kota Malang",
        namaPencarian: "Dum Dum Thai Tea Malang Town Square",
        jam_buka: "10.00-22.00",
        lat: -7.9698,
        lng: 112.6315
      }
    ]
  },
  {
    id: "min_039",
    nama: "LEMON TEA SEGAR",
    foto_url: "https://images.pexels.com/photos/40594/lemon-tea-cold-beverages-summer-offerings-40594.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Teh segar dengan perasan lemon asli yang memberikan rasa asam manis yang menyegarkan.",
    deskripsi_en: "Fresh tea with real lemon juice providing a refreshing sweet and sour taste.",
    jenis: ["minuman"],
    cocok_waktu: ["siang", "sore"],
    tags: ["lemon-tea", "segar", "asam-manis"],
    rating: 4.3,
    trending: false,
    cabang: [
      {
        nama: "Lemon Tea Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.15, Malang",
        namaPencarian: "Lemon Tea Soehat Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9389,
        lng: 112.6178
      }
    ]
  },
  {
    id: "min_040",
    nama: "ES JERUK PERAS",
    foto_url: "https://images.pexels.com/photos/30900665/pexels-photo-30900665.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Jeruk peras asli yang segar dengan tambahan es batu. Minuman klasik yang selalu disukai.",
    deskripsi_en: "Freshly squeezed orange with ice. A classic drink that is always loved.",
    jenis: ["minuman"],
    cocok_waktu: ["siang", "sore"],
    tags: ["jeruk", "segar", "klasik"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Es Jeruk Alun-alun",
        alamatLengkap: "Sekitar Alun-alun Malang",
        namaPencarian: "Es Jeruk Alun-alun Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9797,
        lng: 112.6282
      }
    ]
  },
  {
    id: "min_041",
    nama: "SODA GEMBIRA",
    foto_url: "https://images.pexels.com/photos/30731006/pexels-photo-30731006.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Campuran air soda, susu kental manis, dan sirup merah yang memberikan sensasi ceria.",
    deskripsi_en: "Mix of soda water, condensed milk, and red syrup that gives a cheerful sensation.",
    jenis: ["minuman"],
    cocok_waktu: ["siang", "malam"],
    tags: ["soda", "ceria", "manis"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Soda Gembira Klojen",
        alamatLengkap: "Jl. Pattimura No.5, Malang",
        namaPencarian: "Soda Gembira Klojen Malang",
        jam_buka: "11.00-22.00",
        lat: -7.9750,
        lng: 112.6350
      }
    ]
  },
  {
    id: "leg_042",
    nama: "SEGO RESEK KASIN",
    foto_url: "https://images.pexels.com/photos/37106714/pexels-photo-37106714.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi goreng legendaris yang dimasak dengan arang dalam porsi besar. Campuran mie, tauge, dan suwiran ayam yang melimpah.",
    deskripsi_en: "Legendary fried rice cooked with charcoal in large portions. Mix of noodles, sprouts, and abundant shredded chicken.",
    jenis: ["makanan", "nasi"],
    cocok_waktu: ["malam"],
    tags: ["legendaris", "nasi-goreng", "kasin"],
    rating: 4.5,
    trending: true,
    cabang: [
      {
        nama: "Sego Resek Kasin",
        alamatLengkap: "Jl. Brigjend. Katamso No.4, Kasin, Kec. Klojen, Kota Malang",
        namaPencarian: "Sego Resek Kasin Malang",
        jam_buka: "18.00-21.00",
        lat: -7.9892,
        lng: 112.6275
      }
    ]
  },
  {
    id: "leg_043",
    nama: "BAKSO BAKAR PAK MAN",
    foto_url: "https://images.pexels.com/photos/36318390/pexels-photo-36318390.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Pelopor bakso bakar di Malang. Bakso sapi kenyal dibakar dengan bumbu kecap pedas manis yang meresap.",
    deskripsi_en: "Pioneer of grilled bakso in Malang. Chewy beef balls grilled with spicy sweet soy sauce seasoning that penetrates deeply.",
    jenis: ["makanan", "bakso"],
    cocok_waktu: ["siang", "sore"],
    tags: ["bakso-bakar", "pedas", "legendaris"],
    rating: 4.4,
    trending: true,
    cabang: [
      {
        nama: "Bakso Bakar Pak Man",
        alamatLengkap: "Jl. Diponegoro No.19, Klojen, Kec. Klojen, Kota Malang",
        namaPencarian: "Bakso Bakar Pak Man Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9744,
        lng: 112.6258
      }
    ]
  },
  {
    id: "leg_044",
    nama: "POS KETAN LEGENDA 1967",
    foto_url: "https://images.pexels.com/photos/7361018/pexels-photo-7361018.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Ketan bubuk legendaris dengan berbagai topping modern dari keju, coklat, hingga durian. Sudah ada sejak 1967.",
    deskripsi_en: "Legendary powdered sticky rice with various modern toppings from cheese, chocolate, to durian. Around since 1967.",
    jenis: ["cemilan", "manis"],
    cocok_waktu: ["malam", "tengah_malam"],
    tags: ["ketan", "legendaris", "alun-alun"],
    rating: 4.6,
    trending: true,
    cabang: [
      {
        nama: "Pos Ketan Legenda 1967 Alun-alun",
        alamatLengkap: "Jl. Kartini No.6, Ngaglik, Kec. Batu (Pusat) / Cabang Malang: Jl. Soekarno Hatta",
        namaPencarian: "Pos Ketan Legenda 1967 Malang Soehat",
        jam_buka: "15.00-24.00",
        lat: -7.9425,
        lng: 112.6155
      }
    ]
  },
  {
    id: "leg_045",
    nama: "PUTU LANANG CELAKET",
    foto_url: "https://images.pexels.com/photos/32082080/pexels-photo-32082080.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kue putu legendaris yang dimasak dengan uap bambu. Tekstur lembut dengan isian gula merah cair yang lumer.",
    deskripsi_en: "Legendary putu cake cooked with bamboo steam. Soft texture with melted liquid brown sugar filling.",
    jenis: ["cemilan", "tradisional"],
    cocok_waktu: ["sore", "malam"],
    tags: ["putu", "tradisional", "celaket"],
    rating: 4.7,
    trending: true,
    cabang: [
      {
        nama: "Putu Lanang Celaket",
        alamatLengkap: "Jl. Jaksa Agung Suprapto No.73, Sloading, Kec. Klojen, Kota Malang",
        namaPencarian: "Putu Lanang Celaket Malang",
        jam_buka: "17.30-22.00",
        lat: -7.9715,
        lng: 112.6305
      }
    ]
  },
  {
    id: "leg_046",
    nama: "RAWON NGULING",
    foto_url: "https://images.pexels.com/photos/37106563/pexels-photo-37106563.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Rawon dengan kuah hitam pekat dari kluwek dan potongan daging sapi yang besar dan empuk. Salah satu rawon terbaik di Malang.",
    deskripsi_en: "Rawon with thick black broth from kluwek and large tender beef pieces. One of the best rawon in Malang.",
    jenis: ["makanan", "kuah"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["rawon", "daging", "legendaris"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Rawon Nguling Malang",
        alamatLengkap: "Jl. Zainul Arifin No.62, Kiduldalem, Kec. Klojen, Kota Malang",
        namaPencarian: "Rawon Nguling Malang",
        jam_buka: "07.00-15.30",
        lat: -7.9842,
        lng: 112.6315
      }
    ]
  },
  {
    id: "leg_047",
    nama: "SATE BUNUL H. PAINO",
    foto_url: "https://images.pexels.com/photos/37113562/pexels-photo-37113562.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Sate kambing legendaris dengan daging yang empuk and tidak prengus. Bumbu kacangnya sangat khas and gurih.",
    deskripsi_en: "Legendary goat satay with tender meat and no gamey smell. The peanut sauce is very typical and savory.",
    jenis: ["makanan", "bakar"],
    cocok_waktu: ["siang", "malam"],
    tags: ["sate", "kambing", "legendaris"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Sate Bunul H. Paino",
        alamatLengkap: "Jl. Hamid Rusdi No.315, Bunulrejo, Kec. Blimbing, Kota Malang",
        namaPencarian: "Sate Bunul H. Paino Malang",
        jam_buka: "10.00-22.00",
        lat: -7.9625,
        lng: 112.6445
      }
    ]
  },
  {
    id: "leg_048",
    nama: "TAHU CAMPUR PAK IWAN",
    foto_url: "https://images.pexels.com/photos/37081524/pexels-photo-37081524.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Tahu campur dengan kuah petis yang mantap, potongan otot sapi, tahu, perkedel singkong, and selada segar.",
    deskripsi_en: "Tahu campur with great petis sauce, beef tendon pieces, tofu, cassava fritters, and fresh lettuce.",
    jenis: ["makanan", "tradisional"],
    cocok_waktu: ["sore", "malam"],
    tags: ["tahu-campur", "petis", "legendaris"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Tahu Campur Pak Iwan",
        alamatLengkap: "Jl. Kapten Piere Tendean No.1D, Kasin, Kec. Klojen, Kota Malang",
        namaPencarian: "Tahu Campur Pak Iwan Malang",
        jam_buka: "16.00-22.00",
        lat: -7.9865,
        lng: 112.6295
      }
    ]
  },
  {
    id: "leg_049",
    nama: "OREM-OREM AREMA",
    foto_url: "https://images.pexels.com/photos/8646557/pexels-photo-8646557.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kuliner khas Malang berupa irisan tempe goreng and ayam dalam kuah santan kuning kental, disajikan dengan ketupat.",
    deskripsi_en: "Typical Malang culinary of fried tempeh slices and chicken in thick yellow coconut milk broth, served with rice cakes.",
    jenis: ["makanan", "tradisional"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["orem-orem", "tempe", "khas-malang"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Orem-Orem Arema",
        alamatLengkap: "Jl. Blitar No.14, Sumbersari, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Orem-Orem Arema Malang",
        jam_buka: "09.00-16.00",
        lat: -7.9585,
        lng: 112.6155
      }
    ]
  },
  {
    id: "leg_050",
    nama: "CWIE MIE MALANG (HOT CUI MIE)",
    foto_url: "https://images.pexels.com/photos/36946896/pexels-photo-36946896.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Mie tipis khas Malang dengan taburan ayam halus and pangsit goreng mangkuk yang renyah.",
    deskripsi_en: "Typical thin Malang noodles with fine chicken topping and crispy bowl fried wonton.",
    jenis: ["makanan", "mie"],
    cocok_waktu: ["siang", "malam"],
    tags: ["cwie-mie", "pangsit", "khas-malang"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Hot Cui Mie Malang",
        alamatLengkap: "Jl. Kawi No.20, Kauman, Kec. Klojen, Kota Malang",
        namaPencarian: "Hot Cui Mie Malang",
        jam_buka: "09.00-21.00",
        lat: -7.9785,
        lng: 112.6255
      }
    ]
  },
  {
    id: "leg_051",
    nama: "BAKSO PRESIDENT",
    foto_url: "https://images.pexels.com/photos/36946895/pexels-photo-36946895.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Makan bakso di pinggir rel kereta api aktif. Sensasi unik dengan berbagai pilihan bakso and gorengan.",
    deskripsi_en: "Eating bakso by an active train track. Unique sensation with various bakso and fried snack choices.",
    jenis: ["makanan", "bakso"],
    cocok_waktu: ["siang", "sore"],
    tags: ["bakso", "rel-kereta", "legendaris"],
    rating: 4.5,
    trending: true,
    cabang: [
      {
        nama: "Bakso President",
        alamatLengkap: "Jl. Batanghari No.5, Rampal Celaket, Kec. Klojen, Kota Malang",
        namaPencarian: "Bakso President Malang",
        jam_buka: "08.00-21.30",
        lat: -7.9655,
        lng: 112.6355
      }
    ]
  },
  {
    id: "leg_052",
    nama: "SOTO AYAM LOMBOK",
    foto_url: "https://images.pexels.com/photos/17770765/pexels-photo-17770765.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Soto ayam legendaris dengan koya gurih yang melimpah and kuah kuning bening yang segar.",
    deskripsi_en: "Legendary chicken soto with abundant savory koya and fresh clear yellow broth.",
    jenis: ["makanan", "kuah"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["soto", "ayam", "legendaris"],
    rating: 4.6,
    trending: false,
    cabang: [
      {
        nama: "Soto Ayam Lombok Pusat",
        alamatLengkap: "Jl. Lombok No.1, Kasin, Kec. Klojen, Kota Malang",
        namaPencarian: "Soto Ayam Lombok Malang",
        jam_buka: "07.00-23.00",
        lat: -7.9885,
        lng: 112.6265
      }
    ]
  },
  {
    id: "leg_053",
    nama: "PECEL KAWI HJ. MUSILAH",
    foto_url: "https://images.pexels.com/photos/11013145/pexels-photo-11013145.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi pecel dengan bumbu kacang yang kental and gurih, disajikan dengan berbagai pilihan lauk pauk.",
    deskripsi_en: "Rice pecel with thick and savory peanut sauce, served with various side dish choices.",
    jenis: ["makanan", "tradisional"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["pecel", "sarapan", "legendaris"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Pecel Kawi Hj. Musilah",
        alamatLengkap: "Jl. Kawi No.43B, Bareng, Kec. Klojen, Kota Malang",
        namaPencarian: "Pecel Kawi Hj Musilah Malang",
        jam_buka: "06.00-20.00",
        lat: -7.9785,
        lng: 112.6225
      }
    ]
  },
  {
    id: "leg_054",
    nama: "TAHWA MAS AGUS",
    foto_url: "https://images.pexels.com/photos/33930747/pexels-photo-33930747.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Kembang tahu lembut dengan kuah jahe hangat yang manis. Camilan sehat and menghangatkan.",
    deskripsi_en: "Soft bean curd with sweet warm ginger broth. A healthy and warming snack.",
    jenis: ["cemilan", "minuman"],
    cocok_waktu: ["pagi", "sore", "malam"],
    tags: ["tahwa", "hangat", "tradisional"],
    rating: 4.7,
    trending: false,
    cabang: [
      {
        nama: "Tahwa Mas Agus",
        alamatLengkap: "Jl. Aris Munandar No.20, Kiduldalem, Kec. Klojen, Kota Malang",
        namaPencarian: "Tahwa Mas Agus Malang",
        jam_buka: "07.00-21.00",
        lat: -7.9825,
        lng: 112.6325
      }
    ]
  },
  {
    id: "leg_055",
    nama: "RONDE TITONI",
    foto_url: "https://images.pexels.com/photos/36039032/pexels-photo-36039032.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Warung ronde tertua di Malang. Menyediakan ronde basah, ronde kering, and angsle yang legendaris.",
    deskripsi_en: "Oldest ronde shop in Malang. Providing legendary wet ronde, dry ronde, and angsle.",
    jenis: ["minuman", "cemilan"],
    cocok_waktu: ["malam"],
    tags: ["ronde", "legendaris", "hangat"],
    rating: 4.6,
    trending: true,
    cabang: [
      {
        nama: "Ronde Titoni",
        alamatLengkap: "Jl. Zainul Arifin No.17, Sukoharjo, Kec. Klojen, Kota Malang",
        namaPencarian: "Ronde Titoni Malang",
        jam_buka: "18.00-24.00",
        lat: -7.9835,
        lng: 112.6305
      }
    ]
  },
  {
    id: "leg_056",
    nama: "NASI BHAYANGKARA",
    foto_url: "https://images.pexels.com/photos/37107035/pexels-photo-37107035.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi campur porsi kuli dengan harga terjangkau. Lauk pauk melimpah, favorit mahasiswa Malang.",
    deskripsi_en: "Large portion mixed rice at an affordable price. Abundant side dishes, a favorite for Malang students.",
    jenis: ["makanan", "nasi"],
    cocok_waktu: ["malam", "tengah_malam"],
    tags: ["nasi-campur", "murah", "mahasiswa"],
    rating: 4.4,
    trending: false,
    cabang: [
      {
        nama: "Nasi Bhayangkara",
        alamatLengkap: "Jl. Bhayangkara No.1, Kota Malang",
        namaPencarian: "Nasi Bhayangkara Malang",
        jam_buka: "18.00-03.00",
        lat: -7.9755,
        lng: 112.6325
      }
    ]
  },
  {
    id: "leg_057",
    nama: "DEPOT BEBEK H. SLAMET",
    foto_url: "https://images.pexels.com/photos/29185236/pexels-photo-29185236.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Bebek goreng legendaris dengan sambal korek yang super pedas and gurih.",
    deskripsi_en: "Legendary fried duck with super spicy and savory korek chili sauce.",
    jenis: ["makanan", "ayam"],
    cocok_waktu: ["siang", "malam"],
    tags: ["bebek-goreng", "sambal-korek", "legendaris"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Bebek H. Slamet Soehat",
        alamatLengkap: "Jl. Soekarno Hatta No.D-403, Mojolangu, Kec. Lowokwaru, Kota Malang",
        namaPencarian: "Bebek H Slamet Soehat Malang",
        jam_buka: "10.00-21.00",
        lat: -7.9425,
        lng: 112.6165
      }
    ]
  },
  {
    id: "leg_058",
    nama: "WARUNG SIDIK",
    foto_url: "https://images.pexels.com/photos/37107035/pexels-photo-37107035.jpeg?auto=compress&cs=tinysrgb&h=350",
    deskripsi: "Nasi campur legendaris dengan berbagai pilihan lauk pauk rumahan yang otentik.",
    jenis: ["makanan", "nasi"],
    cocok_waktu: ["pagi", "siang"],
    tags: ["nasi-campur", "legendaris", "rumahan"],
    rating: 4.5,
    trending: false,
    cabang: [
      {
        nama: "Warung Sidik",
        alamatLengkap: "Jl. KH. Ahmad Dahlan No.39, Sukoharjo, Kec. Klojen, Kota Malang",
        namaPencarian: "Warung Sidik Malang",
        jam_buka: "07.00-16.00",
        lat: -7.9855,
        lng: 112.6295
      }
    ]
  }
];

