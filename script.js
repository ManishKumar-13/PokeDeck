const filterContainer = document.querySelector("#filter");
const pokemonContainer = document.querySelector("#pokemonContainer");
const searchInput = document.querySelector(".search-input");
const pokemonTypeSelect = document.getElementById('pokemonType');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const filterButton = document.getElementById('filterButton');
const resetButton = document.getElementById('resetButton');
const pageChangeBtnContainer = document.getElementById('page-change-btn-container');

// URLs
const typeUrl = "https://pokeapi.co/api/v2/type/";
const pokemonUrl = "https://pokeapi.co/api/v2/pokemon?limit=36&offset=0";
/*
limit: Specifies the maximum number of resources (in this case, Pokémon) to return in a single response. 
In this URL, limit=36 means that the API will return a maximum of 36 Pokémon in the response.

offset: Specifies the index of the first resource to return in the response. For example, offset=0 means that the API will start 
returning Pokémon from the first one. If you were to use offset=36, it would skip the first 36 Pokémon and start returning from
the 37th Pokémon.

Together, limit and offset allow you to paginate through a large set of resources. For example, if you wanted to retrieve Pokémon in batches of 10 
starting from the 20th Pokémon, you would use a URL like https://pokeapi.co/api/v2/pokemon?limit=10&offset=20.
*/

let nextUrl;
let previousUrl;
let typeMap = {};
// let pokemonNames = [];

//  Ciolors for Pokemon types
const POKEMON_TYPE_COLORS = {
    normal: "#BDBDBD",     // Silver
    flying: "#87CEEB",     // Sky Blue
    fighting: "#CD5C5C",   // Indian Red
    poison: "#9370DB",     // Medium Purple
    ground: "#DAA520",     // Goldenrod
    rock: "#696969",       // Dim Gray
    bug: "#7FFF00",        // Chartreuse
    ghost: "#4682B4",      // Steel Blue
    steel: "#708090",      // Slate Gray
    fire: "#FFA07A",       // Light Salmon
    water: "#00BFFF",      // Deep Sky Blue
    grass: "#90EE90",      // Light Green
    electric: "#FFD700",   // Gold
    psychic: "#FF69B4",    // Hot Pink
    ice: "#87CEFA",        // Light Sky Blue
    dragon: "#FF6347",     // Tomato
    dark: "#2F4F4F",       // Dark Slate Gray
    fairy: "#FFB6C1"       // Light Pink
};

async function fetchAndCreateOptions() {

    try {
        const response = await fetch(typeUrl);
        const data = await response.json();
        console.log(data);

        data.results.forEach((pokemonType) => {
            typeMap[pokemonType.name] = pokemonType.url;

            const typeOption = document.createElement("option");
            typeOption.innerText = pokemonType.name.toUpperCase();
            typeOption.setAttribute("value", pokemonType.name);

            pokemonTypeSelect.appendChild(typeOption);
        })

    } catch (err) {
        console.log(err);
    }
}

