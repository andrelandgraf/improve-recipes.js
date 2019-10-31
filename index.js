const recipeFile = require('./recipe.json');
const ingredients = require('./ingredients.json');

function getIngredient( ingredientID ) {
    const id = parseInt( ingredientID );
    const key = Object.keys( ingredients ).find( key => ingredients[key].id === id );
    return ingredients[key];
}

function getBestFatReduction( substitueOptions ) {
    const tuples = substitueOptions.map( ingredientID => {
        const ingredient = getIngredient( ingredientID );
        if ( !ingredient[ 'nutrition values' ] || !ingredient[ 'nutrition values' ]['fat'] )
            return; 
        return {
            substitueID: ingredientID,
            value: ingredient[ 'nutrition values' ]['fat'],
        };
    } );
    let bestSubstitute = { substitueID: 0, value: Number.MAX_VALUE }
    tuples.forEach( substitute => 
        ( substitute.value <  bestSubstitute.value) ? bestSubstitute = substitute : undefined );
    return bestSubstitute;
}

const recipes = recipeFile.recipes;
const thaicurry = recipes.find( recipe => recipe.name === "thai curry" );
const substituteIDs = Object.keys( thaicurry.substitutes ).map( id => parseInt( id ) );

// reduce fat
let fatSum = 0;
const selectedSubstitutes = {};
thaicurry.ingredients.forEach( ingredientID => {
    const ingredient = getIngredient( ingredientID );
    const lacksProperty = ( !ingredient[ 'nutrition values' ] || !ingredient[ 'nutrition values' ]['fat'] );
    const ingredientFat = lacksProperty ? 0 : ingredient[ 'nutrition values' ]['fat'];
    fatSum = fatSum + ingredientFat;
    if ( substituteIDs.includes( ingredientID ) ) {
        const substiteOptions = thaicurry.substitutes[ingredientID];
        const bestFatSubstitute = getBestFatReduction( substiteOptions );
        bestFatSubstitute.savedFat = ingredientFat - bestFatSubstitute.value;
        if ( bestFatSubstitute.savedFat > 0 ) 
        selectedSubstitutes[ingredientID] = bestFatSubstitute;
    }
} );

console.log( `Your normal meal contains ${fatSum} gram of fat` );
Object.keys( selectedSubstitutes ).forEach( key => {
    const old = getIngredient( key );
    const better = getIngredient( selectedSubstitutes[key].substitueID );
    const saved = selectedSubstitutes[key].savedFat;
    console.log( `Substitute ${old.name.en } by ${ better.name.en } to save ${saved} gram of fat` );
} );

