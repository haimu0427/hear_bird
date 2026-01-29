import { BirdDatabase } from './types';

export const API_URL = 'http://localhost:8000/analyze';

// Fallback image if species not found in our rich DB
export const PLACEHOLDER_BIRD = "https://images.unsplash.com/photo-1552728089-57bdde30beb8?q=80&w=1000&auto=format&fit=crop";

export const BIRD_DB: BirdDatabase = {
  "Streptopelia decaocto": {
    scientificName: "Streptopelia decaocto",
    commonName: "Eurasian Collared-Dove",
    description: "Large pale dove with a black crescent on the nape. Slightly smaller and paler than Rock Pigeon, with a proportionately longer, square-tipped tail. Favors farms and suburbs; avoids areas with extensive forests. Typically seen in pairs or small loose groups; forms larger flocks in winter. Widespread and common throughout much of Eurasia and northern Africa. ",
    image: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/308119951/2400",
    coverImage: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/308119951/2400",
    coverImageCenterX: 0.9,
    wikiLink: "https://en.wikipedia.org/wiki/Eurasian_tree_sparrow"
  },
  "Passer montanus": {
    scientificName: "Passer montanus",
    commonName: "Eurasian Tree Sparrow",
    description: "The Eurasian tree sparrow (Passer montanus) is a passerine bird in the sparrow family with a rich chestnut crown and nape and a black patch on each pure white cheek. The sexes are similarly plumaged, and young birds are a duller version of the adult. This sparrow breeds over most of temperate Eurasia and Southeast Asia, where it is known as the tree sparrow, and it has been introduced elsewhere including the United States, where it is known as the Eurasian tree sparrow or German sparrow to differentiate it from the native American tree sparrow. Although several subspecies are recognised, the appearance of this bird varies little across its extensive range.",
    image: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/305890841/2400",
    coverImage: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/305890841/2400",
    coverImageCenterX: 0.9,
    wikiLink: "https://en.wikipedia.org/wiki/Eurasian_tree_sparrow"
  },
  "Cuculus canorus": {
    scientificName: "Cuculus canorus",
    commonName: "Common cuckoo",
    description: "The cuckoo, common cuckoo, European cuckoo or Eurasian cuckoo (Cuculus canorus) is a member of the cuckoo order of birds, Cuculiformes, which includes the roadrunners, the anis and the coucals.",
    image: "https://www.monaconatureencyclopedia.com/wp-content/uploads/2015/10/1_e_primavera._e_arrivato_il_cucolo_cuculus_canorus_.jpg",
    coverImage: "https://www.monaconatureencyclopedia.com/wp-content/uploads/2015/10/1_e_primavera._e_arrivato_il_cucolo_cuculus_canorus_.jpg",
    coverImageCenterX: 0.7,
    wikiLink: "https://en.wikipedia.org/wiki/Common_cuckoo"
  },
  "Peucedramus taeniatus": {
    scientificName: "Peucedramus taeniatus",
    commonName: "Olive Warbler",
    description: "The olive warbler (Peucedramus taeniatus) is a small passerine bird. It is the only member of the genus Peucedramus and the family Peucedramidae.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Peucedramus_taeniatus_Durango_Highway_Sinaloa.jpg",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Peucedramus_taeniatus_Durango_Highway_Sinaloa.jpg",
    coverImageCenterX: 0.5,
    wikiLink: "https://en.wikipedia.org/wiki/Olive_warbler"
  },
  "Erithacus rubecula": {
    scientificName: "Erithacus rubecula",
    commonName: "European Robin",
    description: "The common redstart (Phoenicurus phoenicurus), or often simply redstart, is a small passerine bird in the genus Phoenicurus. Like its relatives, it was formerly classed as a member of the thrush family, (Turdidae), but is now known to be an Old World flycatcher (family Muscicapidae).",
    image: "https://wildambience.com/wp-content/uploads/2021/05/european_robin_800px.jpg",
    coverImage: "https://wildambience.com/wp-content/uploads/2021/05/european_robin_800px.jpg",
    coverImageCenterX: 0.5,
    wikiLink: "https://en.wikipedia.org/wiki/European_robin"
  },
  "Phoenicurus phoenicurus": {
    scientificName: "Phoenicurus phoenicurus",
    commonName: "Common Redstart",
    description: "The common redstart (Phoenicurus phoenicurus), or often simply redstart, is a small passerine bird in the genus Phoenicurus. Like its relatives, it was formerly classed as a member of the thrush family, (Turdidae), but is now known to be an Old World flycatcher (family Muscicapidae).",
    image: "https://www.monaconatureencyclopedia.com/wp-content/uploads/2016/11/1tris.jpg",
    coverImage: "https://www.monaconatureencyclopedia.com/wp-content/uploads/2016/11/1tris.jpg",
    coverImageCenterX: 0.5,
    wikiLink: "https://en.wikipedia.org/wiki/Common_redstart"
  },
  "Turdus iliacus": {
    scientificName: "Turdus iliacus",
    commonName: "Redwing",
    description: "A colourful, familiar tit of gardens and woodland. It is easily recognizable by its blue and yellow plumage.",
    image: "https://www.woodlandtrust.org.uk/media/1642/redwing-on-berry-branch-alamydy2jc8-robin-chittenden.jpg?rxy=0.5108225108225108,0.4307692307692308&width=1110&height=624&v=1dc2bfd0a98ab50",
    coverImage: "https://www.woodlandtrust.org.uk/media/1642/redwing-on-berry-branch-alamydy2jc8-robin-chittenden.jpg?rxy=0.5108225108225108,0.4307692307692308&width=1110&height=624&v=1dc2bfd0a98ab50",
    coverImageCenterX: 0.4,
    wikiLink: "https://en.wikipedia.org/wiki/Redwing"
  },
  "Pinicola enucleator": {
    scientificName: "Pinicola enucleator",
    commonName: "Pine Grosbeak",
    description: "The largest UK tit – green and yellow with a striking glossy black head with white cheeks and a distinctive two-syllable song.",
    image: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/67356151/1800",
    coverImage: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/67356151/1800",
    coverImageCenterX: 0.7,
    wikiLink: "https://en.wikipedia.org/wiki/Pine_grosbeak"
  },
  "Baeolophus bicolor": {
    scientificName: "Baeolophus bicolor",
    commonName: "Tufted Titmouse",
    description: "Not as colourful as some of its relatives, the Coal Tit has a distinctive grey back, black cap, and white patch at the back of its neck.",
    image: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/302627281/1800",
    coverImage: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/302627281/1800",
    coverImageCenterX: 0.9,
    wikiLink: "https://en.wikipedia.org/wiki/Tufted_titmouse"
  },
  "Orthotomus sutorius": {
    scientificName: "Orthotomus sutorius",
    commonName: "Common Tailorbird",
    description: "The common tailorbird (Orthotomus sutorius) is a songbird found across tropical Asia. Popular for its nest made of leaves 'sewn' together and immortalized by Rudyard Kipling as Darzee in his Jungle Book, it is a common resident in urban gardens. Although shy birds that are usually hidden within vegetation, their loud calls are familiar and give away their presence. They are distinctive in having a long upright tail, greenish upper body plumage and rust coloured forehead and crown. This passerine bird is typically found in open farmland, scrub, forest edges and gardens. Tailorbirds get their name from the way their nest is constructed. The edges of a large leaf are pierced and sewn together with plant fibre or spider silk to make a cradle in which the actual nest is built. Punjab tailor birds produce shiny red eggs, but became extinct around 1975 due to laying their eggs in fields used to grow fodder crops.",
    image: "https://www.shanghaibirding.com/wp-content/uploads/2022/12/common-tailorbird-elephant-valley-yunnan.jpg",
    coverImage: "https://www.shanghaibirding.com/wp-content/uploads/2022/12/common-tailorbird-elephant-valley-yunnan.jpg",
    coverImageCenterX: 0.2,
    wikiLink: "https://en.wikipedia.org/wiki/Common_tailorbird"
  }
};

export const MOCK_RESULTS_FALLBACK = {
  msg: "success",
  results: [
    {
      start: "0.0",
      end: "2.62",
      scientificName: "Cyanistes caeruleus",
      commonName: "Eurasian Blue Tit",
      confidence: "0.9823"
    },
    {
      start: "0.0",
      end: "2.62",
      scientificName: "Parus major",
      commonName: "Great Tit",
      confidence: "0.6500"
    },
    {
      start: "0.0",
      end: "2.62",
      scientificName: "Periparus ater",
      commonName: "Coal Tit",
      confidence: "0.4000"
    }
  ]
};
