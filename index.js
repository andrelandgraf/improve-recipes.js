const recipeFile = require('./recipe.json');
const ingridients = require('./ingridients.json');

function getIngridient( ingridientID ) {
    const id = parseInt( ingridientID );
    const key = Object.keys( ingridients ).find( key => ingridients[key].id === id );
    return ingridients[key];
}

function getBestFatReduction( substitueOptions ) {
    const tuples = substitueOptions.map( ingridientID => {
        const ingridient = getIngridient( ingridientID );
        if ( !ingridient[ 'nutrition values' ] || !ingridient[ 'nutrition values' ]['fat'] )
            return; 
        return {
            substitueID: ingridientID,
            value: ingridient[ 'nutrition values' ]['fat'],
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
thaicurry.ingridients.forEach( ingridientID => {
    const ingridient = getIngridient( ingridientID );
    const lacksProperty = ( !ingridient[ 'nutrition values' ] || !ingridient[ 'nutrition values' ]['fat'] );
    const ingridientFat = lacksProperty ? 0 : ingridient[ 'nutrition values' ]['fat'];
    fatSum = fatSum + ingridientFat;
    if ( substituteIDs.includes( ingridientID ) ) {
        const substiteOptions = thaicurry.substitutes[ingridientID];
        const bestFatSubstitute = getBestFatReduction( substiteOptions );
        bestFatSubstitute.savedFat = ingridientFat - bestFatSubstitute.value;
        if ( bestFatSubstitute.savedFat > 0 ) 
        selectedSubstitutes[ingridientID] = bestFatSubstitute;
    }
} );

console.log( `Your normal meal contains ${fatSum} gram of fat` );
Object.keys( selectedSubstitutes ).forEach( key => {
    const old = getIngridient( key );
    const better = getIngridient( selectedSubstitutes[key].substitueID );
    const saved = selectedSubstitutes[key].savedFat;
    console.log( `Substitute ${old.name.en } by ${ better.name.en } to save ${saved} gram of fat` );
} );

