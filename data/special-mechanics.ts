import { PokemonType } from "@/types/pokemon";

export interface MegaEvolutionData {
  pokemonName: string;
  megaName: string;
  stone: string;
  typeBefore: PokemonType[];
  typeAfter: PokemonType[];
  ability: string;
  statBonus: string;
  howToGetInMinecraft: string;
}

export const MEGA_DATA: MegaEvolutionData[] = [
  {
    pokemonName: "Charizard",
    megaName: "Mega Charizard X",
    stone: "Charizardita X",
    typeBefore: ["fire", "flying"],
    typeAfter: ["fire", "dragon"],
    ability: "Garra Dura (Tough Claws)",
    statBonus: "+50 Atq, +33 Def, +21 SpA (+100 BST)",
    howToGetInMinecraft: "Drop raro de Charizard salvaje Boss en Badlands o cofre de Fortaleza Nether.",
  },
  {
    pokemonName: "Charizard",
    megaName: "Mega Charizard Y",
    stone: "Charizardita Y",
    typeBefore: ["fire", "flying"],
    typeAfter: ["fire", "flying"],
    ability: "Sequía (Drought)",
    statBonus: "+50 SpA, +30 SpD, +20 Atq (+100 BST)",
    howToGetInMinecraft: "Drop raro de Charizard salvaje Boss en picos montañosos altos.",
  },
  {
    pokemonName: "Gengar",
    megaName: "Mega Gengar",
    stone: "Gengarita",
    typeBefore: ["ghost", "poison"],
    typeAfter: ["ghost", "poison"],
    ability: "Sombra Trampa (Shadow Tag)",
    statBonus: "+40 SpA, +35 Def, +20 Spe (+100 BST)",
    howToGetInMinecraft: "Mansión del Bosque Oscuro o cofre secreto en Minas Abandonadas.",
  },
  {
    pokemonName: "Lucario",
    megaName: "Mega Lucario",
    stone: "Lucarita",
    typeBefore: ["fighting", "steel"],
    typeAfter: ["fighting", "steel"],
    ability: "Adaptable (Adaptability)",
    statBonus: "+35 Atq, +25 SpA, +22 Def, +18 Spe (+100 BST)",
    howToGetInMinecraft: "Dojos de montaña o victoria contra entrenadores NPC de alto rango.",
  },
  {
    pokemonName: "Garchomp",
    megaName: "Mega Garchomp",
    stone: "Garchompita",
    typeBefore: ["dragon", "ground"],
    typeAfter: ["dragon", "ground"],
    ability: "Poder Arena (Sand Force)",
    statBonus: "+40 Atq, +40 SpA, +20 Def (-10 Spe)",
    howToGetInMinecraft: "Cofres de templos del desierto enterrados o cuevas profundas.",
  },
];

export const TERA_SHARDS_INFO = [
  {
    item: "Esquirlas Tera (Tera Shards)",
    recipe: "50 Esquirlas del mismo tipo en la Mesa de Teracristalización.",
    dropLocation: "Minar Cristales Tera subterráneos en el Overworld o derrotar incursiones de raid.",
  },
  {
    item: "Tera Orbe (Tera Orb)",
    recipe: "Crafteo con 1 Diamante, 4 Cristales de Amatista y 4 Lingotes de Hierro.",
    dropLocation: "Debe recargarse descansando en un Centro Pokémon o absorbiendo energía de Cristales Tera.",
  },
];