async function renderPokemonCards(pokemonArray, isSearching = false) {

    if (pokemonArray.length === 0) {
        alert("No Pokémon found for this type. Please try a different type.");
        location.reload();
        return;
    }

    let promiseArray;

    if (!isSearching) {
        promiseArray = pokemonArray.map(async (pokemon) => {
            try {
                const response = await fetch(pokemon.url || pokemon.pokemon.url);
                const data = await response.json();
                return data;
            } catch (error) {
                return { error };
            }
        });
    } else {
        promiseArray = pokemonArray;
    }

    try {
        const pokemonDetailsArray = await Promise.all(promiseArray);
        pokemonContainer.innerHTML = ``;

        const pokemonCardsHTML = pokemonDetailsArray.map(pokemonDetails => {
            const typesHTML = pokemonDetails.types.map(type => `<p>${type.type.name.toUpperCase()}</p>`).join('');
            const backgroundColor = pokemonDetails.types.length === 1 ? `${POKEMON_TYPE_COLORS[pokemonDetails.types[0].type.name]}` :
            `linear-gradient(50deg, ${POKEMON_TYPE_COLORS[pokemonDetails.types[0].type.name]}, ${POKEMON_TYPE_COLORS[pokemonDetails.types[1].type.name]})`;

            return `
                <div class="pokemon-card-container">
                    <div class="pokemon-card" style="background: ${backgroundColor}">
                        <div class="pokemon-card-front">
                            <div class="number-and-type-color-container">
                                <p>${pokemonDetails.id}</p>
                                <p><p>
                            </div>
                            <figure>
                                <img src="${pokemonDetails.sprites.front_default}" alt="image of ${pokemonDetails.name}">
                                <figcaption>${pokemonDetails.name.toUpperCase()}</figcaption>
                            </figure>
                            <div class="weight-height-container">
                                <div>
                                    <p>HEIGHT</p>
                                    <p>${pokemonDetails.height}</p>
                                </div>
                                <div>
                                    <p>WEIGHT</p>
                                    <p>${pokemonDetails.weight}</p>
                                </div>
                            </div>
                            <div class="type-container">${typesHTML}</div>
                        </div>
                        <div class="pokemon-card-back">
                            <div class="stats">
                                <p><span>HP:</span><span>${pokemonDetails.stats[0].base_stat}</span></p>
                                <p><span>ATK:</span><span>${pokemonDetails.stats[1].base_stat}</span></p>
                                <p><span>DEF:</span><span>${pokemonDetails.stats[2].base_stat}</span></p>
                                <p><span>SATK:</span><span>${pokemonDetails.stats[3].base_stat}</span></p>
                                <p><span>SDEF:</span><span>${pokemonDetails.stats[4].base_stat}</span></p>
                                <p><span>SPD:</span><span>${pokemonDetails.stats[5].base_stat}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        pokemonContainer.innerHTML = pokemonCardsHTML;
    } catch (error) {
        console.error('Failed to fetch Pokemon details:', error);
    }

}


async function fetchPokemonData(url, isSearching=false) {

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        nextUrl = data.next;
        previousUrl = data.previous;
        console.log(nextUrl);
        console.log(previousUrl);
        renderPokemonCards(data.results || data.pokemon || [data], isSearching);

    } catch (err) {
        alert("Error: No Pokémon found with the given name. Please check your spelling and try again.");
        location.reload();
        console.log(err);
    }
}




function initApp() {
    fetchAndCreateOptions();
    fetchPokemonData(pokemonUrl);
}


document.addEventListener("DOMContentLoaded", initApp);


filterButton.addEventListener('click', function() {
    // Get the currently selected option value
    const selectedType = pokemonTypeSelect.value;

    if(selectedType === "all") {
        fetchPokemonData(pokemonUrl);
        return;
    }

    const urlForSelctedType = typeMap[selectedType];
    // console.log("Filter Button Clicked", urlForSelctedType);
    pageChangeBtnContainer.style.display = "none";
    fetchPokemonData(urlForSelctedType);
});


async function fetchPokemonNames(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pokemonNames = data.results.map(result => result.name);
        return pokemonNames;
    } catch (error) {
        console.error('Error fetching Pokémon names:', error);
        return [];
    }
}

searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    const pokemonNames = await fetchPokemonNames(pokemonUrl);

    console.log(pokemonNames);
    const matchedPokemon = pokemonNames.find(pokemon => pokemon.toLowerCase() === searchTerm);
    console.log(matchedPokemon);
    
    if(matchedPokemon) {
        const pokemonNameUrl =  `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
        fetchPokemonData(pokemonNameUrl, true);
        pageChangeBtnContainer.style.display = "none";
    }
});


prevButton.addEventListener('click', function() {
    console.log("Prev button");
    if(previousUrl != null) {

        fetchPokemonData(previousUrl);
    } 
});

nextButton.addEventListener('click', function() {
    console.log("Next button");
    if(nextUrl != null) {

        fetchPokemonData(nextUrl);
    } 
});


resetButton.addEventListener('click', function() {
    location.reload();
})
