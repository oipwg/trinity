const rent = require('./rent');


module.exports = async function(options) {
    let to_do = Object.keys(options.to_do.rent)[0];

    // console.log(
    //     'Options from rent index.js file 9',
    //     Object.keys(options.to_do.rent)[0]
    // );

    // Switch based on user input object
    switch (to_do) {
        case 'rent':
            let added = await rent(options).then((data)=>{
                return data
            }).catch(err => err);
            return added;
    }
}
